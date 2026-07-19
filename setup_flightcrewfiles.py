#!/usr/bin/env python3
"""
Master setup/update script for Flight Crew Files.

Run daily with:
    python3 setup_flightcrewfiles.py

Fetches fresh aviation videos and news, regenerates sitemap.xml, and logs
everything to update_log.txt. Each step is independent -- if one fails
(bad API key, quota exceeded, network error), the rest still run.
"""

import difflib
import email.utils
import glob
import html
import json
import os
import re
import sys
import time
import traceback
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta, timezone

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ENV_PATH = os.path.join(SCRIPT_DIR, ".env")
LOG_PATH = os.path.join(SCRIPT_DIR, "update_log.txt")
SITE_DOMAIN = "https://flightcrewfiles.com"

HTTP_TIMEOUT = 15  # seconds


# --------------------------------------------------------------------------
# Logging
# --------------------------------------------------------------------------

def log(message, also_print=True):
    """Append a timestamped line to update_log.txt, optionally echo to stdout."""
    stamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{stamp}] {message}"
    with open(LOG_PATH, "a", encoding="utf-8") as f:
        f.write(line + "\n")
    if also_print:
        print(line)


# --------------------------------------------------------------------------
# .env loading (no external dependencies required)
# --------------------------------------------------------------------------

def load_env(path):
    """Minimal .env parser: KEY=VALUE per line, '#' comments, no expansion."""
    env = {}
    if not os.path.exists(path):
        return env
    with open(path, "r", encoding="utf-8") as f:
        for raw_line in f:
            line = raw_line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, _, value = line.partition("=")
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            if key:
                env[key] = value
    return env


# --------------------------------------------------------------------------
# HTTP helper
# --------------------------------------------------------------------------

def http_get_json(url):
    """GET a URL and parse JSON. Raises on any failure (caller handles it)."""
    req = urllib.request.Request(url, headers={"User-Agent": "flightcrewfiles-setup/1.0"})
    with urllib.request.urlopen(req, timeout=HTTP_TIMEOUT) as resp:
        body = resp.read().decode("utf-8")
    return json.loads(body)


def http_get_bytes(url):
    """GET a URL and return raw bytes (for XML parsing). Raises on any failure."""
    req = urllib.request.Request(url, headers={"User-Agent": "flightcrewfiles-setup/1.0"})
    with urllib.request.urlopen(req, timeout=HTTP_TIMEOUT) as resp:
        return resp.read()


def write_json(filename, data):
    path = os.path.join(SCRIPT_DIR, filename)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    return path


# --------------------------------------------------------------------------
# Step 1: YouTube videos -> videos-data.json
# --------------------------------------------------------------------------

YOUTUBE_QUERIES = [
    "aviation incident news",
    "cockpit voice recorder",
    "aviation emergency landing",
    "UAP pilot sighting",
]


def fetch_youtube_videos(api_key):
    """Fetch recent aviation-related videos via YouTube Data API v3."""
    if not api_key:
        raise RuntimeError("YOUTUBE_API_KEY is not set in .env")

    seen_ids = set()
    items = []

    for query in YOUTUBE_QUERIES:
        params = {
            "part": "snippet",
            "q": query,
            "type": "video",
            "order": "date",
            "maxResults": "10",
            "relevanceLanguage": "en",
            "regionCode": "US",
            "videoEmbeddable": "true",
            "key": api_key,
        }
        url = "https://www.googleapis.com/youtube/v3/search?" + urllib.parse.urlencode(params)
        data = http_get_json(url)

        if "error" in data:
            err = data["error"].get("message", "Unknown YouTube API error")
            raise RuntimeError(f"YouTube API error for query '{query}': {err}")

        for entry in data.get("items", []):
            video_id = entry.get("id", {}).get("videoId")
            if not video_id or video_id in seen_ids:
                continue
            seen_ids.add(video_id)
            snippet = entry.get("snippet", {})
            items.append({
                "video_id": video_id,
                "title": snippet.get("title"),
                "description": snippet.get("description"),
                "channel": snippet.get("channelTitle"),
                "published_at": snippet.get("publishedAt"),
                "thumbnail": (snippet.get("thumbnails", {}).get("high")
                              or snippet.get("thumbnails", {}).get("default") or {}).get("url"),
                "url": f"https://www.youtube.com/watch?v={video_id}",
                "matched_query": query,
            })

    payload = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "count": len(items),
        "queries": YOUTUBE_QUERIES,
        "items": items,
    }
    write_json("videos-data.json", payload)
    return len(items)


