document.addEventListener("DOMContentLoaded", () => {

    initAnimations();
    initRoleSwitch();
    initPasswordToggle();
    initLoginForm();
    initRememberMe();
    initForgotPassword();
    initLoginNotices();

});


/* =========================================================
   NOTICES FROM THE URL
   ?notice=blocked           -> company was blocked by the admin
   ?next=company-profile...  -> company came from a reminder email
   ========================================================= */

function initLoginNotices() {

    const params = new URLSearchParams(window.location.search);

    if (getSafeNextPage()) {

        const companyOption = document.querySelector(
            '.role-option[data-role="company"]'
        );

        if (companyOption && !companyOption.classList.contains("active")) {
            companyOption.click();
        }

    }

    if (params.get("notice") === "blocked") {

        showLoginError(
            "passwordError",
            "Your company account has been blocked. Please contact support."
        );

    }

}


/* =========================================================
   PAGE ANIMATIONS
   ========================================================= */

function initAnimations() {

    if (typeof gsap === "undefined") {
        return;
    }

    gsap.from(".login-card", {
        duration: 0.8, opacity: 0, y: 35, ease: "power3.out"
    });

    gsap.from(".signup-heading h1", {
        duration: 0.7, opacity: 0, y: 18, delay: 0.15, ease: "power3.out"
    });

    gsap.from(".role-switch", {
        duration: 0.6, opacity: 0, y: 12, delay: 0.25, ease: "power3.out"
    });

    gsap.from(".input-group", {
        duration: 0.6, opacity: 0, y: 12, delay: 0.3,
        stagger: 0.08, ease: "power3.out"
    });

}


/* =========================================================
   HELPERS
   ========================================================= */

function getSelectedRole() {

    const accountRole = document.getElementById("accountRole");

    if (accountRole && accountRole.value) {
        return accountRole.value;
    }

    return document.querySelector(".role-option.active")?.dataset.role
        || "student";

}


/* =========================================================
   ROLE SWITCH
   ========================================================= */

function initRoleSwitch() {

    const roleButtons = document.querySelectorAll(".role-option");
    const accountRole = document.getElementById("accountRole");

    roleButtons.forEach(button => {

        button.addEventListener("click", () => {

            roleButtons.forEach(item => item.classList.remove("active"));
            button.classList.add("active");

            if (accountRole) {
                accountRole.value = button.dataset.role;
            }

        });

    });

}


/* =========================================================
   PASSWORD TOGGLE
   ========================================================= */

function initPasswordToggle() {

    document.querySelectorAll(".password-toggle").forEach(button => {

        button.addEventListener("click", () => {

            const input = document.getElementById(button.dataset.target);

            if (!input) {
                return;
            }

            if (input.type === "password") {
                input.type = "text";
                button.textContent = "Hide";
            }
            else {
                input.type = "password";
                button.textContent = "Show";
            }

        });

    });

}


/* =========================================================
   LOGIN FORM
   ========================================================= */

