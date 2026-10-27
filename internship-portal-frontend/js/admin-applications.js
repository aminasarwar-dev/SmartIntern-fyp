/* =========================================================
   SMARTINTERN ADMIN — APPLICATIONS PAGE
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    initMobileSidebar();
    initNotifications();
    initApplicationSearch();
    initApplicationFilters();
    initApplicationDrawer();
    initApplicationPagination();
    initHeaderButtons();
    initAnimations();

});


/* =========================================================
   MOBILE SIDEBAR
========================================================= */

function initMobileSidebar() {

    const mobileMenu =
        document.getElementById("mobileMenu");

    const sidebar =
        document.getElementById("dashboardSidebar");

    const overlay =
        document.getElementById("sidebarOverlay");

    if (!mobileMenu || !sidebar || !overlay) {
        return;
    }


    mobileMenu.addEventListener("click", () => {

        sidebar.classList.toggle("open");
        overlay.classList.toggle("show");

    });


    overlay.addEventListener("click", () => {

        sidebar.classList.remove("open");
        overlay.classList.remove("show");

    });


    const sidebarLinks =
        sidebar.querySelectorAll(".sidebar-link");

    sidebarLinks.forEach(link => {

        link.addEventListener("click", () => {

            if (window.innerWidth <= 850) {

                sidebar.classList.remove("open");
                overlay.classList.remove("show");

            }

        });

    });


    window.addEventListener("resize", () => {

        if (window.innerWidth > 850) {

            sidebar.classList.remove("open");
            overlay.classList.remove("show");

        }

    });

}


/* =========================================================
   NOTIFICATIONS
   Opens/closes ONLY with notification button or X
========================================================= */

function initNotifications() {

    const button =
        document.getElementById("notificationButton");

    const panel =
        document.getElementById("notificationPanel");

    const closeButton =
        document.getElementById("closeNotification");

    if (!button || !panel) {
        return;
    }


    button.addEventListener("click", event => {

        event.stopPropagation();

        panel.classList.toggle("show");

    });


    if (closeButton) {

        closeButton.addEventListener("click", event => {

            event.stopPropagation();

            panel.classList.remove("show");

        });

    }

}


/* =========================================================
   SEARCH
========================================================= */

function initApplicationSearch() {

    const searchInput =
        document.getElementById("applicationSearch");

    const rows =
        document.querySelectorAll(
            "#applicationsTableBody tr"
        );

    if (!searchInput) {
        return;
    }


    searchInput.addEventListener("input", () => {

        const query =
            searchInput.value
                .trim()
                .toLowerCase();

        rows.forEach(row => {

            const searchableText =
                (
                    row.dataset.search || ""
                ).toLowerCase();

            row.style.display =
                searchableText.includes(query)
                    ? ""
                    : "none";

        });

        updateEmptyState();

    });

}


/* =========================================================
   FILTERS
========================================================= */

function initApplicationFilters() {

    const statusFilter =
        document.getElementById("statusFilter");

    const typeFilter =
        document.getElementById(
            "applicationTypeFilter"
        );

    if (statusFilter) {

        statusFilter.addEventListener(
            "change",
            applyApplicationFilters
        );

    }


    if (typeFilter) {

        typeFilter.addEventListener(
            "change",
            applyApplicationFilters
        );

    }

}


function applyApplicationFilters() {

    const searchInput =
        document.getElementById("applicationSearch");

    const statusFilter =
        document.getElementById("statusFilter");

    const typeFilter =
        document.getElementById(
            "applicationTypeFilter"
        );

    const rows =
        document.querySelectorAll(
            "#applicationsTableBody tr"
        );


    const searchValue =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";

    const selectedStatus =
        statusFilter
            ? statusFilter.value
            : "all";

    const selectedType =
        typeFilter
            ? typeFilter.value
            : "all";


    rows.forEach(row => {

        const searchableText =
            (
                row.dataset.search || ""
            ).toLowerCase();

        const rowStatus =
            row.dataset.status || "";

        const rowType =
            row.dataset.type || "";


        const matchesSearch =
            searchableText.includes(
                searchValue
            );

        const matchesStatus =
            selectedStatus === "all" ||
            rowStatus === selectedStatus;

        const matchesType =
            selectedType === "all" ||
            rowType === selectedType;


        row.style.display =
            matchesSearch &&
            matchesStatus &&
            matchesType
                ? ""
                : "none";

    });


    updateEmptyState();

}


