/* ── Clock ────────────────────────────────────────────────────── */

const DAYS_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAYS_SHORT = DAYS_FULL.map(d => d.slice(0, 3));
const MONTHS_FULL = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const MONTHS_SHORT = MONTHS_FULL.map(m => m.slice(0, 3));
const CLOCK_FORMATS = ["dddd HH:mm", "dddd h:mm AP", "dddd HH:mm:ss", "ddd d MMM HH:mm", "d MMMM 'W'ww yyyy", "yyyy-MM-dd HH:mm"];

function pad2(n) { return (n < 10 ? "0" : "") + n; }

function isoWeek(year, month, day) {
  const date = new Date(Date.UTC(year, month, day));
  const weekday = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - weekday);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

let clockFormat = "dddd HH:mm";
try { clockFormat = localStorage.getItem("mj-clock-format") || clockFormat; } catch {}

function formatClock(date, format) {
  return String(format).replace(/'([^']*)'|(dddd|ddd|MMMM|MMM|yyyy|ww|HH|hh|mm|ss|AP|h|d)/g, (m, lit, tok) => {
    if (lit !== undefined) return lit;
    switch (tok) {
      case "dddd": return DAYS_FULL[date.getDay()];
      case "ddd":  return DAYS_SHORT[date.getDay()];
      case "MMMM": return MONTHS_FULL[date.getMonth()];
      case "MMM":  return MONTHS_SHORT[date.getMonth()];
      case "yyyy": return String(date.getFullYear());
      case "ww":   return pad2(isoWeek(date.getFullYear(), date.getMonth(), date.getDate()));
      case "HH":   return pad2(date.getHours());
      case "hh":   return pad2(date.getHours() % 12 || 12);
      case "mm":   return pad2(date.getMinutes());
      case "ss":   return pad2(date.getSeconds());
      case "AP":   return date.getHours() < 12 ? "AM" : "PM";
      case "h":    return String(date.getHours() % 12 || 12);
      case "d":    return String(date.getDate());
      default: return m;
    }
  });
}

const clockBtn = document.getElementById("clockBtn");

setInterval(() => {
  const text = formatClock(new Date(), clockFormat);
  if (text !== clockBtn.textContent) clockBtn.textContent = text;
}, 1000);

clockBtn.textContent = formatClock(new Date(), clockFormat);

clockBtn.addEventListener("contextmenu", (event) => {
  event.preventDefault();
  const index = CLOCK_FORMATS.indexOf(clockFormat);
  clockFormat = CLOCK_FORMATS[(index + 1) % CLOCK_FORMATS.length];
  try { localStorage.setItem("mj-clock-format", clockFormat); } catch {}
  clockBtn.textContent = formatClock(new Date(), clockFormat);
});

/* ── Weather ──────────────────────────────────────────────────── */

const SVG_NS = "http://www.w3.org/2000/svg";

function svgNode(parts) {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  for (const part of parts) {
    const el = document.createElementNS(SVG_NS, part.tag);
    for (const key of Object.keys(part.attrs || {})) el.setAttribute(key, part.attrs[key]);
    svg.appendChild(el);
  }
  return svg;
}

