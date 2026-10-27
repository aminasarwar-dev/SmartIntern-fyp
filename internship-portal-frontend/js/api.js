/* =========================================================
   SMARTINTERN — SHARED API CONFIGURATION
========================================================= */

const API_BASE_URL = "http://127.0.0.1:8000";
const REQUEST_TIMEOUT_MS = 30000;   // normal requests (login, lists, etc.)
const SLOW_TIMEOUT_MS    = 60000;   // email / heavy processing (forgot password, etc.)
const UPLOAD_TIMEOUT_MS  = 120000;  // file uploads (resume, trade license) + server-side processing


/* =========================================================
   ERROR MESSAGE HELPER
========================================================= */

function extractErrorMessage(result) {

    if (!result) {
        return "Something went wrong. Please try again.";
    }

    if (typeof result.detail === "string") {
        return result.detail;
    }

    if (Array.isArray(result.detail) && result.detail.length > 0) {

        const first = result.detail[0];
        const field = Array.isArray(first.loc)
            ? first.loc[first.loc.length - 1]
            : "";

        return field
            ? `${field}: ${first.msg}`
            : (first.msg || "Invalid input.");
    }

    return result.message || "Something went wrong. Please try again.";
}


/* =========================================================
   COMMON API REQUEST
========================================================= */

async function apiRequest(endpoint, options = {}) {

    // Per-request timeout: pass { timeout: ms } to override the default.
    const { timeout = REQUEST_TIMEOUT_MS, ...fetchOptions } = options;

    const controller = new AbortController();

    const timer = setTimeout(
        () => controller.abort(),
        timeout
    );

    try {

        const response = await fetch(
            `${API_BASE_URL}${endpoint}`,
            {
                ...fetchOptions,
                signal: controller.signal
            }
        );

        let result = {};

        try {
            result = await response.json();
        } catch {
            result = {};
        }

        if (!response.ok) {
            // Keep the HTTP status and any error code on the Error so pages
            // can react to 401 (session expired) or 403 (blocked).
            const failure = new Error(extractErrorMessage(result));
            failure.status = response.status;
            failure.code =
                result.code ||
                (result.detail && typeof result.detail === "object"
                    ? result.detail.code
                    : undefined);
            throw failure;
        }

        return result;

    } catch (error) {

        if (error.name === "AbortError") {
            throw new Error("The server is taking too long to respond. Please try again.");
        }

        if (error instanceof TypeError) {
            throw new Error(
                "Unable to connect to the backend server."
            );
        }

        throw error;

    } finally {

        clearTimeout(timer);
    }
}


/* =========================================================
   JSON POST REQUEST
========================================================= */

function apiJsonRequest(endpoint, data, timeout = REQUEST_TIMEOUT_MS) {

    return apiRequest(endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data),
        timeout
    });
}


/* =========================================================
   FORM DATA POST REQUEST
========================================================= */

function apiFormRequest(endpoint, formData, timeout = UPLOAD_TIMEOUT_MS) {

    return apiRequest(endpoint, {
        method: "POST",
        body: formData,
        timeout
    });
}


/* =========================================================
   ADMIN LOGIN
   POST /admin/login
========================================================= */

async function adminLoginAPI(email, password) {

    const result = await apiJsonRequest("/admin/login", {
        email: email.trim(),
        password: password
    });

    if (!result.access_token || !result.admin) {
        throw new Error(
            "Invalid login response received from the server."
        );
    }

    sessionStorage.setItem(
        "smartInternAdminToken",
        result.access_token
    );

    sessionStorage.setItem(
        "smartInternAdmin",
        JSON.stringify({
            ...result.admin,
            role: "admin"
        })
    );

    return result;
}


/* =========================================================
   GET ADMIN TOKEN
========================================================= */

function getAdminToken() {

    return (
        sessionStorage.getItem("smartInternAdminToken") ||
        localStorage.getItem("smartInternAdminToken") ||
        ""
    );
}


/* =========================================================
   ADMIN AUTHORIZATION HEADERS
========================================================= */

function getAdminAuthHeaders() {

    const token = getAdminToken();

    if (!token) {
        throw new Error(
            "Admin session expired. Please log in again."
        );
    }

    return {
        Authorization: `Bearer ${token}`
    };
}


/* =========================================================
   GET ADMIN DASHBOARD
   GET /admin/dashboard
========================================================= */

async function getAdminDashboardAPI() {

    return apiRequest("/admin/dashboard", {
        method: "GET",
        headers: getAdminAuthHeaders()
    });
}


/* =========================================================
   GET ADMIN STUDENTS
   GET /admin/students
========================================================= */

async function getAdminStudentsAPI() {

    return apiRequest("/admin/students", {
        method: "GET",
        headers: getAdminAuthHeaders()
    });
}


/* =========================================================
   GET COMPANIES
   GET /admin/companies?status=pending
========================================================= */

async function getAdminCompaniesAPI(status = "all") {

    return apiRequest(
        `/admin/companies?status=${encodeURIComponent(status)}`,
        {
            method: "GET",
            headers: getAdminAuthHeaders()
        }
    );
}


/* =========================================================
   GET COMPANY TRADE LICENSE
   GET /admin/companies/{company_id}/license
========================================================= */

