/* =========================================================
   SMARTINTERN ADMIN — STUDENTS PAGE
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    initMobileSidebar();
    initNotifications();
    initStudentSearch();
    initStudentFilters();
    initStudentDrawer();
    initPagination();
    initHeaderButtons();
    initAnimations();

});


/* =========================================================
   MOBILE SIDEBAR
========================================================= */

function initMobileSidebar() {

    const mobileMenu = document.getElementById("mobileMenu");
    const sidebar = document.getElementById("dashboardSidebar");
    const overlay = document.getElementById("sidebarOverlay");

    if (!mobileMenu || !sidebar || !overlay) return;

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

    document.querySelectorAll(".sidebar-link").forEach(function (link) {
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

    if (!notificationButton || !notificationPanel) return;

    notificationButton.addEventListener("click", function (event) {

        event.stopPropagation();

        notificationPanel.classList.toggle("show");

    });

    if (closeNotification) {

        closeNotification.addEventListener("click", function (event) {

            event.stopPropagation();

            notificationPanel.classList.remove("show");

        });

    }

    /*
       Important:
       Notification panel does NOT close when clicking outside.
       It closes only through the X button or notification button.
    */

}


/* =========================================================
   SEARCH
========================================================= */

function initStudentSearch() {

    const searchInput =
        document.getElementById("studentSearch");

    if (!searchInput) return;

    searchInput.addEventListener("input", function () {
        filterStudents();
    });

}


/* =========================================================
   FILTERS
========================================================= */

function initStudentFilters() {

    const statusFilter =
        document.getElementById("statusFilter");

    const universityFilter =
        document.getElementById("universityFilter");

    if (statusFilter) {

        statusFilter.addEventListener("change", function () {
            filterStudents();
        });

    }

    if (universityFilter) {

        universityFilter.addEventListener("change", function () {
            filterStudents();
        });

    }

}


/* =========================================================
   FILTER STUDENTS
========================================================= */

function filterStudents() {

    const searchInput =
        document.getElementById("studentSearch");

    const statusFilter =
        document.getElementById("statusFilter");

    const universityFilter =
        document.getElementById("universityFilter");

    const rows =
        document.querySelectorAll("#studentsTableBody tr");

    const emptyState =
        document.getElementById("studentsEmpty");

    if (!rows.length) return;

    const searchValue =
        searchInput
            ? searchInput.value.trim().toLowerCase()
            : "";

    const statusValue =
        statusFilter
            ? statusFilter.value
            : "all";

    const universityValue =
        universityFilter
            ? universityFilter.value
            : "all";

    let visibleRows = 0;

    rows.forEach(function (row) {

        const searchText =
            row.dataset.search
                ? row.dataset.search.toLowerCase()
                : "";

        const rowStatus =
            row.dataset.status || "";

        const rowUniversity =
            row.dataset.university || "";

        const matchesSearch =
            searchValue === "" ||
            searchText.includes(searchValue);

        const matchesStatus =
            statusValue === "all" ||
            rowStatus === statusValue;

        const matchesUniversity =
            universityValue === "all" ||
            rowUniversity === universityValue;

        const shouldShow =
            matchesSearch &&
            matchesStatus &&
            matchesUniversity;

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
   STUDENT DRAWER
========================================================= */

function initStudentDrawer() {

    const drawer =
        document.getElementById("studentDrawer");

    const overlay =
        document.getElementById("studentDrawerOverlay");

    const closeButton =
        document.getElementById("closeStudentDrawer");

    const viewButtons =
        document.querySelectorAll(".view-student-btn");

    if (!drawer) return;


    viewButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            const row = button.closest("tr");

            if (!row) return;

            const name =
                button.dataset.student || "Student";

            const avatar =
                row.querySelector(".student-avatar");

            const email =
                row.querySelector(".student-info span");

            const university =
                row.querySelector(".university-cell strong");

            const program =
                row.querySelector(".university-cell span");

            const applications =
                row.querySelector(".application-number");

            const profile =
                row.querySelector(".profile-progress strong");

            updateDrawer({
                name: name,
                avatar: avatar ? avatar.textContent.trim() : "ST",
                email: email ? email.textContent.trim() : "student@email.com",
                university: university
                    ? university.textContent.trim()
                    : "University",
                program: program
                    ? program.textContent.trim()
                    : "Program",
                applications: applications
                    ? applications.textContent.trim()
                    : "00",
                profile: profile
                    ? profile.textContent.trim()
                    : "0%"
            });

            openDrawer();

        });

    });


    function openDrawer() {

        drawer.classList.add("show");

        if (overlay) {
            overlay.classList.add("show");
        }

        document.body.style.overflow = "hidden";

    }


    function closeDrawer() {

        drawer.classList.remove("show");

        if (overlay) {
            overlay.classList.remove("show");
        }

        document.body.style.overflow = "";

    }


    if (closeButton) {

        closeButton.addEventListener("click", function () {
            closeDrawer();
        });

    }


    if (overlay) {

        overlay.addEventListener("click", function () {
            closeDrawer();
        });

    }


    document.addEventListener("keydown", function (event) {

        if (
            event.key === "Escape" &&
            drawer.classList.contains("show")
        ) {
            closeDrawer();
        }

    });


    const fullProfileButton =
        document.getElementById("viewFullProfileBtn");

    if (fullProfileButton) {

        fullProfileButton.addEventListener("click", function () {

            const name =
                document.getElementById("drawerStudentName");

            const studentName =
                name ? name.textContent.trim() : "";

            if (!studentName) return;

            /*
                Later this can be connected to:
                student-profile-admin.html?id=...
            */

            alert(
                "Full profile for " +
                studentName +
                " will open here."
            );

        });

    }


    const suspendButton =
        document.getElementById("suspendStudentBtn");

    if (suspendButton) {

        suspendButton.addEventListener("click", async function () {

            const studentName =
                document.getElementById("drawerStudentName");

            const name =
                studentName
                    ? studentName.textContent.trim()
                    : "this student";

            const confirmed =
                await SmartDialog.confirm({
                    title: "Suspend student?",
                    message: name,
                    confirmText: "Suspend",
                    danger: true
                });

            if (!confirmed) return;

            alert(
                name +
                " has been marked for suspension."
            );

        });

    }

}


/* =========================================================
   DRAWER DATA
========================================================= */

function updateDrawer(student) {

    const drawerAvatar =
        document.getElementById("drawerAvatar");

    const drawerStudentName =
        document.getElementById("drawerStudentName");

    const drawerStudentEmail =
        document.getElementById("drawerStudentEmail");

    const drawerUniversity =
        document.getElementById("drawerUniversity");

    const drawerProgram =
        document.getElementById("drawerProgram");

    const drawerApplications =
        document.getElementById("drawerApplications");

    const drawerProfile =
        document.getElementById("drawerProfile");


    if (drawerAvatar) {
        drawerAvatar.textContent =
            student.avatar;
    }

    if (drawerStudentName) {
        drawerStudentName.textContent =
            student.name;
    }

    if (drawerStudentEmail) {
        drawerStudentEmail.textContent =
            student.email;
    }

    if (drawerUniversity) {
        drawerUniversity.textContent =
            student.university;
    }

    if (drawerProgram) {
        drawerProgram.textContent =
            student.program;
    }

    if (drawerApplications) {
        drawerApplications.textContent =
            student.applications;
    }

    if (drawerProfile) {
        drawerProfile.textContent =
            student.profile;
    }

}


/* =========================================================
   PAGINATION UI
========================================================= */

function initPagination() {

    const buttons =
        document.querySelectorAll(".pagination-btn");

    buttons.forEach(function (button) {

        button.addEventListener("click", function () {

            if (button.classList.contains("disabled")) {
                return;
            }

            if (
                button.textContent.trim() === "←" ||
                button.textContent.trim() === "→"
            ) {
                return;
            }

            buttons.forEach(function (item) {
                item.classList.remove("active");
            });

            button.classList.add("active");

        });

    });

}


/* =========================================================
   HEADER BUTTONS
========================================================= */

function initHeaderButtons() {

    const refreshButton =
        document.getElementById("refreshStudentsBtn");

    const exportButton =
        document.getElementById("exportStudentsBtn");


    if (refreshButton) {

        refreshButton.addEventListener("click", function () {

            const original =
                refreshButton.innerHTML;

            refreshButton.innerHTML =
                "<span>↻</span> Refreshing...";

            refreshButton.disabled = true;

            setTimeout(function () {

                refreshButton.innerHTML =
                    original;

                refreshButton.disabled = false;

            }, 700);

        });

    }


    if (exportButton) {

        exportButton.addEventListener("click", function () {

            /*
                Frontend placeholder.
                Later this can generate/download
                a real CSV from backend data.
            */

            alert(
                "Student data export will be connected to the backend."
            );

        });

    }

}


/* =========================================================
   ANIMATIONS
========================================================= */

function initAnimations() {

    if (typeof gsap === "undefined") {
        return;
    }


    gsap.from(".students-page-header", {
        y: 20,
        opacity: 0,
        duration: .65,
        ease: "power2.out"
    });


    gsap.from(".student-stat-card", {
        y: 18,
        opacity: 0,
        duration: .55,
        stagger: .08,
        delay: .15,
        ease: "power2.out"
    });


    gsap.from(".students-management-card", {
        y: 20,
        opacity: 0,
        duration: .65,
        delay: .25,
        ease: "power2.out"
    });

}