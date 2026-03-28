/**
 * Scroll reveals + hero line animation (studio-style, lightweight).
 */
(function () {
    const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function initReveal() {
        if (reduced) {
            document.querySelectorAll("[data-reveal], [data-reveal-stagger]").forEach((el) => {
                el.classList.add("is-visible");
            });
            document.querySelectorAll(".page-hero__eyebrow, .page-hero__lede, .page-hero__line").forEach((el) => {
                el.classList.add("is-visible");
            });
            return;
        }

        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((en) => {
                    if (!en.isIntersecting) return;
                    en.target.classList.add("is-visible");
                    io.unobserve(en.target);
                });
            },
            { threshold: 0.08, rootMargin: "0px 0px -8% 0px" }
        );

        document.querySelectorAll("[data-reveal], [data-reveal-stagger]").forEach((el) => io.observe(el));

        document.querySelectorAll("[data-reveal-delay]").forEach((el) => {
            const d = el.getAttribute("data-reveal-delay");
            if (d) el.style.setProperty("--reveal-delay", d);
        });
    }

    function initHero() {
        if (reduced) return;

        const hero = document.querySelector(".page-hero--animate");
        if (!hero) return;

        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((en) => {
                    if (!en.isIntersecting) return;
                    hero.querySelectorAll(".page-hero__eyebrow, .page-hero__lede").forEach((el) => {
                        el.classList.add("is-visible");
                    });
                    hero.querySelectorAll(".page-hero__line").forEach((line, i) => {
                        setTimeout(() => line.classList.add("is-visible"), 80 + i * 100);
                    });
                    io.unobserve(en.target);
                });
            },
            { threshold: 0.2 }
        );
        io.observe(hero);
    }

    function initParallax() {
        if (reduced) return;
        const els = document.querySelectorAll("[data-parallax]");
        if (!els.length) return;

        let ticking = false;
        function tick() {
            ticking = false;
            const y = window.scrollY || 0;
            els.forEach((el) => {
                const speed = parseFloat(el.getAttribute("data-parallax") || "0.15");
                const rect = el.getBoundingClientRect();
                const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * speed * 0.02;
                el.style.transform = `translate3d(0, ${offset}px, 0)`;
            });
        }

        window.addEventListener(
            "scroll",
            () => {
                if (ticking) return;
                ticking = true;
                requestAnimationFrame(tick);
            },
            { passive: true }
        );
        tick();
    }

    function boot() {
        initReveal();
        initHero();
        initParallax();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot);
    } else {
        boot();
    }
})();
