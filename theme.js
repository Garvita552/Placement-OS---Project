/**
 * Ocean / Forest theme. Sets html[data-theme="ocean"|"forest"].
 */
(function () {
    var STORAGE = "placement_os_theme";

    function get() {
        try {
            return localStorage.getItem(STORAGE) || "ocean";
        } catch (e) {
            return "ocean";
        }
    }

    function set(theme) {
        if (theme !== "ocean" && theme !== "forest") theme = "ocean";
        document.documentElement.setAttribute("data-theme", theme);
        try {
            localStorage.setItem(STORAGE, theme);
        } catch (e) {}
        syncToggleUi();
    }

    function toggle() {
        set(get() === "ocean" ? "forest" : "ocean");
    }

    function syncToggleUi() {
        var t = get();
        document.querySelectorAll(".theme-toggle").forEach(function (btn) {
            btn.setAttribute("aria-pressed", t === "forest" ? "true" : "false");
            btn.setAttribute("data-theme-mode", t);
            var toForest = btn.querySelector(".theme-toggle__to-forest");
            var toOcean = btn.querySelector(".theme-toggle__to-ocean");
            if (toForest && toOcean) {
                toForest.style.removeProperty("display");
                toOcean.style.removeProperty("display");
            }
        });

        document.querySelectorAll(".navbar-brand-emoji").forEach(function (el) {
            el.textContent = t === "forest" ? "🌿" : "🪼";
        });
    }

    function ensureThemeBg() {
        if (!document.body || document.getElementById("placement-themes-bg")) return;
        var wrap = document.createElement("div");
        wrap.id = "placement-themes-bg";
        wrap.setAttribute("aria-hidden", "true");
        wrap.innerHTML =
            '<div class="sky-layer sky-layer--ocean"></div><div class="sky-layer sky-layer--forest"></div>';
        document.body.insertBefore(wrap, document.body.firstChild);
    }

    function boot() {
        set(get());
        ensureThemeBg();
        syncToggleUi();
    }

    window.getPlacementTheme = get;
    window.setPlacementTheme = set;
    window.togglePlacementTheme = toggle;
    window.syncPlacementThemeUi = syncToggleUi;

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot);
    } else {
        boot();
    }

    document.addEventListener("click", function (e) {
        if (e.target.closest(".theme-toggle")) {
            e.preventDefault();
            toggle();
        }
    });
})();
