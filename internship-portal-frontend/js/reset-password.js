document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("resetPasswordForm");
    const newPassword = document.getElementById("newPassword");
    const confirmPassword = document.getElementById("confirmPassword");
    const newPasswordError = document.getElementById("newPasswordError");
    const confirmPasswordError = document.getElementById("confirmPasswordError");

    if (!form || !newPassword || !confirmPassword) {
        return;
    }

    /* =====================================================
       TOKEN + ROLE FROM URL
       Link format: reset-password.html?token=XYZ&role=company
       ===================================================== */

    const urlParams = new URLSearchParams(window.location.search);
    const resetToken = urlParams.get("token");
    const role = urlParams.get("role") === "company" ? "company" : "student";

    /* =====================================================
       SHOW / HIDE PASSWORD
       ===================================================== */

    document.querySelectorAll(".password-toggle").forEach(button => {

        button.addEventListener("click", () => {

            const target = document.getElementById(button.dataset.target);

            if (!target) {
                return;
            }

            if (target.type === "password") {
                target.type = "text";
                button.textContent = "Hide";
            }
            else {
                target.type = "password";
                button.textContent = "Show";
            }

        });

    });

    /* =====================================================
       SUBMIT
       ===================================================== */

    form.addEventListener("submit", async event => {

        event.preventDefault();

        newPasswordError.textContent = "";
        confirmPasswordError.textContent = "";
        confirmPasswordError.style.color = "";

        const password = newPassword.value;
        const confirm = confirmPassword.value;

        if (!resetToken) {
            newPasswordError.textContent =
                "This password reset link is invalid or expired.";
            return;
        }

        if (!password) {
            newPasswordError.textContent = "New password is required.";
            return;
        }

        if (password.length < 8) {
            newPasswordError.textContent =
                "Password must be at least 8 characters long.";
            return;
        }

        if (!confirm) {
            confirmPasswordError.textContent =
                "Please confirm your new password.";
            return;
        }

        if (password !== confirm) {
            confirmPasswordError.textContent = "Passwords do not match.";
            return;
        }

        /* =================================================
           BACKEND CALL
           ================================================= */

        const endpoint = role === "company"
            ? "/company/reset-password"
            : "/student/reset-password";

        const submitButton = form.querySelector("button[type='submit']");
        const originalButtonHTML = submitButton ? submitButton.innerHTML : "";

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.innerHTML = `<span>Updating...</span>`;
        }

        try {

            const result = await apiJsonRequest(endpoint, {
                token: resetToken,
                new_password: password
            }, SLOW_TIMEOUT_MS);

            confirmPasswordError.style.color = "#8d63ad";
            confirmPasswordError.textContent =
                result.message ||
                "Password updated successfully. Redirecting to login...";

            if (submitButton) {
                submitButton.innerHTML = `<span>Password Updated</span>`;
            }

            setTimeout(() => {
                window.location.href = "login.html";
            }, 2000);

        }
        catch (error) {

            newPasswordError.textContent =
                error.message ||
                "Unable to reset password. Please try again.";

            if (submitButton) {
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonHTML;
            }

        }

    });

});