function initLoginForm() {

    const form = document.getElementById("loginForm");

    if (!form) {
        return;
    }

    form.addEventListener("submit", async event => {

        event.preventDefault();
        clearLoginErrors();

        const email = document.getElementById("email").value.trim().toLowerCase();
        const password = document.getElementById("password").value;
        const role = getSelectedRole();

        let valid = true;

        if (!email) {
            showLoginError("emailError", "Please enter your email.");
            valid = false;
        }
        else if (!isValidEmail(email)) {
            showLoginError("emailError", "Please enter a valid email address.");
            valid = false;
        }

        if (!password) {
            showLoginError("passwordError", "Please enter your password.");
            valid = false;
        }

        if (!valid) {
            return;
        }

        const endpoint = role === "company"
            ? "/company/login"
            : "/student/login";

        const loginButton = document.getElementById("loginButton");
        const originalButtonHTML = loginButton ? loginButton.innerHTML : "";

        if (loginButton) {
            loginButton.disabled = true;
            loginButton.innerHTML = `<span>Signing in...</span>`;
        }

        try {

            const result = await apiJsonRequest(endpoint, { email, password });

            /* SAVE LOGIN DATA */

            if (result.access_token) {
                sessionStorage.setItem("access_token", result.access_token);
            }

            sessionStorage.setItem("user_role", role);
            sessionStorage.setItem("login_data", JSON.stringify(result));

            const userData = result.user || result.student || result.company;

            if (userData) {
                sessionStorage.setItem("user_data", JSON.stringify(userData));
            }

            /* Keys that dashboards, guards and logout use (same as signup) */

            sessionStorage.setItem("smartInternRole", role);

            if (result.access_token) {
                sessionStorage.setItem("smartInternToken", result.access_token);
            }

            if (userData) {
                sessionStorage.setItem(
                    role === "company"
                        ? "smartInternCompanyProfile"
                        : "smartInternStudentProfile",
                    JSON.stringify(userData)
                );
            }

            /* REMEMBER ME (sirf email + role, password kabhi nahi) */

            const rememberMe = document.getElementById("rememberMe");

            if (rememberMe && rememberMe.checked) {
                localStorage.setItem("remember_email", email);
                localStorage.setItem("remember_role", role);
            }
            else {
                localStorage.removeItem("remember_email");
                localStorage.removeItem("remember_role");
            }

            showLoginSuccess(role);

        }
        catch (error) {

            showLoginError(
                "passwordError",
                error.message || "Invalid email or password."
            );

        }
        finally {

            if (loginButton) {
                loginButton.disabled = false;
                loginButton.innerHTML = originalButtonHTML;
            }

        }

    });

}


/* =========================================================
   REMEMBER ME
   ========================================================= */

function initRememberMe() {

    const email = document.getElementById("email");
    const remember = document.getElementById("rememberMe");

    if (!email || !remember) {
        return;
    }

    const savedEmail = localStorage.getItem("remember_email");
    const savedRole = localStorage.getItem("remember_role");

    if (savedEmail) {
        email.value = savedEmail;
        remember.checked = true;
    }

    if (savedRole) {

        const roleButton = document.querySelector(
            `.role-option[data-role="${savedRole}"]`
        );

        const accountRole = document.getElementById("accountRole");

        if (roleButton) {
            document.querySelectorAll(".role-option")
                .forEach(button => button.classList.remove("active"));
            roleButton.classList.add("active");
        }

        if (accountRole) {
            accountRole.value = savedRole;
        }

    }

}


/* =========================================================
   FORGOT PASSWORD MODAL
   ========================================================= */

function initForgotPassword() {

    const link = document.getElementById("forgotPasswordLink");
    const modal = document.getElementById("forgotPasswordModal");
    const closeButton = document.getElementById("forgotModalClose");
    const form = document.getElementById("forgotPasswordForm");

    if (!link || !modal || !closeButton || !form) {
        return;
    }

    /* OPEN MODAL */

    link.addEventListener("click", event => {

        event.preventDefault();
        clearForgotError();

        const loginEmail = document.getElementById("email")?.value.trim();
        const forgotEmail = document.getElementById("forgotEmail");

        if (loginEmail && forgotEmail) {
            forgotEmail.value = loginEmail;
        }

        modal.classList.add("show");
        document.body.style.overflow = "hidden";

        setTimeout(() => {
            if (forgotEmail) {
                forgotEmail.focus();
            }
        }, 100);

    });

    /* CLOSE MODAL */

    closeButton.addEventListener("click", closeForgotModal);

    modal.addEventListener("click", event => {
        if (event.target === modal) {
            closeForgotModal();
        }
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && modal.classList.contains("show")) {
            closeForgotModal();
        }
    });

    /* SUBMIT */

    form.addEventListener("submit", async event => {

        event.preventDefault();
        clearForgotError();

        const forgotEmail = document.getElementById("forgotEmail");
        const email = forgotEmail.value.trim().toLowerCase();

        if (!email) {
            showForgotError("Please enter your email.");
            return;
        }

        if (!isValidEmail(email)) {
            showForgotError("Please enter a valid email address.");
            return;
        }

        const role = getSelectedRole();

        const endpoint = role === "company"
            ? "/company/forgot-password"
            : "/student/forgot-password";

        const submitButton = form.querySelector("button[type='submit']");
        const originalButtonHTML = submitButton ? submitButton.innerHTML : "";

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.innerHTML = `<span>Sending...</span>`;
        }

        try {

            const result = await apiJsonRequest(endpoint, { email }, SLOW_TIMEOUT_MS);

            /*
             * Backend same message deta hai chahe email exist kare ya na kare
             * (email enumeration se bachne ke liye).
             * Button yahan restore NAHI karna, showForgotSuccess khud karta hai.
             */
            showForgotSuccess(
                result.message ||
                "If this email is registered, a password reset link has been sent."
            );

        }
        catch (error) {

            showForgotError(
                error.message ||
                "Unable to send the reset request. Please try again."
            );

            /* Sirf error par button wapas theek karo */
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonHTML;
            }

        }

    });

}


