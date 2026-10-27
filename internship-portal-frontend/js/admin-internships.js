/* =========================================================
   SMARTINTERN ADMIN — INTERNSHIPS PAGE
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    initMobileSidebar();

    initNotifications();

    initInternshipSearch();

    initInternshipFilters();

    initInternshipDrawer();

    initPagination();

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


    function openSidebar() {

        sidebar.classList.add("open");

        overlay.classList.add("show");

        document.body.style.overflow = "hidden";

    }


    function closeSidebar() {

        sidebar.classList.remove("open");

        overlay.classList.remove("show");

        document.body.style.overflow = "";

    }


    mobileMenu.addEventListener("click", function () {

        openSidebar();

    });


    overlay.addEventListener("click", function () {

        closeSidebar();

    });


    document
        .querySelectorAll(".sidebar-link")
        .forEach(function (link) {

            link.addEventListener("click", function () {

                if (window.innerWidth <= 850) {

                    closeSidebar();

                }

            });

        });


    window.addEventListener("resize", function () {

        if (window.innerWidth > 850) {

            closeSidebar();

        }

    });

}


/* =========================================================
   NOTIFICATIONS
========================================================= */

function initNotifications() {

    const notificationButton =
        document.getElementById("notificationButton");

    const notificationPanel =
        document.getElementById("notificationPanel");

    const closeNotification =
        document.getElementById("closeNotification");


    if (!notificationButton || !notificationPanel) {
        return;
    }


    notificationButton.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();

            notificationPanel.classList.toggle("show");

        }
    );


    if (closeNotification) {

        closeNotification.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();

                notificationPanel.classList.remove("show");

            }
        );

    }

}


/* =========================================================
   SEARCH
========================================================= */

function initInternshipSearch() {

    const searchInput =
        document.getElementById("internshipSearch");


    if (!searchInput) {
        return;
    }


    searchInput.addEventListener(
        "input",
        function () {

            filterInternships();

        }
    );

}


/* =========================================================
   FILTERS
========================================================= */

function initInternshipFilters() {

    const statusFilter =
        document.getElementById("statusFilter");

    const typeFilter =
        document.getElementById("typeFilter");


    if (statusFilter) {

        statusFilter.addEventListener(
            "change",
            function () {

                filterInternships();

            }
        );

    }


    if (typeFilter) {

        typeFilter.addEventListener(
            "change",
            function () {

                filterInternships();

            }
        );

    }

}


/* =========================================================
   FILTER INTERNSHIPS
========================================================= */

function filterInternships() {

    const searchInput =
        document.getElementById("internshipSearch");

    const statusFilter =
        document.getElementById("statusFilter");

    const typeFilter =
        document.getElementById("typeFilter");


    const rows =
        document.querySelectorAll(
            "#internshipsTableBody tr"
        );


    const emptyState =
        document.getElementById("internshipsEmpty");


    if (!rows.length) {
        return;
    }


    const searchValue =
        searchInput
            ? searchInput.value.trim().toLowerCase()
            : "";


    const statusValue =
        statusFilter
            ? statusFilter.value
            : "all";


    const typeValue =
        typeFilter
            ? typeFilter.value
            : "all";


    let visibleRows = 0;


    rows.forEach(function (row) {

        const searchText =
            row.dataset.search
                ? row.dataset.search.toLowerCase()
                : "";


        const rowStatus =
            row.dataset.status || "";


        const rowType =
            row.dataset.type || "";


        const matchesSearch =
            searchValue === "" ||
            searchText.includes(searchValue);


        const matchesStatus =
            statusValue === "all" ||
            rowStatus === statusValue;


        const matchesType =
            typeValue === "all" ||
            rowType === typeValue;


        const shouldShow =
            matchesSearch &&
            matchesStatus &&
            matchesType;


        row.style.display =
            shouldShow ? "" : "none";


        if (shouldShow) {

            visibleRows++;

        }

    });


    if (emptyState) {

        if (visibleRows === 0) {

            emptyState.classList.add("show");

        } else {

            emptyState.classList.remove("show");

        }

    }

}