const stroke = { stroke: "currentColor", "stroke-width": "1.6", "stroke-linecap": "round", fill: "none" };
const WX_ICON_PARTS = {
  sun: [{ tag: "circle", attrs: { cx: "12", cy: "12", r: "4" } }, { tag: "path", attrs: { d: "M12 2v2.4M12 19.6V22M2 12h2.4M19.6 12H22M4.9 4.9l1.7 1.7M17.4 17.4l1.7 1.7M19.1 4.9l-1.7 1.7M6.6 17.4l-1.7 1.7", ...stroke, "stroke-width": "1.8" } }],
  moon: [{ tag: "path", attrs: { d: "M20.6 13.4A8.8 8.8 0 1 1 10.6 3.4a7 7 0 0 0 10 10z" } }],
  sunCloud: [{ tag: "circle", attrs: { cx: "7.5", cy: "6.5", r: "2.8" } }, { tag: "path", attrs: { d: "M8.5 17.5a4 4 0 0 1-.6-7.9 5.8 5.8 0 0 1 10.7 1.3 3.4 3.4 0 0 1-.5 6.6z" } }],
  moonCloud: [{ tag: "path", attrs: { d: "M8.5 17.5a4 4 0 0 1-.6-7.9 5.8 5.8 0 0 1 10.7 1.3 3.4 3.4 0 0 1-.5 6.6z" } }, { tag: "path", attrs: { d: "M15.6 2.4a4 4 0 0 1-3.2 5.1 4.2 4.2 0 0 0 6.5 1.8 4.1 4.1 0 0 1-3.3-6.9z" } }],
  cloud: [{ tag: "path", attrs: { d: "M6.6 17.8a4.6 4.6 0 0 1-.7-9.2 6.4 6.4 0 0 1 12.6 1.5 3.9 3.9 0 0 1-.5 7.7z" } }],
  fog: [{ tag: "path", attrs: { d: "M6.6 15.5a4.6 4.6 0 0 1-.7-9.2 6.4 6.4 0 0 1 12.6 1.5 3.9 3.9 0 0 1-.5 7.7z" } }, { tag: "path", attrs: { d: "M4.5 19h15M6.5 21.5h11", ...stroke } }],
  drizzle: [{ tag: "path", attrs: { d: "M6.6 16.5a4.6 4.6 0 0 1-.7-9.2 6.4 6.4 0 0 1 12.6 1.5 3.9 3.9 0 0 1-.5 7.7z" } }, { tag: "path", attrs: { d: "M9 19.5v2M15 19.5v2", ...stroke } }],
  rain: [{ tag: "path", attrs: { d: "M6.6 16.5a4.6 4.6 0 0 1-.7-9.2 6.4 6.4 0 0 1 12.6 1.5 3.9 3.9 0 0 1-.5 7.7z" } }, { tag: "path", attrs: { d: "M7.8 19.5l-.6 2.2M12 19.5l-.6 2.2M16.2 19.5l-.6 2.2", ...stroke } }],
  snow: [{ tag: "path", attrs: { d: "M6.6 15.5a4.6 4.6 0 0 1-.7-9.2 6.4 6.4 0 0 1 12.6 1.5 3.9 3.9 0 0 1-.5 7.7z" } }, { tag: "path", attrs: { d: "M9 19.3v2M8 20.3h2M13 19.3v2M12 20.3h2M16.5 19.3v2M15.5 20.3h2", ...stroke, "stroke-width": "1.4" } }],
  sleet: [{ tag: "path", attrs: { d: "M6.6 16.5a4.6 4.6 0 0 1-.7-9.2 6.4 6.4 0 0 1 12.6 1.5 3.9 3.9 0 0 1-.5 7.7z" } }, { tag: "path", attrs: { d: "M7.6 19.6l-.7 2M11.8 19.6l-.7 2M16 19.6l-.7 2", ...stroke } }],
  thunder: [{ tag: "path", attrs: { d: "M6.6 15.5a4.6 4.6 0 0 1-.7-9.2 6.4 6.4 0 0 1 12.6 1.5 3.9 3.9 0 0 1-.5 7.7z" } }, { tag: "path", attrs: { d: "M11.6 16.5 9.6 19.6h2.1l-.9 3.4 4-4.8h-2.3l1.6-2.7z" } }]
};

function wxIconNode(key) { return svgNode(WX_ICON_PARTS[key] || WX_ICON_PARTS.cloud); }

function wxIconKey(code, night) {
  const c = Number(code);
  switch (c) {
    case 113: return night ? "moon" : "sun";
    case 116: return night ? "moonCloud" : "sunCloud";
    case 119: case 122: return "cloud";
    case 143: case 248: case 260: return "fog";
    case 176: case 263: case 353: return "drizzle";
    case 179: case 227: case 230: case 323: case 326: case 368: return "snow";
    case 182: case 185: case 281: case 284: case 311: case 314: case 317: case 320: case 350: case 362: case 365: case 374: case 377: return "sleet";
    case 200: case 386: case 389: case 392: case 395: return "thunder";
    case 266: case 293: case 296: case 299: case 302: case 305: case 308: case 356: case 359: return "rain";
    case 329: case 332: case 335: case 338: case 371: return "snow";
    default: return "cloud";
  }
}

