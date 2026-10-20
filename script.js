// =============================================================
//  WarDogs Refund Portal — every request is denied. As promised.
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
$("hours").addEventListener("input", () => {
  const h = parseFloat($("hours").value);
  const w = $("hours-warning");
  if (h > 100) {
    w.textContent = "⚠ WARNING: More than 100 hours. Seriously?? This will be noted.";
    w.hidden = false;
  } else if (h > 10) {
    w.textContent = "⚠ WARNING: That is more than 10 hours. This will be noted.";
    w.hidden = false;
  } else {
    w.hidden = true;
  }
});

// ---------------- Q6: fun slider ----------------
$("fun").addEventListener("input", () => {
  $("fun-value").textContent = $("fun").value;
});

// ---------------- Q12: word counter ----------------
function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}
$("explanation").addEventListener("input", () => {
  const n = countWords($("explanation").value);
  $("word-count").textContent = n;
  $("word-count").style.color = n >= 50 ? "green" : "red";
});

// ---------------- Q14: fake upload ----------------
const uploadErrors = [
  "Upload failed: file too small to count as suffering.",
  "Upload failed: suffering not detected.",
  "Upload failed: our server is also suffering.",
  "Upload failed: please print the file and send it by fax.",
];
let uploadTries = 0;
$("upload-btn").addEventListener("click", () => {
  const msg = $("upload-msg");
  msg.textContent = uploadErrors[uploadTries % uploadErrors.length];
  msg.hidden = false;
  uploadTries++;
});

// ---------------- Q17: thermodynamics ----------------
const thermo = { solved: false, usedHint: false, wrong: 0, inJoules: false };

function setThermoCorrect(extra) {
  thermo.solved = true;
  const fb = $("thermo-feedback");
  fb.className = "ok";
  fb.textContent = "✔ Correct. This will not help you." + (extra || "");
  $("thermo").readOnly = true;
  $("thermo-check").disabled = true;
  $("thermo-hint").hidden = true;
}

$("thermo-check").addEventListener("click", () => {
  if (thermo.solved) return;
  const raw = $("thermo").value.replace(",", ".").trim();
  const v = parseFloat(raw);
  const fb = $("thermo-feedback");

  if (v >= 0.15 && v <= 0.17) {
    setThermoCorrect();
  } else if (v >= 150 && v <= 170) {
    thermo.inJoules = true;
    setThermoCorrect(" (That's J/K, not kJ/K, but we'll allow it.)");
  } else {
    thermo.wrong++;
    fb.className = "bad";
    fb.textContent = `✘ Incorrect. Please try again. (Attempt ${thermo.wrong})`;
    if (thermo.wrong >= 3) $("thermo-hint").hidden = false;
  }
});

$("thermo").addEventListener("keydown", (e) => {
  if (e.key === "Enter") { e.preventDefault(); $("thermo-check").click(); }
});

$("thermo-hint").addEventListener("click", () => {
  thermo.usedHint = true;
  $("thermo").value = "0.162";
  $("thermo-solution").hidden = false;
  setThermoCorrect();
});

