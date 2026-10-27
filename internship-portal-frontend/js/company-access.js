/* =========================================================
   SMARTINTERN — COMPANY VERIFICATION ACCESS
   ---------------------------------------------------------
   A company can LOG IN while it is pending / rejected / frozen, but it
   can only look around. Posting internships, applicants, AI tools and
   analytics unlock when the admin approves it.

   pending   -> banner "under review", locked sidebar
   rejected  -> banner with the admin's reason + "Upload new license"
   frozen    -> red banner (license expired, grace period over) +
                "Upload new license", locked sidebar
   approved  -> full access. If the license is about to expire (7 days
                or less) a yellow banner is shown; if it already expired
                (grace period, up to 28 days) a red banner is shown but
                the company can still post.
   blocked   -> logged out, cannot log in

   Data comes from GET /company/me:
     verification_status, rejection_reason,
     license_days_left, grace_ends_on

   The upload form sends  PUT /company/reupload-license  with
     trade_license, license_issue_date, license_expiry_date
   (see reuploadCompanyLicenseAPI in api.js). After a successful upload
   the status becomes "pending" and the admin verifies again.

   Load order in <head>:  session.js  ->  api.js  ->  company-access.js
   NOTE: this only controls the UI. The backend must enforce the same
   rules on every route.
========================================================= */
(function () {

    "use strict";

    /* ---------------- SETTINGS ---------------- */

    // If the backend does not send any status for a company:
    //   false = treat it as "pending" (safe)   true = treat it as approved
    const TREAT_UNKNOWN_STATUS_AS_APPROVED = false;

    const ME_ENDPOINT = "/company/me";
    const MAX_LICENSE_MB = 5;
    const EXPIRY_WARNING_DAYS = 7;

    // Pages that need an approved company
    const LOCKED_PAGES = [
        "post-internship",
        "manage-internships",
        "view-applicants",
        "ai-candidate-matches",
        "hiring-analytics"
    ];

    const session = window.SmartInternSession;

    if (!session) {
        return;
    }

    const page = window.location.pathname
        .split("/")
        .pop()
        .replace(".html", "");

    /* ---------------- STATUS HELPERS ---------------- */

    function normalizeStatus(value) {
        const status = String(value ?? "").trim().toLowerCase();

        if (["approved", "verified", "active"].includes(status)) return "approved";
        if (["rejected", "declined"].includes(status)) return "rejected";
        if (["blocked", "suspended"].includes(status)) return "blocked";
        if (status === "frozen") return "frozen";

        return "pending";
    }

    function readStatus(profile) {
        if (!profile) {
            return TREAT_UNKNOWN_STATUS_AS_APPROVED ? "approved" : "pending";
        }

        const raw =
            profile.verification_status ??
            profile.status ??
            profile.company_status;

        if (raw !== undefined && raw !== null && raw !== "") {
            return normalizeStatus(raw);
        }

        if (profile.is_blocked === true) return "blocked";
        if (profile.is_frozen === true) return "frozen";
        if (profile.is_verified === true || profile.is_approved === true) return "approved";
        if (profile.is_verified === false || profile.is_approved === false) return "pending";

        return TREAT_UNKNOWN_STATUS_AS_APPROVED ? "approved" : "pending";
    }

    function readReason(profile) {
        return String(
            profile?.rejection_reason ??
            profile?.reject_reason ??
            profile?.verification_note ??
            ""
        ).trim();
    }

    function readDaysLeft(profile) {
        const raw = profile?.license_days_left;

        if (raw === undefined || raw === null || raw === "") {
            return null;
        }

        const number = Number(raw);

        return Number.isFinite(number) ? number : null;
    }

    function readGraceEnds(profile) {
        return String(profile?.grace_ends_on ?? "").trim();
    }

    // Accepts "2026-11-03" or a full ISO timestamp, no timezone shift.
    function formatDate(value) {
        if (!value) return "";

        const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
        const date = match
            ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
            : new Date(value);

        if (Number.isNaN(date.getTime())) return "";

        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        });
    }

    function todayISO() {
        const now = new Date();

        return [
            now.getFullYear(),
            String(now.getMonth() + 1).padStart(2, "0"),
            String(now.getDate()).padStart(2, "0")
        ].join("-");
    }

    function saveProfile(profile) {
        try {
            const json = JSON.stringify(profile);
            sessionStorage.setItem("smartInternCompanyProfile", json);
            sessionStorage.setItem("user_data", json);
        } catch (error) { /* ignore */ }
    }

    let profile = session.getProfile() || {};
    let status = readStatus(profile);
    let reason = readReason(profile);

    /*
       Which banner is needed?
         ""          nothing to show (approved, license fine)
         "pending" | "rejected" | "frozen"
         "expiring"  approved, 7 days or less left
         "expired"   approved, license expired, still inside the grace period
    */
    function bannerKind() {
        if (status === "pending" || status === "rejected" || status === "frozen") {
            return status;
        }

        if (status === "approved") {
            const days = readDaysLeft(profile);

            if (days !== null && days < 0) return "expired";
            if (days !== null && days <= EXPIRY_WARNING_DAYS) return "expiring";
        }

        return "";
    }

    /* ---------------- EARLY GUARD (runs before the page is drawn) ---------------- */

    function goBlocked() {
        session.clear();
        window.location.replace("login.html?notice=blocked");
    }

    if (status === "blocked") {
        goBlocked();
        return;
    }

    if (status !== "approved" && LOCKED_PAGES.includes(page)) {
        try {
            sessionStorage.setItem("smartInternLockedNotice", "1");
        } catch (error) { /* ignore */ }

        window.location.replace("company-dashboard.html");
        return;
    }

    /* ---------------- SMALL UI HELPERS ---------------- */

    function el(tag, className, text) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    }

    let toastTimer = null;

    function toast(message) {
        let box = document.getElementById("accessToast");

        if (!box) {
            box = el("div", "access-toast");
            box.id = "accessToast";
            box.setAttribute("role", "status");
            document.body.appendChild(box);
        }

        box.textContent = message;
        box.classList.add("show");

        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => box.classList.remove("show"), 4500);
    }

    /* ---------------- BANNER ---------------- */

    function checkStatusButton() {
        const refresh = el("button", "vb-btn", "Check status");
        refresh.type = "button";
        refresh.addEventListener("click", async () => {
            refresh.disabled = true;
            await refreshStatus(true);
            refresh.disabled = false;
        });
        return refresh;
    }

    function uploadButton(label) {
        const upload = el("button", "vb-btn primary", label);
        upload.type = "button";
        upload.addEventListener("click", startLicenseUpload);
        return upload;
    }

    function buildBanner(kind) {
        const banner = el("section", `verification-banner is-${kind}`);
        banner.id = "verificationBanner";
        banner.setAttribute("role", "status");

        const warningIcon = ["rejected", "frozen", "expired", "expiring"].includes(kind);
        const icon = el("div", "vb-icon", warningIcon ? "!" : "◔");
        icon.setAttribute("aria-hidden", "true");

        const body = el("div", "vb-body");

        if (kind === "pending") {
            body.append(
                el("span", "vb-eyebrow", "VERIFICATION · IN REVIEW"),
                el("h2", "vb-title", "Your company is under review"),
                el(
                    "p",
                    "vb-text",
                    "Our admin team is checking your company details and trade license. " +
                    "You can look around, but posting internships, viewing applicants, " +
                    "AI matches and analytics unlock after approval. " +
                    "We will email you as soon as the review is done."
                )
            );

            const steps = el("ul", "vb-steps");
            [
                ["Registered", true],
                ["Admin review", false],
                ["Email sent", false],
                ["Full access", false]
            ].forEach(([label, done]) => {
                steps.appendChild(el("li", done ? "done" : "", label));
            });
            body.appendChild(steps);

            const actions = el("div", "vb-actions");
            actions.appendChild(checkStatusButton());

            if (page !== "company-profile") {
                const profileLink = el("a", "vb-btn", "View company profile");
                profileLink.href = "company-profile.html";
                actions.appendChild(profileLink);
            }

            body.appendChild(actions);
        }

        if (kind === "rejected") {
            body.append(
                el("span", "vb-eyebrow", "VERIFICATION · ACTION NEEDED"),
                el("h2", "vb-title", "We could not verify your company yet"),
                el(
                    "p",
                    "vb-text",
                    "Please fix the problem below and upload your trade license again. " +
                    "After you upload it, your account goes back to review."
                )
            );

            const box = el("div", "vb-reason");
            box.append(
                el("strong", "", "Reason from the admin"),
                el("span", "", reason || "No reason was provided. Please upload a clear, valid trade license.")
            );
            body.appendChild(box);

            const actions = el("div", "vb-actions");
            actions.append(uploadButton("Upload new trade license"), checkStatusButton());
            body.appendChild(actions);
        }

        if (kind === "frozen") {
            const graceText = formatDate(readGraceEnds(profile));

            body.append(
                el("span", "vb-eyebrow", "ACCOUNT · FROZEN"),
                el("h2", "vb-title", "Your account is frozen"),
                el(
                    "p",
                    "vb-text",
                    "Your account is frozen because your trade license expired" +
                    (graceText ? ` (grace period ended ${graceText})` : "") +
                    ". Please upload a new license. Posting internships and viewing " +
                    "candidates stay locked until the admin verifies it again."
                )
            );

            const actions = el("div", "vb-actions");
            actions.append(uploadButton("Upload new trade license"), checkStatusButton());
            body.appendChild(actions);
        }

        if (kind === "expiring") {
            const days = readDaysLeft(profile);
            const when = days === 0
                ? "today"
                : `in ${days} day${days === 1 ? "" : "s"}`;

            body.append(
                el("span", "vb-eyebrow", "LICENSE · EXPIRING SOON"),
                el("h2", "vb-title", `Your trade license expires ${when}`),
                el(
                    "p",
                    "vb-text",
                    "Your license is about to expire. Please update it now so your " +
                    "account is not interrupted."
                )
            );

            const actions = el("div", "vb-actions");
            actions.appendChild(uploadButton("Update my license"));
            body.appendChild(actions);
        }

        if (kind === "expired") {
            const graceText = formatDate(readGraceEnds(profile));

            body.append(
                el("span", "vb-eyebrow", "LICENSE · EXPIRED"),
                el("h2", "vb-title", "Your trade license has expired"),
                el(
                    "p",
                    "vb-text",
                    graceText
                        ? `Please update your license by ${graceText}, otherwise your account will be frozen. ` +
                          "Until then you can keep posting internships."
                        : "Please update your license, otherwise your account will be frozen. " +
                          "Until then you can keep posting internships."
                )
            );

            const actions = el("div", "vb-actions");
            actions.appendChild(uploadButton("Update my license"));
            body.appendChild(actions);
        }

        banner.append(icon, body);

        return banner;
    }

    /* ---------------- LOCKED ITEMS ---------------- */

    function targetPage(anchor) {
        const href = anchor.getAttribute("href") || "";
        return href.split("?")[0].split("#")[0].split("/").pop().replace(".html", "");
    }

    function lockMessage() {
        if (status === "frozen") {
            return "Your account is frozen. Upload a new trade license to unlock this feature.";
        }

        if (status === "rejected") {
            return "This feature unlocks after you fix the problem and your company is verified.";
        }

        return "This feature unlocks after the admin verifies your company.";
    }

    function lockItem(node) {
        if (node.classList.contains("is-locked")) return;

        node.classList.add("is-locked");
        node.setAttribute("aria-disabled", "true");
        node.title = status === "frozen"
            ? "Unavailable while your account is frozen"
            : "Available after your company is verified";

        if (node.classList.contains("sidebar-link")) {
            const lock = el("span", "lock-icon", "🔒");
            lock.setAttribute("aria-hidden", "true");
            node.appendChild(lock);
        }
    }

    function unlockItem(node) {
        node.classList.remove("is-locked");
        node.removeAttribute("aria-disabled");
        node.removeAttribute("title");
        node.querySelector(".lock-icon")?.remove();
    }

    function applyLocks() {
        document.querySelectorAll("a[href]").forEach(anchor => {
            if (!LOCKED_PAGES.includes(targetPage(anchor))) return;

            if (status === "approved") {
                unlockItem(anchor);
            } else {
                lockItem(anchor);
            }
        });

        document.querySelectorAll("[data-requires-verified]").forEach(node => {
            if (status === "approved") {
                unlockItem(node);
            } else {
                lockItem(node);
            }
        });
    }

    // One click handler for every locked item (capture = runs before the page's own handlers)
    document.addEventListener(
        "click",
        event => {
            const locked = event.target.closest?.(".is-locked");

            if (!locked) return;

            event.preventDefault();
            event.stopImmediatePropagation();

            toast(lockMessage());
        },
        true
    );

    /* ---------------- RENDER ---------------- */

    const STATUS_LABEL = {
        approved: "Verified company",
        pending: "Pending verification",
        rejected: "Action needed",
        frozen: "Account frozen"
    };

    function render() {
        document.getElementById("verificationBanner")?.remove();

        const main = document.querySelector(".dashboard-main");

        // The dashboard shows sample numbers; blur them until the company is verified
        main?.classList.toggle("access-restricted", status !== "approved");

        const kind = bannerKind();

        if (kind) {
            const topbar = document.querySelector(".dashboard-topbar");
            const content = document.querySelector(".dashboard-content");
            const banner = buildBanner(kind);

            if (content) {
                banner.classList.add("in-content");
                content.prepend(banner);
            } else if (topbar) {
                topbar.after(banner);
            } else {
                main?.prepend(banner);
            }
        }

        const label = document.querySelector(".sidebar-profile-info span");

        if (label && STATUS_LABEL[status]) {
            label.textContent = STATUS_LABEL[status];
        }

        applyLocks();
    }

    /* ---------------- REFRESH STATUS FROM THE SERVER ---------------- */

    let lastRefresh = 0;

    function announceProfile() {
        try {
            document.dispatchEvent(
                new CustomEvent("smartintern:company", { detail: profile })
            );
        } catch (error) { /* ignore */ }
    }

    function applyNewProfile(next) {
        const previous = status;

        profile = { ...profile, ...next };
        saveProfile(profile);

        status = readStatus(profile);
        reason = readReason(profile);

        if (status === "blocked") {
            goBlocked();
            return;
        }

        if (status !== previous) {
            if (status === "approved") {
                toast("Your company has been verified. All features are now unlocked.");
            }

            if (status !== "approved" && LOCKED_PAGES.includes(page)) {
                window.location.replace("company-dashboard.html");
                return;
            }
        }

        render();
        announceProfile();
    }

    async function refreshStatus(manual) {
        if (typeof apiRequest !== "function" || !session.getToken()) return;

        lastRefresh = Date.now();

        try {
            const data = await apiRequest(ME_ENDPOINT, {
                headers: { Authorization: `Bearer ${session.getToken()}` }
            });

            const company = data.company || data.user || data;

            if (company && typeof company === "object") {
                const before = status;
                applyNewProfile(company);

                if (manual && status === before && status !== "approved") {
                    toast(
                        status === "frozen"
                            ? "Your account is still frozen. Upload a new license to continue."
                            : status === "rejected"
                                ? "Your company is still rejected. Please upload a new license."
                                : "Still under review. We will email you when it is done."
                    );
                }
            }
        } catch (error) {
            if (error.status === 401) {
                session.clear();
                window.location.replace("login.html");
                return;
            }

            if (error.code === "COMPANY_BLOCKED" || (error.status === 403 && /blocked/i.test(error.message))) {
                goBlocked();
                return;
            }

            if (manual) {
                toast(error.message || "Could not check your status right now. Please try again.");
            }
        }
    }

    /* ---------------- AFTER A SUCCESSFUL UPLOAD ---------------- */

    // Called by the dialog below and by the company-profile page form.
    function licenseSubmitted(issueDate, expiryDate) {
        profile = {
            ...profile,
            verification_status: "pending",
            status: "pending",
            rejection_reason: "",
            license_issue_date: issueDate || profile.license_issue_date,
            license_expiry_date: expiryDate || profile.license_expiry_date,
            license_days_left: null,
            grace_ends_on: null
        };
        saveProfile(profile);

        status = "pending";
        reason = "";

        // A pending company cannot stay on a page that needs approval.
        if (LOCKED_PAGES.includes(page)) {
            try {
                sessionStorage.setItem("smartInternLockedNotice", "1");
            } catch (error) { /* ignore */ }

            window.location.replace("company-dashboard.html");
            return;
        }

        render();
        announceProfile();

        toast("License submitted. The admin will verify your company again.");
    }

    /* ---------------- RE-UPLOAD DIALOG ---------------- */

    let dialog = null;

    function dateField(id, labelText) {
        const wrap = el("div", "license-field");
        const label = el("label", "", labelText);
        label.setAttribute("for", id);

        const input = document.createElement("input");
        input.type = "date";
        input.id = id;
        input.name = id;

        wrap.append(label, input);

        return { wrap, input };
    }

    function buildDialog() {
        const root = el("div", "license-modal");
        root.id = "licenseModal";
        root.setAttribute("aria-hidden", "true");

        const backdrop = el("div", "license-backdrop");
        backdrop.addEventListener("click", closeUploadDialog);

        const card = el("section", "license-card");
        card.setAttribute("role", "dialog");
        card.setAttribute("aria-modal", "true");
        card.setAttribute("aria-labelledby", "licenseTitle");

        const title = el("h2");
        title.id = "licenseTitle";
        title.append("Upload your ", el("em", "", "trade license."));

        const intro = el(
            "p",
            "",
            "Upload a new copy of your trade license with its issue and expiry dates. " +
            "After you submit, your account goes back to review."
        );

        const tips = el("ul", "license-tips");
        [
            "Clear and readable (no blur, no glare)",
            "All four corners of the document visible",
            "Company name matches your registration",
            `PDF, JPG or PNG, up to ${MAX_LICENSE_MB} MB`
        ].forEach(text => tips.appendChild(el("li", "", text)));

        const drop = el("label", "license-drop");
        const fileName = el("strong", "", "Click to choose a file");
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png";
        input.id = "licenseFile";
        drop.append(fileName, input);

        const dates = el("div", "license-dates");
        const issue = dateField("licenseIssueDate", "Issue date");
        const expiry = dateField("licenseExpiryDate", "Expiry date");
        issue.input.max = todayISO();
        dates.append(issue.wrap, expiry.wrap);

        const error = el("p", "license-error");
        error.id = "licenseError";
        error.setAttribute("role", "alert");

        const actions = el("div", "license-actions");
        const cancel = el("button", "vb-btn", "Cancel");
        cancel.type = "button";
        cancel.addEventListener("click", closeUploadDialog);

        const submit = el("button", "vb-btn primary", "Submit for review");
        submit.type = "button";
        actions.append(cancel, submit);

        input.addEventListener("change", () => {
            error.textContent = "";
            fileName.textContent = input.files[0] ? input.files[0].name : "Click to choose a file";
        });

        [issue.input, expiry.input].forEach(field => {
            field.addEventListener("change", () => { error.textContent = ""; });
        });

        submit.addEventListener("click", async () => {
            const file = input.files[0];

            if (!file) {
                error.textContent = "Please choose your trade license file.";
                return;
            }

            if (!/\.(pdf|jpe?g|png)$/i.test(file.name)) {
                error.textContent = "Only PDF, JPG or PNG files are allowed.";
                return;
            }

            if (file.size > MAX_LICENSE_MB * 1024 * 1024) {
                error.textContent = `The file is too large. Maximum size is ${MAX_LICENSE_MB} MB.`;
                return;
            }

            if (!issue.input.value) {
                error.textContent = "Please enter the license issue date.";
                return;
            }

            if (!expiry.input.value) {
                error.textContent = "Please enter the license expiry date.";
                return;
            }

            if (issue.input.value > todayISO()) {
                error.textContent = "The issue date cannot be in the future.";
                return;
            }

            if (expiry.input.value <= issue.input.value) {
                error.textContent = "The expiry date must be after the issue date.";
                return;
            }

            if (expiry.input.value < todayISO()) {
                error.textContent = "This license has already expired. Please upload a valid license.";
                return;
            }

            if (typeof reuploadCompanyLicenseAPI !== "function") {
                error.textContent = "Upload is not available right now.";
                return;
            }

            submit.disabled = true;
            submit.textContent = "Uploading...";
            error.textContent = "";

            try {
                await reuploadCompanyLicenseAPI(
                    file,
                    issue.input.value,
                    expiry.input.value
                );

                closeUploadDialog();
                licenseSubmitted(issue.input.value, expiry.input.value);
            } catch (failure) {
                if (failure.status === 401) {
                    session.clear();
                    window.location.replace("login.html");
                    return;
                }

                // Always show the server's message (detail) on screen.
                error.textContent = failure.message || "Upload failed. Please try again.";
            } finally {
                submit.disabled = false;
                submit.textContent = "Submit for review";
            }
        });

        card.append(title, intro, tips, drop, dates, error, actions);
        root.append(backdrop, card);
        document.body.appendChild(root);

        document.addEventListener("keydown", event => {
            if (event.key === "Escape") closeUploadDialog();
        });

        return root;
    }

    function openUploadDialog() {
        if (!dialog) dialog = buildDialog();

        dialog.querySelector("#licenseFile").value = "";
        dialog.querySelector("#licenseIssueDate").value = "";
        dialog.querySelector("#licenseExpiryDate").value = "";
        dialog.querySelector("#licenseError").textContent = "";
        dialog.querySelector(".license-drop strong").textContent = "Click to choose a file";

        dialog.classList.add("show");
        dialog.setAttribute("aria-hidden", "false");
    }

    function closeUploadDialog() {
        if (!dialog) return;

        dialog.classList.remove("show");
        dialog.setAttribute("aria-hidden", "true");
    }

    // On the company profile page the upload form is already on the page.
    function startLicenseUpload() {
        const section = document.getElementById("tradeLicence");

        if (page === "company-profile" && section) {
            section.scrollIntoView({ behavior: "smooth", block: "start" });
            return;
        }

        openUploadDialog();
    }

    /* ---------------- START ---------------- */

    document.addEventListener("DOMContentLoaded", () => {
        render();

        if (sessionStorage.getItem("smartInternLockedNotice")) {
            sessionStorage.removeItem("smartInternLockedNotice");
            toast(
                status === "frozen"
                    ? "That feature is locked while your account is frozen."
                    : "That feature unlocks after the admin verifies your company."
            );
        }

        refreshStatus(false);

        // Coming back to the tab (e.g. after reading the approval email)
        document.addEventListener("visibilitychange", () => {
            if (!document.hidden && Date.now() - lastRefresh > 30000) {
                refreshStatus(false);
            }
        });
    });

    window.SmartInternCompany = {
        getStatus: () => status,
        getProfile: () => profile,
        refresh: () => refreshStatus(true),
        openUploadDialog,
        licenseSubmitted
    };

})();
