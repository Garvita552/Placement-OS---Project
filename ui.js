// Global UI interactions: 3D tilt, cursor highlight tracking, and reveal animations.
(function () {
  const prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function attachTilt(el) {
    if (!el) return;
    el.style.willChange = "transform";

    let raf = null;
    let last = null;

    function onMove(e) {
      if (prefersReduced) return;
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      const rotY = (x - 0.5) * 14;
      const rotX = (0.5 - y) * 12;

      el.style.setProperty("--mx", `${Math.round(x * 100)}%`);
      el.style.setProperty("--my", `${Math.round(y * 100)}%`);

      last = { rotX, rotY };
      if (raf) return;
        raf = requestAnimationFrame(() => {
          raf = null;
          if (!last) return;
          /* Rotate only (no translate) — keeps cursor inside stable hit box; avoids hover flicker. */
          el.style.transform = `perspective(900px) rotateX(${clamp(last.rotX, -10, 10)}deg) rotateY(${clamp(last.rotY, -12, 12)}deg)`;
        });
    }

    function onLeave() {
      el.style.transform = "";
      el.style.setProperty("--mx", "50%");
      el.style.setProperty("--my", "35%");
    }

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
  }

  function applyTiltToCards() {
    // Only [data-tilt] — avoids fighting CSS transforms on .card (jank + battery).
    document.querySelectorAll("[data-tilt]").forEach((el) => attachTilt(el));
  }

  function wrapCardHitboxes() {
    document.querySelectorAll(".cards").forEach((grid) => {
      Array.from(grid.children).forEach((child) => {
        if (!child.classList.contains("card")) return;
        if (child.parentElement.classList.contains("card-hitbox")) return;
        const hb = document.createElement("div");
        hb.className = "card-hitbox card-trigger";
        grid.insertBefore(hb, child);
        hb.appendChild(child);
      });
    });
  }

  function observeCardGrids() {
    wrapCardHitboxes();
    document.querySelectorAll(".cards").forEach((grid) => {
      const mo = new MutationObserver(() => {
        wrapCardHitboxes();
      });
      mo.observe(grid, { childList: true });
    });
  }

  function applyReveal() {
    /* Cards with .card--enter use their own staggered animation (index). */
    const els = Array.from(
      document.querySelectorAll(".card:not(.card--enter), .glass-box, .page-section")
    );
    if (!("IntersectionObserver" in window) || prefersReduced) return;

    els.forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = el.style.transform || "translateY(16px)";
      el.style.transition = "opacity 600ms ease, transform 700ms ease";
    });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          const el = en.target;
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
          io.unobserve(el);
        });
      },
      { threshold: 0.12 }
    );

    els.forEach((el) => io.observe(el));
  }

  function init() {
    applyTiltToCards();
    observeCardGrids();
    applyReveal();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

