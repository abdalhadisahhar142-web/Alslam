/* =========================================================
   الإعدادات: غيّر رقم الواتساب هون بس، وكل الأزرار بتتحدّث
   الرقم بالصيغة الدولية بدون + ولا أصفار بالبداية
   ========================================================= */
const WHATSAPP_NUMBER = "963900000000";

/* ---------- روابط الواتساب مع رسالة جاهزة لكل زر ---------- */
document.querySelectorAll(".js-wa").forEach((el) => {
  const msg = el.dataset.msg || "مرحبا";
  el.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  el.target = "_blank";
  el.rel = "noopener";
});

/* ---------- بداية حركة الواجهة بعد التحميل ---------- */
window.addEventListener("load", () => document.body.classList.add("is-loaded"));
// احتياط إذا تأخرت الصور
setTimeout(() => document.body.classList.add("is-loaded"), 1200);

/* ---------- شريط التنقل وزر الواتساب العائم ---------- */
const nav = document.getElementById("nav");
const waFloat = document.querySelector(".wa-float");
const onScroll = () => {
  const y = window.scrollY;
  nav.classList.toggle("is-solid", y > 40);
  waFloat.classList.toggle("is-visible", y > window.innerHeight * 0.6);
  parallax();
};
window.addEventListener("scroll", onScroll, { passive: true });

/* ---------- قائمة الموبايل ---------- */
document.getElementById("burger").addEventListener("click", () => {
  nav.classList.toggle("is-open");
  document.body.style.overflow = nav.classList.contains("is-open") ? "hidden" : "";
});
document.querySelectorAll("#navLinks a").forEach((a) =>
  a.addEventListener("click", () => {
    nav.classList.remove("is-open");
    document.body.style.overflow = "";
  })
);

/* ---------- ظهور العناصر عند النزول ---------- */
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("is-in");
      if (e.target.classList.contains("stat")) countUp(e.target.querySelector(".stat__num"));
      io.unobserve(e.target);
    });
  },
  { threshold: 0.18, rootMargin: "0px 0px -40px 0px" }
);
document.querySelectorAll(".reveal, .stat, #planPath").forEach((el) => io.observe(el));

/* ---------- عدّاد الأرقام ---------- */
function countUp(el) {
  if (!el || el.dataset.done) return;
  el.dataset.done = "1";
  const target = +el.dataset.count;
  const suffix = el.dataset.suffix || "";
  if (reduceMotion) { el.textContent = target.toLocaleString("en-US") + suffix; return; }
  const duration = 1800;
  const start = performance.now();
  const tick = (now) => {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 4);
    el.textContent = Math.round(target * eased).toLocaleString("en-US") + (p === 1 ? suffix : "");
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/* ---------- حركة بسيطة للصور مع النزول (بارالاكس) ---------- */
const pills = document.querySelectorAll(".pill");
function parallax() {
  if (reduceMotion) return;
  const vh = window.innerHeight;
  pills.forEach((p) => {
    const r = p.getBoundingClientRect();
    if (r.bottom < 0 || r.top > vh) return;
    const progress = (r.top + r.height / 2) / vh; // 0 فوق، 1 تحت
    p.style.setProperty("--py", `${30 + progress * 40}%`);
  });
}

/* ---------- شريط المحطات: البطاقة بالنص بتكبر ---------- */
const track = document.getElementById("placesTrack");
const cards = [...track.querySelectorAll(".place")];
let current = 0;

function markCenter() {
  const mid = track.getBoundingClientRect().left + track.clientWidth / 2;
  let best = 0, bestDist = Infinity;
  cards.forEach((c, i) => {
    const r = c.getBoundingClientRect();
    const d = Math.abs(r.left + r.width / 2 - mid);
    if (d < bestDist) { bestDist = d; best = i; }
  });
  current = best;
  cards.forEach((c, i) => c.classList.toggle("is-center", i === best));
}

function goTo(i) {
  current = (i + cards.length) % cards.length;
  // بنحسب الفرق بين نص البطاقة ونص الشريط، وهيك بتشتغل صح مع الاتجاه من اليمين لليسار
  const c = cards[current].getBoundingClientRect();
  const t = track.getBoundingClientRect();
  const delta = (c.left + c.width / 2) - (t.left + t.width / 2);
  track.scrollBy({ left: delta, behavior: reduceMotion ? "auto" : "smooth" });
}

let scrollTimer;
track.addEventListener("scroll", () => {
  cancelAnimationFrame(scrollTimer);
  scrollTimer = requestAnimationFrame(markCenter);
}, { passive: true });

document.getElementById("placesNext").addEventListener("click", () => { goTo(current + 1); restartAuto(); });
document.getElementById("placesPrev").addEventListener("click", () => { goTo(current - 1); restartAuto(); });
cards.forEach((c, i) => c.addEventListener("click", () => { goTo(i); restartAuto(); }));

// تقليب تلقائي، وبيوقف وقت المستخدم يحط الماوس أو يلمس الشريط
let auto;
const startAuto = () => { if (!reduceMotion) auto = setInterval(() => goTo(current + 1), 3800); };
const restartAuto = () => { clearInterval(auto); startAuto(); };
track.addEventListener("mouseenter", () => clearInterval(auto));
track.addEventListener("mouseleave", startAuto);
track.addEventListener("touchstart", () => clearInterval(auto), { passive: true });

window.addEventListener("load", () => { goTo(2); setTimeout(markCenter, 600); startAuto(); });
window.addEventListener("resize", () => { goTo(current); markCenter(); });

/* ---------- نموذج "ابقوا على اطلاع" بيفتح واتساب ---------- */
document.getElementById("notifyForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const phone = e.target.querySelector("input").value.trim();
  const msg = `مرحبا، بدي توصلني مواعيد رحلات العمرة الجديدة. رقمي: ${phone}`;
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
  document.getElementById("notifyHint").textContent = "تمام! كمّل الإرسال من الواتساب 🤍";
});

onScroll();
