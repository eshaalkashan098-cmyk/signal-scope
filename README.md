# Signal Scope — Web Version

A browser-based version of your OSINT tool: an IP lookup and username checker,
served as a small website instead of a terminal script.

## Run it locally first

```bash
cd osint-web
pip3 install -r requirements.txt
python3 app.py
```

Then open **http://127.0.0.1:5000** in your browser. Test the IP tab with `8.8.8.8`
and the username tab with something like `octocat`.

## How it's structured

- `app.py` — Flask backend. Two API routes:
  - `/api/ip-lookup?ip=...` → calls ip-api.com, returns JSON
  - `/api/username-lookup?username=...` → checks each site, returns JSON
- `templates/index.html` — the page structure
- `static/style.css` — the visual design (a dark "radar console" theme)
- `static/script.js` — handles form submits, calls the API, renders results

This mirrors the logic from your `tracker.py` — same lookups, just returning
JSON instead of printing to a terminal, with a webpage on top calling it.

## Making it live for other people to use

Right now it only runs on your own laptop. To make it reachable by anyone
on the internet, you need to **host** it somewhere. Good free/cheap options
for a small Flask app:

1. **[Render](https://render.com)** — free tier, connects directly to a GitHub repo, simplest option
2. **[Railway](https://railway.app)** — similar, usage-based free tier
3. **[PythonAnywhere](https://www.pythonanywhere.com)** — free tier built specifically for Python apps

General steps (Render as the example):
1. Push this project to a GitHub repo (see the earlier README for git commands)
2. Sign up at render.com, click "New Web Service", connect your GitHub repo
3. Set the start command to: `python app.py` (or better for production: `gunicorn app:app` — add `gunicorn` to requirements.txt first)
4. Render gives you a public URL like `https://your-app.onrender.com` — that's what you share

## Before you share it publicly

A few things worth doing once real strangers can use this:

- **Rate limit it.** `ip-api.com`'s free tier allows 45 requests/minute total —
  if this gets any traffic, you'll hit that fast and everyone starts seeing errors.
  Consider adding a simple per-IP rate limit (the `flask-limiter` package makes this easy).
- **Turn off debug mode** (`app.run(debug=True)` → `app.run(debug=False)`) before
  deploying — debug mode can leak internal details if something errors.
- **Add the consent/ethics note prominently** — it's already in the footer, but
  make sure it stays visible; this tool surfaces info about real IPs and accounts.
- **Consider a simple abuse safeguard**, like not letting the same visitor spam
  hundreds of lookups per minute (rate limiting above covers this too).