# --------------------------------------------------------------------------
# Step 2: Aviation news -> news.json / uap_news.json (RSS, no API key)
# --------------------------------------------------------------------------

# (feed_url, friendly source name) -- friendly name is used as the "source"
# field in the output JSON, matching what NewsAPI used to supply.
AVIATION_FEEDS = [
    ("https://www.aviationweek.com/rss.xml", "Aviation Week"),
    ("https://simpleflying.com/feed", "Simple Flying"),
    ("https://www.flightglobal.com/rss", "FlightGlobal"),
    ("https://avherald.com/h?archive", "The Aviation Herald"),
    ("https://www.aopa.org/news-and-media/all-news/rss", "AOPA"),
    ("https://www.flyingmag.com/feed", "Flying Magazine"),
]

# theblackvault.com doesn't publish a feed at /documentdb/feed (404); their
# real UFO/UAP case-files RSS lives at /casefiles/feed, so that's used here.
UAP_FEEDS = [
    ("https://theblackvault.com/casefiles/feed", "The Black Vault"),
    ("https://ufos-scientificresearch.blogspot.com/feeds/posts/default", "UFOs: Scientific Research"),
]

ATOM_NS = "{http://www.w3.org/2005/Atom}"
MEDIA_NS = "{http://search.yahoo.com/mrss/}"
CONTENT_NS = "{http://purl.org/rss/1.0/modules/content/}"
DC_NS = "{http://purl.org/dc/elements/1.1/}"

TAG_RE = re.compile(r"<[^>]+>")
WHITESPACE_RE = re.compile(r"\s+")
IMG_SRC_RE = re.compile(r'<img[^>]+src=["\']([^"\']+)["\']', re.IGNORECASE)
NON_ALNUM_RE = re.compile(r"[^a-z0-9\s]")

# --------------------------------------------------------------------------
# Article quality validation
# --------------------------------------------------------------------------

MIN_TITLE_LENGTH = 20
MIN_DESCRIPTION_LENGTH = 30
MAX_ARTICLE_AGE = timedelta(days=7)
CLOCK_SKEW_ALLOWANCE = timedelta(hours=1)  # tolerate feeds with slightly-future timestamps
TITLE_SIMILARITY_THRESHOLD = 0.85  # same-story dedup across feeds
URL_CHECK_TIMEOUT = 8  # seconds; short since this runs once per article

# Title must contain at least one of these (case-insensitive) to be kept.
TITLE_KEYWORDS = [
    "aviation", "flight", "aircraft", "airline", "pilot", "airport", "plane",
    "UAP", "UFO", "helicopter", "runway", "cockpit", "airspace", "Boeing",
    "Airbus", "FAA", "NTSB", "airways", "aerial", "crash", "emergency",
    "landing", "takeoff", "turbulence", "cabin crew",
]


def has_required_title_keyword(title):
    """True if the title contains at least one required keyword (case-insensitive)."""
    text = (title or "").lower()
    return any(keyword.lower() in text for keyword in TITLE_KEYWORDS)


def _registrable_domain(netloc):
    netloc = (netloc or "").lower().split(":")[0]  # drop port
    if netloc.startswith("www."):
        netloc = netloc[4:]
    return netloc


def domain_matches_feed(article_url, feed_url):
    """Reject articles whose link resolves to a different domain than the
    feed itself (e.g. ad redirects, syndicated pickups, tracking wrappers)."""
    try:
        article_domain = _registrable_domain(urllib.parse.urlparse(article_url).netloc)
        feed_domain = _registrable_domain(urllib.parse.urlparse(feed_url).netloc)
    except ValueError:
        return False
    if not article_domain or not feed_domain:
        return False
    return article_domain == feed_domain


