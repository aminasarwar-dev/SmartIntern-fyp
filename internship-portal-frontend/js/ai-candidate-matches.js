/* =========================================================
   SMARTINTERN — AI CANDIDATE MATCHES
   Filters, candidate review modal, sidebar and notifications
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    const page = document.querySelector(".ai-matches-page");
    if (!page) return;

    /* -----------------------------------------
       COMPANY PROFILE
    ----------------------------------------- */

    let companyProfile = {};

    try {
        companyProfile = JSON.parse(
            sessionStorage.getItem("smartInternCompanyProfile") || "{}"
        );
    } catch (error) {
        companyProfile = {};
    }

    const companyName =
        companyProfile.companyName ||
        companyProfile.name ||
        companyProfile.company_name ||
        "Company";

    const initials = companyName
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part[0].toUpperCase())
        .join("") || "C";

    const sidebarCompanyName = document.getElementById("sidebarCompanyName");
    const topbarCompanyName = document.getElementById("topbarCompanyName");
    const sidebarCompanyAvatar = document.getElementById("sidebarCompanyAvatar");
    const topbarCompanyAvatar = document.getElementById("topbarCompanyAvatar");

    if (sidebarCompanyName) sidebarCompanyName.textContent = companyName;
    if (topbarCompanyName) topbarCompanyName.textContent = companyName;
    if (sidebarCompanyAvatar) sidebarCompanyAvatar.textContent = initials;
    if (topbarCompanyAvatar) topbarCompanyAvatar.textContent = initials;

    /* -----------------------------------------
       MOBILE SIDEBAR
    ----------------------------------------- */

    const sidebar = document.getElementById("dashboardSidebar");
    const overlay = document.getElementById("sidebarOverlay");
    const mobileMenu = document.getElementById("mobileMenu");

    function closeSidebar() {
        sidebar?.classList.remove("show");
        overlay?.classList.remove("show");
    }

    mobileMenu?.addEventListener("click", () => {
        sidebar?.classList.toggle("show");
        overlay?.classList.toggle("show");
    });

    overlay?.addEventListener("click", closeSidebar);

    /* -----------------------------------------
       LOGOUT
       No browser confirm popup
    ----------------------------------------- */

    document.getElementById("logoutLink")?.addEventListener("click", event => {
        event.preventDefault();

        sessionStorage.removeItem("smartInternToken");
        sessionStorage.removeItem("smartInternLogin");
        sessionStorage.removeItem("smartInternRole");
        if (window.SmartInternSession) { window.SmartInternSession.clear(); }

        window.location.href = "login.html";
    });

    /* -----------------------------------------
       NOTIFICATION PANEL
    ----------------------------------------- */

    const notificationButton = document.getElementById("notificationButton");
    const notificationPanel = document.getElementById("notificationPanel");
    const closeNotifications = document.getElementById("closeNotifications");

    function closeNotificationPanel() {
        notificationPanel?.classList.remove("show");
    }

    notificationButton?.addEventListener("click", event => {
        event.stopPropagation();
        notificationPanel?.classList.toggle("show");
    });

    closeNotifications?.addEventListener("click", event => {
        event.stopPropagation();
        closeNotificationPanel();
    });

    notificationPanel?.addEventListener("click", event => {
        event.stopPropagation();
    });

    document.addEventListener("click", closeNotificationPanel);

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            closeNotificationPanel();
            closeCandidateModal();
            closeSidebar();
        }
    });

    /* -----------------------------------------
       CANDIDATE FILTERS
    ----------------------------------------- */

    const internshipFilter = document.getElementById("internshipFilter");
    const skillsFilter = document.getElementById("skillsFilter");
    const scoreFilter = document.getElementById("scoreFilter");
    const resetFilters = document.getElementById("resetFilters");
    const emptyReset = document.getElementById("emptyReset");

    const candidateGrid = document.getElementById("candidateGrid");
    const resultCount = document.getElementById("resultCount");
    const emptyState = document.getElementById("emptyState");

    const candidateCards = Array.from(
        document.querySelectorAll(".ai-candidate-card")
    );

    function filterCandidates() {
        const selectedInternship = internshipFilter?.value || "all";
        const searchTerm = (skillsFilter?.value || "").trim().toLowerCase();
        const minimumScore = Number(scoreFilter?.value || 0);

        let visibleCount = 0;

        candidateCards.forEach(card => {
            const candidateName = (card.dataset.name || "").toLowerCase();
            const candidateSkills = (card.dataset.skills || "").toLowerCase();
            const candidateInternships = (card.dataset.internships || "").toLowerCase();
            const candidateScore = Number(card.dataset.score || 0);

            const internshipMatches =
                selectedInternship === "all" ||
                candidateInternships.split(/\s+/).includes(selectedInternship);

            const searchMatches =
                !searchTerm ||
                candidateName.includes(searchTerm) ||
                candidateSkills.includes(searchTerm);

            const scoreMatches = candidateScore >= minimumScore;

            const visible =
                internshipMatches && searchMatches && scoreMatches;

            card.hidden = !visible;

            if (visible) visibleCount++;
        });

        if (resultCount) {
            resultCount.textContent =
                `${visibleCount} ${visibleCount === 1 ? "candidate" : "candidates"}`;
        }

        if (emptyState) emptyState.hidden = visibleCount !== 0;
        if (candidateGrid) candidateGrid.hidden = visibleCount === 0;
    }

    function clearFilters() {
        if (internshipFilter) internshipFilter.value = "all";
        if (skillsFilter) skillsFilter.value = "";
        if (scoreFilter) scoreFilter.value = "0";
        filterCandidates();
    }

    internshipFilter?.addEventListener("change", filterCandidates);
    skillsFilter?.addEventListener("input", filterCandidates);
    scoreFilter?.addEventListener("change", filterCandidates);
    resetFilters?.addEventListener("click", clearFilters);
    emptyReset?.addEventListener("click", clearFilters);

    filterCandidates();

    /* -----------------------------------------
       CANDIDATE REVIEW MODAL
    ----------------------------------------- */

    const candidateModal = document.getElementById("candidateModal");
    const modalCandidateName = document.getElementById("modalCandidateName");
    const modalCandidateDescription = document.getElementById("modalCandidateDescription");
    const closeCandidateModalButton = document.getElementById("closeCandidateModal");
    const modalDone = document.getElementById("modalDone");

    function openCandidateModal(name, card) {
        if (!candidateModal) return;

        if (modalCandidateName) {
            modalCandidateName.textContent = name;
        }

        if (modalCandidateDescription && card) {
            const skills = (card.dataset.skills || "")
                .split(/\s+/)
                .filter(Boolean)
                .map(skill => skill.toUpperCase())
                .join(", ");

            modalCandidateDescription.textContent =
                `Listed skills: ${skills || "Not provided"}. ` +
                "This sample card does not contain a full candidate profile. " +
                "Connect your applicant/profile API to load verified details.";
        }

        candidateModal.hidden = false;
        document.body.style.overflow = "hidden";
        closeCandidateModalButton?.focus();
    }

    function closeCandidateModal() {
        if (!candidateModal || candidateModal.hidden) return;
        candidateModal.hidden = true;
        document.body.style.overflow = "";
    }

    document.querySelectorAll(".ai-view-button").forEach(button => {
        button.addEventListener("click", () => {
            const card = button.closest(".ai-candidate-card");
            const name = button.dataset.candidate || "Candidate";
            openCandidateModal(name, card);
        });
    });

    closeCandidateModalButton?.addEventListener("click", closeCandidateModal);
    modalDone?.addEventListener("click", closeCandidateModal);

    candidateModal?.addEventListener("click", event => {
        if (event.target === candidateModal) {
            closeCandidateModal();
        }
    });
});