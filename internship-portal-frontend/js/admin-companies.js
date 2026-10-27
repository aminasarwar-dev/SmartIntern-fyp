
/* =========================================================
   SMARTINTERN ADMIN — COMPANIES
   API-connected version
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    initMobileSidebar();
    initNotifications();
    initCompanySearch();
    initCompanyFilters();
    initCompanyDrawer();
    initPagination();
    initHeaderActions();

    // Load the real companies from the backend and draw the table.
    loadCompanies();
});


/* ---------------- API CONFIGURATION ---------------- */

// API_BASE_URL and getAdminToken() come from api.js (loaded before this file).
const ADMIN_API_BASE =
    (typeof API_BASE_URL !== "undefined"
        ? API_BASE_URL
        : "http://127.0.0.1:8000"
    ).replace(/\/$/, "");

async function adminRequest(path, options = {}) {
    const token = getAdminToken();

    if (!token) {
        throw new Error(
            "Admin login token not found. Please log in again."
        );
    }

    const headers = {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`
    };

    if (options.body && !headers["Content-Type"]) {
        headers["Content-Type"] = "application/json";
    }

    const response = await fetch(
        `${ADMIN_API_BASE}${path}`,
        {
            ...options,
            headers
        }
    );

    const rawText = await response.text();
    let data = {};

    try {
        data = rawText ? JSON.parse(rawText) : {};
    } catch {
        data = { detail: rawText };
    }

    if (!response.ok) {
        throw new Error(
            data.detail ||
            data.message ||
            `Request failed (${response.status})`
        );
    }

    return data;
}

function showMessage(title, message) {
    const modal = document.getElementById("companyActionModal");

    if (!modal) {
        SmartDialog.alert(message, title);
        return;
    }

    const icon = document.getElementById("companyActionModalIcon");
    const heading = document.getElementById("companyActionModalTitle");
    const text = document.getElementById("companyActionModalText");
    const close = document.getElementById("companyActionModalClose");

    if (icon) icon.textContent = "ⓘ";
    if (heading) heading.textContent = title;
    if (text) text.textContent = message;

    modal.classList.add("show");

    if (close) {
        close.onclick = () => modal.classList.remove("show");
    }
}


/* ---------------- MOBILE SIDEBAR ---------------- */

function initMobileSidebar() {
    const menu = document.getElementById("mobileMenu");
    const sidebar = document.getElementById("dashboardSidebar");
    const overlay = document.getElementById("sidebarOverlay");

    if (!menu || !sidebar || !overlay) return;

    function closeSidebar() {
        sidebar.classList.remove("open");
        overlay.classList.remove("show");
        document.body.style.overflow = "";
    }

    menu.addEventListener("click", () => {
        sidebar.classList.add("open");
        overlay.classList.add("show");
        document.body.style.overflow = "hidden";
    });

    overlay.addEventListener("click", closeSidebar);

    document.querySelectorAll(".sidebar-link").forEach(link => {
        link.addEventListener("click", () => {
            if (window.innerWidth <= 850) closeSidebar();
        });
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 850) closeSidebar();
    });
}


/* ---------------- NOTIFICATIONS ---------------- */

function initNotifications() {
    const button = document.getElementById("notificationButton");
    const panel = document.getElementById("notificationPanel");
    const close = document.getElementById("closeNotifications");

    if (!button || !panel) return;

    button.addEventListener("click", event => {
        event.stopPropagation();
        panel.classList.toggle("show");
    });

    if (close) {
        close.addEventListener("click", event => {
            event.stopPropagation();
            panel.classList.remove("show");
        });
    }

    panel.addEventListener("click", event => event.stopPropagation());

    document.addEventListener("click", event => {
        if (
            panel.classList.contains("show") &&
            !panel.contains(event.target) &&
            !button.contains(event.target)
        ) {
            panel.classList.remove("show");
        }
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            panel.classList.remove("show");
        }
    });
}


/* ---------------- COMPANY TABLE DATA ---------------- */

let companyRecords = [];
let selectedCompanyId = null;

function getCompanyArray(data) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.companies)) return data.companies;
    if (Array.isArray(data.items)) return data.items;
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.results)) return data.results;
    return [];
}

function getRecordId(company) {
    return company.id ?? company.company_id ?? company.companyId ?? null;
}

function getRecordName(company) {
    return String(
        company.company_name ??
        company.name ??
        company.companyName ??
        ""
    ).trim().toLowerCase();
}

function getRecordEmail(company) {
    return String(
        company.email ??
        company.company_email ??
        company.companyEmail ??
        ""
    ).trim().toLowerCase();
}

const STATUS_LABELS = {
    verified: "Verified",
    pending: "Pending",
    rejected: "Rejected",
    frozen: "Frozen",
    suspended: "Blocked"
};

function normalizeCompanyStatus(value) {
    const status = String(value ?? "pending").trim().toLowerCase();

    if (["verified", "approved", "active"].includes(status)) return "verified";
    if (["rejected", "declined"].includes(status)) return "rejected";
    if (status === "frozen") return "frozen";
    if (["blocked", "suspended"].includes(status)) return "suspended";

    return "pending";
}

function escapeCompanyHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function formatCompanyDate(value) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });
}

function padCount(value) {
    const number = Number(value);

    if (!Number.isFinite(number)) return "—";

    return String(number).padStart(2, "0");
}

async function loadCompanies() {
    const tbody = document.getElementById("companiesTableBody");
    const empty = document.getElementById("companiesEmpty");

    if (tbody) {
        tbody.innerHTML =
            '<tr><td colspan="7" class="companies-loading">Loading companies...</td></tr>';
    }

    empty?.classList.remove("show");

    try {
        const data = await adminRequest("/admin/companies?status=all");
        companyRecords = getCompanyArray(data);

        renderCompanies();
        updateCompanyStats();
        fillIndustryFilter();

        // Opened from the dashboard: admin-companies.html?status=pending
        const wanted = new URLSearchParams(window.location.search).get("status");
        const statusFilter = document.getElementById("companyStatusFilter");

        if (wanted && statusFilter && !statusFilter.dataset.applied) {
            statusFilter.value = wanted;
            statusFilter.dataset.applied = "1";
        }

        filterCompanies();
    } catch (error) {
        console.error("Could not load companies:", error.message);

        if (tbody) tbody.innerHTML = "";

        if (empty) {
            empty.querySelector("h3").textContent = "Could not load companies";
            empty.querySelector("p").textContent =
                error.message || "Please check that the backend is running.";
            empty.classList.add("show");
        }
    }
}

function renderCompanies() {
    const tbody = document.getElementById("companiesTableBody");

    if (!tbody) return;

    tbody.innerHTML = "";

    companyRecords.forEach(company => {
        const id = getRecordId(company);

        const name = String(
            company.company_name ?? company.name ?? company.companyName ?? "Unnamed company"
        ).trim();

        const email = String(
            company.email ?? company.company_email ?? company.companyEmail ?? ""
        ).trim();

        const industry = String(company.industry ?? "").trim() || "—";
        const businessType = String(
            company.business_type ?? company.company_type ?? company.company_size ?? ""
        ).trim() || "—";

        const statusKey = normalizeCompanyStatus(
            company.verification_status ?? company.status
        );

        const joined = formatCompanyDate(
            company.created_at ?? company.submitted_at ?? company.created_on
        );

        const internships = padCount(
            company.internships_count ?? company.internship_count ?? company.total_internships
        );

        const applicants = padCount(
            company.applicants_count ?? company.applicant_count ?? company.total_applicants
        );

        const row = document.createElement("tr");

        row.dataset.companyId = id ?? "";
        row.dataset.status = statusKey;
        row.dataset.industry = industry.toLowerCase();
        row.dataset.search = [name, email, industry, businessType]
            .join(" ")
            .toLowerCase();

        row.innerHTML = `
            <td>
                <div class="company-cell">
                    <div class="company-logo">${escapeCompanyHTML(name.charAt(0).toUpperCase() || "C")}</div>
                    <div>
                        <strong>${escapeCompanyHTML(name)}</strong>
                        <span>${escapeCompanyHTML(email)}</span>
                    </div>
                </div>
            </td>
            <td>
                <div class="industry-cell">
                    <strong>${escapeCompanyHTML(industry)}</strong>
                    <span>${escapeCompanyHTML(businessType)}</span>
                </div>
            </td>
            <td><strong class="company-number">${internships}</strong></td>
            <td><strong class="company-number">${applicants}</strong></td>
            <td>
                <span class="company-status ${getStatusClass(STATUS_LABELS[statusKey])}">
                    ${STATUS_LABELS[statusKey]}
                </span>
            </td>
            <td><span class="company-date">${escapeCompanyHTML(joined)}</span></td>
            <td>
                <button
                    type="button"
                    class="company-view-btn"
                    data-company="${escapeCompanyHTML(name)}"
                    data-company-id="${escapeCompanyHTML(id ?? "")}"
                >
                    Review <span>→</span>
                </button>
            </td>
        `;

        tbody.appendChild(row);
    });
}

function updateCompanyStats() {
    const counts = { verified: 0, pending: 0, rejected: 0, frozen: 0, suspended: 0 };

    companyRecords.forEach(company => {
        counts[
            normalizeCompanyStatus(company.verification_status ?? company.status)
        ]++;
    });

    const set = (id, value) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    };

    set("statTotalCompanies", companyRecords.length);
    set("statVerifiedCompanies", counts.verified);
    set("statPendingCompanies", counts.pending);
    set(
        "statRejectedCompanies",
        counts.rejected + counts.frozen + counts.suspended
    );

    set(
        "statRejectedNote",
        `${counts.rejected} rejected · ${counts.frozen} frozen · ${counts.suspended} blocked`
    );

    set(
        "companyTotal",
        `${companyRecords.length} ${companyRecords.length === 1 ? "Company" : "Companies"}`
    );
}

function fillIndustryFilter() {
    const select = document.getElementById("companyIndustryFilter");

    if (!select) return;

    const current = select.value;
    const industries = [...new Set(
        companyRecords
            .map(company => String(company.industry ?? "").trim())
            .filter(Boolean)
    )].sort((a, b) => a.localeCompare(b));

    select.innerHTML = '<option value="all">All Industries</option>';

    industries.forEach(industry => {
        const option = document.createElement("option");
        option.value = industry.toLowerCase();
        option.textContent = industry;
        select.appendChild(option);
    });

    if ([...select.options].some(option => option.value === current)) {
        select.value = current;
    }
}


/* ---------------- SEARCH AND FILTERS ---------------- */

function initCompanySearch() {
    document.getElementById("companySearch")
        ?.addEventListener("input", filterCompanies);
}

function initCompanyFilters() {
    document.getElementById("companyStatusFilter")
        ?.addEventListener("change", filterCompanies);

    document.getElementById("companyIndustryFilter")
        ?.addEventListener("change", filterCompanies);
}

function filterCompanies() {
    const searchValue = (
        document.getElementById("companySearch")?.value || ""
    ).trim().toLowerCase();

    const statusValue =
        document.getElementById("companyStatusFilter")?.value || "all";

    const industryValue =
        document.getElementById("companyIndustryFilter")?.value || "all";

    const rows = document.querySelectorAll("#companiesTableBody tr");
    const empty = document.getElementById("companiesEmpty");
    let visible = 0;

    rows.forEach(row => {
        const rowSearch = (row.dataset.search || "").toLowerCase();
        const rowStatus = row.dataset.status || "";
        const rowIndustry = row.dataset.industry || "";

        const show =
            (!searchValue || rowSearch.includes(searchValue)) &&
            (statusValue === "all" || rowStatus === statusValue) &&
            (industryValue === "all" || rowIndustry === industryValue);

        row.style.display = show ? "" : "none";
        if (show) visible++;
    });

    if (empty && companyRecords.length) {
        const heading = empty.querySelector("h3");
        const text = empty.querySelector("p");

        if (heading) heading.textContent = "No companies found";
        if (text) text.textContent = "Try changing your search or filters.";

        empty.classList.toggle("show", visible === 0);
    }
    else if (empty && !companyRecords.length && !document.querySelector("#companiesTableBody .companies-loading")) {
        const heading = empty.querySelector("h3");
        const text = empty.querySelector("p");

        if (heading && !empty.classList.contains("show")) heading.textContent = "No companies registered yet";
        if (text && !empty.classList.contains("show")) text.textContent = "New company registrations will appear here.";

        empty.classList.add("show");
    }

    const summary = document.getElementById("companiesSummary");

    if (summary) {
        summary.innerHTML =
            `Showing <strong>${visible}</strong> of <strong>${companyRecords.length}</strong> companies`;
    }
}


/* ---------------- COMPANY DRAWER ---------------- */

function initCompanyDrawer() {
    const drawer = document.getElementById("companyDrawer");
    const overlay = document.getElementById("companyDrawerOverlay");
    const close = document.getElementById("closeCompanyDrawer");

    if (!drawer) return;

    document.getElementById("companiesTableBody")?.addEventListener("click", event => {
        const button = event.target.closest(".company-view-btn");
        if (!button) return;

        const row = button.closest("tr");
        if (!row) return;

        selectedCompanyId =
            button.dataset.companyId ||
            row.dataset.companyId ||
            null;

        // Read the details from the API record, not from the table text.
        const record = companyRecords.find(
            company => String(getRecordId(company)) === String(selectedCompanyId)
        );

        if (!record) {
            showMessage(
                "Company not found",
                "Could not find this company in the loaded list. Please refresh and try again."
            );
            return;
        }

        updateCompanyDrawer(describeCompany(record));

        drawer.classList.add("show");
        overlay?.classList.add("show");
        document.body.style.overflow = "hidden";

        const licenseButton = document.getElementById("viewLicenseBtn");
        if (licenseButton) {
            licenseButton.disabled = !selectedCompanyId;
            licenseButton.title = selectedCompanyId
                ? "View trade licence"
                : "Company ID could not be matched. Check the API data.";
        }
    });

    function closeDrawer() {
        drawer.classList.remove("show");
        overlay?.classList.remove("show");
        document.body.style.overflow = "";
    }

    close?.addEventListener("click", closeDrawer);
    overlay?.addEventListener("click", closeDrawer);

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") closeDrawer();
    });

    initCompanyActions();
}


/* ---------------- DRAWER DETAILS ---------------- */

function firstValue(company, keys) {
    for (const key of keys) {
        const value = company[key];

        if (value !== undefined && value !== null && String(value).trim() !== "") {
            return value;
        }
    }

    return "";
}

// Everything the drawer needs, taken from one API record.
function describeCompany(company) {
    const name = String(
        firstValue(company, ["company_name", "name", "companyName"]) || "Unnamed company"
    ).trim();

    const statusKey = normalizeCompanyStatus(
        company.verification_status ?? company.status
    );

    const daysRaw = firstValue(company, ["license_days_left"]);
    const daysLeft = daysRaw === "" ? null : Number(daysRaw);

    return {
        name,
        email: String(firstValue(company, ["email", "company_email", "companyEmail"])).trim(),
        industry: String(company.industry ?? "").trim() || "—",
        businessType: String(
            firstValue(company, ["business_type", "company_type", "company_size"])
        ).trim() || "—",
        status: STATUS_LABELS[statusKey],
        date: formatCompanyDate(
            firstValue(company, ["created_at", "submitted_at", "created_on"])
        ),
        logo: name.charAt(0).toUpperCase() || "C",
        internships: padCount(
            firstValue(company, ["internships_count", "internship_count", "total_internships"])
        ),
        applicants: padCount(
            firstValue(company, ["applicants_count", "applicant_count", "total_applicants"])
        ),
        contactPerson: String(
            firstValue(company, ["contact_person", "contact_name", "contact_person_name"])
        ).trim() || "—",
        phone: String(
            firstValue(company, ["phone", "contact_number", "phone_number", "company_phone"])
        ).trim() || "—",
        licenseExpiry: formatCompanyDate(
            firstValue(company, ["license_expiry_date", "license_expiry", "licence_expiry"])
        ),
        daysLeft: Number.isFinite(daysLeft) ? daysLeft : null,
        graceEnds: formatCompanyDate(firstValue(company, ["grace_ends_on"])),
        rejectionReason: String(
            firstValue(company, ["rejection_reason", "reject_reason", "verification_note"])
        ).trim(),
        profileCompletion: firstValue(company, ["profile_completion", "profile_percent"]),
        hires: padCount(firstValue(company, ["hires_count", "total_hires"]))
    };
}

function describeDaysLeft(days) {
    if (days === null) return "";

    if (days < 0) {
        const ago = Math.abs(days);
        return `expired ${ago} day${ago === 1 ? "" : "s"} ago`;
    }

    if (days === 0) return "expires today";

    return `${days} day${days === 1 ? "" : "s"} left`;
}

function updateCompanyDrawer(company) {
    const setText = (id, value) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value ?? "—";
    };

    setText("drawerCompanyLogo", company.logo);
    setText("drawerCompanyName", company.name);
    setText("drawerCompanyEmail", company.email);
    setText("drawerContactEmail", company.email);
    setText("drawerContactPerson", company.contactPerson);
    setText("drawerPhone", company.phone);
    setText("drawerIndustry", company.industry);
    setText("drawerBusinessType", company.businessType);
    setText("drawerJoinedDate", company.date);
    setText("drawerInternships", company.internships);
    setText("drawerApplicants", company.applicants);
    setText(
        "drawerProfileCompletion",
        company.profileCompletion === "" ? "—" : `${String(company.profileCompletion).replace("%", "")}%`
    );
    setText("drawerHires", company.hires);

    // License expiry + when the account will freeze
    const expiryText = [
        company.licenseExpiry,
        describeDaysLeft(company.daysLeft)
    ].filter(part => part && part !== "—").join(" · ");

    setText("drawerLicenseExpiry", expiryText || "—");
    setText("drawerGraceEnds", company.graceEnds);

    const reasonRow = document.getElementById("drawerRejectReasonRow");

    if (reasonRow) {
        const show = company.status === "Rejected" && Boolean(company.rejectionReason);
        reasonRow.style.display = show ? "" : "none";
        setText("drawerRejectReason", company.rejectionReason);
    }

    const status = document.getElementById("drawerCompanyStatus");

    if (status) {
        status.textContent = company.status;
        status.className = "company-status " + getStatusClass(company.status);
    }

    updateActionButtons(company.status);
}

function getStatusClass(status) {
    const value = String(status || "").toLowerCase();

    if (value.includes("verified")) return "verified";
    if (value.includes("frozen")) return "frozen";
    if (
        value.includes("rejected") ||
        value.includes("suspended") ||
        value.includes("blocked")
    ) return "suspended";

    return "pending";
}

/*
   Which admin buttons are shown for each status:

     Pending   -> Verify, Reject, Block
     Verified  -> Block
     Rejected  -> Block      (the company must upload a new license first)
     Frozen    -> Reject, Block   (no Verify: the company must upload a
                                   new license first, then it becomes Pending)
     Blocked   -> Unblock
*/
function updateActionButtons(status) {
    const value = String(status || "").toLowerCase();

    const pending = value.includes("pending");
    const verified = value.includes("verified");
    const rejected = value.includes("rejected");
    const frozen = value.includes("frozen");
    const blocked = value.includes("blocked") || value.includes("suspended");

    const show = (id, visible) => {
        const element = document.getElementById(id);
        if (element) element.style.display = visible ? "flex" : "none";
    };

    show("verifyCompanyBtn", pending);
    show("rejectCompanyBtn", pending || frozen);
    show("suspendCompanyBtn", pending || verified || rejected || frozen);
    show("unblockCompanyBtn", blocked);
}


/* ---------------- VERIFY, REJECT, LICENSE ---------------- */

function initCompanyActions() {
    const verifyButton = document.getElementById("verifyCompanyBtn");
    const rejectButton = document.getElementById("rejectCompanyBtn");
    const blockButton = document.getElementById("suspendCompanyBtn");
    const unblockButton = document.getElementById("unblockCompanyBtn");
    const licenseButton = document.getElementById("viewLicenseBtn");

    verifyButton?.addEventListener("click", async () => {
        const id = selectedCompanyId;
        if (!id) {
            showMessage("Company ID missing", "Could not match this company with an ID from the company list API.");
            return;
        }

        verifyButton.disabled = true;
        const original = verifyButton.innerHTML;
        verifyButton.textContent = "Verifying...";

        try {
            const result = await adminRequest(
                `/admin/companies/${encodeURIComponent(id)}/verify`,
                { method: "PATCH" }
            );

            updateDrawerAfterAction("Verified");
            showMessage(
                "Company Verified",
                result.message || "The company has been verified and can now log in."
            );
        } catch (error) {
            showMessage("Verification failed", error.message);
        } finally {
            verifyButton.disabled = false;
            verifyButton.innerHTML = original;
        }
    });

    rejectButton?.addEventListener("click", async () => {
        const id = selectedCompanyId;
        if (!id) {
            showMessage("Company ID missing", "Company ID is not available.");
            return;
        }

        const reason = await SmartDialog.prompt({
            title: "Reject this company?",
            message: "The company will see this reason and can upload a new license.",
            label: "Rejection reason",
            placeholder: "e.g. The license image is blurry",
            confirmText: "Reject company",
            required: true,
            danger: true
        });
        if (reason === null) return;

        rejectButton.disabled = true;

        try {
            const result = await adminRequest(
                `/admin/companies/${encodeURIComponent(id)}/reject`,
                {
                    method: "PATCH",
                    body: JSON.stringify({ reason: reason.trim() })
                }
            );

            updateDrawerAfterAction("Rejected", { rejection_reason: reason.trim() });
            showMessage(
                "Company Rejected",
                result.message || "The company has been rejected."
            );
        } catch (error) {
            showMessage("Rejection failed", error.message);
        } finally {
            rejectButton.disabled = false;
        }
    });

    blockButton?.addEventListener("click", async () => {
        const id = selectedCompanyId;
        if (!id) {
            showMessage("Company ID missing", "Company ID is not available.");
            return;
        }

        const confirmed = await SmartDialog.confirm({
            title: "Block this company?",
            message: "It will not be able to log in until you unblock it.",
            confirmText: "Block company",
            danger: true
        });
        if (!confirmed) return;

        blockButton.disabled = true;

        try {
            const result = await adminRequest(
                `/admin/companies/${encodeURIComponent(id)}/block`,
                { method: "PATCH" }
            );

            updateDrawerAfterAction("Blocked");
            showMessage(
                "Company Blocked",
                result.message || "The company has been blocked."
            );
        } catch (error) {
            showMessage("Block failed", error.message);
        } finally {
            blockButton.disabled = false;
        }
    });

    unblockButton?.addEventListener("click", async () => {
        const id = selectedCompanyId;
        if (!id) {
            showMessage("Company ID missing", "Company ID is not available.");
            return;
        }

        const confirmed = await SmartDialog.confirm({
            title: "Unblock this company?",
            message: "It will be able to log in again.",
            confirmText: "Unblock"
        });
        if (!confirmed) return;

        unblockButton.disabled = true;

        try {
            const result = await adminRequest(
                `/admin/companies/${encodeURIComponent(id)}/unblock`,
                { method: "PATCH" }
            );

            // The server decides which status the company goes back to.
            const restored = normalizeCompanyStatus(
                result.verification_status ?? result.status ?? "verified"
            );

            updateDrawerAfterAction(STATUS_LABELS[restored]);
            showMessage(
                "Company Unblocked",
                result.message || "The company has been unblocked and can log in again."
            );
        } catch (error) {
            showMessage("Unblock failed", error.message);
        } finally {
            unblockButton.disabled = false;
        }
    });

    licenseButton?.addEventListener("click", async () => {
        const id = selectedCompanyId;

        if (!id) {
            showMessage(
                "Company ID missing",
                "Could not match this company's database ID. Check the /admin/companies response."
            );
            return;
        }

        // Open a tab immediately to avoid popup blockers while fetching the URL.
        const documentTab = window.open("about:blank", "_blank");

        if (documentTab) {
            documentTab.document.title = "Trade Licence";
            documentTab.document.body.innerHTML =
                "<p style='font-family:Arial;padding:24px'>Loading trade licence…</p>";
        }

        licenseButton.disabled = true;
        const original = licenseButton.textContent;
        licenseButton.textContent = "Loading...";

        try {
            const data = await adminRequest(
                `/admin/companies/${encodeURIComponent(id)}/license`
            );

            const url =
                typeof data === "string"
                    ? data
                    : (
                        data.url ||
                        data.signed_url ||
                        data.signedUrl ||
                        data.license_url ||
                        data.licenseUrl ||
                        data.document_url ||
                        data.documentUrl ||
                        data.file_url ||
                        data.fileUrl
                    );

            if (!url || typeof url !== "string") {
                if (documentTab) documentTab.close();

                showMessage(
                    "Licence not available",
                    data.message ||
                    data.detail ||
                    "The backend did not return a document URL. Check the license link response."
                );
                return;
            }

            // Only open HTTP(S) links returned by the authenticated backend.
            const parsedURL = new URL(url, window.location.origin);

            if (!["http:", "https:"].includes(parsedURL.protocol)) {
                throw new Error("The server returned an invalid document URL.");
            }

            if (documentTab) {
                documentTab.location.replace(parsedURL.href);
            } else {
                window.location.href = parsedURL.href;
            }
        } catch (error) {
            if (documentTab) documentTab.close();

            showMessage(
                "Unable to open trade licence",
                error.message || "The document could not be loaded."
            );
        } finally {
            licenseButton.disabled = false;
            licenseButton.textContent = original;
        }
    });
}


/* ---------------- UPDATE UI AFTER API SUCCESS ---------------- */

function updateDrawerAfterAction(newStatus, extraFields = {}) {
    const status = document.getElementById("drawerCompanyStatus");

    if (status) {
        status.textContent = newStatus;
        status.className = "company-status " + getStatusClass(newStatus);
    }

    updateActionButtons(newStatus);

    const row = document.querySelector(
        `#companiesTableBody tr[data-company-id="${CSS.escape(String(selectedCompanyId))}"]`
    );

    if (row) {
        const rowStatus = row.querySelector(".company-status");

        if (rowStatus) {
            rowStatus.textContent = newStatus;
            rowStatus.className = "company-status " + getStatusClass(newStatus);
        }

        row.dataset.status = normalizeCompanyStatus(newStatus);
    }

    const record = companyRecords.find(
        company => String(getRecordId(company)) === String(selectedCompanyId)
    );

    if (record) {
        record.verification_status = normalizeCompanyStatus(newStatus);
        record.status = record.verification_status;
        Object.assign(record, extraFields);

        // refresh the drawer rows that depend on the record (e.g. rejection reason)
        updateCompanyDrawer(describeCompany(record));
    }

    updateCompanyStats();
    filterCompanies();
}


/* ---------------- PAGINATION ---------------- */

function initPagination() {
    document.querySelectorAll(".pagination-btn").forEach(button => {
        button.addEventListener("click", () => {
            if (
                button.classList.contains("disabled") ||
                ["←", "→"].includes(button.textContent.trim())
            ) return;

            document.querySelectorAll(".pagination-btn").forEach(item => {
                item.classList.remove("active");
            });

            button.classList.add("active");
        });
    });
}


/* ---------------- HEADER ACTIONS ---------------- */

function initHeaderActions() {
    const refresh = document.getElementById("refreshCompaniesBtn");
    const exportButton = document.getElementById("exportCompaniesBtn");

    refresh?.addEventListener("click", async () => {
        const original = refresh.innerHTML;
        refresh.disabled = true;
        refresh.textContent = "Refreshing...";

        try {
            await loadCompanies();
            showMessage("Refreshed", "The company list was reloaded from the server.");
        } finally {
            refresh.disabled = false;
            refresh.innerHTML = original;
        }
    });

    exportButton?.addEventListener("click", () => {
        showMessage(
            "Export not connected",
            "Company export is not available yet: no backend endpoint is configured."
        );
    });
}
