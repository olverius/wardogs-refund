// =============================================================
//  WarDogs Refund Portal — every request is denied. As promised.
//  All text lives in lang.js
// =============================================================

const $ = (id) => document.getElementById(id);
const form = $("refund-form");

const screens = {
  form: $("screen-form"),
  loading: $("screen-loading"),
  deny: $("screen-deny"),
};

function show(name) {
  for (const key in screens) screens[key].hidden = key !== name;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ---------------- Language ----------------
let lang = "en";
try {
  const saved = localStorage.getItem("wd-lang");
  if (saved && LANG[saved]) lang = saved;
  else {
    const nav = (navigator.language || "en").slice(0, 2).toLowerCase();
    if (LANG[nav]) lang = nav;
  }
} catch (e) { /* storage blocked */ }

function t(key, ...args) {
  const v = LANG[lang][key] ?? LANG.en[key];
  return typeof v === "function" ? v(...args) : v;
}

function applyLang() {
  document.documentElement.lang = lang;
  document.title = t("title");
  $("lang").value = lang;
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.innerHTML = t(el.dataset.i18n); // only our own strings from lang.js
  });
  // re-render anything dynamic
  updateHoursWarning();
  renderUpload();
  renderThermo();
  buildTos();
  if (!screens.deny.hidden && lastData) renderDeny();
}

$("lang").addEventListener("change", () => {
  lang = $("lang").value;
  try { localStorage.setItem("wd-lang", lang); } catch (e) {}
  applyLang();
});

// ---------------- Visitor counter ----------------
let visitor = 847;
try {
  const stored = parseInt(localStorage.getItem("wd-visits") || "0", 10);
  localStorage.setItem("wd-visits", String(stored + 1));
  visitor += stored + 1;
} catch (e) { /* storage blocked, whatever */ }

function renderCounter() {
  $("counter").textContent = String(visitor).padStart(6, "0");
}
renderCounter();

// ---------------- Q4: hours warning ----------------
function updateHoursWarning() {
  const h = parseFloat($("hours").value);
  const w = $("hours-warning");
  if (h > 100) {
    w.textContent = t("hours100");
    w.hidden = false;
  } else if (h > 10) {
    w.textContent = t("hours10");
    w.hidden = false;
  } else {
    w.hidden = true;
  }
}
$("hours").addEventListener("input", updateHoursWarning);

// ---------------- Q6: fun slider ----------------
$("fun").addEventListener("input", () => {
  $("fun-value").textContent = $("fun").value;
});

// ---------------- Q12: word counter ----------------
// Chinese has no spaces, so each Chinese character counts as one "word"
function countWords(text) {
  const m = text.match(/[㐀-鿿豈-﫿]|[^\s㐀-鿿豈-﫿]+/g);
  return m ? m.length : 0;
}
$("explanation").addEventListener("input", () => {
  const n = countWords($("explanation").value);
  $("word-count").textContent = n;
  $("word-count").style.color = n >= 50 ? "green" : "red";
});

// ---------------- Q14: fake upload ----------------
let uploadTries = 0;
function renderUpload() {
  const msg = $("upload-msg");
  if (uploadTries === 0) { msg.hidden = true; return; }
  const errs = t("uploadErrors");
  msg.textContent = errs[(uploadTries - 1) % errs.length];
  msg.hidden = false;
}
$("upload-btn").addEventListener("click", () => {
  uploadTries++;
  renderUpload();
});

// ---------------- Q17: thermodynamics ----------------
const thermo = { solved: false, usedHint: false, wrong: 0, inJoules: false, lastWrong: false };

function renderThermo() {
  const fb = $("thermo-feedback");
  if (thermo.solved) {
    fb.className = "ok";
    fb.textContent = t("correct") + (thermo.inJoules ? t("joules") : "");
  } else if (thermo.lastWrong) {
    fb.className = "bad";
    fb.textContent = t("incorrect", thermo.wrong);
  } else {
    fb.className = "";
    fb.textContent = "";
  }
  $("thermo").readOnly = thermo.solved;
  $("thermo-check").disabled = thermo.solved;
  $("thermo-hint").hidden = thermo.solved || thermo.wrong < 3;
  $("thermo-solution").hidden = !thermo.usedHint;
}

$("thermo-check").addEventListener("click", () => {
  if (thermo.solved) return;
  const v = parseFloat($("thermo").value.replace(",", ".").trim());
  if (v >= 0.15 && v <= 0.17) {
    thermo.solved = true;
  } else if (v >= 150 && v <= 170) {
    thermo.solved = true;
    thermo.inJoules = true;
  } else {
    thermo.wrong++;
    thermo.lastWrong = true;
  }
  renderThermo();
});