/* =========================================================
   INTERNSHIP DRAWER
========================================================= */

function initInternshipDrawer() {

    const drawer =
        document.getElementById("internshipDrawer");

    const overlay =
        document.getElementById(
            "internshipDrawerOverlay"
        );

    const closeButton =
        document.getElementById(
            "closeInternshipDrawer"
        );


    const viewButtons =
        document.querySelectorAll(
            ".view-internship-btn"
        );


    if (!drawer) {
        return;
    }


    viewButtons.forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                const row =
                    button.closest("tr");


                if (!row) {
                    return;
                }


                const name =
                    button.dataset.internship ||
                    "Internship";


                const icon =
                    row.querySelector(
                        ".internship-icon"
                    );


                const company =
                    row.querySelector(
                        ".company-cell strong"
                    );


                const category =
                    row.querySelector(
                        ".internship-info span"
                    );


                const application =
                    row.querySelector(
                        ".application-number"
                    );


                const type =
                    row.querySelector(
                        ".type-badge"
                    );


                const deadline =
                    row.querySelector(
                        ".deadline-date"
                    );


                const status =
                    row.querySelector(
                        ".status-badge"
                    );


                updateDrawer({

                    name: name,

                    icon:
                        icon
                            ? icon.textContent.trim()
                            : "IN",

                    company:
                        company
                            ? company.textContent.trim()
                            : "Company",

                    category:
                        category
                            ? category.textContent.trim()
                            : "Category",

                    applications:
                        application
                            ? application.textContent.trim()
                            : "00",

                    type:
                        type
                            ? type.textContent.trim()
                            : "Type",

                    deadline:
                        deadline
                            ? deadline.textContent.trim()
                            : "Deadline",

                    status:
                        status
                            ? status.textContent.trim()
                            : "Status"

                });


                openDrawer();

            }
        );

    });


    function openDrawer() {

        drawer.classList.add("show");


        if (overlay) {

            overlay.classList.add("show");

        }


        document.body.style.overflow =
            "hidden";

    }


    function closeDrawer() {

        drawer.classList.remove("show");


        if (overlay) {

            overlay.classList.remove("show");

        }


        document.body.style.overflow =
            "";

    }


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            function () {

                closeDrawer();

            }
        );

    }


    if (overlay) {

        overlay.addEventListener(
            "click",
            function () {

                closeDrawer();

            }
        );

    }


    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Escape" &&
                drawer.classList.contains("show")
            ) {

                closeDrawer();

            }

        }
    );


    const approveButton =
        document.getElementById(
            "approveInternshipBtn"
        );


    if (approveButton) {

        approveButton.addEventListener(
            "click",
            async function () {

                const name =
                    document.getElementById(
                        "drawerInternshipName"
                    );


                const internshipName =
                    name
                        ? name.textContent.trim()
                        : "this internship";


                const confirmed =
                    await SmartDialog.confirm({
                        title: "Approve internship?",
                        message: internshipName,
                        confirmText: "Approve"
                    });


                if (!confirmed) {
                    return;
                }


                alert(
                    internshipName +
                    " has been approved."
                );

            }
        );

    }


    const removeButton =
        document.getElementById(
            "removeInternshipBtn"
        );


    if (removeButton) {

        removeButton.addEventListener(
            "click",
            async function () {

                const name =
                    document.getElementById(
                        "drawerInternshipName"
                    );


                const internshipName =
                    name
                        ? name.textContent.trim()
                        : "this internship";


                const confirmed =
                    await SmartDialog.confirm({
                        title: "Remove internship?",
                        message: internshipName,
                        confirmText: "Remove",
                        danger: true
                    });


                if (!confirmed) {
                    return;
                }


                alert(
                    internshipName +
                    " has been marked for removal."
                );

            }
        );

    }

}


/* =========================================================
   DRAWER DATA
========================================================= */

