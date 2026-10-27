/* =========================================================
   SMARTINTERN ADMIN — REAL DASHBOARD DATA
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    loadRealDashboardData();
});

async function loadRealDashboardData() {
    const token = sessionStorage.getItem("smartInternAdminToken");

    if (!token) {
        window.location.href = "admin-login.html";
        return;
    }

    try {
        const data = await getAdminDashboardAPI();

        const stats = data.stats || {};

        setDashboardValue("totalStudents", stats.students ?? 0);
        setDashboardValue("totalCompanies", stats.companies ?? 0);
        setDashboardValue(
            "pendingCompanies",
            stats.pending_companies ?? 0
        );

        setDashboardValue(
            "newStudentsThisMonth",
            `${stats.new_students_this_month ?? 0} this month`
        );

        // These modules are not yet connected to real backend data.
        setDashboardValue("totalInternships", stats.internships ?? 0);
        setDashboardValue("totalApplications", stats.applications ?? 0);

        renderPendingCompanies(data.pending_companies || []);

    } catch (error) {
        console.error("Dashboard data error:", error);

        const container = document.getElementById("pendingCompaniesList");

        if (container) {
            container.replaceChildren();

            const message = document.createElement("p");
            message.textContent =
                "Dashboard data could not be loaded. Please check the API connection and admin login.";
            container.appendChild(message);
        }
    }
}

function setDashboardValue(id, value) {
    const element = document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}

function renderPendingCompanies(companies) {
    const container = document.getElementById("pendingCompaniesList");

    if (!container) return;

    container.replaceChildren();

    if (!companies.length) {
        const emptyMessage = document.createElement("p");
        emptyMessage.textContent = "No companies are waiting for verification.";
        container.appendChild(emptyMessage);
        return;
    }

    companies.forEach((company) => {
        const card = document.createElement("article");
        card.className = "admin-review-card";

        const logo = document.createElement("div");
        logo.className = "review-company-logo";
        logo.textContent = (company.company_name || "C").charAt(0).toUpperCase();

        const info = document.createElement("div");
        info.className = "review-info";

        const top = document.createElement("div");
        top.className = "review-top";

        const label = document.createElement("span");
        label.textContent = "COMPANY";

        const status = document.createElement("span");
        status.className = "review-status";
        status.textContent = "Pending";

        top.append(label, status);

        const name = document.createElement("h3");
        name.textContent = company.company_name || "Unnamed company";

        const industry = document.createElement("p");
        industry.textContent = company.industry || "Industry not provided";

        const date = document.createElement("small");
        date.textContent = company.created_at
            ? `Registered: ${new Date(company.created_at).toLocaleDateString()}`
            : "Registration date unavailable";

        info.append(top, name, industry, date);

        const button = document.createElement("button");
        button.type = "button";
        button.className = "review-arrow";
        button.dataset.action = "review";
        button.textContent = "→";
        button.addEventListener("click", () => {
            window.location.href = "admin-companies.html?status=pending";
        });

        card.append(logo, info, button);
        container.appendChild(card);
    });
}