const weatherBtn = document.getElementById("weatherBtn");
const wxPanel = document.getElementById("wxPanel");
const wxHeroIcon = document.getElementById("wxHeroIcon");
const wxTemp = document.getElementById("wxTemp");
const wxUnit = document.getElementById("wxUnit");
const wxLocation = document.getElementById("wxLocation");
const wxFeels = document.getElementById("wxFeels");
const wxWind = document.getElementById("wxWind");
const wxHumid = document.getElementById("wxHumid");
const wxDivider = document.getElementById("wxDivider");
const wxForecast = document.getElementById("wxForecast");
const wxStatus = document.getElementById("wxStatus");

const wxImperial = /^en[_-]US|en[_-]LR|^my[_.]/.test(navigator.language);
const wxState = { current: null, days: [], location: "", settled: false, reqId: 0 };
let wxRetries = 0;

function wxTempLabel(c) { return wxImperial ? String(Math.round(Number(c) * 9 / 5 + 32)) : String(Math.round(Number(c))); }
function wxTempWithUnit(c) { return wxTempLabel(c) + "°" + (wxImperial ? "F" : "C"); }
function wxWindLabel(kmh) { return wxImperial ? String(Math.round(Number(kmh) * 0.621371)) + " mph" : String(Math.round(Number(kmh))) + " km/h"; }

function todayISO() {
  const d = new Date();
  return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
}

