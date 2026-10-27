/* =====================================================
   SMARTINTERN — HIRING ANALYTICS
   Sidebar, notifications, profile and analytics rendering
===================================================== */

document.addEventListener("DOMContentLoaded", () => {
    const $ = (id) => document.getElementById(id);

    /* ---------------------------------------------
       COMPANY PROFILE
    --------------------------------------------- */

    function getCompanyProfile() {
        const possibleKeys = [
            "smartInternCompanyProfile",
            "smartInternCompany",
            "smartInternLogin"
        ];

        for (const key of possibleKeys) {
            try {
                const value = JSON.parse(sessionStorage.getItem(key) || "null");
                if (value && typeof value === "object") return value;
            } catch (error) {
                // Ignore invalid or non-JSON storage values.
            }
        }

        return {};
    }

    const profile = getCompanyProfile();

    const companyName =
        profile.companyName ||
        profile.company_name ||
        profile.name ||
        profile.fullName ||
        profile.full_name ||
        "Company";

    const initials = companyName
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(part => part.charAt(0))
        .join("")
        .toUpperCase() || "C";

    ["sidebarCompanyName", "topbarCompanyName"].forEach(id => {
        if ($(id)) $(id).textContent = companyName;
    });

    ["sidebarCompanyAvatar", "topbarCompanyAvatar"].forEach(id => {
        if ($(id)) $(id).textContent = initials;
    });

    /* ---------------------------------------------
       MOBILE SIDEBAR
    --------------------------------------------- */

    const sidebar = $("dashboardSidebar");
    const overlay = $("sidebarOverlay");
    const mobileMenu = $("mobileMenu");

    function closeSidebar() {
        sidebar?.classList.remove("active", "show");
        overlay?.classList.remove("active", "show");
        document.body.classList.remove("sidebar-open");
    }

    mobileMenu?.addEventListener("click", () => {
        sidebar?.classList.toggle("active");
        overlay?.classList.toggle("active");
        document.body.classList.toggle(
            "sidebar-open",
            sidebar?.classList.contains("active")
        );
    });

    overlay?.addEventListener("click", closeSidebar);

    document.querySelectorAll(".sidebar-link").forEach(link => {
        link.addEventListener("click", closeSidebar);
    });

    /* ---------------------------------------------
       NOTIFICATIONS
    --------------------------------------------- */

    const notificationButton = $("notificationButton");
    const notificationPanel = $("notificationPanel");
    const closeNotifications = $("closeNotifications");

    function openNotifications() {
        notificationPanel?.classList.add("show");
        notificationButton?.setAttribute("aria-expanded", "true");
    }

    function hideNotifications() {
        notificationPanel?.classList.remove("show");
        notificationButton?.setAttribute("aria-expanded", "false");
    }

    notificationButton?.setAttribute("aria-expanded", "false");

    notificationButton?.addEventListener("click", event => {
        event.stopPropagation();

        if (notificationPanel?.classList.contains("show")) {
            hideNotifications();
        } else {
            openNotifications();
        }
    });

    closeNotifications?.addEventListener("click", hideNotifications);

    document.addEventListener("click", event => {
        if (
            notificationPanel?.classList.contains("show") &&
            !notificationPanel.contains(event.target) &&
            !notificationButton?.contains(event.target)
        ) {
            hideNotifications();
        }
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            hideNotifications();
            closeSidebar();
        }
    });

    /* ---------------------------------------------
       LOGOUT
    --------------------------------------------- */

    $("logoutLink")?.addEventListener("click", async event => {
        event.preventDefault();

        const shouldLogout = await SmartDialog.confirm({
            title: "Log out?",
            message: "Are you sure you want to log out of your company account?",
            confirmText: "Yes, log out"
        });
        if (!shouldLogout) return;

        [
            "smartInternToken",
            "smartInternLogin",
            "smartInternRole",
            "smartInternCompanyProfile"
        ].forEach(key => {
            sessionStorage.removeItem(key);
        });

        if (window.SmartInternSession) { window.SmartInternSession.clear(); }

        window.location.href = "login.html";
    });

    /* ---------------------------------------------
       ANALYTICS DATA
       No fake statistics are inserted.
       Replace this object with your real API response.
    --------------------------------------------- */

    const analyticsData = {
        internships: null,
        applications: null,
        shortlisted: null,
        interview: null,
        selected: null,
        trend: [],
        roles: []
    };

    function formatNumber(value) {
        return Number.isFinite(Number(value))
            ? Number(value).toLocaleString()
            : "—";
    }

    function setText(id, value) {
        const element = $(id);
        if (element) element.textContent = value;
    }

    function setProgressBar(id, value, maximum) {
        const element = $(id);
        if (!element) return;

        const number = Number(value);
        const max = Number(maximum);

        if (!Number.isFinite(number) || !Number.isFinite(max) || max <= 0) {
            element.style.width = "0%";
            return;
        }

        element.style.width = `${Math.max(0, Math.min(100, (number / max) * 100))}%`;
    }

    function renderStats(data) {
        setText("statInternships", formatNumber(data.internships));
        setText("statApplications", formatNumber(data.applications));
        setText("statShortlisted", formatNumber(data.shortlisted));
        setText("statSelected", formatNumber(data.selected));

        setText("pipelineApplications", formatNumber(data.applications));
        setText("pipelineShortlisted", formatNumber(data.shortlisted));
        setText("pipelineInterview", formatNumber(data.interview));
        setText("pipelineSelected", formatNumber(data.selected));

        const max = Math.max(
            Number(data.applications) || 0,
            Number(data.shortlisted) || 0,
            Number(data.interview) || 0,
            Number(data.selected) || 0
        );

        setProgressBar("barApplications", data.applications, max);
        setProgressBar("barShortlisted", data.shortlisted, max);
        setProgressBar("barInterview", data.interview, max);
        setProgressBar("barSelected", data.selected, max);
    }

    function renderTrend(trend) {
        const chart = $("applicationChart");
        const labels = $("chartLabels");

        if (!chart || !labels) return;

        if (!Array.isArray(trend) || trend.length === 0) {
            chart.innerHTML = `
                <text x="300" y="110" text-anchor="middle"
                    fill="#8f8293" font-size="13">
                    Analytics data will appear here
                </text>`;
            labels.innerHTML = "<span>—</span>".repeat(6);
            return;
        }

        const points = trend.slice(-6);
        const maxValue = Math.max(...points.map(item => Number(item.count) || 0), 1);

        const chartWidth = 580;
        const chartHeight = 190;
        const left = 10;
        const top = 8;
        const bottom = 195;
        const usableHeight = chartHeight - 20;
        const step = points.length > 1
            ? chartWidth / (points.length - 1)
            : 0;

        const coordinates = points.map((item, index) => {
            const count = Math.max(0, Number(item.count) || 0);
            const x = left + (step * index);
            const y = bottom - ((count / maxValue) * usableHeight);
            return { x, y };
        });

        const polyline = coordinates
            .map(point => `${point.x},${point.y}`)
            .join(" ");

        const circles = coordinates.map(point =>
            `<circle cx="${point.x}" cy="${point.y}" r="4"></circle>`
        ).join("");

        chart.innerHTML = `
            <polyline points="${polyline}"></polyline>
            ${circles}
        `;

        labels.innerHTML = points.map(item =>
            `<span>${escapeHTML(item.label || "")}</span>`
        ).join("");
    }

    function renderRoles(roles) {
        const body = $("internshipAnalyticsBody");
        if (!body) return;

        if (!Array.isArray(roles) || roles.length === 0) {
            body.innerHTML = `
                <tr>
                    <td colspan="3" class="empty-table">
                        Internship analytics will appear here
                        when data is connected.
                    </td>
                </tr>`;
            return;
        }

        body.innerHTML = roles.map(role => {
            const status = String(role.status || "Active");
            const statusClass = status.toLowerCase() === "closed" ? "closed" : "";

            return `
                <tr>
                    <td>${escapeHTML(role.title || "Untitled internship")}</td>
                    <td>${formatNumber(role.applications)}</td>
                    <td>
                        <span class="status-tag ${statusClass}">
                            ${escapeHTML(status)}
                        </span>
                    </td>
                </tr>`;
        }).join("");
    }

    function escapeHTML(value) {
        return String(value).replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[character]);
    }

    function renderAnalytics(data) {
        renderStats(data);
        renderTrend(data.trend);
        renderRoles(data.roles);
    }

    /* ---------------------------------------------
       PERIOD SELECTOR
       Re-render after data is loaded from the API.
    --------------------------------------------- */

    $("analyticsPeriod")?.addEventListener("change", event => {
        const period = event.target.value;

        document.dispatchEvent(new CustomEvent("smartInternAnalyticsPeriodChange", {
            detail: { period }
        }));
    });

    /* ---------------------------------------------
       CONNECT YOUR API HERE
       Keep the response format consistent with analyticsData.
       Do not add invented endpoint URLs.
    --------------------------------------------- */

    renderAnalytics(analyticsData);

    // When your API is ready, call:
    // renderAnalytics(apiResponse);
    // Expected keys: internships, applications, shortlisted,
    // interview, selected, trend: [{ label, count }],
    // roles: [{ title, applications, status }].
});