$("thermo").addEventListener("keydown", (e) => {
  if (e.key === "Enter") { e.preventDefault(); $("thermo-check").click(); }
});

$("thermo-hint").addEventListener("click", () => {
  thermo.usedHint = true;
  thermo.solved = true;
  $("thermo").value = "0.162";
  renderThermo();
});

// ---------------- Q23: Terms & Conditions ----------------
const lorem = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.";
function buildTos() {
  const box = $("tos-box");
  box.innerHTML = "";
  for (let i = 1; i <= 40; i++) {
    const p = document.createElement("p");
    p.textContent = `§${i}. ${lorem}`;
    box.appendChild(p);
  }
  const last = document.createElement("p");
  const b = document.createElement("b");
  b.textContent = t("tosLast");
  last.appendChild(b);
  box.appendChild(last);
}
// delegated, because the link gets re-created when the language changes
document.addEventListener("click", (e) => {
  if (e.target && e.target.id === "tos-link") {
    e.preventDefault();
    $("tos-box").hidden = !$("tos-box").hidden;
  }
});

// ---------------- Validation ----------------
function radio(name) {
  const el = form.querySelector(`input[name="${name}"]:checked`);
  return el ? el.value : "";
}

function collect() {
  return {
    name: $("name").value.trim(),
    steam: $("steam").value.trim(),
    purchaseDate: $("purchaseDate").value,
    hours: parseFloat($("hours").value),
    reason: $("reason").value,
    fun: parseInt($("fun").value, 10),
    oneMore: radio("oneMore"),
    favorite: $("favorite").value.trim(),
    launches: parseInt($("launches").value, 10),
    gunpoint: radio("gunpoint"),
    explanation: $("explanation").value,
    problem: radio("problem"),
    honesty: parseInt($("honesty").value, 10),
    medyk: $("medyk").value,
    cat: $("cat").value.trim(),
    baca: $("baca").value.trim(),
    time: $("time").value,
    timeMode: radio("timeMode"),
    ack1: form.elements.ack1.checked,
    ack2: form.elements.ack2.checked,
    ack3: form.elements.ack3.checked,
  };
}

function validate(d) {
  const missing = [];
  if (!d.name) missing.push("1");
  if (!d.steam) missing.push("2");
  if (!d.purchaseDate) missing.push("3");
  if (isNaN(d.hours) || d.hours < 0) missing.push("4");
  if (!d.reason) missing.push("5");
  if (!d.oneMore) missing.push("7");
  if (!d.favorite) missing.push("8");
  if (isNaN(d.launches) || d.launches < 0) missing.push("9");
  if (!d.gunpoint) missing.push("11");
  const wc = countWords(d.explanation);
  if (wc < 50) missing.push(`12 (${t("words", wc)})`);
  if (!d.problem) missing.push("13");
  if (isNaN(d.honesty)) missing.push("15");
  if (!d.medyk) missing.push("16");
  if (!thermo.solved) missing.push("17");
  if (!d.cat) missing.push("18");
  if (!d.time || !d.timeMode) missing.push("20");
  if (!d.ack1 || !d.ack2 || !d.ack3) missing.push("21-23");
  return missing;
}

// ---------------- Loading screen ----------------
let loadingRunning = false;

// Message timings (ms); the text itself comes from lang.js
const mainTimes = [0, 1500, 3000, 5000, 6300, 7400, 8500];
const appealTimes = [0, 1500, 3000, 4300, 5500];

// Main submission: ~10 seconds, goes backwards, gets stuck at 99%
const mainKeyframes = [
  { t: 0, p: 0 },
  { t: 3000, p: 60 },
  { t: 5000, p: 35 },   // backwards!
  { t: 8000, p: 99 },
  { t: 10000, p: 99 },  // stuck
];
// Appeal: shorter, equally hopeless
const appealKeyframes = [
  { t: 0, p: 0 },
  { t: 2000, p: 80 },
  { t: 3000, p: 20 },
  { t: 5000, p: 99 },
  { t: 6500, p: 99 },
];