function el(tagName, className, text) {
  const node = document.createElement(tagName);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function parseWttr(data) {
  const cur = data.current_condition && data.current_condition[0];
  if (!cur) throw new Error("empty");
  const area = data.nearest_area && data.nearest_area[0];
  const hour = new Date().getHours();
  wxState.current = {
    tempC: cur.temp_C, feelsC: cur.FeelsLikeC, windKmh: cur.windspeedKmph,
    humidity: cur.humidity, code: Number(cur.weatherCode), isDay: hour >= 6 && hour < 18
  };
  wxState.location = area && area.areaName && area.areaName[0] ? area.areaName[0].value : "";
  wxState.days = (data.weather || [])
    .filter(d => String(d.date).slice(0, 10) > todayISO())
    .slice(0, 3)
    .map(d => {
      let code = null, bestDist = 9999;
      for (const h of (d.hourly || [])) {
        const dist = Math.abs(Number(h.time || 0) - 1200);
        if (dist < bestDist) { bestDist = dist; code = Number(h.weatherCode); }
      }
      return { date: d.date, maxC: d.maxtempC, minC: d.mintempC, code };
    });
  wxState.settled = true;
  renderWeather();
}

function wxRetry() {
  if (wxRetries >= 3) { renderWeather(); return; }
  wxRetries++;
  setTimeout(wxFetch, 4000);
}

function wxFetch() {
  const reqId = ++wxState.reqId;
  if (wxState.settled) wxStatus.hidden = true;
  else { wxStatus.hidden = false; wxStatus.textContent = "Fetching forecast…"; }
  fetch("https://wttr.in/?format=j1")
    .then(r => { if (!r.ok) throw new Error(); return r.json(); })
    .then(data => { if (reqId === wxState.reqId) parseWttr(data); })
    .catch(() => { if (reqId === wxState.reqId) wxRetry(); });
}

function renderWeather() {
  const cur = wxState.current;
  if (!cur) { wxStatus.hidden = false; wxStatus.textContent = "Weather unavailable"; return; }

  const icon = wxIconNode(wxIconKey(cur.code, cur.isDay));
  weatherBtn.replaceChildren(icon);
  weatherBtn.classList.remove("hidden");

  wxHeroIcon.replaceChildren(icon.cloneNode(true));
  wxTemp.textContent = wxTempLabel(cur.tempC);
  wxUnit.textContent = "°" + (wxImperial ? "F" : "C");
  wxFeels.textContent = wxTempWithUnit(cur.feelsC);
  wxWind.textContent = wxWindLabel(cur.windKmh);
  wxHumid.textContent = Math.round(Number(cur.humidity)) + "%";
  wxLocation.textContent = (wxState.location || "").toUpperCase();
  wxStatus.hidden = true;

  const hasDays = wxState.days.length > 0;
  wxDivider.hidden = !hasDays;
  wxForecast.replaceChildren();
  for (const day of wxState.days) {
    const d = new Date(day.date + "T12:00:00");
    const cell = el("div", "wx-day");
    cell.appendChild(wxIconNode(wxIconKey(day.code, false)));
    const col = el("div");
    col.appendChild(el("div", "wx-day-name", DAYS_FULL[d.getDay()].toUpperCase()));
    const temps = el("div", "wx-day-temps");
    temps.appendChild(el("span", null, wxTempLabel(day.maxC) + "°"));
    temps.appendChild(el("span", "lo", wxTempLabel(day.minC) + "°"));
    col.appendChild(temps);
    cell.appendChild(col);
    wxForecast.appendChild(cell);
  }
}

weatherBtn.addEventListener("click", () => togglePanel(wxPanel));
weatherBtn.addEventListener("auxclick", (event) => {
  if (event.button === 1) { event.preventDefault(); wxRetries = 0; wxFetch(); }
});
weatherBtn.addEventListener("contextmenu", (event) => {
  event.preventDefault();
  wxRetries = 0;
  wxFetch();
});

/* ── Panel manager ────────────────────────────────────────────── */

const calPanel = document.getElementById("calPanel");

function closePanels() {
  calPanel.classList.remove("open");
  wxPanel.classList.remove("open");
}

function togglePanel(panel) {
  if (panel.classList.contains("open")) closePanels();
  else { closePanels(); panel.classList.add("open"); }
}

/* ── Calendar (clock panel) ───────────────────────────────────── */

const calHero = document.getElementById("calHero");
const calHeroDate = document.getElementById("calHeroDate");
const calYear = document.getElementById("calYear");
const calYearFill = document.getElementById("calYearFill");
const calYearPct = document.getElementById("calYearPct");
const calGrid = document.getElementById("calGrid");
const calMonthLabel = document.getElementById("calMonthLabel");

function localeFirstDay() {
  try {
    const info = new Intl.Locale(navigator.language).weekInfo;
    if (info && info.firstDay) return info.firstDay % 7;
  } catch {}
  return 0;
}

let weekStart = 0;
try { weekStart = Number(localStorage.getItem("mj-week-start")); } catch {}
if (Number.isNaN(weekStart) || weekStart < 0 || weekStart > 6) weekStart = localeFirstDay();

let viewYear = new Date().getFullYear();
let viewMonth = new Date().getMonth();

function dateKey(y, m, d) { return y + "-" + pad2(m + 1) + "-" + pad2(d); }

function monthGrid(year, month, start) {
  const leading = (new Date(year, month, 1).getDay() - start + 7) % 7;
  const cursor = new Date(year, month, 1 - leading);
  const todayKey = todayISO();
  const weeks = [];
  for (let w = 0; w < 6; w++) {
    const days = [];
    let thursday = null;
    for (let d = 0; d < 7; d++) {
      if (cursor.getDay() === 4) thursday = { year: cursor.getFullYear(), month: cursor.getMonth(), day: cursor.getDate() };
      days.push({ year: cursor.getFullYear(), month: cursor.getMonth(), day: cursor.getDate(), inMonth: cursor.getMonth() === month && cursor.getFullYear() === year, weekend: cursor.getDay() === 0 || cursor.getDay() === 6, today: dateKey(cursor.getFullYear(), cursor.getMonth(), cursor.getDate()) === todayKey });
      cursor.setDate(cursor.getDate() + 1);
    }
    const anchor = thursday || days[0];
    weeks.push({ week: isoWeek(anchor.year, anchor.month, anchor.day), days });
  }
  return weeks;
}

function yearProgressPercent() {
  const now = new Date();
  const start = Date.UTC(now.getFullYear(), 0, 1);
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const daysInYear = Math.round((Date.UTC(now.getFullYear() + 1, 0, 1) - start) / 86400000);
  return Math.max(0, Math.min(100, Math.round(((today - start) / 86400000 / daysInYear) * 100)));
}

function renderCal() {
  const now = new Date();
  const viewingCurrent = viewYear === now.getFullYear() && viewMonth === now.getMonth();

  calHeroDate.textContent = MONTHS_FULL[now.getMonth()] + " " + now.getDate();
  calHero.classList.toggle("clickable", !viewingCurrent);
  calHero.title = viewingCurrent ? "" : "Back to today";

  const pct = yearProgressPercent();
  calYear.textContent = String(now.getFullYear());
  calYearPct.textContent = pct + "%";
  calYearFill.style.width = pct + "%";

  const order = [];
  for (let i = 0; i < 7; i++) order.push((weekStart + i) % 7);

  calGrid.replaceChildren();
  const headerRow = el("div", "cal-week-row");
  const head = el("span", "cal-week-num w-head", "W");
  head.title = "Start weeks on " + (weekStart === 1 ? "Sunday" : "Monday");
  head.addEventListener("click", () => {
    weekStart = weekStart === 1 ? 0 : 1;
    try { localStorage.setItem("mj-week-start", String(weekStart)); } catch {}
    renderCal();
  });
  headerRow.appendChild(head);
  for (const d of order) headerRow.appendChild(el("span", "cal-day-hdr", DAYS_SHORT[d].toUpperCase()));
  calGrid.appendChild(headerRow);

  for (const week of monthGrid(viewYear, viewMonth, weekStart)) {
    const row = el("div", "cal-week-row");
    row.appendChild(el("span", "cal-week-num", String(week.week)));
    for (const day of week.days) {
      const cls = "cal-cell" + (day.today ? " today" : "") + (day.weekend ? " weekend" : "") + (day.inMonth ? "" : " out");
      row.appendChild(el("span", cls, String(day.day)));
    }
    calGrid.appendChild(row);
  }

  calMonthLabel.textContent = (MONTHS_FULL[viewMonth] + " " + viewYear).toUpperCase();
}

function moveMonth(delta) {
  const target = new Date(viewYear, viewMonth + delta, 1);
  viewYear = target.getFullYear();
  viewMonth = target.getMonth();
  renderCal();
}

function goToToday() {
  viewYear = new Date().getFullYear();
  viewMonth = new Date().getMonth();
  renderCal();
}

document.getElementById("calPrev").addEventListener("click", () => moveMonth(-1));
document.getElementById("calNext").addEventListener("click", () => moveMonth(1));
calHero.addEventListener("click", () => { if (!calHero.classList.contains("clickable")) return; goToToday(); });
calPanel.addEventListener("wheel", (event) => {
  if (event.deltaY === 0) return;
  moveMonth(event.deltaY > 0 ? 1 : -1);
}, { passive: true });

clockBtn.addEventListener("click", () => togglePanel(calPanel));

renderCal();

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") { closePanels(); return; }
  if (!calPanel.classList.contains("open")) return;
  if (event.key === "ArrowLeft") { event.preventDefault(); moveMonth(-1); }
  else if (event.key === "ArrowRight") { event.preventDefault(); moveMonth(1); }
  else if (event.key === "ArrowUp") { event.preventDefault(); moveMonth(-12); }
  else if (event.key === "ArrowDown") { event.preventDefault(); moveMonth(12); }
  else if (event.key === "[") { moveMonth(-1); }
  else if (event.key === "]") { moveMonth(1); }
  else if (event.key === "{") { moveMonth(-12); }
  else if (event.key === "}") { moveMonth(12); }
  else if (event.key === "t" || event.key === "T") { goToToday(); }
  else if (event.key === "w" || event.key === "W") {
    weekStart = weekStart === 1 ? 0 : 1;
    try { localStorage.setItem("mj-week-start", String(weekStart)); } catch {}
    renderCal();
  }
});