/* =========================================================
   EMPTY STATE
========================================================= */

function updateEmptyState() {

    const rows =
        document.querySelectorAll(
            "#applicationsTableBody tr"
        );

    const emptyState =
        document.getElementById(
            "applicationsEmpty"
        );

    if (!emptyState) {
        return;
    }


    let visibleRows = 0;


    rows.forEach(row => {

        if (row.style.display !== "none") {
            visibleRows++;
        }

    });


    emptyState.classList.toggle(
        "show",
        visibleRows === 0
    );

}


/* =========================================================
   APPLICATION DRAWER
========================================================= */

function initApplicationDrawer() {

    const drawerOverlay =
        document.getElementById(
            "applicationDrawerOverlay"
        );

    const closeButton =
        document.getElementById(
            "closeApplicationDrawer"
        );

    const viewButtons =
        document.querySelectorAll(
            ".view-application-btn"
        );

    const removeButtons =
        document.querySelectorAll(
            ".remove-application-btn"
        );


    if (!drawerOverlay) {
        return;
    }


    viewButtons.forEach(button => {

        button.addEventListener(
            "click",
            async () => {

                const row =
                    button.closest("tr");

                if (!row) {
                    return;
                }

                openApplicationDrawer(row);

            }
        );

    });


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeApplicationDrawer
        );

    }


    drawerOverlay.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                drawerOverlay
            ) {

                closeApplicationDrawer();

            }

        }
    );


    removeButtons.forEach(button => {

        button.addEventListener(
            "click",
            async () => {

                const row =
                    button.closest("tr");

                if (!row) {
                    return;
                }


                const studentName =
                    row.dataset.name ||
                    "this student";


                const confirmed =
                    await SmartDialog.confirm({
                        title: "Remove application?",
                        message: `Remove the application submitted by ${studentName}?`,
                        confirmText: "Remove",
                        danger: true
                    });


                if (confirmed) {

                    row.remove();

                    updateEmptyState();

                    alert(
                        "Application removed successfully."
                    );

                }

            }
        );

    });


    const drawerRemoveButton =
        document.getElementById(
            "removeApplicationBtn"
        );


    if (drawerRemoveButton) {

        drawerRemoveButton.addEventListener(
            "click",
            async () => {

                const studentName =
                    document.getElementById(
                        "drawerStudentName"
                    ).textContent.trim();


                const confirmed =
                    await SmartDialog.confirm({
                        title: "Remove application?",
                        message: `Remove the application submitted by ${studentName}?`,
                        confirmText: "Remove",
                        danger: true
                    });


                if (confirmed) {

                    closeApplicationDrawer();

                    alert(
                        "Application marked for removal."
                    );

                }

            }
        );

    }


    const viewFullButton =
        document.getElementById(
            "viewStudentApplicationBtn"
        );


    if (viewFullButton) {

        viewFullButton.addEventListener(
            "click",
            () => {

                const studentName =
                    document.getElementById(
                        "drawerStudentName"
                    ).textContent.trim();

                alert(
                    `Full application details for ${studentName} will open here.`
                );

            }
        );

    }

}


/* =========================================================
   OPEN DRAWER
========================================================= */

