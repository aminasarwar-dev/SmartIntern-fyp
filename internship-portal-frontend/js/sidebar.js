/* =========================================================
   SMARTINTERN — SHARED SIDEBAR (one place for every page)
   ---------------------------------------------------------
   Use on any dashboard page:

     <aside class="dashboard-sidebar" id="dashboardSidebar"
            data-role="student"></aside>
     <script src="../js/sidebar.js"></script>

   data-role = "student" | "company" | "admin"

   - Menu items are written ONCE here. To add / rename / reorder
     a link, change it below and every page updates.
   - The link of the page you are on gets the "active" class
     automatically (from the file name in the address bar).
   - The script must sit right after the <aside>, so the sidebar
     exists before the page scripts run.
   - Same ids / classes as before (dashboardSidebar, logoutLink,
     sidebarStudentName, sidebarCompanyName, sidebarCompanyAvatar),
     so the other scripts and CSS work unchanged.
========================================================= */
(function () {

    "use strict";

    var aside = document.getElementById("dashboardSidebar");

    if (!aside) {
        return;
    }

    var role = aside.getAttribute("data-role") || "student";


    /* ---------------- MENUS ---------------- */

    // item = [ file, icon, label ]   |   "TEXT" = section label

    var MENUS = {

        student: {
            profile: {
                avatar: { text: "AS" },
                name: { id: "sidebarStudentName", text: "Student" },
                role: "Student"
            },
            logout: "/",
            items: [
                "MAIN",
                ["/student-dashboard", "⌂", "Dashboard"],
                ["/student-browse-internships", "⌕", "Browse Internships"],
                ["/student-my-applications", "▣", "My Applications"],
                ["/resume-upload", "↥", "Resume"],
                "AI TOOLS",
                ["/skill-gap", "✦", "AI Skill Gap"],
                ["/ai-match", "◎", "AI Matches"],
                "ACCOUNT",
                ["/student-profile", "◯", "My Profile"]
            ]
        },

        company: {
            profile: {
                avatar: { id: "sidebarCompanyAvatar", text: "C" },
                name: { id: "sidebarCompanyName", text: "Company" },
                role: "Company"
            },
            logout: "/login",
            items: [
                "MAIN",
                ["/company-dashboard", "⌂", "Dashboard"],
                ["/post-internship", "＋", "Post Internship"],
                ["/manage-internships", "▣", "Manage Internships"],
                ["/view-applicants", "◇", "Applicants"],
                "AI TOOLS",
                ["/ai-candidate-matches", "✦", "AI Candidate Matches"],
                ["/hiring-analytics", "◎", "Hiring Analytics"],
                "ACCOUNT",
                ["/company-profile", "◯", "Company Profile"]
            ]
        },

        admin: {
            profile: {
                avatar: { text: "AD" },
                name: { text: "Admin" },
                role: "Administrator"
            },
            logout: "/admin-login",
            items: [
                "MAIN",
                ["/admin-dashboard", "⌂", "Dashboard"],
                ["/admin-students", "◉", "Students"],
                ["/admin-companies", "◇", "Companies"],
                ["/admin-internships", "▣", "Internships"],
                ["/admin-applications", "▤", "Applications"],
                "MANAGEMENT",
                ["/admin-analytics", "◎", "Analytics"],
                ["/admin-settings", "⚙", "Settings"]
            ]
        }
    };


    /* Pages that are not in the menu but belong to a menu item */

    var BELONGS_TO = {
        "internship-detail": "student-browse-internships"
    };


    var menu = MENUS[role] || MENUS.student;

    // "/student-dashboard" (or an old "student-dashboard.html") -> "student-dashboard"
    var current = (window.location.pathname.split("/").pop() || "").replace(/\.html$/i, "");
    current = BELONGS_TO[current] || current;


    /* ---------------- BUILD ---------------- */

    function idAttr(id) {
        return id ? ' id="' + id + '"' : "";
    }

    var html = "";

    html += '<div class="sidebar-brand">' +
                '<a href="/">Smart<span>Intern</span></a>' +
            '</div>';

    html += '<div class="sidebar-profile">' +
                '<div class="sidebar-avatar"' + idAttr(menu.profile.avatar.id) + '>' +
                    menu.profile.avatar.text +
                '</div>' +
                '<div class="sidebar-profile-info">' +
                    '<strong' + idAttr(menu.profile.name.id) + '>' + menu.profile.name.text + '</strong>' +
                    '<span>' + menu.profile.role + '</span>' +
                '</div>' +
            '</div>';

    html += '<nav class="sidebar-nav">';

    var firstLabel = true;

    menu.items.forEach(function (item) {

        if (typeof item === "string") {
            html += '<p class="nav-label' + (firstLabel ? "" : " nav-label-space") + '">' + item + '</p>';
            firstLabel = false;
            return;
        }

        var isActive = item[0].replace(/^\//, "") === current;

        html += '<a href="' + item[0] + '" class="sidebar-link' + (isActive ? " active" : "") + '"' +
                    (isActive ? ' aria-current="page"' : "") + '>' +
                    '<span class="nav-icon">' + item[1] + '</span>' +
                    '<span>' + item[2] + '</span>' +
                '</a>';
    });

    html += '<a href="' + menu.logout + '" class="sidebar-link" id="logoutLink">' +
                '<span class="nav-icon">↪</span>' +
                '<span>Logout</span>' +
            '</a>';

    html += '</nav>';

    aside.innerHTML = html;

})();