/* ── GitHub: profile + repositories ───────────────────────────── */

const LANG_COLORS = {
  JavaScript: "#f1e05a", TypeScript: "#3178c6", Python: "#3572A5", Go: "#00ADD8",
  Rust: "#dea584", Shell: "#89e051", Lua: "#000080", HTML: "#e34c26", CSS: "#563d7c",
  "C++": "#f34b7d", C: "#555555", Java: "#b07219", PHP: "#4F5D95", Ruby: "#701516",
  Vue: "#41b883", Svelte: "#ff3e00", Dockerfile: "#384d54", Nix: "#7e7eff",
  Makefile: "#427819", "C#": "#178600", Kotlin: "#A97BFF", Swift: "#F05138"
};

function fmtUpdated(dateStr) {
  const days = Math.round((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (days < 1) return "today";
  if (days < 30) return days + " days ago";
  const months = Math.round(days / 30);
  return months < 12 ? months + " months ago" : Math.round(days / 365) + " years ago";
}

function renderRepo(repo) {
  const row = el("a", "repo");
  row.href = repo.html_url;
  row.target = "_blank";
  row.rel = "noopener noreferrer";

  const top = el("div", "repo-top");
  top.appendChild(el("span", "repo-name", repo.name));
  top.appendChild(el("span", "repo-updated", fmtUpdated(repo.pushed_at)));
  row.appendChild(top);

  if (repo.description) row.appendChild(el("p", "repo-desc", repo.description));

  const meta = el("div", "repo-meta");
  if (repo.language) {
    const lang = el("span", "repo-lang", repo.language);
    lang.style.setProperty("--lang-color", LANG_COLORS[repo.language] || "#8b949e");
    meta.appendChild(lang);
  }
  if (repo.stargazers_count > 0) meta.appendChild(el("span", null, "★ " + repo.stargazers_count));
  if (repo.forks_count > 0) meta.appendChild(el("span", null, "⑂ " + repo.forks_count));
  row.appendChild(meta);
  return row;
}

function renderRepos(repos) {
  const list = document.getElementById("reposList");
  list.replaceChildren();
  const owned = repos.filter(r => !r.fork && !r.archived).sort((a, b) => b.stargazers_count - a.stargazers_count || b.pushed_at.localeCompare(a.pushed_at));
  const forked = repos.filter(r => r.fork).sort((a, b) => b.pushed_at.localeCompare(a.pushed_at));
  const show = owned.slice(0, 14).concat(forked.slice(0, 3));
  if (!show.length) { list.appendChild(el("p", "repos-status", "No public repositories.")); return; }
  for (const repo of show) list.appendChild(renderRepo(repo));
}

function fetchRepos() {
  const list = document.getElementById("reposList");
  list.replaceChildren();
  list.appendChild(el("p", "repos-status", "Loading repositories…"));
  fetch("https://api.github.com/users/mjtiempo/repos?per_page=100&sort=pushed")
    .then(r => { if (!r.ok) throw new Error(); return r.json(); })
    .then(renderRepos)
    .catch(() => {
      list.replaceChildren();
      list.appendChild(el("p", "repos-status", "Could not load repositories."));
    });
}

function fetchProfile() {
  fetch("https://api.github.com/users/mjtiempo")
    .then(r => { if (!r.ok) throw new Error(); return r.json(); })
    .then(user => {
      document.querySelector(".profile-name").textContent = user.name || user.login;
      document.querySelector(".profile-handle").textContent = "@" + user.login;
      document.querySelector(".profile-bio").textContent = user.bio || "";
      const meta = document.querySelector(".profile-meta");
      meta.replaceChildren();
      if (user.location) { const s = el("span", "pin", "● " + user.location); meta.appendChild(s); }
      meta.appendChild(el("span", null, "★ " + user.followers + " followers"));
      meta.appendChild(el("span", null, "▦ " + user.public_repos + " public repos"));
      const email = document.querySelector(".profile-actions .btn[href^='mailto']");
      if (user.blog && !email.previousElementSibling) {
        const blog = el("a", "btn ghost");
        blog.href = user.blog.startsWith("http") ? user.blog : "https://" + user.blog;
        blog.target = "_blank";
        blog.rel = "noopener noreferrer";
        blog.textContent = "Website";
        document.querySelector(".profile-actions").appendChild(blog);
      }
    })
    .catch(() => {});
}

document.getElementById("reposRefresh").addEventListener("click", fetchRepos);

fetchProfile();
fetchRepos();
wxFetch();
setInterval(() => { wxRetries = 0; wxFetch(); }, 15 * 60 * 1000);

if (location.hash === "#calendar") togglePanel(calPanel);
else if (location.hash === "#weather") togglePanel(wxPanel);
