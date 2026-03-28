/**
 * Abyss FX: lightweight caustics + rising sea-snow / bubbles (canvas).
 * Attaches to each .ocean-bg. Expects optional #abyssCaustics, #abyssSeaSnow in each layer.
 */
(function () {
    const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function resizeCanvas(canvas) {
        if (!canvas || !canvas.parentElement) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = canvas.parentElement.clientWidth || window.innerWidth;
        const h = canvas.parentElement.clientHeight || window.innerHeight;
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        canvas.style.width = w + "px";
        canvas.style.height = h + "px";
        const ctx = canvas.getContext("2d");
        if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function causticsLoop(canvas) {
        if (!canvas) return () => {};
        const ctx = canvas.getContext("2d");
        let raf = 0;
        const t0 = performance.now();

        function frame(now) {
            if (document.hidden) {
                raf = requestAnimationFrame(frame);
                return;
            }
            const w = canvas.clientWidth;
            const h = canvas.clientHeight;
            const t = now - t0;
            ctx.clearRect(0, 0, w, h);
            ctx.globalCompositeOperation = "lighter";

            for (let i = 0; i < 5; i++) {
                const phase = t * 0.00035 + i * 1.7;
                const px = w * (0.45 + 0.38 * Math.sin(phase * 0.9 + i * 0.3));
                const py = h * (0.42 + 0.28 * Math.cos(phase * 0.75 + i * 0.5));
                const r = 60 + 90 * (0.5 + 0.5 * Math.sin(phase * 0.4));
                const a = 0.035 + 0.02 * Math.sin(t * 0.001 + i);
                const grd = ctx.createRadialGradient(px, py, 0, px, py, r);
                grd.addColorStop(0, `rgba(120, 235, 255, ${a})`);
                grd.addColorStop(0.45, `rgba(80, 180, 220, ${a * 0.45})`);
                grd.addColorStop(1, "rgba(0,0,0,0)");
                ctx.fillStyle = grd;
                ctx.fillRect(0, 0, w, h);
            }

            ctx.globalCompositeOperation = "source-over";
            raf = requestAnimationFrame(frame);
        }

        raf = requestAnimationFrame(frame);
        return () => cancelAnimationFrame(raf);
    }

    function seaSnowLoop(canvas) {
        if (!canvas) return () => {};
        const ctx = canvas.getContext("2d");
        const coarse = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
        const count = coarse || window.innerWidth < 768 ? 48 : 96;
        let parts = [];
        let raf = 0;

        function init() {
            const w = canvas.clientWidth;
            const h = canvas.clientHeight;
            parts = [];
            for (let i = 0; i < count; i++) {
                parts.push({
                    x: Math.random() * w,
                    y: Math.random() * h,
                    s: 0.35 + Math.random() * 2.2,
                    vy: 0.15 + Math.random() * 0.85,
                    vx: (Math.random() - 0.5) * 0.35,
                    a: 0.08 + Math.random() * 0.2,
                    wobble: Math.random() * Math.PI * 2,
                });
            }
        }

        function frame() {
            if (document.hidden) {
                raf = requestAnimationFrame(frame);
                return;
            }
            const w = canvas.clientWidth;
            const h = canvas.clientHeight;
            ctx.clearRect(0, 0, w, h);
            ctx.globalCompositeOperation = "lighter";

            const t = performance.now() * 0.001;
            for (let i = 0; i < parts.length; i++) {
                const p = parts[i];
                p.wobble += 0.02;
                p.y -= p.vy;
                p.x += p.vx + Math.sin(p.wobble + t) * 0.15;
                if (p.y < -6) p.y = h + 6;
                if (p.x < -6) p.x = w + 6;
                if (p.x > w + 6) p.x = -6;

                ctx.beginPath();
                ctx.fillStyle = `rgba(200, 245, 255, ${p.a * (0.85 + 0.15 * Math.sin(t + i))})`;
                ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.globalCompositeOperation = "source-over";
            raf = requestAnimationFrame(frame);
        }

        resizeCanvas(canvas);
        init();
        raf = requestAnimationFrame(frame);
        return () => {
            cancelAnimationFrame(raf);
        };
    }

    function bootOcean(root) {
        if (!root) return;
        let caust = root.querySelector(".abyss-caustics, #abyssCaustics");
        let snow = root.querySelector(".abyss-sea-snow, #abyssSeaSnow");

        if (!caust) {
            caust = document.createElement("canvas");
            caust.className = "abyss-caustics";
            caust.id = "abyssCaustics";
            caust.setAttribute("aria-hidden", "true");
            root.insertBefore(caust, root.firstChild);
        }
        if (!snow) {
            snow = document.createElement("canvas");
            snow.className = "abyss-sea-snow";
            snow.id = "abyssSeaSnow";
            snow.setAttribute("aria-hidden", "true");
            root.insertBefore(snow, caust.nextSibling);
        }

        resizeCanvas(caust);
        resizeCanvas(snow);

        const stops = [];
        if (!reduced) {
            stops.push(causticsLoop(caust));
            stops.push(seaSnowLoop(snow));
        }

        let resizeT = 0;
        const onResize = () => {
            clearTimeout(resizeT);
            resizeT = setTimeout(() => {
                resizeCanvas(caust);
                resizeCanvas(snow);
            }, 120);
        };
        window.addEventListener("resize", onResize, { passive: true });

        return () => {
            stops.forEach((fn) => fn && fn());
            window.removeEventListener("resize", onResize);
        };
    }

    function init() {
        if (reduced) return;
        document.querySelectorAll(".ocean-bg").forEach((el) => bootOcean(el));
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
