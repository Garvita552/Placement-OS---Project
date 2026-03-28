/**
 * Shared chrome: subtle ocean + navbar for inner pages.
 * Set window.__SHELL_ACTIVE__ = 'daily' | 'tracker' | 'timetable' | 'notes' | 'ai' | 'overall' | 'dashboard' | 'details' | '' before loading.
 */
(function () {
    if (!localStorage.getItem("authToken")) return;

    const ACTIVE = window.__SHELL_ACTIVE__ || "";

    function navActive(id) {
        if (id === "dashboard" && (ACTIVE === "dashboard" || ACTIVE === "details")) return "nav-link--active";
        return id === ACTIVE ? "nav-link--active" : "";
    }

    window.toggleShellMenu = function () {
        const navLinks = document.getElementById("navLinks");
        const hamburger = document.getElementById("hamburgerMenu");
        if (navLinks) navLinks.classList.toggle("active");
        if (hamburger) hamburger.classList.toggle("active");
    };

    const ocean = document.createElement("div");
    ocean.className = "ocean-bg ocean-bg--shell";
    ocean.setAttribute("aria-hidden", "true");
    ocean.innerHTML =
        '<div class="abyss-hue-orbit" aria-hidden="true"></div>' +
        '<canvas class="abyss-caustics" id="abyssCaustics" aria-hidden="true"></canvas>' +
        '<canvas class="abyss-sea-snow" id="abyssSeaSnow" aria-hidden="true"></canvas>' +
        '<div class="ocean-waves"></div><div class="ocean-bubbles"></div>';

    const nav = document.createElement("nav");
    nav.className = "navbar";
    nav.innerHTML = `
    <h2><span class="navbar-brand-emoji" aria-hidden="true">🪼</span> Placement OS</h2>
    <div class="nav-links" id="navLinks">
        <span class="${navActive("home")}" data-dive-href="index.html">Home</span>
        <span class="${navActive("dashboard")}" data-dive-href="dashboard.html">Topics</span>
        <span class="${navActive("daily")}" data-dive-href="daily-tracker.html">Daily</span>
        <span class="${navActive("tracker")}" data-dive-href="tracker.html">Tracker</span>
        <span class="${navActive("timetable")}" data-dive-href="timetable.html">Timetable</span>
        <span class="${navActive("notes")}" data-dive-href="notes.html">Notes</span>
        <span class="${navActive("ai")}" data-dive-href="ai.html">AI Help</span>
        <span class="${navActive("overall")}" data-dive-href="overall-tracker.html">Analytics</span>
    </div>
    <div class="nav-actions">
        <button type="button" class="theme-toggle" aria-label="Switch ocean or forest theme" title="Ocean ↔ Forest">
            <span class="theme-toggle__to-forest" aria-hidden="true">🌿</span>
            <span class="theme-toggle__to-ocean" aria-hidden="true">⚓</span>
        </button>
        <span class="username-label" id="usernameLabel">User</span>
        <button type="button" onclick="logout()" style="padding: 10px 14px;">Logout</button>
        <button class="hamburger" id="hamburgerMenu" type="button" onclick="toggleShellMenu()" aria-label="Menu">
            <span></span><span></span><span></span>
        </button>
    </div>`;

    if (!document.querySelector(".navbar")) {
        document.body.prepend(nav);
        document.body.prepend(ocean);
    }

    if (typeof setAuthUI === "function") {
        setAuthUI();
    }

    if (typeof window.syncPlacementThemeUi === "function") {
        window.syncPlacementThemeUi();
    }
})();