/* =========================================================
   FORGOT PASSWORD SUCCESS
   ========================================================= */

function showForgotSuccess(message) {

    const form = document.getElementById("forgotPasswordForm");
    const forgotEmail = document.getElementById("forgotEmail");
    const error = document.getElementById("forgotEmailError");

    if (error) {
        error.textContent = message;
        error.style.color = "#8d63ad";
    }

    if (forgotEmail) {
        forgotEmail.disabled = true;
    }

    const submitButton = form?.querySelector("button[type='submit']");

    if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = `<span>Email Sent</span>`;
    }

    setTimeout(() => {

        if (forgotEmail) {
            forgotEmail.disabled = false;
        }

        if (error) {
            error.textContent = "";
            error.style.color = "";
        }

        if (form) {
            form.reset();
        }

        if (submitButton) {
            submitButton.disabled = false;
            submitButton.innerHTML = `
                <span>Continue</span>
                <span class="button-arrow">→</span>
            `;
        }

        closeForgotModal();

    }, 3500);

}


/* =========================================================
   CLOSE FORGOT MODAL
   ========================================================= */

function closeForgotModal() {

    const modal = document.getElementById("forgotPasswordModal");

    if (!modal) {
        return;
    }

    modal.classList.remove("show");
    document.body.style.overflow = "";

}


/* =========================================================
   LOGIN SUCCESS + REDIRECT
   ========================================================= */

function showLoginSuccess(role) {

    const overlay = document.getElementById("successOverlay");

    if (!overlay) {
        redirectToDashboard(role);
        return;
    }

    overlay.classList.add("show");

    const continueButton = document.getElementById("continueBtn");

    if (continueButton) {
        continueButton.onclick = () => redirectToDashboard(role);
    }
    else {
        setTimeout(() => redirectToDashboard(role), 1200);
    }

}


function getSafeNextPage() {

    // ?next=company-profile.html#tradeLicence  (from reminder emails / guards)
    // Only plain page names from this folder are accepted.

    const next = new URLSearchParams(window.location.search).get("next") || "";

    return /^[a-z0-9-]+\.html(#[a-z0-9-]+)?$/i.test(next) ? next : "";

}


function redirectToDashboard(role) {

    const next = getSafeNextPage();

    if (role === "company" && next) {
        window.location.href = next;
        return;
    }

    window.location.href = role === "company"
        ? "company-dashboard.html"
        : "student-dashboard.html";

}


/* =========================================================
   ERRORS
   ========================================================= */

function showLoginError(id, message) {

    const element = document.getElementById(id);

    if (element) {
        element.textContent = message;
    }

}


function clearLoginErrors() {

    document.querySelectorAll("#loginForm .error").forEach(error => {
        error.textContent = "";
    });

}


function showForgotError(message) {

    const error = document.getElementById("forgotEmailError");

    if (error) {
        error.textContent = message;
        error.style.color = "";
    }

}


function clearForgotError() {

    const error = document.getElementById("forgotEmailError");

    if (error) {
        error.textContent = "";
        error.style.color = "";
    }

}


/* =========================================================
   EMAIL VALIDATION
   ========================================================= */

function isValidEmail(email) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

}