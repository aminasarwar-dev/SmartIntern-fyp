javascript
/* =========================================================
   SMARTINTERN — APPLICANTS PAGE
   UI interactions + demo data
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    const $ = id => document.getElementById(id);

    const list = $("applicantList");
    const search = $("applicantSearch");
    const internshipFilter = $("internshipFilter");
    const statusFilter = $("applicantStatusFilter");
    const sortFilter = $("applicantSort");
    const emptyState = $("applicantsEmptyState");
    const modal = $("applicantModal");
    const confirmButton = $("confirmApplicantAction");
    const cancelButton = $("cancelApplicantAction");
    const notificationButton = $("notificationButton");
    const notificationPanel = $("notificationPanel");
    const toast = $("applicantToast");

    const STORAGE_KEY = "smartInternApplicantsDemo";

    /*
     * FICTIONAL DEMO DATA.
     * Replace this array with data returned by your API.
     */

    const initialApplicants = [
        {
            id: "demo-app-101",
            name: "Ayesha Khan",
            email: "ayesha.demo@example.com",
            internship: "Frontend Developer Intern",
            skills: ["HTML", "CSS", "JavaScript"],
            education: "BS Computer Science",
            appliedAt: "2026-10-13",
            status: "Under Review",
            matchScore: 92
        },
        {
            id: "demo-app-102",
            name: "Usman Ali",
            email: "usman.demo@example.com",
            internship: "Frontend Developer Intern",
            skills: ["JavaScript", "React", "Git"],
            education: "BS Software Engineering",
            appliedAt: "2026-10-12",
            status: "Shortlisted",
            matchScore: 88
        },
        {
            id: "demo-app-103",
            name: "Sara Ahmed",
            email: "sara.demo@example.com",
            internship: "UI/UX Design Intern",
            skills: ["Figma", "Wireframing", "Prototyping"],
            education: "BS Computer Science",
            appliedAt: "2026-10-11",
            status: "Interview",
            matchScore: 90
        },
        {
            id: "demo-app-104",
            name: "Hamza Malik",
            email: "hamza.demo@example.com",
            internship: "Data Analyst Intern",
            skills: ["Python", "SQL", "Excel"],
            education: "BS Data Science",
            appliedAt: "2026-10-09",
            status: "Under Review",
            matchScore: 84
        },
        {
            id: "demo-app-105",
            name: "Fatima Noor",
            email: "fatima.demo@example.com",
            internship: "UI/UX Design Intern",
            skills: ["Figma", "User Research", "UI Design"],
            education: "BS Software Engineering",
            appliedAt: "2026-10-07",
            status: "Selected",
            matchScore: 95
        },
        {
            id: "demo-app-106",
            name: "Bilal Hassan",
            email: "bilal.demo@example.com",
            internship: "Data Analyst Intern",
            skills: ["Python", "SQL", "Data Visualization"],
            education: "BS Computer Science",
            appliedAt: "2026-10-05",
            status: "Rejected",
            matchScore: 67
        }
    ];

    const allowedStatuses = [
        "Under Review",
        "Shortlisted",
        "Interview",
        "Selected",
        "Rejected"
    ];

    let applicants = loadApplicants();
    let pendingAction = null;
    let previousFocus = null;
    let toastTimer = null;

    /* ---------------- HELPERS ---------------- */

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[character]);
    }

    function initials(name) {
        return String(name || "Candidate")
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map(part => part.charAt(0).toUpperCase())
            .join("");
    }

    function formatDate(value) {
        if (!value) return "Not specified";

        const date = new Date(`${value}T00:00:00`);

        if (Number.isNaN(date.getTime())) {
            return "Not specified";
        }

        return date.toLocaleDateString("en", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    }

    function getStatusClass(status) {
        const classes = {
            "Under Review": "status-review",
            "Shortlisted": "status-shortlisted",
            "Interview": "status-interview",
            "Selected": "status-selected",
            "Rejected": "status-rejected"
        };

        return classes[status] || "status-review";
    }

    function showToast(message) {
        toast.textContent = message;
        toast.hidden = false;
        clearTimeout(toastTimer);

        toastTimer = setTimeout(() => {
            toast.hidden = true;
        }, 3200);
    }

    /* ---------------- LOCAL DEMO STORAGE ---------------- */

    function loadApplicants() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);

            if (saved !== null) {
                const parsed = JSON.parse(saved);

                if (Array.isArray(parsed)) {
                    return parsed.filter(item =>
                        item &&
                        typeof item.id === "string" &&
                        typeof item.name === "string" &&
                        allowedStatuses.includes(item.status)
                    );
                }
            }
        } catch (error) {
            console.warn("Could not read demo applicants.", error);
        }

        return initialApplicants.map(item => ({
            ...item,
            skills: [...item.skills]
        }));
    }

    function saveApplicants() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(applicants));
            return true;
        } catch (error) {
            console.error("Could not save demo applicant status.", error);
            showToast("Could not save this demo change in your browser.");
            return false;
        }
    }

    /* ---------------- COMPANY PROFILE ---------------- */

    function setCompanyProfile() {
        let profile = {};

        try {
            profile = JSON.parse(
                sessionStorage.getItem("smartInternCompanyProfile") || "{}"
            );
        } catch (error) {
            console.warn("Could not read company profile.", error);
        }

        const name =
            profile.companyName ||
            profile.company_name ||
            profile.name ||
            "Company";

        const avatar = initials(name) || "C";

        [
            ["sidebarCompanyName", name],
            ["topbarCompanyName", name],
            ["sidebarCompanyAvatar", avatar],
            ["topbarCompanyAvatar", avatar]
        ].forEach(([id, value]) => {
            const element = $(id);
            if (element) element.textContent = value;
        });
    }

    /* ---------------- STATISTICS ---------------- */

    function renderStatistics() {
        $("totalApplicants").textContent = applicants.length;

        $("reviewApplicants").textContent = applicants.filter(
            item => item.status === "Under Review"
        ).length;

        $("shortlistedApplicants").textContent = applicants.filter(
            item => item.status === "Shortlisted"
        ).length;

        $("selectedApplicants").textContent = applicants.filter(
            item => item.status === "Selected"
        ).length;
    }

    /* ---------------- FILTER OPTIONS ---------------- */

    function renderInternshipOptions() {
        const previousValue = internshipFilter.value;

        const titles = [...new Set(
            applicants.map(item => item.internship).filter(Boolean)
        )].sort((a, b) => a.localeCompare(b));

        internshipFilter.innerHTML = [
            '<option value="All">All internships</option>',
            ...titles.map(title =>
                `<option value="${escapeHTML(title)}">${escapeHTML(title)}</option>`
            )
        ].join("");

        if (titles.includes(previousValue)) {
            internshipFilter.value = previousValue;
        }
    }

    /* ---------------- FILTERS AND SORT ---------------- */

    function getFilteredApplicants() {
        const query = search.value.trim().toLowerCase();
        const selectedInternship = internshipFilter.value;
        const selectedStatus = statusFilter.value;

        const filtered = applicants.filter(applicant => {
            const skills = Array.isArray(applicant.skills)
                ? applicant.skills
                : [];

            const searchable = [
                applicant.name,
                applicant.email,
                applicant.internship,
                applicant.education,
                ...skills
            ].join(" ").toLowerCase();

            return searchable.includes(query) &&
                (selectedInternship === "All" ||
                    applicant.internship === selectedInternship) &&
                (selectedStatus === "All" ||
                    applicant.status === selectedStatus);
        });

        switch (sortFilter.value) {
            case "oldest":
                filtered.sort((a, b) =>
                    String(a.appliedAt).localeCompare(String(b.appliedAt))
                );
                break;

            case "name":
                filtered.sort((a, b) =>
                    a.name.localeCompare(b.name)
                );
                break;

            case "match":
                filtered.sort((a, b) =>
                    (Number(b.matchScore) || 0) -
                    (Number(a.matchScore) || 0)
                );
                break;

            default:
                filtered.sort((a, b) =>
                    String(b.appliedAt).localeCompare(String(a.appliedAt))
                );
        }

        return filtered;
    }

    /* ---------------- RENDER CARDS ---------------- */

    function renderApplicants() {
        const filtered = getFilteredApplicants();

        renderStatistics();

        const label = `${filtered.length} ${
            filtered.length === 1 ? "applicant" : "applicants"
        }`;

        $("filteredApplicantCount").textContent = label;
        $("applicantResultsText").textContent =
            `Showing ${filtered.length} of ${applicants.length} applicants`;

        emptyState.hidden = filtered.length > 0;
        list.hidden = filtered.length === 0;

        list.innerHTML = filtered.map(applicant => {
            const skills = Array.isArray(applicant.skills)
                ? applicant.skills
                : [];

            const score = Math.min(
                100,
                Math.max(0, Number(applicant.matchScore) || 0)
            );

            const finalStatus = ["Selected", "Rejected"].includes(applicant.status);

            const actions = [
                `<a class="applicant-action-button primary"
                    href="applicant-detail.html?id=${encodeURIComponent(applicant.id)}">
                    View details →
                </a>`
            ];

            if (!finalStatus && applicant.status !== "Shortlisted") {
                actions.push(
                    `<button type="button" class="applicant-action-button"
                        data-action="shortlist" data-id="${escapeHTML(applicant.id)}">
                        Shortlist
                    </button>`
                );
            }

            if (!finalStatus && applicant.status !== "Interview") {
                actions.push(
                    `<button type="button" class="applicant-action-button"
                        data-action="interview" data-id="${escapeHTML(applicant.id)}">
                        Mark interview
                    </button>`
                );
            }

            if (!finalStatus) {
                actions.push(
                    `<button type="button" class="applicant-action-button"
                        data-action="select" data-id="${escapeHTML(applicant.id)}">
                        Select
                    </button>`
                );

                actions.push(
                    `<button type="button" class="applicant-action-button danger"
                        data-action="reject" data-id="${escapeHTML(applicant.id)}">
                        Reject
                    </button>`
                );
            }

            return `
                <article class="applicant-card" data-id="${escapeHTML(applicant.id)}">

                    <div class="applicant-card-top">
                        <div class="applicant-card-main">
                            <div class="applicant-avatar" aria-hidden="true">
                                ${escapeHTML(initials(applicant.name))}
                            </div>

                            <div class="applicant-identity">
                                <h3>${escapeHTML(applicant.name)}</h3>
                                <p>${escapeHTML(applicant.email)}</p>
                            </div>
                        </div>

                        <span class="applicant-status ${getStatusClass(applicant.status)}">
                            ${escapeHTML(applicant.status)}
                        </span>
                    </div>

                    <div class="applicant-card-meta">
                        <span>▣ ${escapeHTML(applicant.internship)}</span>
                        <span>⌂ ${escapeHTML(applicant.education)}</span>
                        <span>◷ Applied ${formatDate(applicant.appliedAt)}</span>
                        <span>✦ ${skills.length
                            ? skills.slice(0, 4).map(escapeHTML).join(" · ")
                            : "Skills not provided"}</span>
                    </div>

                    <div class="applicant-card-footer">
                        <div class="applicant-match">
                            <span>Demo AI match</span>
                            <strong>${score}%</strong>
                            <div class="match-track"
                                role="progressbar"
                                aria-label="Demo match score"
                                aria-valuemin="0"
                                aria-valuemax="100"
                                aria-valuenow="${score}">
                                <span style="width:${score}%"></span>
                            </div>
                        </div>

                        <div class="applicant-actions">
                            ${actions.join("")}
                        </div>
                    </div>

                </article>
            `;
        }).join("");
    }

    /* ---------------- FILTER EVENTS ---------------- */

    search.addEventListener("input", renderApplicants);
    internshipFilter.addEventListener("change", renderApplicants);
    statusFilter.addEventListener("change", renderApplicants);
    sortFilter.addEventListener("change", renderApplicants);

    function resetFilters() {
        search.value = "";
        internshipFilter.value = "All";
        statusFilter.value = "All";
        sortFilter.value = "newest";
        renderApplicants();
    }

    $("clearApplicantFilters").addEventListener("click", resetFilters);
    $("resetEmptyApplicants").addEventListener("click", resetFilters);

    /* ---------------- STATUS CONFIRMATION ---------------- */

    const actionConfig = {
        shortlist: {
            title: "Shortlist this candidate?",
            message: "This demo will mark the candidate as shortlisted.",
            icon: "✦",
            button: "Shortlist candidate",
            status: "Shortlisted"
        },
        interview: {
            title: "Move to interview stage?",
            message: "This changes the demo status only. It does not schedule an interview.",
            icon: "◷",
            button: "Update status",
            status: "Interview"
        },
        select: {
            title: "Select this candidate?",
            message: "This demo will mark the candidate as selected.",
            icon: "✓",
            button: "Select candidate",
            status: "Selected"
        },
        reject: {
            title: "Reject this application?",
            message: "This demo will mark the application as rejected.",
            icon: "×",
            button: "Reject application",
            status: "Rejected"
        }
    };

    function openModal(config, action) {
        previousFocus = document.activeElement;
        pendingAction = action;

        $("applicantModalTitle").textContent = config.title;
        $("applicantModalMessage").textContent = config.message;
        $("applicantModalIcon").textContent = config.icon;
        confirmButton.textContent = config.button;
        confirmButton.classList.toggle("is-danger", action.type === "reject");

        modal.hidden = false;
        confirmButton.focus();
    }

    function closeModal() {
        modal.hidden = true;
        pendingAction = null;

        if (previousFocus && typeof previousFocus.focus === "function") {
            previousFocus.focus();
        }
    }

    list.addEventListener("click", event => {
        const button = event.target.closest("[data-action]");

        if (!button) return;

        const actionType = button.dataset.action;
        const applicantId = button.dataset.id;
        const config = actionConfig[actionType];

        if (!config || !applicants.some(item => item.id === applicantId)) {
            return;
        }

        openModal(config, {
            type: actionType,
            id: applicantId
        });
    });

    cancelButton.addEventListener("click", closeModal);

    modal.addEventListener("click", event => {
        if (event.target === modal) closeModal();
    });

    confirmButton.addEventListener("click", () => {
        if (!pendingAction) return;

        if (pendingAction.type === "logout") {
            sessionStorage.removeItem("smartInternToken");
            sessionStorage.removeItem("smartInternLogin");
            sessionStorage.removeItem("smartInternRole");
            window.location.href = "login.html";
            return;
        }

        const config = actionConfig[pendingAction.type];
        const applicant = applicants.find(item => item.id === pendingAction.id);

        if (!config || !applicant) {
            closeModal();
            return;
        }

        applicant.status = config.status;

        const saved = saveApplicants();

        closeModal();
        renderInternshipOptions();
        renderApplicants();

        if (saved) {
            showToast(
                `Demo status updated: ${applicant.name} — ${applicant.status}.`
            );
        }
    });

    /* ---------------- NOTIFICATIONS ---------------- */

    function closeNotifications() {
        notificationPanel.classList.remove("show");
        notificationPanel.hidden = true;
        notificationButton.setAttribute("aria-expanded", "false");
    }

    notificationButton.addEventListener("click", event => {
        event.stopPropagation();

        const open = notificationPanel.hidden;
        notificationPanel.hidden = !open;
        notificationPanel.classList.toggle("show", open);
        notificationButton.setAttribute("aria-expanded", String(open));
    });

    $("closeNotifications").addEventListener("click", closeNotifications);

    document.addEventListener("click", event => {
        if (
            !notificationPanel.hidden &&
            !notificationPanel.contains(event.target) &&
            !notificationButton.contains(event.target)
        ) {
            closeNotifications();
        }
    });

    /* ---------------- MOBILE SIDEBAR ---------------- */

    const sidebar = $("dashboardSidebar");
    const overlay = $("sidebarOverlay");
    const mobileMenu = $("mobileMenu");

    function closeSidebar() {
        sidebar.classList.remove("active");
        overlay.classList.remove("active");
        document.body.classList.remove("sidebar-open");
    }

    mobileMenu.addEventListener("click", () => {
        const open = !sidebar.classList.contains("active");

        sidebar.classList.toggle("active", open);
        overlay.classList.toggle("active", open);
        document.body.classList.toggle("sidebar-open", open);
    });

    overlay.addEventListener("click", closeSidebar);

    sidebar.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            if (window.innerWidth <= 1000 && link.id !== "logoutLink") {
                closeSidebar();
            }
        });
    });

    /* ---------------- LOGOUT ---------------- */

    $("logoutLink").addEventListener("click", event => {
        event.preventDefault();

        openModal({
            title: "Log out of SmartIntern?",
            message: "Are you sure you want to log out of your company account?",
            icon: "↪",
            button: "Log out"
        }, {
            type: "logout",
            id: null
        });
    });

    /* ---------------- KEYBOARD ---------------- */

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            closeNotifications();
            closeSidebar();

            if (!modal.hidden) {
                closeModal();
            }
        }
    });

    /* ---------------- INITIAL LOAD ---------------- */

    setCompanyProfile();
    renderInternshipOptions();
    renderApplicants();
});