def is_within_lookback(published_at, max_age=MAX_ARTICLE_AGE):
    """True if published_at parses and falls within the last `max_age`."""
    if not published_at:
        return False
    try:
        dt = datetime.fromisoformat(published_at.replace("Z", "+00:00"))
    except ValueError:
        return False
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    age = datetime.now(timezone.utc) - dt
    return -CLOCK_SKEW_ALLOWANCE <= age <= max_age


def is_bare_url(url):
    """True if url is missing, has no host, or points at a bare homepage
    (no path, or just '/', and no query string) rather than a specific article."""
    if not url:
        return True
    try:
        parsed = urllib.parse.urlparse(url)
    except ValueError:
        return True
    if not parsed.scheme or not parsed.netloc:
        return True
    path = parsed.path or ""
    if path in ("", "/") and not parsed.query:
        return True
    return False


def _resolve_final_url(url):
    """Follow the link (HEAD, falling back to GET if the server rejects HEAD)
    and return the final URL after any redirects. Raises HTTPError/URLError
    on failure."""
    last_exc = None
    for method in ("HEAD", "GET"):
        req = urllib.request.Request(url, headers={"User-Agent": "flightcrewfiles-setup/1.0"}, method=method)
        try:
            with urllib.request.urlopen(req, timeout=URL_CHECK_TIMEOUT) as resp:
                return resp.geturl()
        except urllib.error.HTTPError as exc:
            if exc.code == 404:
                raise
            if method == "HEAD" and exc.code in (403, 405, 501):
                last_exc = exc
                continue  # some servers reject HEAD; retry with GET
            raise
    raise last_exc


def verify_url_reachable(url):
    """Follow the article link and reject it if it 404s or redirects to an
    unrelated/homepage page. Other HTTP errors (403/503/...) and network
    errors (timeout/DNS/connection) are treated as unverifiable rather than
    rejected outright, since anti-bot blocking of automated requests is
    common on news sites and shouldn't disqualify an otherwise valid article."""
    req_domain = _registrable_domain(urllib.parse.urlparse(url).netloc)
    try:
        final_url = _resolve_final_url(url)
    except urllib.error.HTTPError as exc:
        if exc.code == 404:
            return False, "URL returned a 404 error"
        return True, None
    except (urllib.error.URLError, TimeoutError, OSError):
        return True, None

    if is_bare_url(final_url):
        return False, "URL redirects to a homepage/unrelated page"
    final_domain = _registrable_domain(urllib.parse.urlparse(final_url).netloc)
    if final_domain and req_domain and final_domain != req_domain:
        return False, "URL redirects to an unrelated domain"
    return True, None


def normalize_title(title):
    """Lowercase/punctuation-stripped title, used only for fuzzy same-story
    matching across different feeds -- not stored or displayed."""
    text = NON_ALNUM_RE.sub("", title.lower())
    text = WHITESPACE_RE.sub(" ", text).strip()
    return text


def validate_article(article, feed_url):
    """Apply all article-quality checks. Returns (is_valid, reason_if_rejected)."""
    title = article.get("title") or ""
    description = article.get("description") or ""
    url = article.get("url") or ""

    if len(title) < MIN_TITLE_LENGTH:
        return False, f"title shorter than {MIN_TITLE_LENGTH} chars"
    if not has_required_title_keyword(title):
        return False, "title has no required aviation keyword"
    if is_bare_url(url):
        return False, "missing URL or URL is a bare homepage with no article path"
    if not description or len(description) < MIN_DESCRIPTION_LENGTH:
        return False, f"description missing or shorter than {MIN_DESCRIPTION_LENGTH} chars"
    if not domain_matches_feed(url, feed_url):
        return False, "article URL domain doesn't match source feed domain"
    if not is_within_lookback(article.get("published_at")):
        return False, "not published within the last 7 days"
    # Network check last -- only pay for it once the cheap checks already passed.
    ok, reason = verify_url_reachable(url)
    if not ok:
        return False, reason
    return True, None


