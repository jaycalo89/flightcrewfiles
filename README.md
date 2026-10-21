# Flight Crew Files

**Live site:** [flightcrewfiles.com](https://flightcrewfiles.com)

An aviation media site covering incident case files, survival stories, UAP encounters
and classified aircraft history. It's a static site that **updates itself every day**
through a self-hosted automation pipeline I built and run on Ubuntu.

## Highlights

- **66 pages**, including long-form case files (Air France 447, MH370, Tenerife,
  United 232, Gimli Glider and more), aircraft history (SR-71, A-12 OXCART, U-2,
  F-117), and UAP case pages
- **Daily content pipeline**: aviation and UAP news from RSS feeds, aviation videos
  from the YouTube Data API, and community posts from Hacker News and Aviation Stack
  Exchange, refreshed every morning with no manual work
- **Unattended operations**: a cron job runs the pipeline, verifies the output, commits
  and pushes to GitHub, and reports by Telegram. Weekly runs add a GTmetrix performance
  check, a dead-link audit and log rotation
- **Interactive features** in vanilla JavaScript: site search, saved and bookmarked case
  files, daily quiz, polls, a UAP sightings map (Leaflet), live ATC audio (LiveATC),
  live flight tracking, random case file, and most-read lists
- **SEO and indexing**: sitemap generated automatically (skips `noindex` pages),
  `<noscript>` fallbacks generated from the JS data so crawlers see full content,
  Bing and Google site verification
- **Monetization**: Google AdSense with `ads.txt`

## Automation pipeline

```
cron (6am daily)
  └─ maintain.sh
       ├─ check connectivity, repair DNS if needed
       ├─ setup_flightcrewfiles.py
       │    ├─ fetch YouTube videos        → videos-data.json
       │    ├─ fetch aviation news (RSS)   → news.json
       │    ├─ fetch UAP news (RSS)        → uap_news.json
       │    ├─ fetch community posts       → community_feed.json
       │    ├─ regenerate <noscript> fallbacks
       │    └─ regenerate sitemap.xml
       ├─ verify results
       ├─ commit + push  (hourly retry for up to 6h if the push fails)
       └─ Telegram summary  (emergency alert on failure)

Sundays: GTmetrix check · external link audit · log rotation
```

### Design decisions

- **Every step is isolated.** One failure (bad API key, quota hit, network error) is
  logged and reported but never stops the rest of the run. That's why `maintain.sh`
  deliberately avoids `set -e`.
- **News quality filters.** Articles must match aviation keywords, come from the
  feed's own domain, be recent, resolve to a reachable URL, and not duplicate
  another headline (fuzzy title matching with `difflib`).
- **No secrets in the repo.** API keys and tokens load from a local `.env`, which is
  gitignored. Tracing is suppressed while it loads so tokens never reach the logs.
- **Cache busting.** Each data feed has a `*-version.json` so browsers pick up fresh
  content right away.
- **Python standard library only.** The pipeline needs no `pip install`.

## Stack

| Area | Tools |
|---|---|
| Front end | HTML, CSS, vanilla JavaScript (source + minified builds) |
| Automation | Python 3, Bash, cron on Ubuntu (WSL) |
| Data sources | YouTube Data API, RSS/Atom feeds, Hacker News, Stack Exchange |
| Monitoring | Telegram bot alerts, GTmetrix |
| Hosting | GitHub Pages with a custom domain |

Built with AI-assisted development (Claude Code). I designed the site and the
pipeline, directed and reviewed the code, and run and maintain it day to day.

## Running it locally

```bash
# 1. Create .env in the repo root (never commit it)
#    YOUTUBE_API_KEY=...  GITHUB_TOKEN=...  TELEGRAM_BOT_TOKEN=...
#    TELEGRAM_CHAT_ID=...  GTMETRIX_API_KEY=...

# 2. Refresh content once
./update.sh

# 3. Full maintenance run (what cron calls)
./maintain.sh
```

Every push to `main` publishes through GitHub Pages.
