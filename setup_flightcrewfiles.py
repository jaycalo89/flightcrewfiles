#!/usr/bin/env python3
"""
Master setup/update script for Flight Crew Files.

Run daily with:
    python3 setup_flightcrewfiles.py

Fetches fresh aviation videos and news, regenerates sitemap.xml, and logs
everything to update_log.txt. Each step is independent -- if one fails
(bad API key, quota exceeded, network error), the rest still run.
"""

import glob
import json
import os
import sys
import time
import traceback
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone

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


def write_json(filename, data):
    path = os.path.join(SCRIPT_DIR, filename)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    return path


# --------------------------------------------------------------------------
# Step 1: YouTube videos -> videos.json
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
    write_json("videos.json", payload)
    return len(items)


# --------------------------------------------------------------------------
# Step 2: Aviation news -> news.json
# --------------------------------------------------------------------------

def fetch_newsapi(api_key, query, filename, page_size=20):
    """Shared NewsAPI /v2/everything fetch, used for both general and UAP news."""
    if not api_key:
        raise RuntimeError("NEWSAPI_KEY is not set in .env")

    params = {
        "q": query,
        "language": "en",
        "sortBy": "publishedAt",
        "pageSize": str(page_size),
        "apiKey": api_key,
    }
    url = "https://newsapi.org/v2/everything?" + urllib.parse.urlencode(params)
    data = http_get_json(url)

    if data.get("status") != "ok":
        raise RuntimeError(f"NewsAPI error for query '{query}': {data.get('message', 'unknown error')}")

    articles = []
    for a in data.get("articles", []):
        articles.append({
            "title": a.get("title"),
            "description": a.get("description"),
            "url": a.get("url"),
            "source": (a.get("source") or {}).get("name"),
            "author": a.get("author"),
            "published_at": a.get("publishedAt"),
            "image": a.get("urlToImage"),
        })

    payload = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "query": query,
        "count": len(articles),
        "articles": articles,
    }
    write_json(filename, payload)
    return len(articles)


def fetch_aviation_news(api_key):
    return fetch_newsapi(
        api_key,
        query='aviation OR airline OR airplane OR aircraft',
        filename="news.json",
        page_size=20,
    )


def fetch_uap_news(api_key):
    return fetch_newsapi(
        api_key,
        query='UAP OR UFO OR "unidentified aerial phenomena" OR "unidentified flying object"',
        filename="uap_news.json",
        page_size=20,
    )


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
    newsapi_key = env.get("NEWSAPI_KEY") or os.environ.get("NEWSAPI_KEY")

    if not youtube_key:
        log("WARNING YOUTUBE_API_KEY not found in .env or environment")
    if not newsapi_key:
        log("WARNING NEWSAPI_KEY not found in .env or environment")

    results = {}

    print("\n[1/4] Fetching latest aviation videos from YouTube...")
    results["videos"] = run_step("Fetch YouTube videos", fetch_youtube_videos, youtube_key)

    print("\n[2/4] Fetching latest aviation news...")
    results["news"] = run_step("Fetch aviation news", fetch_aviation_news, newsapi_key)

    print("\n[3/4] Fetching UAP-specific news...")
    results["uap_news"] = run_step("Fetch UAP news", fetch_uap_news, newsapi_key)

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
