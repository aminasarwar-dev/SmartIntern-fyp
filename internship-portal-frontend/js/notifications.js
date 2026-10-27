/* =========================================================
   SMARTINTERN — NOTIFICATIONS (one behaviour for every page)
   ---------------------------------------------------------
   • Same panel design on student, company and admin pages
   • Opens with the bell button
   • Closes ONLY with the × button (not on outside click, not on Esc)
   • Works on pages that had no panel at all

   Notification texts below are samples until a notifications API
   exists (GET /notifications) — replace ITEMS or call the API in
   loadItems().
========================================================= */
(function () {

    "use strict";

    const ITEMS = {
        student: [
            { icon: "✦", title: "New AI match", text: "You have a new internship match. Open Browse Internships to see it.", time: "Just now" },
            { icon: "◷", title: "Application update", text: "A company viewed your application.", time: "2 hours ago" },
            { icon: "!", title: "Deadline reminder", text: "An internship you saved closes in 3 days.", time: "Yesterday" }
        ],
        company: [
            { icon: "✦", title: "New applicant", text: "A candidate has applied for one of your internships.", time: "Just now" },
            { icon: "✓", title: "Internship published", text: "Your internship is now visible to students.", time: "3 hours ago" },
            { icon: "!", title: "Licence reminder", text: "Keep your trade licence up to date to stay verified.", time: "Yesterday" }
        ],
        admin: [
            { icon: "▣", title: "Company waiting", text: "A new company is waiting for verification.", time: "Just now" },
            { icon: "◉", title: "New student", text: "A new student registered on SmartIntern.", time: "1 hour ago" },
            { icon: "▤", title: "Internship to review", text: "A new internship was posted.", time: "Yesterday" }
        ]
    };

    const COMPANY_PAGES = [
        "company-dashboard", "company-profile", "post-internship", "manage-internships",
        "view-applicants", "ai-candidate-matches", "hiring-analytics"
    ];

    function currentRole() {
        const page = (location.pathname.split("/").pop() || "").replace(".html", "");
        if (page.indexOf("admin-") === 0) return "admin";
        if (COMPANY_PAGES.indexOf(page) !== -1) return "company";
        try {
            const role = sessionStorage.getItem("smartInternRole");
            if (role === "company" || role === "admin") return role;
        } catch (error) { /* ignore */ }
        return "student";
    }

    function loadItems(role) {
        return ITEMS[role] || ITEMS.student;
    }

    function ensureStyles() {
        if (document.querySelector('link[href$="notifications.css"]')) return;
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "../css/notifications.css";
        document.head.appendChild(link);
    }

    function build(role) {
        const panel = document.createElement("div");
        panel.className = "si-notify";
        panel.id = "notificationPanel";
        panel.setAttribute("role", "dialog");
        panel.setAttribute("aria-label", "Notifications");

        const head = document.createElement("div");
        head.className = "si-notify-head";
        const title = document.createElement("h3");
        title.textContent = "Notifications";
        const close = document.createElement("button");
        close.type = "button";
        close.id = "closeNotifications";
        close.className = "si-notify-close";
        close.setAttribute("aria-label", "Close notifications");
        close.textContent = "×";
        head.append(title, close);

        const list = document.createElement("ul");
        list.className = "si-notify-list";
        loadItems(role).forEach(item => {
            const li = document.createElement("li");
            li.className = "si-notify-item";
            const icon = document.createElement("div");
            icon.className = "si-notify-icon";
            icon.textContent = item.icon;
            const body = document.createElement("div");
            const strong = document.createElement("strong");
            strong.textContent = item.title;
            const text = document.createElement("p");
            text.textContent = item.text;
            const time = document.createElement("small");
            time.textContent = item.time;
            body.append(strong, text, time);
            li.append(icon, body);
            list.appendChild(li);
        });

        panel.append(head, list);
        return panel;
    }

    function init() {
        const oldButton = document.getElementById("notificationButton");
        if (!oldButton) return;

        ensureStyles();

        // a clone has none of the old click handlers
        const button = oldButton.cloneNode(true);
        oldButton.replaceWith(button);
        button.setAttribute("aria-haspopup", "dialog");
        button.setAttribute("aria-expanded", "false");

        // replace whatever panel the page had (or add one)
        const oldPanel = document.getElementById("notificationPanel");
        const panel = build(currentRole());
        if (oldPanel) oldPanel.replaceWith(panel);
        else document.body.appendChild(panel);

        let allowClose = false;

        function open() {
            panel.classList.add("is-open", "show");
            button.setAttribute("aria-expanded", "true");
            button.classList.add("is-read");
        }

        function close() {
            allowClose = true;
            panel.classList.remove("is-open", "show");
            allowClose = false;
            button.setAttribute("aria-expanded", "false");
            button.focus({ preventScroll: true });
        }

        button.addEventListener("click", event => {
            event.preventDefault();
            event.stopPropagation();
            open();
        });

        panel.querySelector("#closeNotifications").addEventListener("click", event => {
            event.stopPropagation();
            close();
        });

        // clicking inside the panel never closes it
        panel.addEventListener("click", event => event.stopPropagation());

        // old page scripts may still try to close it (outside click, Esc, menu click):
        // put it back unless the × button was used
        new MutationObserver(() => {
            if (!allowClose && button.getAttribute("aria-expanded") === "true" &&
                !panel.classList.contains("is-open")) {
                panel.classList.add("is-open", "show");
            }
            if (panel.hasAttribute("hidden")) panel.removeAttribute("hidden");
            if (panel.style.display) panel.style.display = "";
        }).observe(panel, { attributes: true, attributeFilter: ["class", "hidden", "style"] });
    }

    if (document.readyState === "complete") init();
    else window.addEventListener("load", init);

})();
