/* =========================================================
   SMARTINTERN — POST INTERNSHIP
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("internshipForm");
    const feedback = document.getElementById("formFeedback");

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

    /* FEEDBACK */

    function showFeedback(message, type = "info") {
        feedback.textContent = message;
        feedback.dataset.type = type;
        feedback.hidden = false;
    }

    function clearFeedback() {
        feedback.hidden = true;
        feedback.textContent = "";
        delete feedback.dataset.type;
    }

    form.addEventListener("input", clearFeedback);
    form.addEventListener("change", clearFeedback);

    /* CONDITIONAL FIELDS */

    const arrangementInputs = document.querySelectorAll(
        'input[name="workArrangement"]'
    );

    const remoteFields = document.getElementById("remoteFields");
    const officeFields = document.getElementById("officeFields");
    const hybridFields = document.getElementById("hybridFields");

    const remoteRegion = document.getElementById("remoteRegion");
    const remoteTimezone = document.getElementById("remoteTimezone");
    const officeCity = document.getElementById("officeCity");
    const officeAddress = document.getElementById("officeAddress");
    const officeDays = document.getElementById("officeDays");

    function setFieldGroup(elements, required) {
        elements.forEach(element => {
            element.required = required;

            if (!required) {
                element.value = "";
            }
        });
    }

    function updateArrangementFields() {
        const selected = document.querySelector(
            'input[name="workArrangement"]:checked'
        )?.value || "";

        const isRemote = selected === "Remote";
        const isOffice = selected === "On-site" || selected === "Hybrid";
        const isHybrid = selected === "Hybrid";

        remoteFields.hidden = !isRemote;
        officeFields.hidden = !isOffice;
        hybridFields.hidden = !isHybrid;

        setFieldGroup(
            [remoteRegion, remoteTimezone],
            isRemote
        );

        setFieldGroup(
            [officeCity, officeAddress],
            isOffice
        );

        setFieldGroup(
            [officeDays],
            isHybrid
        );
    }

    arrangementInputs.forEach(input => {
        input.addEventListener("change", updateArrangementFields);
    });

    /* CUSTOM DURATION */

    const duration = document.getElementById("duration");
    const customDurationField = document.getElementById("customDurationField");
    const customDuration = document.getElementById("customDuration");

    function updateDurationFields() {
        const customSelected = duration.value === "Other";

        customDurationField.hidden = !customSelected;
        customDuration.required = customSelected;

        if (!customSelected) {
            customDuration.value = "";
        }
    }

    duration.addEventListener("change", updateDurationFields);

    /* QUALIFICATIONS: SEMESTER ONLY FOR CURRENT STUDENTS */

    const candidateType = document.getElementById("candidateType");
    const semesterField = document.getElementById("semesterField");
    const minSemester = document.getElementById("minSemester");

    function updateCandidateFields() {
        const isStudent = candidateType.value === "Current student";

        semesterField.hidden = !isStudent;

        setFieldGroup(
            [minSemester],
            isStudent
        );
    }

    candidateType.addEventListener("change", updateCandidateFields);

    /* PAID / UNPAID */

    const compensationType = document.getElementById("compensationType");
    const stipendFields = document.getElementById("stipendFields");
    const stipendAmount = document.getElementById("stipendAmount");
    const stipendCurrency = document.getElementById("stipendCurrency");

    function updateCompensationFields() {
        const isPaid = compensationType.value === "Paid";

        stipendFields.hidden = !isPaid;

        setFieldGroup(
            [stipendAmount, stipendCurrency],
            isPaid
        );
    }

    compensationType.addEventListener("change", updateCompensationFields);

    /* NOTIFICATION PANEL */

    const notificationButton = document.getElementById("notificationButton");
    const notificationPanel = document.getElementById("notificationPanel");
    const closeNotifications = document.getElementById("closeNotifications");

    function openNotifications() {
        notificationPanel.classList.add("show");
        notificationPanel.hidden = false;
        notificationButton.setAttribute("aria-expanded", "true");
    }

    function hideNotifications() {
        notificationPanel.classList.remove("show");
        notificationPanel.hidden = true;
        notificationButton.setAttribute("aria-expanded", "false");
    }

    notificationButton.addEventListener("click", event => {
        event.stopPropagation();

        if (notificationPanel.classList.contains("show")) {
            hideNotifications();
        } else {
            openNotifications();
        }
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

    /* MOBILE SIDEBAR FALLBACK */

    const sidebar = document.getElementById("dashboardSidebar");
    const sidebarOverlay = document.getElementById("sidebarOverlay");
    const mobileMenu = document.getElementById("mobileMenu");

    function closeSidebar() {
        sidebar.classList.remove("active");
        sidebarOverlay.classList.remove("active");
        document.body.classList.remove("sidebar-open");
    }

    mobileMenu.addEventListener("click", () => {
        const shouldOpen = !sidebar.classList.contains("active");

        sidebar.classList.toggle("active", shouldOpen);
        sidebarOverlay.classList.toggle("active", shouldOpen);
        document.body.classList.toggle("sidebar-open", shouldOpen);
    });

    sidebarOverlay.addEventListener("click", closeSidebar);

    /* LOGOUT CONFIRMATION */

    const logoutLink = document.getElementById("logoutLink");
    const logoutModal = document.getElementById("logoutModal");
    const cancelLogout = document.getElementById("cancelLogout");
    const confirmLogout = document.getElementById("confirmLogout");

    logoutLink.addEventListener("click", event => {
        event.preventDefault();
        logoutModal.hidden = false;
    });

    function closeLogoutModal() {
        logoutModal.hidden = true;
    }

    cancelLogout.addEventListener("click", closeLogoutModal);

    logoutModal.addEventListener("click", event => {
        if (event.target === logoutModal) {
            closeLogoutModal();
        }
    });

    confirmLogout.addEventListener("click", () => {
        sessionStorage.removeItem("smartInternToken");
        sessionStorage.removeItem("smartInternLogin");
        sessionStorage.removeItem("smartInternRole");
        if (window.SmartInternSession) { window.SmartInternSession.clear(); }

        window.location.href = "login.html";
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            hideNotifications();
            closeLogoutModal();
            closeSidebar();
        }
    });

    /* FORM VALIDATION */

    form.addEventListener("reset", () => {
        window.setTimeout(() => {
            updateArrangementFields();
            updateDurationFields();
            updateCompensationFields();
            updateCandidateFields();
            clearFeedback();
        }, 0);
    });

    function todayISO() {
        const now = new Date();

        return [
            now.getFullYear(),
            String(now.getMonth() + 1).padStart(2, "0"),
            String(now.getDate()).padStart(2, "0")
        ].join("-");
    }

    document.getElementById("applicationDeadline").min = todayISO();

    /* PAYLOAD: rename these keys to match the backend schema */

    function buildInternshipPayload(data) {
        return {
            title: data.title,
            category: data.category,
            positions: Number(data.positions),
            description: data.description,
            responsibilities: data.responsibilities,
            requirements: data.requirements,
            skills: data.skills,
            candidate_type: data.candidateType,
            min_semester: data.minSemester ? Number(data.minSemester) : null,
            education_level: data.educationLevel,
            academic_background: data.academicBackground,
            work_arrangement: data.workArrangement,
            remote_region: data.remoteRegion || null,
            remote_timezone: data.remoteTimezone || null,
            office_city: data.officeCity || null,
            office_address: data.officeAddress || null,
            office_days: data.officeDays ? Number(data.officeDays) : null,
            duration: data.duration === "Other" ? data.customDuration : data.duration,
            schedule: data.schedule,
            hours_per_week: data.hoursPerWeek,
            compensation_type: data.compensationType,
            stipend_amount: data.stipendAmount ? Number(data.stipendAmount) : null,
            stipend_currency: data.stipendCurrency || null,
            application_deadline: data.applicationDeadline,   // YYYY-MM-DD
            start_date: data.startDate
        };
    }

    form.addEventListener("submit", async event => {
        event.preventDefault();
        clearFeedback();

        updateArrangementFields();
        updateDurationFields();
        updateCompensationFields();
        updateCandidateFields();

        if (!form.checkValidity()) {
            form.reportValidity();

            const firstInvalid = form.querySelector(":invalid");

            if (firstInvalid) {
                firstInvalid.focus({ preventScroll: true });
                firstInvalid.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });
            }

            showFeedback(
                "Please complete all required fields before continuing.",
                "error"
            );

            return;
        }

        const data = Object.fromEntries(new FormData(form).entries());

        const deadlineChanged = !editId || data.applicationDeadline !== originalDeadline;

        if (deadlineChanged && data.applicationDeadline < todayISO()) {
            showFeedback("The application deadline cannot be in the past.", "error");
            document.getElementById("applicationDeadline").focus();
            return;
        }

        if (data.startDate && data.applicationDeadline > data.startDate) {
            showFeedback("The application deadline must be on or before the start date.", "error");
            document.getElementById("applicationDeadline").focus();
            return;
        }

        data.skills = data.skills
            .split(",")
            .map(skill => skill.trim())
            .filter(Boolean);

        const payload = buildInternshipPayload(data);

        if (typeof INTERNSHIP_API_ENABLED === "undefined" || !INTERNSHIP_API_ENABLED) {
            console.log("Validated internship payload:", payload);

            showFeedback(
                "All required fields are complete. The form is ready, but publishing to the database requires connecting your backend API.",
                "success"
            );

            return;
        }

        const publishButton = form.querySelector(".post-publish-button");
        const publishHTML = publishButton.innerHTML;

        publishButton.disabled = true;
        publishButton.textContent = editId ? "Saving..." : "Publishing...";

        try {
            if (editId) {
                await updateInternshipAPI(editId, payload);

                showFeedback("Changes saved. Taking you back to your internships...", "success");
                feedback.scrollIntoView({ behavior: "smooth", block: "center" });

                window.setTimeout(() => {
                    window.location.href = "manage-internships.html";
                }, 1200);

                return;
            }

            await createInternshipAPI(payload);

            form.reset();

            // the reset handler clears the feedback box, so show the message after it
            window.setTimeout(() => {
                showFeedback("Your internship has been published.", "success");
                feedback.scrollIntoView({ behavior: "smooth", block: "center" });
            }, 10);
        } catch (failure) {
            if (failure.status === 401) {
                window.SmartInternSession?.clear();
                window.location.replace("login.html");
                return;
            }

            // The server's message (detail) is always shown on screen.
            showFeedback(
                failure.message ||
                (editId ? "Could not save the changes." : "Could not publish the internship."),
                "error"
            );
        } finally {
            publishButton.disabled = false;
            publishButton.innerHTML = publishHTML;
        }
    });

    /* EDIT MODE: post-internship.html?edit=ID */

    const editParam = new URLSearchParams(window.location.search).get("edit");
    const editId = /^\d+$/.test(editParam || "") ? editParam : "";
    let originalDeadline = "";

    function setValue(id, value) {
        const element = document.getElementById(id);

        if (element && value !== null && value !== undefined) {
            element.value = value;
        }
    }

    function fillForm(item) {
        setValue("internshipTitle", item.title);
        setValue("category", item.category);
        setValue("positions", item.positions);
        setValue("description", item.description);
        setValue("responsibilities", item.responsibilities);
        setValue("requirements", item.requirements);
        setValue("skills", (item.skills || []).join(", "));

        setValue("candidateType", item.candidate_type);
        updateCandidateFields();
        setValue("minSemester", item.min_semester);
        setValue("educationLevel", item.education_level);
        setValue("academicBackground", item.academic_background);

        const arrangement = document.querySelector(
            `input[name="workArrangement"][value="${CSS.escape(item.work_arrangement || "")}"]`
        );

        if (arrangement) arrangement.checked = true;

        updateArrangementFields();
        setValue("remoteRegion", item.remote_region);
        setValue("remoteTimezone", item.remote_timezone);
        setValue("officeCity", item.office_city);
        setValue("officeAddress", item.office_address);
        setValue("officeDays", item.office_days);

        // a duration that is not in the list is shown as "Other"
        const known = [...duration.options].some(option => option.value === item.duration);

        if (known) {
            duration.value = item.duration;
        } else {
            duration.value = "Other";
            updateDurationFields();
            customDuration.value = item.duration || "";
        }

        updateDurationFields();
        setValue("schedule", item.schedule);
        setValue("hoursPerWeek", item.hours_per_week);

        setValue("compensationType", item.compensation_type);
        updateCompensationFields();
        setValue("stipendAmount", item.stipend_amount);
        setValue("stipendCurrency", item.stipend_currency);

        originalDeadline = item.application_deadline || "";
        setValue("applicationDeadline", originalDeadline);
        setValue("startDate", item.start_date);

        // an old deadline that is unchanged is allowed, so do not block it
        document.getElementById("applicationDeadline").removeAttribute("min");
    }

    async function startEditMode() {
        document.title = "Edit Internship | SmartIntern";

        const heading = document.querySelector(".topbar-title h1");
        if (heading) heading.textContent = "Edit Internship";

        const intro = document.querySelector(".post-form-intro h2");
        if (intro) intro.textContent = "Edit your opportunity";

        const publishButton = form.querySelector(".post-publish-button");
        publishButton.innerHTML = "Save Changes <span>↗</span>";

        const clearButton = form.querySelector(".post-reset-button");
        clearButton.type = "button";
        clearButton.textContent = "Cancel";
        clearButton.addEventListener("click", () => {
            window.location.href = "manage-internships.html";
        });

        showFeedback("Loading your internship...", "info");
        publishButton.disabled = true;

        try {
            const item = await getInternshipAPI(editId);

            fillForm(item);
            clearFeedback();

            if (item.status === "closed") {
                showFeedback("This internship is closed. Reopen it before editing.", "error");
                return;
            }

            publishButton.disabled = false;
        } catch (failure) {
            if (failure.status === 401) {
                window.SmartInternSession?.clear();
                window.location.replace("login.html");
                return;
            }

            showFeedback(failure.message || "Could not load this internship.", "error");
        }
    }

    /* INITIAL STATE */

    updateArrangementFields();
    updateDurationFields();
    updateCompensationFields();
    updateCandidateFields();

    if (editId) {
        startEditMode();
    }
});