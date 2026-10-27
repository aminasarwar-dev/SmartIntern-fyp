/* =========================================================
   SMARTINTERN ADMIN — ANALYTICS PAGE
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    initMobileSidebar();

    initNotifications();

    initRefreshButton();

    initAnimations();

});


/* =========================================================
   MOBILE SIDEBAR
========================================================= */

function initMobileSidebar() {

    const mobileMenu =
        document.getElementById("mobileMenu");

    const sidebar =
        document.getElementById(
            "dashboardSidebar"
        );

    const overlay =
        document.getElementById(
            "sidebarOverlay"
        );


    if (
        !mobileMenu ||
        !sidebar ||
        !overlay
    ) {

        return;

    }


    mobileMenu.addEventListener(
        "click",
        () => {

            sidebar.classList.toggle(
                "open"
            );

            overlay.classList.toggle(
                "show"
            );

        }
    );


    overlay.addEventListener(
        "click",
        () => {

            sidebar.classList.remove(
                "open"
            );

            overlay.classList.remove(
                "show"
            );

        }
    );


    sidebar
        .querySelectorAll(
            ".sidebar-link"
        )
        .forEach(link => {

            link.addEventListener(
                "click",
                () => {

                    if (
                        window.innerWidth <= 850
                    ) {

                        sidebar.classList.remove(
                            "open"
                        );

                        overlay.classList.remove(
                            "show"
                        );

                    }

                }
            );

        });


    window.addEventListener(
        "resize",
        () => {

            if (
                window.innerWidth > 850
            ) {

                sidebar.classList.remove(
                    "open"
                );

                overlay.classList.remove(
                    "show"
                );

            }

        }
    );

}


/* =========================================================
   NOTIFICATIONS
   Only notification button / X closes it.
   No outside-click closing.
========================================================= */

function initNotifications() {

    const button =
        document.getElementById(
            "notificationButton"
        );

    const panel =
        document.getElementById(
            "notificationPanel"
        );

    const closeButton =
        document.getElementById(
            "closeNotification"
        );


    if (
        !button ||
        !panel
    ) {

        return;

    }


    button.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            panel.classList.toggle(
                "show"
            );

        }
    );


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                panel.classList.remove(
                    "show"
                );

            }
        );

    }

}


/* =========================================================
   REFRESH BUTTON
========================================================= */

function initRefreshButton() {

    const button =
        document.getElementById(
            "refreshAnalyticsBtn"
        );


    if (!button) {

        return;

    }


    button.addEventListener(
        "click",
        () => {

            const original =
                button.innerHTML;


            button.innerHTML =
                "<span>↻</span> Refreshing...";


            button.disabled =
                true;


            setTimeout(
                () => {

                    button.innerHTML =
                        original;

                    button.disabled =
                        false;

                },
                700
            );

        }
    );

}


/* =========================================================
   ANIMATIONS
========================================================= */

function initAnimations() {

    const header =
        document.querySelector(
            ".analytics-page-header"
        );

    const statCards =
        document.querySelectorAll(
            ".analytics-stat-card"
        );

    const analyticsCards =
        document.querySelectorAll(
            ".analytics-card"
        );

    const insight =
        document.querySelector(
            ".analytics-insight-card"
        );


    /*
       IMPORTANT:
       Make everything visible first.
       This prevents the page from disappearing
       if GSAP is unavailable.
    */

    if (header) {

        header.style.opacity =
            "1";

    }


    statCards.forEach(
        card => {

            card.style.opacity =
                "1";

        }
    );


    analyticsCards.forEach(
        card => {

            card.style.opacity =
                "1";

        }
    );


    if (insight) {

        insight.style.opacity =
            "1";

    }


    /*
       If GSAP is not loaded,
       leave everything visible.
    */

    if (
        typeof gsap === "undefined"
    ) {

        return;

    }


    /* =====================================================
       HEADER
    ====================================================== */

    if (header) {

        gsap.fromTo(

            header,

            {
                y: 18,
                opacity: 0
            },

            {
                y: 0,
                opacity: 1,
                duration: .65,
                ease: "power2.out"
            }

        );

    }


    /* =====================================================
       STAT CARDS
    ====================================================== */

    if (
        statCards.length
    ) {

        gsap.fromTo(

            statCards,

            {
                y: 18,
                opacity: 0
            },

            {
                y: 0,
                opacity: 1,
                duration: .55,
                stagger: .08,
                delay: .1,
                ease: "power2.out"
            }

        );

    }


    /* =====================================================
       ANALYTICS CARDS
    ====================================================== */

    if (
        analyticsCards.length
    ) {

        gsap.fromTo(

            analyticsCards,

            {
                y: 18,
                opacity: 0
            },

            {
                y: 0,
                opacity: 1,
                duration: .6,
                stagger: .08,
                delay: .25,
                ease: "power2.out"
            }

        );

    }


    /* =====================================================
       INSIGHT
    ====================================================== */

    if (insight) {

        gsap.fromTo(

            insight,

            {
                y: 14,
                opacity: 0
            },

            {
                y: 0,
                opacity: 1,
                duration: .55,
                delay: .45,
                ease: "power2.out"
            }

        );

    }


    /* =====================================================
       BAR ANIMATION
    ====================================================== */

    const bars =
        document.querySelectorAll(
            ".growth-bar"
        );


    if (bars.length) {

        gsap.fromTo(

            bars,

            {
                scaleY: 0,
                transformOrigin:
                    "bottom center"
            },

            {
                scaleY: 1,
                duration: .65,
                stagger: .06,
                delay: .45,
                ease: "power2.out"
            }

        );

    }


    /* =====================================================
       PROGRESS BARS
    ====================================================== */

    const progressBars =
        document.querySelectorAll(
            ".category-progress span"
        );


    if (progressBars.length) {

        progressBars.forEach(
            bar => {

                const width =
                    bar.style.width;


                gsap.fromTo(

                    bar,

                    {
                        width: "0%"
                    },

                    {
                        width: width,
                        duration: .8,
                        delay: .55,
                        ease: "power2.out"
                    }

                );

            }
        );

    }

}