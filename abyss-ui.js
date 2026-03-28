/**
 * Abyss UI: dive navigation, liquid ripples, loader, Chart.js biolume helpers.
 */
(function () {
    const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function ensureDiveOverlay() {
        let el = document.getElementById("abyss-dive-overlay");
        if (!el) {
            el = document.createElement("div");
            el.id = "abyss-dive-overlay";
            el.setAttribute("aria-hidden", "true");
            document.body.appendChild(el);
        }
        return el;
    }

    ensureDiveOverlay();

    window.diveTo = function (href) {
        if (!href) return;
        if (reduced) {
            window.location.href = href;
            return;
        }
        document.body.classList.add("abyss-dive-out");
        window.setTimeout(() => {
            window.location.href = href;
        }, 460);
    };

    document.addEventListener(
        "click",
        function (e) {
            const link = e.target.closest("[data-dive-href]");
            if (!link) return;
            const href = link.getAttribute("data-dive-href");
            if (!href) return;
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
            e.preventDefault();
            diveTo(href);
        },
        true
    );

    /* ---- Liquid ripple ---- */
    function rippleAt(el, clientX, clientY) {
        if (reduced) return;
        const r = document.createElement("span");
        r.className = "abyss-ripple";
        const rect = el.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 1.2;
        r.style.width = r.style.height = size + "px";
        r.style.left = clientX - rect.left - size / 2 + "px";
        r.style.top = clientY - rect.top - size / 2 + "px";
        el.appendChild(r);
        r.addEventListener("animationend", () => r.remove());
    }

    document.addEventListener(
        "click",
        function (e) {
            const t = e.target.closest("button, .btn, .btn-card-open, .nav-links span, .hamburger");
            if (!t) return;
            rippleAt(t, e.clientX, e.clientY);
        },
        true
    );

    /* ---- Loader ---- */
    const jellySvg =
        '<svg class="abyss-jelly-svg" viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
        '<defs><radialGradient id="jg" cx="40%" cy="35%" r="55%">' +
        '<stop offset="0%" stop-color="#a5f3fc"/><stop offset="55%" stop-color="#22d3ee" stop-opacity="0.5"/>' +
        '<stop offset="100%" stop-color="#8b5cf6" stop-opacity="0"/></radialGradient></defs>' +
        '<ellipse cx="60" cy="52" rx="38" ry="32" fill="url(#jg)"/>' +
        '<path d="M35 78 Q50 120 60 128 Q70 120 85 78" fill="none" stroke="rgba(34,211,238,0.5)" stroke-width="3" stroke-linecap="round"/>' +
        '<path d="M48 80 Q55 118 60 124 Q65 118 72 80" fill="none" stroke="rgba(139,92,246,0.45)" stroke-width="2" stroke-linecap="round"/>' +
        "</svg>";

    function ensureLoaderRoot() {
        let root = document.getElementById("abyss-loader-root");
        if (!root) {
            root = document.createElement("div");
            root.id = "abyss-loader-root";
            root.innerHTML =
                '<div class="abyss-loader-mark">' +
                jellySvg +
                "<span>Compressing depth…</span></div>";
            document.body.appendChild(root);
        }
        return root;
    }

    window.AbyssLoader = {
        show() {
            ensureLoaderRoot().classList.add("is-on");
        },
        hide() {
            const r = document.getElementById("abyss-loader-root");
            if (r) r.classList.remove("is-on");
        },
    };

    /**
     * Chart.js: glowing line + gradient fill under curve (call from datasets config).
     * Usage: ...AbyssChart.datasetDefaults(ctx, chartArea)
     */
    window.AbyssChart = {
        gradientFill(ctx, chartArea) {
            if (!chartArea) return "rgba(34, 211, 238, 0.15)";
            const g = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            g.addColorStop(0, "rgba(34, 211, 238, 0.42)");
            g.addColorStop(0.45, "rgba(99, 102, 241, 0.15)");
            g.addColorStop(1, "rgba(139, 92, 246, 0.03)");
            return g;
        },
        lineDataset(label, data) {
            return {
                label,
                data,
                borderColor: "rgba(34, 211, 238, 0.95)",
                borderWidth: 2,
                tension: 0.35,
                fill: true,
                pointBackgroundColor: "#22d3ee",
                pointBorderColor: "#e879f9",
                pointRadius: 3,
                pointHoverRadius: 7,
                pointHoverBorderWidth: 2,
                backgroundColor: (ctx) => {
                    const chart = ctx.chart;
                    const { ctx: c, chartArea } = chart;
                    if (!chartArea) return "rgba(34, 211, 238, 0.2)";
                    return window.AbyssChart.gradientFill(c, chartArea);
                },
            };
        },
    };
})();
