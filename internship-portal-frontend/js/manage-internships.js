/* =========================================================
   SMARTINTERN — MANAGE INTERNSHIPS
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    const list = document.getElementById("internshipList");
    const searchInput = document.getElementById("internshipSearch");
    const statusFilter = document.getElementById("statusFilter");
    const sortFilter = document.getElementById("sortFilter");
    const resultsCount = document.getElementById("resultsCount");
    const emptyState = document.getElementById("emptyState");
    const toast = document.getElementById("manageToast");

    const actionModal = document.getElementById("actionModal");
    const actionModalTitle = document.getElementById("actionModalTitle");
    const actionModalMessage = document.getElementById("actionModalMessage");
    const actionModalIcon = document.getElementById("actionModalIcon");
    const cancelAction = document.getElementById("cancelAction");
    const confirmAction = document.getElementById("confirmAction");

    let internships = [];
    let pendingAction = null;
    let toastTimeout = null;
    let loadFailed = false;

    const STATUS_LABELS = {
        active: "Active",
        draft: "Draft",
        closed: "Closed"
    };

    // API record -> the shape the cards use
    function mapInternship(item) {
        const status = String(item.status || "").toLowerCase();

        return {
            id: String(item.id),                       // API sends a number, buttons give a string
            title: item.title,
            category: item.category,
            arrangement: item.work_arrangement,
            duration: item.duration,
            compensation: item.compensation_type,
            applicants: item.applicants_count,
            status: STATUS_LABELS[status] || "Closed",
            createdAt: String(item.created_at || "").slice(0, 10),   // YYYY-MM-DD
            deadlinePassed: Boolean(item.deadline_passed)
        };
    }

    async function loadInternships() {
        const failure = document.getElementById("emptyState");

        try {
            const data = await listInternshipsAPI();

            internships = (data.internships || []).map(mapInternship);
            loadFailed = false;
        } catch (error) {
            if (error.status === 401) {
                window.SmartInternSession?.clear();
                window.location.replace("login.html");
                return;
            }

            internships = [];
            loadFailed = true;

            failure.querySelector("h3").textContent = "Could not load internships";
            failure.querySelector("p").textContent =
                error.message || "Please check your connection and try again.";
            document.getElementById("resetEmptySearch").textContent = "Try again";
        }

        renderInternships();
    }

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[character]);
    }

    function showToast(message) {
        toast.textContent = message;
        toast.hidden = false;

        window.clearTimeout(toastTimeout);

        toastTimeout = window.setTimeout(() => {
            toast.hidden = true;
        }, 3500);
    }

    function statusClass(status) {
        switch (status) {
            case "Active":
                return "status-active";
            case "Draft":
                return "status-draft";
            default:
                return "status-closed";
        }
    }

    function formatDate(dateString) {
        if (!dateString) return "Not specified";

        const date = new Date(`${dateString}T00:00:00`);

        if (Number.isNaN(date.getTime())) {
            return "Not specified";
        }

        return date.toLocaleDateString("en", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    }

    function updateStats() {
        document.getElementById("totalCount").textContent =
            internships.length;

        document.getElementById("activeCount").textContent =
            internships.filter(item => item.status === "Active").length;

        document.getElementById("closedCount").textContent =
            internships.filter(item => item.status === "Closed").length;

        const applicants = internships.reduce(
            (total, item) => total + (Number(item.applicants) || 0),
            0
        );

        document.getElementById("applicantCount").textContent = applicants;
    }

    function getFilteredInternships() {
        const query = searchInput.value.trim().toLowerCase();
        const selectedStatus = statusFilter.value;
        const sort = sortFilter.value;

        const filtered = internships.filter(item => {
            const matchesQuery =
                String(item.title || "").toLowerCase().includes(query) ||
                String(item.category || "").toLowerCase().includes(query);

            const matchesStatus =
                selectedStatus === "All" ||
                item.status === selectedStatus;

            return matchesQuery && matchesStatus;
        });

        filtered.sort((a, b) => {
            if (sort === "title") {
                return String(a.title).localeCompare(String(b.title));
            }

            if (sort === "applicants") {
                return (Number(b.applicants) || 0) -
                    (Number(a.applicants) || 0);
            }

            return String(b.createdAt || "").localeCompare(
                String(a.createdAt || "")
            );
        });

        return filtered;
    }

    function renderInternships() {
        const filtered = getFilteredInternships();

        updateStats();

        resultsCount.textContent =
            `${filtered.length} ${filtered.length === 1 ? "internship" : "internships"}`;

        if (!loadFailed) {
            emptyState.querySelector("h3").textContent =
                internships.length === 0 ? "No internships yet" : "No internships found";
            emptyState.querySelector("p").textContent =
                internships.length === 0
                    ? "Post your first internship and it will appear here."
                    : "Try changing your search or status filter.";
            document.getElementById("resetEmptySearch").textContent =
                internships.length === 0 ? "Post an internship" : "Reset filters";
        }

        emptyState.hidden = filtered.length !== 0;
        list.hidden = filtered.length === 0;

        list.innerHTML = filtered.map(item => {
            const title = escapeHTML(item.title);
            const category = escapeHTML(item.category);
            const status = escapeHTML(item.status);
            const arrangement = escapeHTML(item.arrangement || "Not specified");
            const duration = escapeHTML(item.duration || "Not specified");
            const compensation = escapeHTML(item.compensation || "Not specified");
            const applicants = Number(item.applicants) || 0;
            const initial = escapeHTML(
                (String(item.title || "I").trim()[0] || "I").toUpperCase()
            );

            const isActive = item.status === "Active";
            const isClosed = item.status === "Closed";

            return `
                <article class="manage-internship-card" data-id="${escapeHTML(item.id)}">

                    <div class="manage-card-top">

                        <div class="manage-role-icon">${initial}</div>

                        <div class="manage-card-main">

                            <div class="manage-card-title-row">
                                <h3>${title}</h3>
                                <span class="manage-status ${statusClass(item.status)}">
                                    ${status}
                                </span>
                            </div>

                            <p class="manage-card-category">${category}</p>

                            <div class="manage-card-meta">
                                <span>⌖ ${arrangement}</span>
                                <span>◷ ${duration}</span>
                                <span>◇ ${compensation}</span>
                                <span>▣ Posted ${formatDate(item.createdAt)}</span>
                                ${item.deadlinePassed && isActive ? "<span>◷ Deadline passed</span>" : ""}
                            </div>

                        </div>
                    </div>

                    <div class="manage-card-bottom">

                        <div class="manage-applicant-summary">
                            <strong>${applicants}</strong>
                            ${applicants === 1 ? "applicant" : "applicants"}
                        </div>

                        <div class="manage-card-actions">

                            <a
                                class="manage-action-button primary-action"
                                href="view-applicants.html"
                                aria-label="View applicants for ${title}"
                            >
                                View applicants →
                            </a>

                            <button
                                class="manage-action-button"
                                type="button"
                                data-action="edit"
                                data-id="${escapeHTML(item.id)}"
                            >
                                Edit details
                            </button>

                            ${
                                isActive
                                    ? `<button class="manage-action-button" type="button" data-action="close" data-id="${escapeHTML(item.id)}">Close listing</button>`
                                    : isClosed
                                        ? `<button class="manage-action-button" type="button" data-action="reopen" data-id="${escapeHTML(item.id)}">Reopen</button>`
                                        : `<button class="manage-action-button" type="button" data-action="publish" data-id="${escapeHTML(item.id)}">Publish</button>`
                            }

                            <button
                                class="manage-action-button danger-action"
                                type="button"
                                data-action="delete"
                                data-id="${escapeHTML(item.id)}"
                            >
                                Delete
                            </button>

                        </div>
                    </div>
                </article>
            `;
        }).join("");
    }

    /* SEARCH AND FILTERS */

    searchInput.addEventListener("input", renderInternships);
    statusFilter.addEventListener("change", renderInternships);
    sortFilter.addEventListener("change", renderInternships);

    function resetFilters() {
        searchInput.value = "";
        statusFilter.value = "All";
        sortFilter.value = "newest";
        renderInternships();
    }

    document.getElementById("clearFilters").addEventListener("click", resetFilters);
    document.getElementById("resetEmptySearch").addEventListener("click", () => {
        if (loadFailed) {
            loadInternships();
        } else if (internships.length === 0) {
            window.location.href = "post-internship.html";
        } else {
            resetFilters();
        }
    });

    /* ACTION CONFIRMATION */

    function openActionModal(action, id) {
        const item = internships.find(internship => internship.id === id);
        if (!item) return;

        pendingAction = { action, id };

        const messages = {
            close: {
                title: "Close this listing?",
                message: `“${item.title}” will be closed. Students will no longer see it, and you can reopen it later.`,
                button: "Close listing",
                icon: "◷"
            },
            reopen: {
                title: "Reopen this listing?",
                message: `“${item.title}” will be active again and visible to students.`,
                button: "Reopen listing",
                icon: "↗"
            },
            publish: {
                title: "Publish this draft?",
                message: `“${item.title}” will be published and visible to students.`,
                button: "Publish",
                icon: "✦"
            },
            delete: {
                title: "Delete this internship?",
                message: `“${item.title}” will be deleted permanently. This cannot be undone.`,
                button: "Delete internship",
                icon: "×"
            }
        };

        const content = messages[action];
        if (!content) return;

        actionModalTitle.textContent = content.title;
        actionModalMessage.textContent = content.message;
        confirmAction.textContent = content.button;
        actionModalIcon.textContent = content.icon;

        confirmAction.classList.toggle(
            "manage-danger-button",
            action === "delete"
        );

        actionModal.hidden = false;
        confirmAction.focus();
    }

    function closeActionModal() {
        actionModal.hidden = true;
        pendingAction = null;
    }

    cancelAction.addEventListener("click", closeActionModal);

    actionModal.addEventListener("click", event => {
        if (event.target === actionModal) {
            closeActionModal();
        }
    });

    confirmAction.addEventListener("click", async () => {
        if (!pendingAction) return;

        const { action, id } = pendingAction;
        const item = internships.find(internship => internship.id === id);

        if (!item) {
            closeActionModal();
            return;
        }

        const originalLabel = confirmAction.textContent;
        confirmAction.disabled = true;
        cancelAction.disabled = true;
        confirmAction.textContent = "Please wait...";

        try {
            if (action === "delete") {
                await deleteInternshipAPI(id);
            } else {
                await internshipActionAPI(id, action);
            }

            const messages = {
                delete: "Internship deleted.",
                close: "Listing closed.",
                reopen: "Listing reopened.",
                publish: "Internship published."
            };

            closeActionModal();
            showToast(messages[action]);

            // Reload so the list and the numbers always match the server
            await loadInternships();
        } catch (error) {
            if (error.status === 401) {
                window.SmartInternSession?.clear();
                window.location.replace("login.html");
                return;
            }

            closeActionModal();

            // The server's message (detail) is always shown
            showToast(error.message || "Something went wrong. Please try again.");
        } finally {
            confirmAction.disabled = false;
            cancelAction.disabled = false;
            confirmAction.textContent = originalLabel;
        }
    });

    /* CARD ACTIONS */

    list.addEventListener("click", event => {
        const button = event.target.closest("[data-action]");
        if (!button) return;

        const { action, id } = button.dataset;
        const item = internships.find(internship => internship.id === id);

        if (!item) return;

        if (action === "edit") {
            // post-internship.html loads this internship and saves with PUT
            window.location.href =
                `post-internship.html?edit=${encodeURIComponent(id)}`;
            return;
        }

        openActionModal(action, id);
    });

    /* COMPANY PROFILE */

    let profile = {};

    try {
        profile = JSON.parse(
            sessionStorage.getItem("smartInternCompanyProfile") || "{}"
        );
    } catch {
        profile = {};
    }

    const companyName =
        profile.companyName ||
        profile.company_name ||
        profile.name ||
        "Company";

    const initials = companyName
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part[0].toUpperCase())
        .join("") || "C";

    [
        ["sidebarCompanyName", companyName],
        ["topbarCompanyName", companyName],
        ["sidebarCompanyAvatar", initials],
        ["topbarCompanyAvatar", initials]
    ].forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    });

    /* NOTIFICATIONS */

    const notificationButton = document.getElementById("notificationButton");
    const notificationPanel = document.getElementById("notificationPanel");
    const closeNotifications = document.getElementById("closeNotifications");

    function hideNotifications() {
        notificationPanel.classList.remove("show");
        notificationPanel.hidden = true;
        notificationButton.setAttribute("aria-expanded", "false");
    }

    notificationButton.addEventListener("click", event => {
        event.stopPropagation();

        const open = !notificationPanel.classList.contains("show");

        notificationPanel.classList.toggle("show", open);
        notificationPanel.hidden = !open;
        notificationButton.setAttribute("aria-expanded", String(open));
    });

    closeNotifications.addEventListener("click", hideNotifications);

    document.addEventListener("click", event => {
        if (
            notificationPanel.classList.contains("show") &&
            !notificationPanel.contains(event.target) &&
            !notificationButton.contains(event.target)
        ) {
            hideNotifications();
        }
    });

    /* MOBILE SIDEBAR */

    const sidebar = document.getElementById("dashboardSidebar");
    const sidebarOverlay = document.getElementById("sidebarOverlay");
    const mobileMenu = document.getElementById("mobileMenu");

    function closeSidebar() {
        sidebar.classList.remove("active");
        sidebarOverlay.classList.remove("active");
        document.body.classList.remove("sidebar-open");
    }

    mobileMenu.addEventListener("click", () => {
        const open = !sidebar.classList.contains("active");

        sidebar.classList.toggle("active", open);
        sidebarOverlay.classList.toggle("active", open);
        document.body.classList.toggle("sidebar-open", open);
    });

    sidebarOverlay.addEventListener("click", closeSidebar);

    /* LOGOUT CONFIRMATION */

    const logoutLink = document.getElementById("logoutLink");

    logoutLink.addEventListener("click", async event => {
        event.preventDefault();

        const confirmed = await SmartDialog.confirm({
            title: "Log out?",
            message: "Are you sure you want to log out of your company account?",
            confirmText: "Yes, log out"
        });

        if (!confirmed) return;

        sessionStorage.removeItem("smartInternToken");
        sessionStorage.removeItem("smartInternLogin");
        sessionStorage.removeItem("smartInternRole");
        if (window.SmartInternSession) { window.SmartInternSession.clear(); }

        window.location.href = "login.html";
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            hideNotifications();
            closeActionModal();
            closeSidebar();
        }
    });

    /* INITIAL LOAD */

    loadInternships();
});