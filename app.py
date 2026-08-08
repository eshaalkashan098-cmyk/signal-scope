"""
Flask backend for the OSINT web tool.
Wraps the same lookup logic from tracker.py as JSON API endpoints,
and serves the frontend.
"""

from flask import Flask, render_template, request, jsonify
import requests

app = Flask(__name__)

SITES = {
    "GitHub": "https://github.com/{}",
    "Reddit": "https://www.reddit.com/user/{}",
    "Twitter/X": "https://x.com/{}",
    "Instagram": "https://www.instagram.com/{}",
    "Tumblr": "https://{}.tumblr.com",
}

HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; OSINT-Starter/1.0)"
}


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/ip-lookup")
def api_ip_lookup():
    ip = request.args.get("ip", "").strip()
    if not ip:
        return jsonify({"error": "No IP address provided."}), 400

    url = f"http://ip-api.com/json/{ip}"

    try:
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        data = response.json()
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Network error: {e}"}), 502
    except ValueError:
        return jsonify({"error": "Could not parse response from server."}), 502

    if data.get("status") == "fail":
        return jsonify({"error": data.get("message", "Lookup failed.")}), 400

    result = {
        "ip": data.get("query"),
        "country": data.get("country"),
        "region": data.get("regionName"),
        "city": data.get("city"),
        "isp": data.get("isp"),
        "org": data.get("org"),
        "timezone": data.get("timezone"),
        "lat": data.get("lat"),
        "lon": data.get("lon"),
    }
    return jsonify(result)


@app.route("/api/username-lookup")
def api_username_lookup():
    username = request.args.get("username", "").strip()
    if not username:
        return jsonify({"error": "No username provided."}), 400

    results = []
    for site, pattern in SITES.items():
        url = pattern.format(username)
        try:
            resp = requests.get(url, headers=HEADERS, timeout=5, allow_redirects=True)
            if resp.status_code == 200:
                status = "found"
            elif resp.status_code == 404:
                status = "not_found"
            else:
                status = "unclear"
        except requests.exceptions.RequestException:
            status = "error"

        results.append({"site": site, "url": url, "status": status})

    return jsonify({"username": username, "results": results})


if __name__ == "__main__":
    app.run(debug=True, port=5000)