def dedupe_similar_titles(articles, threshold=TITLE_SIMILARITY_THRESHOLD):
    """Drop articles whose normalized title is near-identical to one already
    kept (e.g. the same wire story picked up by two different outlets).
    Assumes `articles` is already sorted most-recent-first, so the freshest
    copy of a duplicated story is the one that's kept."""
    kept = []
    kept_norms = []
    dropped = 0
    for article in articles:
        norm = normalize_title(article["title"])
        is_dup = any(
            difflib.SequenceMatcher(None, norm, other_norm).ratio() >= threshold
            for other_norm in kept_norms
        )
        if is_dup:
            dropped += 1
            continue
        kept.append(article)
        kept_norms.append(norm)
    return kept, dropped


def clean_text(raw, max_len=300):
    """Strip HTML tags/entities from a feed field and trim to a NewsAPI-like excerpt."""
    if not raw:
        return None
    # Some feeds (e.g. Aviation Week) double-escape their HTML entities.
    text = html.unescape(html.unescape(raw))
    text = TAG_RE.sub(" ", text)
    text = WHITESPACE_RE.sub(" ", text).strip()
    if not text:
        return None
    if len(text) > max_len:
        text = text[:max_len].rsplit(" ", 1)[0] + "…"
    return text


def parse_feed_date(raw):
    """Parse an RFC822 (RSS) or ISO8601 (Atom) date into an ISO8601 UTC string."""
    if not raw:
        return None
    raw = raw.strip()
    try:
        dt = email.utils.parsedate_to_datetime(raw)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        dt = dt.astimezone(timezone.utc).replace(microsecond=0)
        return dt.isoformat().replace("+00:00", "Z")
    except (TypeError, ValueError):
        pass
    try:
        dt = datetime.fromisoformat(raw.replace("Z", "+00:00"))
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        dt = dt.astimezone(timezone.utc).replace(microsecond=0)
        return dt.isoformat().replace("+00:00", "Z")
    except ValueError:
        return None


def extract_image(item):
    """Best-effort image extraction: <enclosure>, media:content/thumbnail, then a
    regex sniff of the first <img> in content:encoded or description."""
    enclosure = item.find("enclosure")
    if enclosure is not None:
        url = enclosure.get("url")
        type_ = enclosure.get("type", "")
        if url and (not type_ or type_.startswith("image")):
            return url

    media_el = item.find(f"{MEDIA_NS}content")
    if media_el is None:
        media_el = item.find(f"{MEDIA_NS}thumbnail")
    if media_el is not None and media_el.get("url"):
        return media_el.get("url")

    for html_blob in (item.findtext(f"{CONTENT_NS}encoded"), item.findtext("description")):
        if html_blob:
            match = IMG_SRC_RE.search(html_blob)
            if match:
                return match.group(1)
    return None


def parse_rss_item(item, source_name):
    """Parse a single RSS 2.0 <item> into the news.json article shape."""
    title = clean_text(item.findtext("title"), max_len=200)
    link = item.findtext("link")
    link = link.strip() if link else None
    if not title or not link:
        return None

    description = clean_text(item.findtext(f"{CONTENT_NS}encoded") or item.findtext("description"))
    author = clean_text(item.findtext(f"{DC_NS}creator") or item.findtext("author"), max_len=100)

    return {
        "title": title,
        "description": description,
        "url": link,
        "source": source_name,
        "author": author,
        "published_at": parse_feed_date(item.findtext("pubDate")),
        "image": extract_image(item),
    }


