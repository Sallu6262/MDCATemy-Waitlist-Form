/* ===========================
   CONFIG
   =========================== */

import { Counter } from "counterapi";

// Google Form embed (used in iframe)
const GOOGLE_FORM_EMBED_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSeZbVProI79cmUW5v6WH49OWmIhKlDniLhW4Qh-z6dDULm9Sw/viewform?embedded=true";

// WhatsApp group invite (opened after form submit)
const WHATSAPP_GROUP_URL = "https://chat.whatsapp.com/JI6pHOyOnj45qU6UW100ie";

// CounterAPI v2: workspace and counter name from your URL
const COUNTER_WORKSPACE = "weeoeoeoeoeoeoeoes-team-2815";
const COUNTER_NAME = "signups5865865856856";
const COUNTER_ACCESS_TOKEN = "PASTE_YOUR_API_KEY_HERE";

// LocalStorage key so we only count once per submit (and open WhatsApp once per session if desired)
const LS_FORM_SUBMITTED_KEY = "mdcatemy_form_submitted_v1";

/* ===========================
   CounterAPI client (npm package)
   =========================== */

const counterClient =
  COUNTER_ACCESS_TOKEN && !COUNTER_ACCESS_TOKEN.includes("PASTE_")
    ? new Counter({
        workspace: COUNTER_WORKSPACE,
        accessToken: COUNTER_ACCESS_TOKEN,
        debug: false,
      })
    : null;

async function counterGet() {
  if (!counterClient) return null;
  try {
    const result = await counterClient.get(COUNTER_NAME);
    return result?.value != null ? Number(result.value) : null;
  } catch {
    return null;
  }
}

async function counterUp() {
  if (!counterClient) return null;
  try {
    const result = await counterClient.up(COUNTER_NAME);
    return result?.value != null ? Number(result.value) : null;
  } catch {
    return null;
  }
}

/* ===========================
   Helpers
   =========================== */
const $ = (sel) => document.querySelector(sel);

/* ===========================
   Reveal + particles
   =========================== */
function initReveal() {
  const els = document.querySelectorAll(".reveal");
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) e.target.classList.add("in");
    });
  }, { threshold: 0.12 });
  els.forEach((el) => io.observe(el));
}

function initParticles() {
  const canvas = $("#fx-canvas");
  const ctx = canvas.getContext("2d");
  let w = (canvas.width = window.innerWidth);
  let h = (canvas.height = window.innerHeight);

  const particles = [];
  const COUNT = Math.min(95, Math.floor((w * h) / 22000));
  const rand = (min, max) => Math.random() * (max - min) + min;

  for (let i = 0; i < COUNT; i++) {
    particles.push({
      x: rand(0, w),
      y: rand(0, h),
      r: rand(0.7, 2.2),
      vx: rand(-0.22, 0.22),
      vy: rand(-0.12, 0.12),
      a: rand(0.08, 0.25),
      warm: Math.random() > 0.7,
    });
  }

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resize);

  function draw() {
    ctx.clearRect(0, 0, w, h);

    const g = ctx.createRadialGradient(
      w * 0.5,
      h * 0.2,
      0,
      w * 0.5,
      h * 0.2,
      Math.max(w, h) * 0.75
    );
    g.addColorStop(0, "rgba(243,180,0,0.06)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < -10) p.x = w + 10;
      if (p.x > w + 10) p.x = -10;
      if (p.y < -10) p.y = h + 10;
      if (p.y > h + 10) p.y = -10;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.warm
        ? `rgba(243,180,0,${p.a})`
        : `rgba(255,255,255,${p.a})`;
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

  const formIframe = $("#formEmbed");
  const formSection = $("#waitlist-form");
  const waitlistBtn = $("#waitlistBtn");
  const whatsappCtaWrap = $("#whatsappCtaWrap");
  const whatsappBtn = $("#whatsappBtn");
  const statusMsg = $("#statusMsg");

  // Load initial counter (best effort)
  try {
    const count = await counterGet();
    if (typeof count === "number") {
      $("#waitlistCount").textContent = count.toLocaleString();
    } else {
      $("#waitlistCount").textContent = "—";
    }
  } catch {
    $("#waitlistCount").textContent = "—";
  }

  // Join the Waitlist: show embedded form (same page), lazy-load iframe
  if (waitlistBtn && formSection && formIframe) {
    waitlistBtn.addEventListener("click", () => {
      formSection.classList.remove("form-section--hidden");
      formSection.setAttribute("aria-hidden", "false");
      if (!formIframe.src || formIframe.src === "about:blank" || formIframe.src === window.location.origin + "/") {
        formIframe.src = GOOGLE_FORM_EMBED_URL;
      }
      formSection.scrollIntoView({ behavior: "smooth", block: "start" });
      statusMsg.textContent = "Fill the form below and click Submit.";
      setTimeout(() => (statusMsg.textContent = ""), 4000);
    });
  }

  // Detect Google Form submit via iframe load: first load = form, second load = confirmation page (no "I submitted" button)
  let formIframeLoadedOnce = false;
  if (formIframe) {
    formIframe.addEventListener("load", async () => {
      if (!formIframeLoadedOnce) {
        formIframeLoadedOnce = true;
        return;
      }
      // Second load = user submitted the form (confirmation page)
      const alreadyCounted = localStorage.getItem(LS_FORM_SUBMITTED_KEY) === "1";
      if (alreadyCounted) {
        if (whatsappCtaWrap) {
          whatsappCtaWrap.classList.remove("hidden");
          whatsappCtaWrap.setAttribute("aria-hidden", "false");
        }
        statusMsg.textContent = "You're already counted ✅";
        setTimeout(() => (statusMsg.textContent = ""), 3500);
        return;
      }
      localStorage.setItem(LS_FORM_SUBMITTED_KEY, "1");

      // Increment CounterAPI (best effort)
      try {
        const newCount = await counterUp();
        if (typeof newCount === "number") {
          $("#waitlistCount").textContent = newCount.toLocaleString();
        }
      } catch (_) {}

      // Show Join WhatsApp button (no "I have submitted" button)
      if (whatsappCtaWrap) {
        whatsappCtaWrap.classList.remove("hidden");
        whatsappCtaWrap.setAttribute("aria-hidden", "false");
      }
      statusMsg.textContent = "Thanks for joining ✅ Join our WhatsApp group below.";
      setTimeout(() => (statusMsg.textContent = ""), 5000);
    });
  }

  if (whatsappBtn) {
    whatsappBtn.addEventListener("click", () => {
      if (!WHATSAPP_GROUP_URL || WHATSAPP_GROUP_URL.includes("PASTE_")) {
        alert("Paste your WhatsApp group invite link in src/app.js (WHATSAPP_GROUP_URL)");
        return;
      }
      window.open(WHATSAPP_GROUP_URL, "_blank", "noopener,noreferrer");
    });
  }
});