function openApplicationDrawer(row) {

    const drawerOverlay =
        document.getElementById(
            "applicationDrawerOverlay"
        );

    const studentAvatar =
        document.getElementById(
            "drawerStudentAvatar"
        );

    const studentName =
        document.getElementById(
            "drawerStudentName"
        );

    const studentProgram =
        document.getElementById(
            "drawerStudentProgram"
        );

    const internship =
        document.getElementById(
            "drawerInternship"
        );

    const company =
        document.getElementById(
            "drawerCompany"
        );

    const applied =
        document.getElementById(
            "drawerApplied"
        );

    const type =
        document.getElementById(
            "drawerType"
        );

    const status =
        document.getElementById(
            "drawerStatus"
        );


    const name =
        row.dataset.name || "Student";

    const internshipName =
        row.dataset.internship || "Internship";

    const companyName =
        row.dataset.company || "Company";

    const appliedDate =
        row.dataset.applied || "—";

    const applicationStatus =
        row.dataset.applicationStatus ||
        "Pending";


    if (studentAvatar) {

        studentAvatar.textContent =
            getInitials(name);

    }


    if (studentName) {

        studentName.textContent =
            name;

    }


    if (studentProgram) {

        studentProgram.textContent =
            "Computer Science";

    }


    if (internship) {

        internship.textContent =
            internshipName;

    }


    if (company) {

        company.textContent =
            companyName;

    }


    if (applied) {

        applied.textContent =
            appliedDate;

    }


    if (type) {

        type.textContent =
            capitalize(
                row.dataset.type || "Hybrid"
            );

    }


    if (status) {

        status.textContent =
            applicationStatus;

        status.className =
            "drawer-status";

    }


    if (drawerOverlay) {

        drawerOverlay.classList.add("show");

    }

}


/* =========================================================
   CLOSE DRAWER
========================================================= */

function closeApplicationDrawer() {

    const drawerOverlay =
        document.getElementById(
            "applicationDrawerOverlay"
        );

    if (drawerOverlay) {

        drawerOverlay.classList.remove("show");

    }

}


/* =========================================================
   HELPERS
========================================================= */

function getInitials(name) {

    return name
        .split(" ")
        .map(part => part.charAt(0))
        .slice(0, 2)
        .join("")
        .toUpperCase();

}


function capitalize(value) {

    if (!value) {
        return "";
    }

    return value.charAt(0).toUpperCase() +
        value.slice(1);

}


/* =========================================================
   PAGINATION
========================================================= */

function initApplicationPagination() {

    const buttons =
        document.querySelectorAll(
            ".pagination-number"
        );

    buttons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                buttons.forEach(item => {

                    item.classList.remove(
                        "active"
                    );

                });


                button.classList.add(
                    "active"
                );

            }
        );

    });

}


/* =========================================================
   HEADER BUTTONS
========================================================= */

function initHeaderButtons() {

    const exportButton =
        document.getElementById(
            "exportApplicationsBtn"
        );

    const refreshButton =
        document.getElementById(
            "refreshApplicationsBtn"
        );


    if (exportButton) {

        exportButton.addEventListener(
            "click",
            () => {

                alert(
                    "Application export will be connected to the backend here."
                );

            }
        );

    }


    if (refreshButton) {

        refreshButton.addEventListener(
            "click",
            () => {

                const originalText =
                    refreshButton.innerHTML;

                refreshButton.innerHTML =
                    "<span>↻</span> Refreshing...";

                refreshButton.disabled = true;


                setTimeout(() => {

                    refreshButton.innerHTML =
                        originalText;

                    refreshButton.disabled =
                        false;

                }, 700);

            }
        );

    }

}


/* =========================================================
   GSAP ANIMATIONS
========================================================= */

function initAnimations() {

    if (
        typeof gsap === "undefined"
    ) {
        return;
    }


    gsap.from(
        ".applications-page-header",
        {
            y: 18,
            opacity: 0,
            duration: .65,
            ease: "power2.out"
        }
    );


    gsap.from(
        ".application-stat-card",
        {
            y: 18,
            opacity: 0,
            duration: .55,
            stagger: .08,
            delay: .1,
            ease: "power2.out"
        }
    );


    gsap.from(
        ".applications-management-card",
        {
            y: 18,
            opacity: 0,
            duration: .65,
            delay: .2,
            ease: "power2.out"
        }
    );

}