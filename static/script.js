// --- Tab switching ---
const tabs = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".panel");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => {
      t.classList.remove("is-active");
      t.setAttribute("aria-selected", "false");
    });
    tab.classList.add("is-active");
    tab.setAttribute("aria-selected", "true");

    const target = tab.dataset.tab;
    panels.forEach((p) => {
      p.classList.toggle("is-hidden", p.dataset.panel !== target);
    });
  });
});

// --- IP lookup ---
const ipForm = document.getElementById("ipForm");
const ipReadout = document.getElementById("ipReadout");

ipForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const ip = document.getElementById("ipInput").value.trim();
  if (!ip) return;

  setLoading(ipForm, true);
  ipReadout.innerHTML = "";

  try {
    const res = await fetch(`/api/ip-lookup?ip=${encodeURIComponent(ip)}`);
    const data = await res.json();

    if (!res.ok) {
      showError(ipReadout, data.error || "Lookup failed.");
      return;
    }

    const rows = [
      ["IP", data.ip],
      ["Country", data.country],
      ["Region", data.region],
      ["City", data.city],
      ["ISP", data.isp],
      ["Org", data.org],
      ["Timezone", data.timezone],
      ["Latitude", data.lat],
      ["Longitude", data.lon],
    ];
    renderReadout(ipReadout, rows);
  } catch (err) {
    showError(ipReadout, "Could not reach the server. Is it running?");
  } finally {
    setLoading(ipForm, false);
  }
});

// --- Username lookup ---
const userForm = document.getElementById("userForm");
const userReadout = document.getElementById("userReadout");

userForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("userInput").value.trim();
  if (!username) return;

  setLoading(userForm, true);
  userReadout.innerHTML = "";

  try {
    const res = await fetch(`/api/username-lookup?username=${encodeURIComponent(username)}`);
    const data = await res.json();

    if (!res.ok) {
      showError(userReadout, data.error || "Lookup failed.");
      return;
    }

    renderSiteResults(userReadout, data.results);
  } catch (err) {
    showError(userReadout, "Could not reach the server. Is it running?");
  } finally {
    setLoading(userForm, false);
  }
});

// --- Helpers ---
function setLoading(form, isLoading) {
  const btn = form.querySelector(".btn");
  btn.disabled = isLoading;
  btn.textContent = isLoading ? "Scanning…" : "Scan";
}

function showError(container, message) {
  container.innerHTML = `<div class="readout-error">[!] ${escapeHtml(message)}</div>`;
}

function renderReadout(container, rows) {
  container.innerHTML = rows
    .map(
      ([label, value], i) => `
      <div class="readout-line" style="animation-delay:${i * 40}ms">
        <span class="k">${escapeHtml(label)}</span>
        <span class="v">${value !== undefined && value !== null && value !== "" ? escapeHtml(String(value)) : "—"}</span>
      </div>`
    )
    .join("");
}

function renderSiteResults(container, results) {
  const labelMap = {
    found: "Found",
    not_found: "Not found",
    unclear: "Unclear",
    error: "Unreachable",
  };

  container.innerHTML = results
    .map(
      (r, i) => `
      <div class="site-row" style="animation-delay:${i * 40}ms">
        <span class="site-name">${escapeHtml(r.site)}</span>
        ${
          r.status === "found"
            ? `<a href="${escapeHtml(r.url)}" target="_blank" rel="noopener noreferrer" class="status ${r.status}">${labelMap[r.status]}</a>`
            : `<span class="status ${r.status}">${labelMap[r.status] || r.status}</span>`
        }
      </div>`
    )
    .join("");
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