def parse_atom_entry(entry, source_name):
    """Parse a single Atom <entry> (e.g. Blogger feeds) into the news.json article shape."""
    title = clean_text(entry.findtext(f"{ATOM_NS}title"), max_len=200)

    link = None
    for link_el in entry.findall(f"{ATOM_NS}link"):
        if link_el.get("rel", "alternate") == "alternate" and link_el.get("href"):
            link = link_el.get("href")
            break
    if not link:
        any_link = entry.find(f"{ATOM_NS}link")
        link = any_link.get("href") if any_link is not None else None

    if not title or not link:
        return None

    content_html = entry.findtext(f"{ATOM_NS}content")
    description = clean_text(content_html or entry.findtext(f"{ATOM_NS}summary"))

    author = None
    author_el = entry.find(f"{ATOM_NS}author/{ATOM_NS}name")
    if author_el is not None:
        author = clean_text(author_el.text, max_len=100)

    published_at = parse_feed_date(
        entry.findtext(f"{ATOM_NS}published") or entry.findtext(f"{ATOM_NS}updated")
    )

    image = None
    if content_html:
        match = IMG_SRC_RE.search(content_html)
        if match:
            image = match.group(1)

    return {
        "title": title,
        "description": description,
        "url": link,
        "source": source_name,
        "author": author,
        "published_at": published_at,
        "image": image,
    }


def fetch_one_feed(url, source_name):
    """Fetch and parse a single RSS or Atom feed into a list of article dicts."""
    body = http_get_bytes(url)
    root = ET.fromstring(body)
    root_tag = root.tag.split("}")[-1]  # strip namespace, if any

    if root_tag == "rss":
        channel = root.find("channel")
        items = channel.findall("item") if channel is not None else []
        return [a for a in (parse_rss_item(i, source_name) for i in items) if a]

    if root_tag == "feed":
        entries = root.findall(f"{ATOM_NS}entry")
        return [a for a in (parse_atom_entry(e, source_name) for e in entries) if a]

    raise RuntimeError(f"unrecognized feed format (root element <{root_tag}>)")


def fetch_rss_news(feeds, filename, query_label, cap=30):
    """Fetch a list of (url, source_name) RSS/Atom feeds, merge, dedupe, sort by
    recency, and save. Each feed is isolated -- one bad feed logs a warning and
    is skipped rather than failing the whole run."""
    all_articles = []
    seen_urls = set()
    feed_errors = []
    total_rejected = 0

    for url, source_name in feeds:
        try:
            fetched = fetch_one_feed(url, source_name)
            added = 0
            rejected = 0
            for article in fetched:
                if article["url"] in seen_urls:
                    continue
                is_valid, reason = validate_article(article, url)
                if not is_valid:
                    rejected += 1
                    continue
                seen_urls.add(article["url"])
                all_articles.append(article)
                added += 1
            total_rejected += rejected
            log(f"       {source_name}: {added} articles from {url} ({rejected} rejected by validation)")
        except Exception as exc:  # noqa: BLE001 - one bad feed shouldn't kill the rest
            feed_errors.append(f"{source_name} ({url}): {exc}")
            log(f"       WARN {source_name} feed failed -> {exc}")

    all_articles.sort(key=lambda a: a["published_at"] or "", reverse=True)
    all_articles, dropped_dupes = dedupe_similar_titles(all_articles)
    if dropped_dupes:
        log(f"       {dropped_dupes} cross-feed duplicate article(s) removed")
    if total_rejected:
        log(f"       {total_rejected} article(s) rejected by validation across all feeds")
    articles = all_articles[:cap]

    payload = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "query": query_label,
        "count": len(articles),
        "articles": articles,
    }
    write_json(filename, payload)

    if feed_errors:
        log(f"       {len(feed_errors)} of {len(feeds)} feed(s) failed for {filename}")
    if not articles and feed_errors:
        raise RuntimeError("All feeds failed: " + "; ".join(feed_errors))

    return len(articles)


def fetch_aviation_news():
    label = "RSS: " + ", ".join(name for _, name in AVIATION_FEEDS)
    return fetch_rss_news(AVIATION_FEEDS, "news.json", label, cap=30)


def fetch_uap_news():
    label = "RSS: " + ", ".join(name for _, name in UAP_FEEDS)
    return fetch_rss_news(UAP_FEEDS, "uap_news.json", label, cap=30)


