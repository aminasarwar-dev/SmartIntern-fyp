/* =====================================================
   SMARTINTERN — NAVIGATION (landing page)
   • Phone / tablet: menu button opens a dropdown with the
     links AND the Login / Get Started buttons
   • Menu links scroll smoothly to their section
   • The link of the section you are on is highlighted
===================================================== */
(function () {

    "use strict";

    const navbar = document.querySelector(".navbar");
    const menuButton = document.querySelector(".menu-btn");
    const nav = document.querySelector(".navbar nav");

    let panel = null;

    function buildPanel() {
        if (!navbar || !nav) return;

        panel = document.createElement("div");
        panel.className = "mobile-nav";
        panel.id = "mobileNav";

        nav.querySelectorAll("a").forEach(link => {
            const copy = document.createElement("a");
            copy.href = link.getAttribute("href");
            copy.className = "mobile-link";
            copy.textContent = link.textContent.trim();
            panel.appendChild(copy);
        });

        const actions = document.createElement("div");
        actions.className = "mobile-actions";

        const login = document.createElement("a");
        login.href = "login.html";
        login.className = "mobile-login";
        login.textContent = "Login";

        const start = document.createElement("a");
        start.href = "profile-setup.html";
        start.className = "mobile-start";
        start.textContent = "Get Started";

        actions.append(login, start);
        panel.appendChild(actions);
        navbar.appendChild(panel);

        panel.addEventListener("click", event => {
            if (event.target.closest("a")) closeMenu();
        });
    }

    function setIcon(open) {
        const icon = menuButton && menuButton.querySelector("i");
        if (icon) icon.className = open ? "fa-solid fa-xmark" : "fa-solid fa-bars";
    }

    function openMenu() {
        if (!panel) return;
        panel.classList.add("open");
        menuButton.setAttribute("aria-expanded", "true");
        menuButton.setAttribute("aria-label", "Close menu");
        setIcon(true);
    }

    function closeMenu() {
        if (!panel) return;
        panel.classList.remove("open");
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute("aria-label", "Open menu");
        setIcon(false);
    }

    buildPanel();

    if (menuButton && panel) {
        menuButton.setAttribute("aria-controls", "mobileNav");

        menuButton.addEventListener("click", event => {
            event.stopPropagation();
            if (panel.classList.contains("open")) closeMenu();
            else openMenu();
        });

        document.addEventListener("click", event => {
            if (panel.classList.contains("open") && !navbar.contains(event.target)) closeMenu();
        });

        document.addEventListener("keydown", event => {
            if (event.key === "Escape") closeMenu();
        });

        window.addEventListener("resize", () => {
            if (window.innerWidth > 1000) closeMenu();
        });
    }

    /* ---------- highlight the current section ---------- */

    const sections = Array.from(document.querySelectorAll("main#home, section[id]"));
    const links = document.querySelectorAll(".navbar nav a, .mobile-nav a.mobile-link");

    function updateActive() {
        let current = "home";
        const line = window.scrollY + 220;

        sections.forEach(section => {
            if (section.offsetTop <= line) current = section.id;
        });

        // bottom of the page = last section (contact)
        if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
            current = "contact";
        }

        links.forEach(link => {
            link.classList.toggle("active", link.getAttribute("href") === "#" + current);
        });
    }

    window.addEventListener("scroll", updateActive, { passive: true });
    updateActive();

})();
