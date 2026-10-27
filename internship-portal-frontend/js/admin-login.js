/* =========================================================
   SMARTINTERN — ADMIN LOGIN
========================================================= */


/* =========================================================
   ELEMENTS
========================================================= */

const adminLoginForm =
    document.getElementById("adminLoginForm");

const adminEmail =
    document.getElementById("adminEmail");

const adminPassword =
    document.getElementById("adminPassword");

const adminPasswordToggle =
    document.getElementById("adminPasswordToggle");

const adminEmailError =
    document.getElementById("adminEmailError");

const adminPasswordError =
    document.getElementById("adminPasswordError");

const adminFormError =
    document.getElementById("adminFormError");

const adminLoginButton =
    document.getElementById("adminLoginButton");

const adminSuccessOverlay =
    document.getElementById("adminSuccessOverlay");


/* =========================================================
   PASSWORD SHOW / HIDE
========================================================= */

if (adminPasswordToggle && adminPassword) {

    adminPasswordToggle.addEventListener("click", function () {

        if (adminPassword.type === "password") {

            adminPassword.type = "text";
            adminPasswordToggle.textContent = "Hide";

        } else {

            adminPassword.type = "password";
            adminPasswordToggle.textContent = "Show";
        }

    });
}


/* =========================================================
   CLEAR ERRORS
========================================================= */

function clearAdminErrors() {

    if (adminEmailError) {
        adminEmailError.textContent = "";
    }

    if (adminPasswordError) {
        adminPasswordError.textContent = "";
    }

    if (adminFormError) {
        adminFormError.textContent = "";
    }
}


/* =========================================================
   VALIDATION
========================================================= */

function validateAdminLogin() {

    clearAdminErrors();

    const email = adminEmail.value.trim();
    const password = adminPassword.value;

    let valid = true;

    if (!email) {

        if (adminEmailError) {
            adminEmailError.textContent =
                "Please enter your email.";
        }

        valid = false;

    } else {

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {

            if (adminEmailError) {
                adminEmailError.textContent =
                    "Please enter a valid email address.";
            }

            valid = false;
        }
    }

    if (!password) {

        if (adminPasswordError) {
            adminPasswordError.textContent =
                "Please enter your password.";
        }

        valid = false;
    }

    return valid;
}


/* =========================================================
   LOGIN — FASTAPI BACKEND
========================================================= */

if (adminLoginForm) {

    adminLoginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        if (!validateAdminLogin()) {
            return;
        }

        const buttonText = adminLoginButton
            ? adminLoginButton.querySelector("span")
            : null;

        try {

            if (adminLoginButton) {

                adminLoginButton.disabled = true;

                if (buttonText) {
                    buttonText.textContent = "Logging in...";
                }
            }

            clearAdminErrors();

            /* Call shared API function */

            await adminLoginAPI(
                adminEmail.value.trim(),
                adminPassword.value
            );

            /* Show success overlay */

            if (adminSuccessOverlay) {
                adminSuccessOverlay.classList.add("show");
            }

            /* Redirect after successful login */

            setTimeout(function () {

                window.location.href = "admin-dashboard.html";

            }, 900);

        } catch (error) {

            if (adminFormError) {
                adminFormError.textContent =
                    error.message ||
                    "Invalid admin email or password.";
            }

            if (adminLoginButton) {

                adminLoginButton.disabled = false;

                if (buttonText) {
                    buttonText.textContent = "Login";
                }
            }

        }

    });
}


/* =========================================================
   CLEAR EMAIL ERROR WHILE TYPING
========================================================= */

if (adminEmail) {

    adminEmail.addEventListener("input", function () {

        if (adminEmailError) {
            adminEmailError.textContent = "";
        }

        if (adminFormError) {
            adminFormError.textContent = "";
        }

    });
}


/* =========================================================
   CLEAR PASSWORD ERROR WHILE TYPING
========================================================= */

if (adminPassword) {

    adminPassword.addEventListener("input", function () {

        if (adminPasswordError) {
            adminPasswordError.textContent = "";
        }

        if (adminFormError) {
            adminFormError.textContent = "";
        }

    });
}