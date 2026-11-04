/* =========================================================
   SMARTINTERN
   STUDENT — BROWSE INTERNSHIPS  (connected to the backend)
   ---------------------------------------------------------
   GET /student/internships         -> the cards (search, filters, paging)
   GET /student/internships/{id}    -> the details popup

   Search and filters are done by the SERVER. This file only
   sends the choices, then draws the cards it gets back.
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {

    const PAGE_SIZE = 12;
    const SEARCH_DELAY_MS = 350;

    /* =====================================================
       ELEMENTS
       ===================================================== */

    const sidebar = document.getElementById("dashboardSidebar");
    const mobileMenu = document.getElementById("mobileMenu");
    const sidebarOverlay = document.getElementById("sidebarOverlay");
    const notificationButton = document.getElementById("notificationButton");
    const notificationPanel = document.getElementById("notificationPanel");
    const closeNotifications = document.getElementById("closeNotifications");

    const searchInput = document.getElementById("internshipSearch");
    const searchButton = document.getElementById("searchButton");
    const filterButtons = document.querySelectorAll(".filter-btn");
    const categoryFilter = document.getElementById("categoryFilter");
    const locationFilter = document.getElementById("locationFilter");
    const durationFilter = document.getElementById("durationFilter");

    const grid = document.getElementById("internshipGrid");
    const resultsCount = document.getElementById("resultsCount");
    const noResults = document.getElementById("noResults");
    const noResultsTitle = noResults ? noResults.querySelector("h3") : null;
    const noResultsText = noResults ? noResults.querySelector("p") : null;
    const retryButton = document.getElementById("retryButton");
    const loadingBox = document.getElementById("browseLoading");
    const loadMoreWrap = document.getElementById("loadMoreWrap");
    const loadMoreButton = document.getElementById("loadMoreButton");

    const helpers = window.StudentInternships;


    /* =====================================================
       MOBILE SIDEBAR
       ===================================================== */

    function openSidebar() {
        if (sidebar) { sidebar.classList.add("open"); }
        if (sidebarOverlay) { sidebarOverlay.classList.add("show"); }
    }

    function closeSidebar() {
        if (sidebar) { sidebar.classList.remove("open"); }
        if (sidebarOverlay) { sidebarOverlay.classList.remove("show"); }
    }

    if (mobileMenu) { mobileMenu.addEventListener("click", openSidebar); }
    if (sidebarOverlay) { sidebarOverlay.addEventListener("click", closeSidebar); }


    /* =====================================================
       NOTIFICATIONS
       (opens with the bell, closes ONLY with the X)
       ===================================================== */

    if (notificationButton && notificationPanel) {
        notificationButton.addEventListener("click", (event) => {
            event.stopPropagation();
            notificationPanel.classList.add("show");
        });
    }

    if (closeNotifications && notificationPanel) {
        closeNotifications.addEventListener("click", (event) => {
            event.stopPropagation();
            notificationPanel.classList.remove("show");
        });
    }


    /* =====================================================
       STATE  (what the student chose + paging)
       ===================================================== */

    const state = {
        q: "",
        type: "all",
        category: "all",
        location: "all",
        duration: "all",
        page: 1,
        total: 0,
        hasMore: false
    };

    let requestNumber = 0;      // an old, slow answer must never replace a newer one
    let searchTimer = null;
    let opening = false;        // the details popup is being opened


    /* =====================================================
       SMALL HELPERS
       ===================================================== */

    function el(tag, className, text) {
        const node = document.createElement(tag);
        if (className) { node.className = className; }
        if (text !== undefined) { node.textContent = text; }
        return node;
    }

    function show(node, visible) {
        if (node) { node.style.display = visible ? "block" : "none"; }
    }

    function setCount(value) {
        if (resultsCount) { resultsCount.textContent = value; }
    }

    function sessionExpired() {
        if (window.SmartInternSession) { window.SmartInternSession.clear(); }
        window.location.replace("/login");
    }

    function showMessage(title, text, withRetry) {
        if (noResultsTitle) { noResultsTitle.textContent = title; }
        if (noResultsText) { noResultsText.textContent = text; }
        if (retryButton) { retryButton.hidden = !withRetry; }
        show(noResults, true);
    }


    /* =====================================================
       DRAW ONE CARD  (same look as before; text is set with
       textContent, so nothing from the server runs as HTML)
       ===================================================== */

    function buildCard(item) {

        const card = el("article", "browse-card");
        card.dataset.id = item.id;

        /* top: logo + match / applied badge */
        const top = el("div", "card-top");
        top.appendChild(
            el(
                "div",
                "company-logo " + helpers.logoClass(item.company_name),
                helpers.initialOf(item.company_name)
            )
        );

        if (item.has_applied) {
            top.appendChild(el("span", "match-score", "Applied ✓"));
        } else if (item.match_pct !== null && item.match_pct !== undefined) {
            top.appendChild(el("span", "match-score", Math.round(item.match_pct) + "% Match"));
        }

        card.appendChild(top);

        /* body */
        const body = el("div", "card-body");

        body.appendChild(el("span", "job-type", helpers.typeLabel(item).toUpperCase()));
        body.appendChild(el("h3", "", item.title));
        body.appendChild(el("p", "company-name", item.company_name));

        const meta = el("div", "job-meta");
        meta.appendChild(el("span", "", "◉ " + (item.location || "—")));
        meta.appendChild(el("span", "", "◷ " + (item.duration || "—")));
        body.appendChild(meta);

        const skills = el("div", "skill-list");
        (item.skills || []).slice(0, 4).forEach(skill => {
            skills.appendChild(el("span", "", skill));
        });
        if ((item.skills || []).length > 4) {
            skills.appendChild(el("span", "", "+" + (item.skills.length - 4)));
        }
        body.appendChild(skills);

        card.appendChild(body);

        /* bottom: deadline + view button */
        const bottom = el("div", "card-bottom");

        const deadline = helpers.dateText(item.application_deadline);
        bottom.appendChild(
            el("span", "ai-note", deadline ? "◷ Apply before " + deadline : "◷ Open for applications")
        );

        const view = el("a", "view-button");
        view.href = "/internship-detail?id=" + encodeURIComponent(item.id);
        view.appendChild(document.createTextNode("View Details "));
        view.appendChild(el("span", "", "→"));
        view.addEventListener("click", event => {
            event.preventDefault();
            openDetails(item.id, view);
        });
        bottom.appendChild(view);

        card.appendChild(bottom);

        attachHover(card);

        return card;
    }

    function attachHover(card) {

        if (typeof gsap === "undefined") { return; }

        card.addEventListener("mousemove", event => {
            const rect = card.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            gsap.to(card, {
                rotationY: ((x / rect.width) - .5) * 5,
                rotationX: ((y / rect.height) - .5) * -5,
                scale: 1.012,
                duration: .25,
                ease: "power2.out"
            });
        });

        card.addEventListener("mouseleave", () => {
            gsap.to(card, {
                rotationY: 0,
                rotationX: 0,
                scale: 1,
                duration: .45,
                ease: "power3.out"
            });
        });
    }


    /* =====================================================
       LOAD THE LIST FROM THE BACKEND
       ===================================================== */

    async function loadInternships(append) {

        const thisRequest = ++requestNumber;

        show(noResults, false);
        show(loadingBox, !append);

        if (loadMoreButton) {
            loadMoreButton.disabled = true;
            loadMoreButton.textContent = "Loading…";
        }

        try {

            const data = await browseInternshipsAPI({
                q: state.q,
                type: state.type,
                category: state.category,
                location: state.location,
                duration: state.duration,
                page: state.page,
                page_size: PAGE_SIZE
            });

            if (thisRequest !== requestNumber) { return; }

            const items = data.internships || [];

            state.total = data.total || 0;
            state.hasMore = Boolean(data.has_more);

            if (!append) { grid.replaceChildren(); }

            const fresh = items.map(buildCard);
            fresh.forEach(card => grid.appendChild(card));

            if (typeof gsap !== "undefined" && fresh.length) {
                gsap.from(fresh, {
                    opacity: 0,
                    y: 22,
                    duration: .55,
                    stagger: .06,
                    ease: "power3.out"
                });
            }

            setCount(state.total);
            show(loadingBox, false);

            if (state.total === 0) {
                showMessage(
                    "No internships found",
                    "Try changing your search or filters.",
                    false
                );
            }

        } catch (error) {

            if (thisRequest !== requestNumber) { return; }

            if (error.status === 401) {
                sessionExpired();
                return;
            }

            if (!append) { grid.replaceChildren(); }

            setCount(0);
            state.hasMore = false;
            show(loadingBox, false);

            if (error.status === 404 || error.status === 403) {
                showMessage(
                    "Internships are not available",
                    error.message || "You cannot see internships right now.",
                    false
                );
            } else {
                showMessage(
                    "Could not load internships",
                    error.message || "Please check your connection and try again.",
                    true
                );
            }

        } finally {

            if (thisRequest === requestNumber && loadMoreWrap) {
                loadMoreWrap.hidden = !state.hasMore;

                if (loadMoreButton) {
                    loadMoreButton.disabled = false;
                    loadMoreButton.textContent = "Load more";
                }
            }
        }
    }

    /* a new search / filter always starts again from page 1 */
    function applyFilters() {
        state.page = 1;
        loadInternships(false);
    }


    /* =====================================================
       SEARCH + FILTERS  ->  state  ->  server
       ===================================================== */

    function readSearch() {
        state.q = searchInput ? searchInput.value.trim() : "";
    }

    if (searchInput) {

        searchInput.maxLength = 100;       // the server accepts up to 100 characters

        searchInput.addEventListener("input", () => {
            clearTimeout(searchTimer);
            searchTimer = setTimeout(() => {
                readSearch();
                applyFilters();
            }, SEARCH_DELAY_MS);
        });

        searchInput.addEventListener("keydown", event => {
            if (event.key === "Enter") {
                event.preventDefault();
                clearTimeout(searchTimer);
                readSearch();
                applyFilters();
            }
        });
    }

    if (searchButton) {
        searchButton.addEventListener("click", () => {
            clearTimeout(searchTimer);
            readSearch();
            applyFilters();
        });
    }

    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            filterButtons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");
            state.type = button.dataset.filter;
            applyFilters();
        });
    });

    if (categoryFilter) {
        categoryFilter.addEventListener("change", () => {
            state.category = categoryFilter.value;
            applyFilters();
        });
    }

    if (locationFilter) {
        locationFilter.addEventListener("change", () => {
            state.location = locationFilter.value;
            applyFilters();
        });
    }

    if (durationFilter) {
        durationFilter.addEventListener("change", () => {
            state.duration = durationFilter.value;
            applyFilters();
        });
    }

    if (loadMoreButton) {
        loadMoreButton.addEventListener("click", () => {
            state.page += 1;
            loadInternships(true);
        });
    }

    if (retryButton) {
        retryButton.addEventListener("click", applyFilters);
    }


    /* =====================================================
       VIEW DETAILS  (GET /student/internships/{id} -> popup)
       ===================================================== */

    async function openDetails(id, button) {

        if (opening) { return; }

        if (!window.SmartApply) {
            window.location.href = "/internship-detail?id=" + encodeURIComponent(id);
            return;
        }

        opening = true;
        button.classList.add("is-loading");

        try {

            const detail = await getStudentInternshipAPI(id);

            window.SmartApply.open(helpers.toApplyItem(detail));

        } catch (error) {

            if (error.status === 401) {
                sessionExpired();
                return;
            }

            if (error.status === 404) {
                // closed, expired or hidden since the list was loaded
                showMessage(
                    "This internship is no longer available",
                    "It may have been closed. The list has been refreshed.",
                    false
                );
                applyFilters();
            } else if (window.SmartDialog && window.SmartDialog.alert) {
                window.SmartDialog.alert(error.message || "Could not open the internship.");
            } else {
                window.alert(error.message || "Could not open the internship.");
            }

        } finally {
            opening = false;
            button.classList.remove("is-loading");
        }
    }


    /* =====================================================
       GSAP — PAGE ENTRANCE
       ===================================================== */

    if (typeof gsap !== "undefined") {

        gsap.from(".browse-hero", { opacity: 0, y: 25, duration: .8, ease: "power3.out" });

        gsap.from(".hero-copy > *", {
            opacity: 0, y: 18, duration: .65, stagger: .12, delay: .15, ease: "power3.out"
        });

        gsap.from(".hero-star", {
            opacity: 0, scale: .5, rotation: -20, duration: .8, delay: .35, ease: "back.out(1.7)"
        });

        gsap.from(".hero-ai-badge", {
            opacity: 0, x: 25, duration: .7, delay: .5, ease: "power3.out"
        });

        gsap.from(".search-panel", { opacity: 0, y: 20, duration: .7, delay: .35, ease: "power3.out" });

        gsap.from(".results-heading", { opacity: 0, y: 18, duration: .6, delay: .5, ease: "power3.out" });

        /* Floating hero elements */
        gsap.to(".hero-star", { y: -9, rotation: 17, duration: 2.4, repeat: -1, yoyo: true, ease: "sine.inOut" });
        gsap.to(".orb-one", { y: -12, x: 7, duration: 2, repeat: -1, yoyo: true, ease: "sine.inOut" });
        gsap.to(".orb-two", { y: 10, x: -6, duration: 2.8, repeat: -1, yoyo: true, ease: "sine.inOut" });
        gsap.to(".hero-ai-badge", { y: -5, duration: 2.2, repeat: -1, yoyo: true, ease: "sine.inOut" });
    }


    /* =====================================================
       START
       ===================================================== */

    setCount("…");
    loadInternships(false);

});