# --------------------------------------------------------------------------
# Step 3: sitemap.xml
# --------------------------------------------------------------------------

def generate_sitemap():
    """Regenerate sitemap.xml from every .html file in the site root."""
    html_files = sorted(
        os.path.basename(p) for p in glob.glob(os.path.join(SCRIPT_DIR, "*.html"))
    )
    if not html_files:
        raise RuntimeError("No .html files found to build sitemap.xml from")

    today = datetime.now().strftime("%Y-%m-%d")

    lines = ['<?xml version="1.0" encoding="UTF-8"?>',
             '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']

    for filename in html_files:
        is_home = filename == "index.html"
        loc = SITE_DOMAIN + "/" if is_home else f"{SITE_DOMAIN}/{filename}"
        priority = "1.0" if is_home else "0.8"
        lines.append("  <url>")
        lines.append(f"    <loc>{loc}</loc>")
        lines.append(f"    <lastmod>{today}</lastmod>")
        lines.append("    <changefreq>weekly</changefreq>")
        lines.append(f"    <priority>{priority}</priority>")
        lines.append("  </url>")

    lines.append("</urlset>")

    sitemap_path = os.path.join(SCRIPT_DIR, "sitemap.xml")
    with open(sitemap_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")

    return len(html_files)


# --------------------------------------------------------------------------
# Orchestration
# --------------------------------------------------------------------------

def run_step(step_name, func, *args):
    """Run one step, log start/success/failure, never let it raise upward."""
    log(f"START  {step_name}")
    try:
        result = func(*args)
        log(f"OK     {step_name} -> {result}")
        return {"ok": True, "result": result, "error": None}
    except Exception as exc:  # noqa: BLE001 - intentionally broad, this is a resilience script
        log(f"FAILED {step_name} -> {exc}")
        log(traceback.format_exc(), also_print=False)
        return {"ok": False, "result": None, "error": str(exc)}


def main():
    start_time = time.time()
    log("=" * 60)
    log("Flight Crew Files update run starting")

    env = load_env(ENV_PATH)
    youtube_key = env.get("YOUTUBE_API_KEY") or os.environ.get("YOUTUBE_API_KEY")

    if not youtube_key:
        log("WARNING YOUTUBE_API_KEY not found in .env or environment")

    results = {}

    print("\n[1/4] Fetching latest aviation videos from YouTube...")
    results["videos"] = run_step("Fetch YouTube videos", fetch_youtube_videos, youtube_key)

    print("\n[2/4] Fetching latest aviation news from RSS feeds...")
    results["news"] = run_step("Fetch aviation news", fetch_aviation_news)

    print("\n[3/4] Fetching UAP-specific news from RSS feeds...")
    results["uap_news"] = run_step("Fetch UAP news", fetch_uap_news)

    print("\n[4/4] Generating sitemap.xml...")
    results["sitemap"] = run_step("Generate sitemap.xml", generate_sitemap)

    elapsed = time.time() - start_time
    log(f"Flight Crew Files update run finished in {elapsed:.1f}s")

    videos_count = results["videos"]["result"] if results["videos"]["ok"] else 0
    news_count = results["news"]["result"] if results["news"]["ok"] else 0
    uap_count = results["uap_news"]["result"] if results["uap_news"]["ok"] else 0

    errors = [
        f"- {label}: {r['error']}"
        for label, r in results.items() if not r["ok"]
    ]

    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"Videos fetched:        {videos_count}")
    print(f"News articles fetched: {news_count}")
    print(f"UAP articles fetched:  {uap_count}")
    print(f"Sitemap pages listed:  {results['sitemap']['result'] if results['sitemap']['ok'] else 0}")
    print(f"Time taken:            {elapsed:.1f}s")
    if errors:
        print(f"\nErrors ({len(errors)}):")
        for line in errors:
            print(line)
    else:
        print("\nErrors: none")
    print("=" * 60)
    print(f"Full log: {LOG_PATH}")

    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
