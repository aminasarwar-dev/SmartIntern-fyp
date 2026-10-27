/* =========================================================
   SMARTINTERN
   STUDENT — BROWSE INTERNSHIPS
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {


    /* =====================================================
       ELEMENTS
       ===================================================== */

    const sidebar =
        document.getElementById("dashboardSidebar");

    const mobileMenu =
        document.getElementById("mobileMenu");

    const sidebarOverlay =
        document.getElementById("sidebarOverlay");

    const notificationButton =
        document.getElementById("notificationButton");

    const notificationPanel =
        document.getElementById("notificationPanel");

    const closeNotifications =
        document.getElementById("closeNotifications");

    const searchInput =
        document.getElementById("internshipSearch");

    const searchButton =
        document.getElementById("searchButton");

    const filterButtons =
        document.querySelectorAll(".filter-btn");

    const locationFilter =
        document.getElementById("locationFilter");

    const durationFilter =
        document.getElementById("durationFilter");

    const cards =
        document.querySelectorAll(".browse-card");

    const resultsCount =
        document.getElementById("resultsCount");

    const noResults =
        document.getElementById("noResults");



    /* =====================================================
       MOBILE SIDEBAR
       ===================================================== */

    function openSidebar() {

        if (sidebar) {
            sidebar.classList.add("open");
        }

        if (sidebarOverlay) {
            sidebarOverlay.classList.add("show");
        }

    }


    function closeSidebar() {

        if (sidebar) {
            sidebar.classList.remove("open");
        }

        if (sidebarOverlay) {
            sidebarOverlay.classList.remove("show");
        }

    }


    if (mobileMenu) {

        mobileMenu.addEventListener(
            "click",
            openSidebar
        );

    }


    if (sidebarOverlay) {

        sidebarOverlay.addEventListener(
            "click",
            closeSidebar
        );

    }



    /* =====================================================
       NOTIFICATIONS
       ===================================================== */

    if (notificationButton && notificationPanel) {

        /*
         * Open notification panel.
         *
         * It will NOT close when clicking somewhere
         * else on the page.
         */

        notificationButton.addEventListener(
            "click",
            (event) => {

                event.stopPropagation();

                notificationPanel.classList.add(
                    "show"
                );

            }
        );

    }


    if (closeNotifications && notificationPanel) {

        /*
         * Notification closes ONLY from X.
         */

        closeNotifications.addEventListener(
            "click",
            (event) => {

                event.stopPropagation();

                notificationPanel.classList.remove(
                    "show"
                );

            }
        );

    }


    /*
     * IMPORTANT:
     *
     * There is intentionally NO document-level
     * click listener here.
     *
     * Therefore clicking anywhere outside the
     * notification panel will NOT close it.
     */



    /* =====================================================
       FILTER STATE
       ===================================================== */

    let activeType = "all";

    let activeCategory = "all";


    const categoryFilter =
        document.getElementById("categoryFilter");

    if (categoryFilter) {

        categoryFilter.addEventListener(
            "change",
            () => {

                activeCategory =
                    categoryFilter.value;

                filterInternships();

            }
        );

    }



    filterButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                filterButtons.forEach(
                    btn =>
                        btn.classList.remove("active")
                );


                button.classList.add("active");


                activeType =
                    button.dataset.filter;


                filterInternships();

            }
        );

    });



    /* =====================================================
       SEARCH
       ===================================================== */

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            filterInternships
        );

    }


    if (searchButton) {

        searchButton.addEventListener(
            "click",
            filterInternships
        );

    }



    /* =====================================================
       SELECT FILTERS
       ===================================================== */

    if (locationFilter) {

        locationFilter.addEventListener(
            "change",
            filterInternships
        );

    }


    if (durationFilter) {

        durationFilter.addEventListener(
            "change",
            filterInternships
        );

    }



    /* =====================================================
       FILTER FUNCTION
       ===================================================== */

    function filterInternships() {

        const searchValue =
            searchInput
                ? searchInput.value
                    .toLowerCase()
                    .trim()
                : "";


        const selectedLocation =
            locationFilter
                ? locationFilter.value
                : "all";


        const selectedDuration =
            durationFilter
                ? durationFilter.value
                : "all";


        let visibleCount = 0;


        cards.forEach(card => {

            const type =
                card.dataset.type;


            const location =
                card.dataset.location;


            const duration =
                card.dataset.duration;


            const searchableText =
                card.dataset.search
                    .toLowerCase();


            const matchesCategory =
                activeCategory === "all" ||
                card.dataset.category === activeCategory;


            const matchesType =
                activeType === "all" ||
                type === activeType;


            const matchesLocation =
                selectedLocation === "all" ||
                location === selectedLocation;


            const matchesDuration =
                selectedDuration === "all" ||
                duration === selectedDuration;


            const matchesSearch =
                searchValue === "" ||
                searchableText.includes(
                    searchValue
                );


            const shouldShow =
                matchesCategory &&
                matchesType &&
                matchesLocation &&
                matchesDuration &&
                matchesSearch;


            if (shouldShow) {

                card.style.display = "flex";

                visibleCount++;

            } else {

                card.style.display = "none";

            }

        });


        if (resultsCount) {

            resultsCount.textContent =
                visibleCount;

        }


        if (noResults) {

            noResults.style.display =
                visibleCount === 0
                    ? "block"
                    : "none";

        }

    }



    /* =====================================================
       VIEW DETAILS  +  APPLY (opens the modal)
       ===================================================== */

    /*
     * Sample details until the internships list API is used
     * on this page. Keyed by the card title.
     */

    const SAMPLE_DETAILS = {

        "Frontend Developer Intern": {
            about: "Work with the TechNova product team to build responsive, accessible screens for a growing SaaS platform.",
            responsibilities: ["Build UI components from Figma designs", "Fix bugs and improve page speed", "Write clean, reusable HTML, CSS and JavaScript", "Join weekly code reviews"],
            requirements: ["Good understanding of HTML, CSS and JavaScript", "A few small projects or a GitHub profile", "Able to work 20 hours per week"],
            perks: ["Monthly stipend", "Certificate and recommendation letter", "Mentor from the engineering team"],
            stipend: "PKR 30,000 / month",
            deadline: "30 Nov 2026"
        },

        "UI/UX Design Intern": {
            about: "Help Alpha Labs design clear, friendly interfaces for mobile and web products.",
            responsibilities: ["Create wireframes and prototypes in Figma", "Run quick user feedback sessions", "Keep the design system consistent"],
            requirements: ["Basic knowledge of Figma", "A small portfolio (university work is fine)", "Eye for spacing, colour and typography"],
            perks: ["Monthly stipend", "Portfolio-ready projects", "Certificate"],
            stipend: "PKR 25,000 / month",
            deadline: "5 Dec 2026"
        },

        "Digital Marketing Intern": {
            about: "Support Creative Studio's marketing team in planning and running campaigns for local and international brands.",
            responsibilities: ["Plan and schedule social media posts", "Write short blog and caption content", "Do basic SEO and keyword research", "Report weekly campaign results"],
            requirements: ["Good written English", "Basic understanding of social media and SEO", "Creative mindset and willingness to learn"],
            perks: ["Monthly stipend", "Certificate and recommendation letter", "Real brand campaigns for your portfolio"],
            stipend: "PKR 20,000 / month",
            deadline: "15 Dec 2026"
        },

        "Backend Developer Intern": {
            about: "Join Software Orbit's engineering team to build and test APIs and database features used by real customers.",
            responsibilities: ["Build and test REST API endpoints", "Write database queries and migrations", "Fix bugs and write simple tests", "Take part in code reviews"],
            requirements: ["Python or similar backend language", "Basic database (SQL) knowledge", "Able to work on-site 4 days a week"],
            perks: ["Monthly stipend", "Mentor from the senior team", "Certificate and job opportunity"],
            stipend: "PKR 35,000 / month",
            deadline: "20 Dec 2026"
        },

        "Data Analyst Intern": {
            about: "Help Insight Labs turn raw business data into clear reports and dashboards that managers can act on.",
            responsibilities: ["Clean and organise data in Excel and SQL", "Create charts and weekly reports", "Find trends and share simple insights"],
            requirements: ["SQL and Excel basics", "Basic Python is a plus", "Attention to detail"],
            perks: ["Monthly stipend", "Hands-on dashboard projects", "Certificate"],
            stipend: "PKR 30,000 / month",
            deadline: "25 Dec 2026"
        },

        "AI / ML Intern": {
            about: "Support the Nova Systems team in cleaning data and training simple machine learning models.",
            responsibilities: ["Prepare and clean datasets", "Train and test basic models in Python", "Document experiments and results"],
            requirements: ["Python basics", "Knowledge of statistics or ML coursework", "Curiosity to learn new tools"],
            perks: ["Monthly stipend", "Real project experience", "Certificate"],
            stipend: "PKR 35,000 / month",
            deadline: "10 Dec 2026"
        }

    };


    function textOf(card, selector) {

        const node = card.querySelector(selector);

        return node ? node.textContent.replace(/\s+/g, " ").trim() : "";

    }


    function buildInternship(card) {

        const title = textOf(card, "h3");
        const company = textOf(card, ".company-name");
        const jobType = textOf(card, ".job-type");
        const meta = Array.from(card.querySelectorAll(".job-meta span"))
            .map(node => node.textContent.replace(/^[^A-Za-z0-9]+/, "").trim());
        const skills = Array.from(card.querySelectorAll(".skill-list span"))
            .map(node => node.textContent.trim().toLowerCase());
        const scoreText = textOf(card, ".match-score, .ai-match-badge");
        const scoreNumber = parseFloat(scoreText);

        const extra = SAMPLE_DETAILS[title] || {};

        const saved = window.SmartAI ? window.SmartAI.getSavedSkills() : null;

        const gap = saved && window.SmartAI
            ? window.SmartAI.computeMatch(skills, saved).gap
            : [];

        return {
            id: title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
            title: title,
            company: company,
            initial: textOf(card, ".company-logo").charAt(0),
            typeLabel: jobType.replace(/\s*·\s*/g, " · "),
            location: meta[0] || "",
            duration: meta[1] || "",
            skills: skills,
            matchPct: isNaN(scoreNumber) ? null : scoreNumber,
            gap: gap,
            about: extra.about || ("Join " + company + " as a " + title + " and learn on real projects with the team."),
            responsibilities: extra.responsibilities || [],
            requirements: extra.requirements || [],
            perks: extra.perks || [],
            stipend: extra.stipend || "",
            deadline: extra.deadline || ""
        };

    }


    cards.forEach(card => {

        const viewButton = card.querySelector(".view-button");

        if (!viewButton || !window.SmartApply) {
            return;
        }

        viewButton.addEventListener(
            "click",
            event => {

                event.preventDefault();

                window.SmartApply.open(
                    buildInternship(card)
                );

            }
        );

    });



    /* =====================================================
       GSAP — PAGE ENTRANCE
       ===================================================== */

    if (typeof gsap !== "undefined") {


        gsap.from(
            ".browse-hero",
            {
                opacity: 0,
                y: 25,
                duration: .8,
                ease: "power3.out"
            }
        );


        gsap.from(
            ".hero-copy > *",
            {
                opacity: 0,
                y: 18,
                duration: .65,
                stagger: .12,
                delay: .15,
                ease: "power3.out"
            }
        );


        gsap.from(
            ".hero-star",
            {
                opacity: 0,
                scale: .5,
                rotation: -20,
                duration: .8,
                delay: .35,
                ease: "back.out(1.7)"
            }
        );


        gsap.from(
            ".hero-ai-badge",
            {
                opacity: 0,
                x: 25,
                duration: .7,
                delay: .5,
                ease: "power3.out"
            }
        );


        gsap.from(
            ".search-panel",
            {
                opacity: 0,
                y: 20,
                duration: .7,
                delay: .35,
                ease: "power3.out"
            }
        );


        gsap.from(
            ".results-heading",
            {
                opacity: 0,
                y: 18,
                duration: .6,
                delay: .5,
                ease: "power3.out"
            }
        );


        gsap.from(
            ".browse-card",
            {
                opacity: 0,
                y: 25,
                duration: .65,
                stagger: .10,
                delay: .55,
                ease: "power3.out"
            }
        );


        /* Floating hero elements */

        gsap.to(
            ".hero-star",
            {
                y: -9,
                rotation: 17,
                duration: 2.4,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            }
        );


        gsap.to(
            ".orb-one",
            {
                y: -12,
                x: 7,
                duration: 2,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            }
        );


        gsap.to(
            ".orb-two",
            {
                y: 10,
                x: -6,
                duration: 2.8,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            }
        );


        /* AI badge floating */

        gsap.to(
            ".hero-ai-badge",
            {
                y: -5,
                duration: 2.2,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            }
        );

    }



    /* =====================================================
       CARD 3D HOVER
       ===================================================== */

    cards.forEach(card => {


        card.addEventListener(
            "mousemove",
            event => {

                const rect =
                    card.getBoundingClientRect();


                const x =
                    event.clientX - rect.left;


                const y =
                    event.clientY - rect.top;


                const rotateY =
                    ((x / rect.width) - .5) * 5;


                const rotateX =
                    ((y / rect.height) - .5) * -5;


                if (typeof gsap !== "undefined") {

                    gsap.to(
                        card,
                        {
                            rotationY: rotateY,
                            rotationX: rotateX,
                            scale: 1.012,
                            duration: .25,
                            ease: "power2.out"
                        }
                    );

                }

            }
        );


        card.addEventListener(
            "mouseleave",
            () => {

                if (typeof gsap !== "undefined") {

                    gsap.to(
                        card,
                        {
                            rotationY: 0,
                            rotationX: 0,
                            scale: 1,
                            duration: .45,
                            ease: "power3.out"
                        }
                    );

                }

            }
        );

    });



    /* =====================================================
       ACTIVE AI MATCH ANIMATION
       ===================================================== */

    const matchScores =
        document.querySelectorAll(".match-score");


    if (typeof gsap !== "undefined") {

        matchScores.forEach(
            (score, index) => {

                gsap.from(
                    score,
                    {
                        scale: .75,
                        opacity: 0,
                        duration: .5,
                        delay: .9 + (index * .08),
                        ease: "back.out(1.8)"
                    }
                );

            }
        );

    }


});