function runLoading(kind, onDone) {
  const keyframes = kind === "appeal" ? appealKeyframes : mainKeyframes;
  const times = kind === "appeal" ? appealTimes : mainTimes;
  const headingKey = kind === "appeal" ? "loadAppeal" : "loadMain";
  const msgKey = kind === "appeal" ? "msgAppeal" : "msgMain";

  loadingRunning = true;
  show("loading");
  const fill = $("progress-fill");
  const pct = $("progress-pct");
  const pctBox = pct.parentElement;
  const status = $("loading-status");
  const total = keyframes[keyframes.length - 1].t;
  const start = performance.now();
  let lastCounterTick = 0;

  function progressAt(ms) {
    for (let i = 0; i < keyframes.length - 1; i++) {
      const a = keyframes[i], b = keyframes[i + 1];
      if (ms >= a.t && ms <= b.t) {
        return a.p + (b.p - a.p) * ((ms - a.t) / (b.t - a.t || 1));
      }
    }
    return keyframes[keyframes.length - 1].p;
  }

  function frame(now) {
    const ms = now - start;
    const p = Math.min(99, Math.floor(progressAt(ms)));
    fill.style.width = p + "%";
    pct.textContent = p;
    pctBox.classList.toggle("stuck", p >= 99);

    // looked up every frame, so switching language mid-loading works
    $("loading-heading").textContent = t(headingKey);
    let idx = 0;
    times.forEach((tt, i) => { if (ms >= tt) idx = i; });
    status.textContent = t(msgKey)[idx];

    if (ms - lastCounterTick > 900) {
      visitor += Math.floor(Math.random() * 3) + 1;
      renderCounter();
      lastCounterTick = ms;
    }

    if (ms < total) {
      requestAnimationFrame(frame);
    } else {
      pctBox.classList.remove("stuck");
      loadingRunning = false;
      onDone();
    }
  }
  requestAnimationFrame(frame);
}

// ---------------- Deny page ----------------
let appeals = 0;
let lastData = null;
let caseNo = "";

function trunc(s, n) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

function shiftHour(time, delta) {
  const [h, m] = time.split(":").map(Number);
  const nh = (h + delta + 24) % 24;
  return String(nh).padStart(2, "0") + ":" + String(m).padStart(2, "0");
}

// All the numbers the denial reasons need, in one place
function values(d) {
  return {
    h: d.hours,
    ex: +(d.hours - 2).toFixed(1),
    x: Math.round(d.hours / 2),
    fun: d.fun,
    fh: Math.round(d.hours * d.fun / 100),
    oneMore: d.oneMore,
    reason: d.reason,
    fav: trunc(d.favorite, 90),
    launches: d.launches,
    gunpoint: d.gunpoint,
    honesty: d.honesty,
    p: (10 - d.honesty) * 10,
    thermo: thermo.usedHint ? "hint" : (thermo.inJoules ? "joules" : "solved"),
    cat: trunc(d.cat, 60),
    baca: !!d.baca,
    time: d.time,
    mode: d.timeMode,
    other: d.timeMode === "na stare"
      ? `${shiftHour(d.time, -1)} na nowe`
      : `${shiftHour(d.time, +1)} na stare`,
    appeals,
  };
}

function renderDeny() {
  const d = lastData;
  const v = values(d);

  $("case-number").textContent = caseNo;
  $("case-name").textContent = d.name;
  $("case-steam").textContent = d.steam;
  $("case-appeals").textContent = t("approved", appeals);
  $("stamp").textContent = appeals === 0 ? t("stampReq") : t("stampAppeal", appeals);
  $("deny-intro").textContent = appeals === 0 ? t("introFirst", d.name) : t("introAppeal", d.name);

  const reasons = t("reasons", v);
  if (appeals > 0) reasons.unshift(t("appealExtra", v));
  const list = $("deny-reasons");
  list.innerHTML = "";
  for (const text of reasons) {
    const li = document.createElement("li");
    li.textContent = text; // textContent = safe from whatever your friends type
    list.appendChild(li);
  }

  $("deny-note").textContent = t("note", v);
}

function showDeny() {
  caseNo = "WD-REF-2026-" + String(Math.floor(Math.random() * 100000)).padStart(5, "0");
  renderDeny();
  show("deny");
  // restart the stamp slam animation
  const stamp = $("stamp");
  stamp.style.animation = "none";
  void stamp.offsetWidth;
  stamp.style.animation = "";
}

// ---------------- Wiring ----------------
form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (loadingRunning) return;
  const d = collect();
  const missing = validate(d);
  if (missing.length) {
    alert(t("alert", missing.join(", ")));
    return;
  }
  lastData = d;
  appeals = 0;
  runLoading("main", showDeny);
});

form.addEventListener("reset", () => {
  setTimeout(() => {
    $("fun-value").textContent = $("fun").value;
    $("word-count").textContent = "0";
    Object.assign(thermo, { solved: false, usedHint: false, wrong: 0, inJoules: false, lastWrong: false });
    uploadTries = 0;
    updateHoursWarning();
    renderUpload();
    renderThermo();
  });
});

$("appeal-btn").addEventListener("click", () => {
  if (loadingRunning || !lastData) return;
  appeals++;
  runLoading("appeal", showDeny);
});

applyLang();
