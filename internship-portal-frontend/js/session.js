/* =========================================================
   SMARTINTERN — SESSION HELPER + PAGE GUARD
   ---------------------------------------------------------
   Load this in <head> of every protected page:

     <script src="../js/session.js" data-role="student"></script>
     <script src="../js/session.js" data-role="company"></script>
     <script src="../js/session.js" data-role="admin"></script>

   - If the visitor is not logged in with that role, they are
     redirected to the login page.
   - Exposes window.SmartInternSession (get / clear / name helpers).
   - NOTE: this is only a UX guard. Real security must always be
     enforced by the backend (token check on every API route).
========================================================= */
(function () {

    "use strict";

    const USER_KEYS = [
        "smartInternToken",
        "smartInternRole",
        "smartInternLogin",
        "smartInternCompanyProfile",
        "smartInternStudentProfile",
        "access_token",
        "user_role",
        "login_data",
        "user_data"
    ];

    const ADMIN_KEYS = [
        "smartInternAdminToken",
        "smartInternAdmin"
    ];

    function read(key) {
        try {
            return sessionStorage.getItem(key);
        } catch (error) {
            return null;
        }
    }

    function getToken() {
        return read("smartInternToken") || read("access_token") || "";
    }

    function getRole() {
        return read("smartInternRole") || read("user_role") || "";
    }

    function getAdminToken() {
        let token = read("smartInternAdminToken");

        if (!token) {
            try {
                token = localStorage.getItem("smartInternAdminToken");
            } catch (error) {
                token = "";
            }
        }

        return token || "";
    }

    function getProfile() {
        const role = getRole();

        const raw =
            (role === "company"
                ? read("smartInternCompanyProfile")
                : read("smartInternStudentProfile")) ||
            read("user_data");

        if (!raw) {
            return null;
        }

        try {
            return JSON.parse(raw);
        } catch (error) {
            return null;
        }
    }

    function getDisplayName() {
        const profile = getProfile();

        if (!profile) {
            return "";
        }

        return (
            profile.companyName ||
            profile.company_name ||
            profile.name ||
            profile.full_name ||
            profile.fullName ||
            ""
        );
    }

    function clearUserSession() {
        USER_KEYS.forEach(key => {
            try {
                sessionStorage.removeItem(key);
            } catch (error) { /* ignore */ }
        });
    }

    function clearAdminSession() {
        ADMIN_KEYS.forEach(key => {
            try {
                sessionStorage.removeItem(key);
                localStorage.removeItem(key);
            } catch (error) { /* ignore */ }
        });
    }

    window.SmartInternSession = {
        getToken,
        getRole,
        getAdminToken,
        getProfile,
        getDisplayName,
        clear: clearUserSession,
        clearAdmin: clearAdminSession
    };

    /* ---------------------------------------------------------
       PAGE GUARD
    --------------------------------------------------------- */

    const script = document.currentScript;
    const requiredRole = script ? script.getAttribute("data-role") : "";

    if (requiredRole) {

        let allowed = false;
        let redirectTo = "login.html";

        if (requiredRole === "admin") {
            allowed = Boolean(getAdminToken());
            redirectTo = "admin-login.html";
        }
        else {
            allowed = Boolean(getToken()) && getRole() === requiredRole;
        }

        if (!allowed) {

            // A company that opens a link from an email (for example
            // "Update my license") while logged out is sent to login first
            // and then brought back to this page.
            if (requiredRole === "company") {
                const current = window.location.pathname.split("/").pop();

                if (/^[a-z0-9-]+\.html$/i.test(current)) {
                    redirectTo = "login.html?next=" +
                        encodeURIComponent(current + window.location.hash);
                }
            }

            window.location.replace(redirectTo);
            return;
        }
    }

    /* ---------------------------------------------------------
       SHOW LOGGED-IN NAME IN THE SIDEBAR (every page, not only
       the dashboard)
    --------------------------------------------------------- */

    document.addEventListener("DOMContentLoaded", () => {

        if (requiredRole !== "student" && requiredRole !== "company") {
            return;
        }

        const name = getDisplayName();

        if (!name) {
            return;
        }

        const nameElement = document.querySelector(
            ".sidebar-profile-info strong"
        );

        if (nameElement) {
            nameElement.textContent = name;
        }

        const avatar = document.querySelector(".sidebar-avatar");

        if (avatar) {
            const initials = name
                .split(/\s+/)
                .filter(Boolean)
                .slice(0, 2)
                .map(word => word[0].toUpperCase())
                .join("");

            if (initials) {
                avatar.textContent = initials;
            }
        }
    });

})();
