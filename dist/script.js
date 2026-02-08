
/* ===========================
   CONFIG
   =========================== */

// WhatsApp group invite (opened when user clicks Join WhatsApp after submitting form)
const WHATSAPP_GROUP_URL = "https://chat.whatsapp.com/JI6pHOyOnj45qU6UW100ie";

// BULLSHIT CODE:

// const COUNTER_BASE =
//   "https://api.counterapi.dev/v2/weeoeoeoeoeoeoeoes-team-2815/signups5865865856856";

// // WARNING: putting API key in frontend is not secure (ok for testing)
// const COUNTER_API_KEY = "PASTE_YOUR_API_KEY_HERE";

// // LocalStorage key so we only count once per form submit
const LS_FORM_SUBMITTED_KEY = "mdcatemy_form_submitted_v1";


/* ===========================
   Helpers
   =========================== */
const $ = (sel) => document.querySelector(sel);

function parseCounterValue(json){
  if (!json || typeof json !== "object") return null;

  const candidates = [
    json.value,
    json.count,
    json.data?.value,
    json.data?.count,
    json.data?.stats?.value,
  ];

  for (const c of candidates){
    if (typeof c === "number") return c;
  }
  for (const c of candidates){
    const n = Number(c);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function milestoneFromCount(count){
  if (count >= 5000) return "5000+ joined";
  if (count >= 2000) return "2000+ joined";
  if (count >= 1000) return "1000+ joined";
  if (count >= 500)  return "500+ joined";
  if (count >= 100)  return "100+ joined";
  return "Waitlist is live";
}

/* ===========================
   CounterAPI calls
   =========================== */
async function counterGet(){
  const res = await fetch('https://api.counterapi.dev/v2/gamers-gamess-team-2833/first-counter-2833');
  const count = await res.json();
  if (!res.ok) throw new Error("Counter GET failed");
  return count.data.up_count;
}

async function counterUp() {
  const res = await fetch(
    'https://api.counterapi.dev/v2/gamers-gamess-team-2833/first-counter-2833/up'
  );

  if (!res.ok) throw new Error("Counter UP failed");

  const data = await res.json();
  return parseCounterValue(data);
}

/* ===========================
   Reveal + particles
   =========================== */

function initReveal(){
  const els = document.querySelectorAll(".reveal");
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) e.target.classList.add("in");
    });
  }, { threshold: 0.12 });
  els.forEach(el => io.observe(el));
}

function initParticles(){
  const canvas = $("#fx-canvas");
  const ctx = canvas.getContext("2d");
  let w = canvas.width = window.innerWidth;
  let h = canvas.height = window.innerHeight;

  const particles = [];
  const COUNT = Math.min(95, Math.floor((w*h) / 22000));
  const rand = (min, max) => Math.random() * (max - min) + min;

  for (let i=0; i<COUNT; i++){
    particles.push({
      x: rand(0, w),
      y: rand(0, h),
      r: rand(0.7, 2.2),
      vx: rand(-0.22, 0.22),
      vy: rand(-0.12, 0.12),
      a: rand(0.08, 0.25),
      warm: Math.random() > 0.7
    });
  }

  function resize(){
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resize);

  function draw(){
    ctx.clearRect(0,0,w,h);

    const g = ctx.createRadialGradient(w*0.5, h*0.2, 0, w*0.5, h*0.2, Math.max(w,h)*0.75);
    g.addColorStop(0, "rgba(243,180,0,0.06)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0,0,w,h);

    for (const p of particles){
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < -10) p.x = w+10;
      if (p.x > w+10) p.x = -10;
      if (p.y < -10) p.y = h+10;
      if (p.y > h+10) p.y = -10;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fillStyle = p.warm ? `rgba(243,180,0,${p.a})` : `rgba(255,255,255,${p.a})`;
      ctx.fill();
    }

    requestAnimationFrame(draw);
  }

  draw();
}

/* ===========================
   Main
   =========================== */
document.addEventListener("DOMContentLoaded", async () => {
  $("#year").textContent = new Date().getFullYear();

  initReveal();
  initParticles();

  const formSection = $("#waitlist-form");
  const waitlistBtn = $("#waitlistBtn");
  const whatsappCtaWrap = $("#whatsappCtaWrap");
  const whatsappBtn = $("#whatsappBtn");
  const statusMsg = $("#statusMsg");
  const toastEl = $("#toast");

  // Load initial counter (best effort)
  try{
    const count = await counterGet();
    if (typeof count === "number"){
      $("#waitlistCount").textContent = count.toLocaleString();
    } else {
      $("#waitlistCount").textContent = "—";
    }
  }catch{
    $("#waitlistCount").textContent = "—";
  }

  // Show toast notification (e.g. "Form submitted! Join WhatsApp button has appeared.")
  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add("toast--show");
    setTimeout(function() {
      toastEl.classList.remove("toast--show");
    }, 4500);
  }

  // Join the Waitlist: show embedded Tally form on the same page
  if (waitlistBtn && formSection) {
    waitlistBtn.addEventListener("click", function() {
      formSection.classList.remove("form-section--hidden");
      formSection.setAttribute("aria-hidden", "false");
      formSection.scrollIntoView({ behavior: "smooth", block: "start" });
      if (statusMsg) {
        statusMsg.textContent = "Fill the form below and click Submit.";
        setTimeout(function(){ statusMsg.textContent = ""; }, 4000);
      }
    });
  }

  // Tally form submitted (from postMessage in index.html)
  document.addEventListener("tallyFormSubmitted", function() {
    var alreadyCounted = localStorage.getItem(LS_FORM_SUBMITTED_KEY) === "1";
    if (alreadyCounted) {
      if (whatsappCtaWrap) {
        whatsappCtaWrap.classList.remove("hidden");
        whatsappCtaWrap.setAttribute("aria-hidden", "false");
      }
      if (statusMsg) { statusMsg.textContent = "You're already counted ✅"; setTimeout(function(){ statusMsg.textContent = ""; }, 3500); }
      showToast("\"Join Whatsapp\" button appeared above.");
      return;
    }
    localStorage.setItem(LS_FORM_SUBMITTED_KEY, "1");

    counterUp().then(function(newCount) {
      if (typeof newCount === "number") { $("#waitlistCount").textContent = newCount.toLocaleString(); }
    }).catch(function() {});

    if (whatsappCtaWrap) {
      whatsappCtaWrap.classList.remove("hidden");
      whatsappCtaWrap.setAttribute("aria-hidden", "false");
    }
    if (statusMsg) {
      statusMsg.textContent = "Thanks for joining ✅ Join our WhatsApp group below.";
      setTimeout(function(){ statusMsg.textContent = ""; }, 5000);
    }
    showToast("Form submitted! The Join WhatsApp button has appeared above.");
  });

  if (whatsappBtn) {
    whatsappBtn.addEventListener("click", function() {
      if (!WHATSAPP_GROUP_URL || WHATSAPP_GROUP_URL.includes("PASTE_")) {
        alert("Paste your WhatsApp group invite link in script.js (WHATSAPP_GROUP_URL)");
        return;
      }
      window.open(WHATSAPP_GROUP_URL, "_blank", "noopener,noreferrer");
    });
  }
});