async function getCompanyLicenseAPI(companyId) {

    if (
        !Number.isInteger(Number(companyId)) ||
        Number(companyId) <= 0
    ) {
        throw new Error("Invalid company ID.");
    }

    return apiRequest(
        `/admin/companies/${Number(companyId)}/license`,
        {
            method: "GET",
            headers: getAdminAuthHeaders()
        }
    );
}


/* =========================================================
   VERIFY COMPANY
   PATCH /admin/companies/{company_id}/verify
========================================================= */

async function verifyCompanyAPI(companyId) {

    if (
        !Number.isInteger(Number(companyId)) ||
        Number(companyId) <= 0
    ) {
        throw new Error("Invalid company ID.");
    }

    return apiRequest(
        `/admin/companies/${Number(companyId)}/verify`,
        {
            method: "PATCH",
            headers: getAdminAuthHeaders()
        }
    );
}


/* =========================================================
   REJECT COMPANY
   PATCH /admin/companies/{company_id}/reject
========================================================= */

async function rejectCompanyAPI(companyId, reason = "") {

    if (
        !Number.isInteger(Number(companyId)) ||
        Number(companyId) <= 0
    ) {
        throw new Error("Invalid company ID.");
    }

    return apiRequest(
        `/admin/companies/${Number(companyId)}/reject`,
        {
            method: "PATCH",
            headers: {
                ...getAdminAuthHeaders(),
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                reason: reason.trim()
            })
        }
    );
}


/* =========================================================
   COMPANY — CURRENT COMPANY
   GET /company/me
   Returns verification_status (pending / verified / rejected /
   frozen / blocked), license_days_left, grace_ends_on,
   rejection_reason ...
========================================================= */

async function getCompanyMeAPI() {

    const token =
        sessionStorage.getItem("smartInternToken") ||
        sessionStorage.getItem("access_token") ||
        "";

    return apiRequest("/company/me", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` }
    });
}


/* =========================================================
   COMPANY — RE-UPLOAD TRADE LICENSE
   PUT /company/reupload-license   (multipart/form-data)
   Fields: trade_license, license_issue_date, license_expiry_date
   Works for rejected, frozen and expiring/expired licenses.
   On success the company status becomes "pending".
========================================================= */

async function reuploadCompanyLicenseAPI(file, issueDate, expiryDate) {

    const token =
        sessionStorage.getItem("smartInternToken") ||
        sessionStorage.getItem("access_token") ||
        "";

    if (!token) {
        throw new Error("Your session has expired. Please log in again.");
    }

    const formData = new FormData();
    formData.append("trade_license", file);
    formData.append("license_issue_date", issueDate);
    formData.append("license_expiry_date", expiryDate);

    // Do NOT set Content-Type: the browser adds the multipart boundary.
    return apiRequest("/company/reupload-license", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
        timeout: UPLOAD_TIMEOUT_MS
    });
}


/* =========================================================
   COMPANY — INTERNSHIPS
   ---------------------------------------------------------
   POST   /company/internships                 publish a new internship
   GET    /company/internships                 { internships: [...], stats: {...} }
   GET    /company/internships/{id}            one internship (fills the edit form)
   PUT    /company/internships/{id}            edit (send ALL fields again)
   PATCH  /company/internships/{id}/close
   PATCH  /company/internships/{id}/reopen
   PATCH  /company/internships/{id}/publish    publish a draft
   DELETE /company/internships/{id}            only when it has no applicants

   Reading works for any logged-in company. Changing needs a
   VERIFIED company (others get 403 with a "detail" message).
   Every error is { "detail": "message" } and apiRequest turns it
   into error.message.
========================================================= */

const INTERNSHIP_API_ENABLED = true;

function companyAuthHeaders(extra = {}) {

    const token =
        sessionStorage.getItem("smartInternToken") ||
        sessionStorage.getItem("access_token") ||
        "";

    if (!token) {
        throw new Error("Your session has expired. Please log in again.");
    }

    return { Authorization: `Bearer ${token}`, ...extra };
}

function internshipUrl(id, suffix = "") {

    // Ids come from the server (numbers). Never put anything else in the URL.
    if (!/^\d+$/.test(String(id))) {
        throw new Error("Invalid internship ID.");
    }

    return `/company/internships/${id}${suffix}`;
}

function createInternshipAPI(payload) {

    return apiRequest("/company/internships", {
        method: "POST",
        headers: companyAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(payload)
    });
}

function listInternshipsAPI() {

    return apiRequest("/company/internships", {
        method: "GET",
        headers: companyAuthHeaders()
    });
}

function getInternshipAPI(id) {

    return apiRequest(internshipUrl(id), {
        method: "GET",
        headers: companyAuthHeaders()
    });
}

function updateInternshipAPI(id, payload) {

    return apiRequest(internshipUrl(id), {
        method: "PUT",
        headers: companyAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(payload)
    });
}

// action: "close" | "reopen" | "publish"
function internshipActionAPI(id, action) {

    if (!["close", "reopen", "publish"].includes(action)) {
        throw new Error("Unknown action.");
    }

    return apiRequest(internshipUrl(id, `/${action}`), {
        method: "PATCH",
        headers: companyAuthHeaders()
    });
}

function deleteInternshipAPI(id) {

    return apiRequest(internshipUrl(id), {
        method: "DELETE",
        headers: companyAuthHeaders()
    });
}