function updateDrawer(internship) {

    const icon =
        document.getElementById(
            "drawerInternshipIcon"
        );


    const name =
        document.getElementById(
            "drawerInternshipName"
        );


    const company =
        document.getElementById(
            "drawerInternshipCompany"
        );


    const category =
        document.getElementById(
            "drawerCategory"
        );


    const applications =
        document.getElementById(
            "drawerApplications"
        );


    const type =
        document.getElementById(
            "drawerType"
        );


    const deadline =
        document.getElementById(
            "drawerDeadline"
        );


    const status =
        document.getElementById(
            "drawerStatus"
        );


    const companyShort =
        document.getElementById(
            "drawerCompany"
        );


    const statusShort =
        document.getElementById(
            "drawerStatusShort"
        );


    const typeShort =
        document.getElementById(
            "drawerTypeShort"
        );


    if (icon) {
        icon.textContent = internship.icon;
    }


    if (name) {
        name.textContent = internship.name;
    }


    if (company) {
        company.textContent = internship.company;
    }


    if (category) {
        category.textContent = internship.category;
    }


    if (applications) {
        applications.textContent =
            internship.applications;
    }


    if (type) {
        type.textContent = internship.type;
    }


    if (deadline) {
        deadline.textContent = internship.deadline;
    }


    if (status) {

        status.textContent =
            internship.status;

        status.className =
            "status-badge " +
            internship.status.toLowerCase();

    }


    if (companyShort) {

        companyShort.textContent =
            internship.company
                .substring(0, 2)
                .toUpperCase();

    }


    if (statusShort) {

        statusShort.textContent =
            internship.status
                .substring(0, 2)
                .toUpperCase();

    }


    if (typeShort) {

        typeShort.textContent =
            internship.type
                .substring(0, 2)
                .toUpperCase();

    }

}


/* =========================================================
   PAGINATION
========================================================= */

function initPagination() {

    const buttons =
        document.querySelectorAll(
            ".pagination-btn"
        );


    buttons.forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                if (
                    button.classList.contains(
                        "disabled"
                    )
                ) {

                    return;

                }


                if (
                    button.textContent.trim() === "←" ||
                    button.textContent.trim() === "→"
                ) {

                    return;

                }


                buttons.forEach(
                    function (item) {

                        item.classList.remove(
                            "active"
                        );

                    }
                );


                button.classList.add("active");

            }
        );

    });

}


/* =========================================================
   HEADER BUTTONS
========================================================= */

function initHeaderButtons() {

    const refreshButton =
        document.getElementById(
            "refreshInternshipsBtn"
        );


    const exportButton =
        document.getElementById(
            "exportInternshipsBtn"
        );


    if (refreshButton) {

        refreshButton.addEventListener(
            "click",
            function () {

                const original =
                    refreshButton.innerHTML;


                refreshButton.innerHTML =
                    "<span>↻</span> Refreshing...";


                refreshButton.disabled =
                    true;


                setTimeout(
                    function () {

                        refreshButton.innerHTML =
                            original;

                        refreshButton.disabled =
                            false;

                    },
                    700
                );

            }
        );

    }


    if (exportButton) {

        exportButton.addEventListener(
            "click",
            function () {

                alert(
                    "Internship data export will be connected to the backend."
                );

            }
        );

    }

}


/* =========================================================
   ANIMATIONS
========================================================= */

function initAnimations() {

    if (typeof gsap === "undefined") {

        return;

    }


    gsap.from(
        ".internships-page-header",
        {
            y: 20,

            opacity: 0,

            duration: .65,

            ease: "power2.out"
        }
    );


    gsap.from(
        ".internship-stat-card",
        {
            y: 18,

            opacity: 0,

            duration: .55,

            stagger: .08,

            delay: .15,

            ease: "power2.out"
        }
    );


    gsap.from(
        ".internships-management-card",
        {
            y: 20,

            opacity: 0,

            duration: .65,

            delay: .25,

            ease: "power2.out"
        }
    );

}