// ---------------- Q23: Terms & Conditions ----------------
const lorem = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.";
(function buildTos() {
  const box = $("tos-box");
  for (let i = 1; i <= 40; i++) {
    const p = document.createElement("p");
    p.textContent = `§${i}. ${lorem}`;
    box.appendChild(p);
  }
  const last = document.createElement("p");
  last.innerHTML = "<b>§41. Refunds: lol no.</b>";
  box.appendChild(last);
})();
$("tos-link").addEventListener("click", (e) => {
  e.preventDefault();
  $("tos-box").hidden = !$("tos-box").hidden;
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
    friend: $("friend").value,
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
  const errors = [];
  if (!d.name) errors.push("1. Full name");
  if (!d.steam) errors.push("2. Steam username");
  if (!d.purchaseDate) errors.push("3. Date of purchase");
  if (isNaN(d.hours) || d.hours < 0) errors.push("4. Total hours played");
  if (!d.reason) errors.push("5. Reason for refund");
  if (!d.oneMore) errors.push("7. \"One more round\"");
  if (!d.favorite) errors.push("8. Favorite moment (everyone has one)");
  if (isNaN(d.launches) || d.launches < 0) errors.push("9. Voluntary launches");
  if (!d.gunpoint) errors.push("11. Gunpoint question");
  if (countWords(d.explanation) < 50) errors.push(`12. Explanation (${countWords(d.explanation)}/50 words)`);
  if (!d.problem) errors.push("13. Is the problem you? (Hint: yes)");
  if (isNaN(d.honesty)) errors.push("15. Honesty rating");
  if (!d.medyk) errors.push("16. Medyk is?");
  if (!thermo.solved) errors.push("17. Engineering competency check");
  if (!d.cat) errors.push("18. Cat has?");
  if (!d.time || !d.timeMode) errors.push("20. Time (and na stare / na nowe)");
  if (!d.ack1 || !d.ack2 || !d.ack3) errors.push("21-23. Final confirmations");
  return errors;
}

// ---------------- Loading screen ----------------
let loadingRunning = false;

function runLoading({ heading, keyframes, messages, onDone }) {
  loadingRunning = true;
  show("loading");
  $("loading-heading").textContent = heading;
  const fill = $("progress-fill");
  const pct = $("progress-pct");
  const pctBox = pct.parentElement;
  const status = $("loading-status");
  const total = keyframes[keyframes.length - 1].t;
  const start = performance.now();
  let lastCounterTick = 0;

  function progressAt(t) {
    for (let i = 0; i < keyframes.length - 1; i++) {
      const a = keyframes[i], b = keyframes[i + 1];
      if (t >= a.t && t <= b.t) {
        const k = (t - a.t) / (b.t - a.t || 1);
        return a.p + (b.p - a.p) * k;
      }
    }
    return keyframes[keyframes.length - 1].p;
  }

  function messageAt(t) {
    let msg = messages[0].text;
    for (const m of messages) if (t >= m.t) msg = m.text;
    return msg;
  }

  function frame(now) {
    const t = now - start;
    const p = Math.min(99, Math.floor(progressAt(t)));
    fill.style.width = p + "%";
    pct.textContent = p;
    pctBox.classList.toggle("stuck", p >= 99);
    status.textContent = messageAt(t);

    if (t - lastCounterTick > 900) {
      visitor += Math.floor(Math.random() * 3) + 1;
      renderCounter();
      lastCounterTick = t;
    }

    if (t < total) {
      requestAnimationFrame(frame);
    } else {
      pctBox.classList.remove("stuck");
      loadingRunning = false;
      onDone();
    }
  }
  requestAnimationFrame(frame);
}

// Main submission: ~10 seconds, goes backwards, gets stuck at 99%
const mainKeyframes = [
  { t: 0, p: 0 },
  { t: 3000, p: 60 },
  { t: 5000, p: 35 },   // backwards!
  { t: 8000, p: 99 },
  { t: 10000, p: 99 },  // stuck
];
const mainMessages = [
  { t: 0, text: "Verifying playtime..." },
  { t: 1500, text: "Consulting legal department..." },
  { t: 3000, text: "Recalculating your excuses..." },
  { t: 5000, text: "Contacting Olek in Denmark..." },
  { t: 6300, text: "Checking if Medyk is here..." },
  { t: 7400, text: "Reviewing thermodynamics answer..." },
  { t: 8500, text: "Almost done (lie)..." },
];

// Appeal: shorter, equally hopeless
const appealKeyframes = [
  { t: 0, p: 0 },
  { t: 2000, p: 80 },
  { t: 3000, p: 20 },
  { t: 5000, p: 99 },
  { t: 6500, p: 99 },
];
const appealMessages = [
  { t: 0, text: "Forwarding appeal to the Appeals Department..." },
  { t: 1500, text: "Appeals Department is on lunch break..." },
  { t: 3000, text: "Appeals Department has returned. They look tired..." },
  { t: 4300, text: "Re-reading your favorite moment..." },
  { t: 5500, text: "Laughing..." },
];

// ---------------- Deny page ----------------
let appeals = 0;
let lastData = null;

function trunc(s, n) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

function shiftHour(time, delta) {
  const [h, m] = time.split(":").map(Number);
  const nh = (h + delta + 24) % 24;
  return String(nh).padStart(2, "0") + ":" + String(m).padStart(2, "0");
}

function buildReasons(d) {
  const r = [];
  const h = d.hours;

  // Hours
  if (h > 2) {
    r.push(`Applicant reported ${h} hours of playtime. The refund window closes at 2 hours. Applicant exceeded it by ${+(h - 2).toFixed(1)} hours (${Math.round(h / 2)}× the limit).`);
  } else {
    r.push(`Applicant reported only ${h} hours of playtime. We do not believe you.`);
  }

  // Fun
  if (d.fun === 0) {
    r.push(`Applicant claims 0% fun across ${h} hours. Doing something you hate for ${h} hours is legally classified as commitment.`);
  } else {
    r.push(`Applicant admits to actively having fun ${d.fun}% of the time, which equals approximately ${Math.round(h * d.fun / 100)} hours of confirmed fun.`);
  }

  // One more round
  const oneMore = {
    yes: "Applicant admitted to saying \"one more round\". Case closed.",
    no: "Applicant claims to have never said \"one more round\". This is statistically impossible.",
    fifth: "Applicant pleaded the fifth regarding \"one more round\". The Department interprets this as YES.",
  };
  r.push(oneMore[d.oneMore]);

  // Reason
  const reasons = {
    "Game is bad": "Reason given: \"Game is bad\". The game was apparently bad enough to play for " + h + " hours.",
    "Didn't enjoy it": "Reason given: \"Didn't enjoy it\". See the fun percentage above.",
    "Technical issues": "Reason given: \"Technical issues\". The only technical issue found is a skill issue.",
    "Spite": "Reason given: \"Spite\". Spite is not a valid refund reason, although it is respected.",
    "Olek is from Denmark": "Reason given: \"Olek is from Denmark\". This is not the game's fault. It is not Olek's fault either. It is nobody's fault.",
    "Other": "Reason given: \"Other\". The Department does not process vague feelings.",
  };
  r.push(reasons[d.reason]);

  // Favorite moment
  r.push(`Applicant has a favorite moment ("${trunc(d.favorite, 90)}"). People who dislike a game do not have favorite moments.`);

  // Launches
  if (d.launches === 0) {
    r.push("Applicant claims 0 voluntary launches. Steam disagrees.");
  } else {
    r.push(`Applicant voluntarily launched the game ${d.launches} time${d.launches === 1 ? "" : "s"}. Nobody voluntarily opens something they hate ${d.launches === 1 ? "even once" : d.launches + " times"}.`);
  }

  // Gunpoint
  r.push(d.gunpoint === "yes"
    ? "Applicant claims to have been held at gunpoint. In a shooter game, this is considered normal gameplay."
    : "Applicant confirms they were not held at gunpoint. All playtime was therefore voluntary.");

  // Honesty
  if (d.honesty === 10) {
    r.push("Applicant rated their honesty 10/10. Nobody who rates themselves 10/10 is honest.");
  } else {
    r.push(`Applicant rated their honesty ${d.honesty}/10. By their own admission, this form is up to ${(10 - d.honesty) * 10}% lies.`);
  }

  // Medyk
  r.push("Medyk was confirmed to be HERE. The team was fully supported at all times, so the game cannot have been that bad.");

  // Thermo
  if (thermo.usedHint) {
    r.push("Applicant could not solve a basic entropy generation problem and required a hint. Applicant's judgement can therefore not be trusted.");
  } else if (thermo.inJoules) {
    r.push("Applicant solved the thermodynamics problem but answered in J/K instead of kJ/K. Units matter. Denied.");
  } else {
    r.push("Applicant correctly calculated the entropy generation. This proves the applicant has too much free time, not too little fun.");
  }

  // Cat
  r.push(`Cat has: "${trunc(d.cat, 60)}". Irrelevant, but noted on file.`);

  // Baca
  r.push(d.baca
    ? "Baca joke received and reviewed by the committee. It was not funny enough to reverse this decision."
    : "Applicant did not provide a Baca joke. This alone is grounds for denial.");

  // Time
  const other = d.timeMode === "na stare"
    ? `${shiftHour(d.time, -1)} na nowe`
    : `${shiftHour(d.time, +1)} na stare`;
  r.push(`Form submitted at ${d.time} ${d.timeMode} (which is ${other}). Refunds are only processed between 25:00 and 25:30, in either time system.`);

  // Confession
  r.push("Applicant signed a confession stating they played this game longer than some people's jobs. Confession accepted.");

  return r;
}

function showDeny(d) {
  const caseNo = "WD-REF-2026-" + String(Math.floor(Math.random() * 100000)).padStart(5, "0");
  $("case-number").textContent = caseNo;
  $("case-name").textContent = d.name;
  $("case-steam").textContent = d.steam;
  $("case-appeals").textContent = `${appeals} (approved: 0)`;

  const stamp = $("stamp");
  stamp.textContent = appeals === 0 ? "REQUEST DENIED" : (appeals === 1 ? "APPEAL DENIED" : `APPEAL #${appeals} DENIED`);
  // restart the slam animation
  stamp.style.animation = "none";
  void stamp.offsetWidth;
  stamp.style.animation = "";

  $("deny-intro").textContent = appeals === 0
    ? `Dear ${d.name}, thank you for your refund request. Our team of qualified professionals has carefully reviewed your submission (approx. 0.4 seconds). Unfortunately, your request has been DENIED for the following reasons:`
    : `Dear ${d.name}, your appeal has been reviewed by the Appeals Department, which is the same department as before. All original reasons still apply, plus one more:`;

  const list = $("deny-reasons");
  list.innerHTML = "";
  const reasons = buildReasons(d);
  if (appeals > 0) {
    reasons.unshift(`Filing ${appeals === 1 ? "an appeal" : appeals + " appeals"} after ${d.hours} hours of gameplay is considered emotional damage to the Department.`);
  }
  for (const text of reasons) {
    const li = document.createElement("li");
    li.textContent = text; // textContent = safe from whatever your friends type
    list.appendChild(li);
  }

  // ✏️ Edit the personal note here
  $("deny-note").textContent =
    `I promised a refund if you didn't like the game. Based on the evidence above (${d.hours} hours, ` +
    `${d.fun}% fun, and a favorite moment), you liked it. A lot. See you in the next round. ` +
    `— The Management`;

  show("deny");
}

// ---------------- Wiring ----------------
form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (loadingRunning) return;
  const d = collect();
  const errors = validate(d);
  if (errors.length) {
    alert("ERROR 400: FORM INCOMPLETE\n\nThe following fields require your attention:\n\n• " + errors.join("\n• ") + "\n\nPlease try again.");
    return;
  }
  lastData = d;
  appeals = 0;
  runLoading({
    heading: "PROCESSING YOUR REQUEST",
    keyframes: mainKeyframes,
    messages: mainMessages,
    onDone: () => showDeny(d),
  });
});

form.addEventListener("reset", () => {
  setTimeout(() => {
    $("fun-value").textContent = $("fun").value;
    $("word-count").textContent = "0";
    $("hours-warning").hidden = true;
    Object.assign(thermo, { solved: false, usedHint: false, wrong: 0, inJoules: false });
    $("thermo").readOnly = false;
    $("thermo-check").disabled = false;
    $("thermo-hint").hidden = true;
    $("thermo-solution").hidden = true;
    $("thermo-feedback").textContent = "";
  });
});

$("appeal-btn").addEventListener("click", () => {
  if (loadingRunning || !lastData) return;
  appeals++;
  runLoading({
    heading: "PROCESSING YOUR APPEAL",
    keyframes: appealKeyframes,
    messages: appealMessages,
    onDone: () => showDeny(lastData),
  });
});
