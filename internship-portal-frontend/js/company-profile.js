
// =========================================================
// SMARTINTERN — COMPANY PROFILE
// =========================================================

document.addEventListener("DOMContentLoaded", () => {
    const $ = (id) => document.getElementById(id);

    const form = $("companyProfileForm");
    const fileInput = $("licenceFile");
    const uploadBox = $("licenceUploadBox");
    const toast = $("profileToast");
    const modal = $("profileModal");

    let toastTimer;

    // -----------------------------------------------------
    // Company information from the existing login session
    // -----------------------------------------------------

    // "2026-11-03T00:00:00" -> "2026-11-03" (what <input type="date"> needs)
    function dateOnly(value) {
        const match = String(value || "").match(/^\d{4}-\d{2}-\d{2}/);
        return match ? match[0] : "";
    }

    let storedProfile = {};

    try {
        storedProfile = JSON.parse(
            sessionStorage.getItem("smartInternCompanyProfile") || "{}"
        );
    } catch {
        storedProfile = {};
    }

    const initialValues = {
        companyName: storedProfile.company_name || storedProfile.companyName || "",
        companyEmail: storedProfile.email || storedProfile.company_email || "",
        companyPhone: storedProfile.phone || storedProfile.company_phone || "",
        companyWebsite: storedProfile.website || "",
        companyIndustry: storedProfile.industry || "",
        companySize: storedProfile.company_size || storedProfile.companySize || "",
        companyCity: storedProfile.city || "",
        companyCountry: storedProfile.country || "",
        companyAddress: storedProfile.address || "",
        companyDescription: storedProfile.description || "",
        licenceNumber:
            storedProfile.licence_number || storedProfile.license_number || "",
        licenceIssue: dateOnly(
            storedProfile.license_issue_date || storedProfile.licence_issue || ""
        ),
        licenceExpiry: dateOnly(
            storedProfile.license_expiry_date || storedProfile.licence_expiry || ""
        )
    };

    Object.entries(initialValues).forEach(([id, value]) => {
        const field = $(id);
        if (field && value) field.value = value;
    });

    // company-access.js fetches /company/me and announces the fresh data.
    // Fill only fields the company has not typed into yet.
    document.addEventListener("smartintern:company", (event) => {
        const fresh = event.detail || {};

        const values = {
            licenceNumber: fresh.licence_number || fresh.license_number,
            licenceIssue: dateOnly(fresh.license_issue_date || fresh.licence_issue),
            licenceExpiry: dateOnly(fresh.license_expiry_date || fresh.licence_expiry)
        };

        Object.entries(values).forEach(([id, value]) => {
            const field = $(id);
            if (field && value && !field.value) field.value = value;
        });

        updateLicenceExpiryNotice();
    });

    function companyInitials(name) {
        const cleanName = String(name || "").trim();

        if (!cleanName) return "C";

        const words = cleanName.split(/\s+/).filter(Boolean);

        if (words.length > 1) {
            return (words[0][0] + words[1][0]).toUpperCase();
        }

        return cleanName.slice(0, 2).toUpperCase();
    }

    function updateCompanyDisplay() {
        const name = $("companyName").value.trim() || "Your Company";
        const industry = $("companyIndustry").value;
        const city = $("companyCity").value.trim();
        const country = $("companyCountry").value.trim();

        const location = [city, country].filter(Boolean).join(", ");
        const subtitle = [industry, location].filter(Boolean).join(" · ");
        const initials = companyInitials(name);

        $("sidebarCompanyName").textContent = name;
        $("topbarCompanyName").textContent = name;
        $("summaryCompanyName").textContent = name;

        $("sidebarCompanyAvatar").textContent = initials;
        $("topbarCompanyAvatar").textContent = initials;
        $("profileCompanyAvatar").textContent = initials;

        $("summaryCompanyIndustry").textContent =
            subtitle || "Add your industry and location";
    }

    ["companyName", "companyIndustry", "companyCity", "companyCountry"].forEach((id) => {
        $(id).addEventListener("input", updateCompanyDisplay);
        $(id).addEventListener("change", updateCompanyDisplay);
    });

    updateCompanyDisplay();

    // -----------------------------------------------------
    // Toast messages
    // -----------------------------------------------------

    function showToast(message, isError = false) {
        clearTimeout(toastTimer);

        toast.textContent = message;
        toast.classList.toggle("error", isError);
        toast.classList.add("show");

        toastTimer = setTimeout(() => {
            toast.classList.remove("show");
        }, 4200);
    }

    function showModal(title, message) {
        $("profileModalTitle").textContent = title;
        $("profileModalMessage").textContent = message;
        modal.hidden = false;
        $("closeProfileModal").focus();
    }

    $("closeProfileModal").addEventListener("click", () => {
        modal.hidden = true;
    });

    modal.addEventListener("click", (event) => {
        if (event.target === modal) modal.hidden = true;
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            modal.hidden = true;
            $("notificationPanel").classList.remove("show");
            $("notificationButton").setAttribute("aria-expanded", "false");
        }
    });

    // -----------------------------------------------------
    // Mobile sidebar
    // -----------------------------------------------------

    const sidebar = $("dashboardSidebar");
    const overlay = $("sidebarOverlay");
    const menuButton = $("mobileMenu");

    function closeSidebar() {
        sidebar?.classList.remove("active", "open", "show");
        overlay?.classList.remove("active", "show");
        document.body.classList.remove("sidebar-open");
    }

    menuButton?.addEventListener("click", () => {
        sidebar?.classList.toggle("active");
        overlay?.classList.toggle("active");
        document.body.classList.toggle("sidebar-open");
    });

    overlay?.addEventListener("click", closeSidebar);

    // -----------------------------------------------------
    // Notification panel
    // -----------------------------------------------------

    const notificationButton = $("notificationButton");
    const notificationPanel = $("notificationPanel");
    const closeNotifications = $("closeNotifications");

    function closeNotificationsPanel() {
        notificationPanel?.classList.remove("show");
        notificationButton?.setAttribute("aria-expanded", "false");
    }

    notificationButton?.addEventListener("click", (event) => {
        event.stopPropagation();

        const willOpen = !notificationPanel.classList.contains("show");

        notificationPanel.classList.toggle("show", willOpen);
        notificationButton.setAttribute("aria-expanded", String(willOpen));
    });

    closeNotifications?.addEventListener("click", closeNotificationsPanel);

    document.addEventListener("click", (event) => {
        if (
            notificationPanel &&
            notificationButton &&
            !notificationPanel.contains(event.target) &&
            !notificationButton.contains(event.target)
        ) {
            closeNotificationsPanel();
        }
    });

    // -----------------------------------------------------
    // Logout
    // -----------------------------------------------------

    $("logoutLink")?.addEventListener("click", (event) => {
        event.preventDefault();

        SmartDialog.confirm({
            title: "Log out?",
            message: "Are you sure you want to log out of your company account?",
            confirmText: "Yes, log out"
        }).then(confirmed => {
            if (!confirmed) return;

            sessionStorage.removeItem("smartInternToken");
            sessionStorage.removeItem("smartInternLogin");
            sessionStorage.removeItem("smartInternRole");
            if (window.SmartInternSession) { window.SmartInternSession.clear(); }
            window.location.href = "login.html";
        });
    });

    // -----------------------------------------------------
    // Licence expiry notice
    // -----------------------------------------------------

    const expiryInput = $("licenceExpiry");

    function updateLicenceExpiryNotice() {
        const expiryValue = expiryInput.value;

        if (!expiryValue) {
            $("licenceNoticeTitle").textContent =
                "Keep your trade licence up to date";

            $("licenceNoticeText").textContent =
                "Upload your current trade licence and enter its expiry date.";

            $("licenceReviewBadge").classList.remove("expired");
            return;
        }

        // Compare calendar dates without timezone conversion.
        const today = new Date();
        const todayLocal = [
            today.getFullYear(),
            String(today.getMonth() + 1).padStart(2, "0"),
            String(today.getDate()).padStart(2, "0")
        ].join("-");

        if (expiryValue < todayLocal) {
            $("licenceNoticeTitle").textContent = "Your licence has expired";
            $("licenceNoticeText").textContent =
                "Please upload a new valid licence. Verification may require review by your administrator.";

            $("licenceReviewBadge").textContent = "Expired";
            $("licenceReviewBadge").classList.add("expired");
        } else {
            $("licenceNoticeTitle").textContent = "Licence expiry date recorded";
            $("licenceNoticeText").textContent =
                "Make sure the uploaded document matches the licence number and expiry date.";

            $("licenceReviewBadge").textContent = "Date entered";
            $("licenceReviewBadge").classList.remove("expired");
        }
    }

    expiryInput.addEventListener("change", updateLicenceExpiryNotice);
    updateLicenceExpiryNotice();

    // -----------------------------------------------------
    // Trade licence file selection
    // -----------------------------------------------------

    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    const allowedExtensions = ["pdf", "jpg", "jpeg", "png"];

    function getExtension(fileName) {
        const parts = fileName.toLowerCase().split(".");
        return parts.length > 1 ? parts.pop() : "";
    }

    function validateLicenceFile(file) {
        if (!file) return false;

        const extension = getExtension(file.name);

        if (!allowedExtensions.includes(extension)) {
            showToast("Please select a PDF, JPG or PNG file.", true);
            return false;
        }

        if (file.size > MAX_FILE_SIZE) {
            showToast("The licence file must be 5 MB or smaller.", true);
            return false;
        }

        return true;
    }

    fileInput.addEventListener("change", () => {
        const file = fileInput.files[0];

        if (!file) {
            updateFileDisplay(null);
            return;
        }

        if (!validateLicenceFile(file)) {
            fileInput.value = "";
            updateFileDisplay(null);
            return;
        }

        updateFileDisplay(file);
    });

    function updateFileDisplay(file) {
        if (file) {
            $("licenceFileTitle").textContent = file.name;
            $("licenceFileDescription").textContent =
                `${(file.size / (1024 * 1024)).toFixed(2)} MB · Selected`;
            $("licenceCurrentTitle").textContent = file.name;
            $("licenceCurrentText").textContent =
                "Selected in this browser. It has not been uploaded to the server yet.";
            $("licenceReviewBadge").textContent = "Selected";
            $("licenceReviewBadge").classList.add("selected");
            uploadBox.classList.add("drag-active");
        } else {
            $("licenceFileTitle").textContent = "Choose your trade licence";
            $("licenceFileDescription").textContent = "PDF, JPG or PNG · Maximum 5 MB";
            $("licenceCurrentTitle").textContent = "No new document selected";
            $("licenceCurrentText").textContent =
                "Choose a file above to prepare your licence update.";
            $("licenceReviewBadge").textContent = "Not submitted";
            $("licenceReviewBadge").classList.remove("selected");
            uploadBox.classList.remove("drag-active");
        }
    }

    ["dragenter", "dragover"].forEach((eventName) => {
        uploadBox.addEventListener(eventName, (event) => {
            event.preventDefault();
            uploadBox.classList.add("drag-active");
        });
    });

    ["dragleave", "drop"].forEach((eventName) => {
        uploadBox.addEventListener(eventName, (event) => {
            event.preventDefault();
            uploadBox.classList.remove("drag-active");
        });
    });

    uploadBox.addEventListener("drop", (event) => {
        const file = event.dataTransfer?.files?.[0];
        if (!file) return;

        const transfer = new DataTransfer();
        transfer.items.add(file);
        fileInput.files = transfer.files;
        fileInput.dispatchEvent(new Event("change", { bubbles: true }));
    });

    // -----------------------------------------------------
    // Form validation and submission
    // -----------------------------------------------------

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        updateCompanyDisplay();

        const requiredFields = [...form.querySelectorAll("[required]")];
        let firstInvalid = null;

        for (const field of requiredFields) {
            if (field.type === "file") {
                if (!field.files || !field.files.length ||
                    !validateLicenceFile(field.files[0])) {
                    firstInvalid = field;
                    break;
                }
            } else if (!field.checkValidity()) {
                firstInvalid = field;
                break;
            }
        }

        if (firstInvalid) {
            showToast("Please complete all required fields and check the licence file.", true);

            if (firstInvalid.type === "file") {
                uploadBox.scrollIntoView({ behavior: "smooth", block: "center" });
                fileInput.focus({ preventScroll: true });
            } else {
                firstInvalid.reportValidity();
                firstInvalid.focus();
            }
            return;
        }

        const website = $("companyWebsite").value.trim();

        if (website && !/^https?:\/\//i.test(website)) {
            $("companyWebsite").setCustomValidity(
                "Please enter a website starting with https:// or http://"
            );
            $("companyWebsite").reportValidity();
            $("companyWebsite").focus();
            $("companyWebsite").setCustomValidity("");
            return;
        }

        // ---- Trade licence dates ----
        const issueValue = $("licenceIssue").value;
        const expiryValue = $("licenceExpiry").value;

        const today = new Date();
        const todayLocal = [
            today.getFullYear(),
            String(today.getMonth() + 1).padStart(2, "0"),
            String(today.getDate()).padStart(2, "0")
        ].join("-");

        if (issueValue > todayLocal) {
            showToast("The licence issue date cannot be in the future.", true);
            $("licenceIssue").focus();
            return;
        }

        if (expiryValue <= issueValue) {
            showToast("The expiry date must be after the issue date.", true);
            $("licenceExpiry").focus();
            return;
        }

        if (expiryValue < todayLocal) {
            showToast("This licence has already expired. Please upload a valid licence.", true);
            $("licenceExpiry").focus();
            return;
        }

        // A verified company with a healthy licence goes back to review after
        // uploading, so ask first.
        const company = window.SmartInternCompany;

        if (company && company.getStatus() === "approved") {
            const days = Number(company.getProfile()?.license_days_left);

            if (!(Number.isFinite(days) && days <= 7)) {
                const proceed = await SmartDialog.confirm({
                    title: "Send company back to review?",
                    message:
                        "Uploading a new licence sends your company back to review, " +
                        "and posting internships is paused until the admin verifies it again.",
                    confirmText: "Upload anyway"
                });

                if (!proceed) return;
            }
        }

        // ---- Upload: PUT /company/reupload-license ----
        const saveButton = $("saveProfileButton");
        const saveButtonHTML = saveButton.innerHTML;

        saveButton.disabled = true;
        saveButton.textContent = "Uploading...";

        try {
            await reuploadCompanyLicenseAPI(
                fileInput.files[0],
                issueValue,
                expiryValue
            );
        } catch (failure) {
            if (failure.status === 401) {
                window.SmartInternSession?.clear();
                window.location.replace("login.html?next=company-profile.html%23tradeLicence");
                return;
            }

            // The server's message (detail) is always shown on screen.
            showToast(failure.message || "Upload failed. Please try again.", true);
            return;
        } finally {
            saveButton.disabled = false;
            saveButton.innerHTML = saveButtonHTML;
        }

        const profileData = {
            company_name: $("companyName").value.trim(),
            email: $("companyEmail").value.trim(),
            phone: $("companyPhone").value.trim(),
            website: $("companyWebsite").value.trim(),
            industry: $("companyIndustry").value,
            company_size: $("companySize").value,
            city: $("companyCity").value.trim(),
            country: $("companyCountry").value.trim(),
            address: $("companyAddress").value.trim(),
            description: $("companyDescription").value.trim(),
            licence_number: $("licenceNumber").value.trim(),
            license_issue_date: issueValue,
            license_expiry_date: expiryValue
        };

        // Keep the current session's company display details in sync.
        try {
            const current = JSON.parse(
                sessionStorage.getItem("smartInternCompanyProfile") || "{}"
            );

            sessionStorage.setItem(
                "smartInternCompanyProfile",
                JSON.stringify({ ...current, ...profileData })
            );
        } catch (error) {
            console.error("Could not update the company session profile.", error);
        }

        updateCompanyDisplay();

        // Licence is now with the admin: reset the form file and update the banner.
        fileInput.value = "";
        updateFileDisplay(null);
        $("licenceReviewBadge").textContent = "In review";

        if (window.SmartInternCompany) {
            window.SmartInternCompany.licenseSubmitted(issueValue, expiryValue);
        }

        showModal(
            "Licence submitted",
            "Your trade licence was submitted. The admin will verify your company again and we will email you. " +
            "Other profile details are only kept in this browser until a profile-update API is connected."
        );
    });
});
