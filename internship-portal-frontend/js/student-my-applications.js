/* =========================================================
   SMARTINTERN — MY APPLICATIONS JS
   ========================================================= */


/* =========================================================
   ELEMENTS
   ========================================================= */

const sidebar =
    document.getElementById("dashboardSidebar");

const sidebarOverlay =
    document.getElementById("sidebarOverlay");

const mobileMenu =
    document.getElementById("mobileMenu");

const notificationButton =
    document.getElementById("notificationButton");

const notificationPanel =
    document.getElementById("notificationPanel");

const closeNotifications =
    document.getElementById("closeNotifications");

const logoutLink =
    document.getElementById("logoutLink");

const applicationList =
    document.getElementById("applicationsList");

const noApplications =
    document.getElementById("noApplications");

const filters =
    document.querySelectorAll(".application-filter");

const sortSelect =
    document.getElementById("sortApplications");


/* =========================================================
   MOBILE SIDEBAR
   ========================================================= */

if (mobileMenu) {

    mobileMenu.addEventListener("click", () => {

        sidebar.classList.toggle("open");

        sidebarOverlay.classList.toggle("show");

    });

}


if (sidebarOverlay) {

    sidebarOverlay.addEventListener("click", () => {

        sidebar.classList.remove("open");

        sidebarOverlay.classList.remove("show");

    });

}


/* =========================================================
   NOTIFICATIONS
   ========================================================= */

/* =========================================================
   NOTIFICATIONS
   ========================================================= */

if (notificationButton && notificationPanel) {

    notificationButton.addEventListener(
        "click",
        (event) => {

            event.stopPropagation();

            notificationPanel.style.display = "block";

        }
    );

}


if (closeNotifications && notificationPanel) {

    closeNotifications.addEventListener(
        "click",
        (event) => {

            event.stopPropagation();

            notificationPanel.style.display = "none";

        }
    );

}


/* =========================================================
   APPLICATION FILTERING
   ========================================================= */

let currentFilter = "all";


filters.forEach(filter => {

    filter.addEventListener("click", () => {

        filters.forEach(item => {

            item.classList.remove("active");

        });


        filter.classList.add("active");


        currentFilter =
            filter.dataset.filter;


        updateApplications();

    });

});


/* =========================================================
   SORTING
   ========================================================= */

if (sortSelect) {

    sortSelect.addEventListener("change", () => {

        updateApplications();

    });

}


/* =========================================================
   UPDATE APPLICATIONS
   ========================================================= */

function updateApplications() {

    const cards =
        Array.from(
            applicationList.querySelectorAll(
                ".application-card"
            )
        );


    let visibleCards =
        cards.filter(card => {

            if (currentFilter === "all") {

                return true;

            }


            return (
                card.dataset.status ===
                currentFilter
            );

        });


    /* Sort */

    const sortValue =
        sortSelect.value;


    if (sortValue === "old") {

        visibleCards.sort(
            (a, b) =>
                Number(b.dataset.order) -
                Number(a.dataset.order)
        );

    }


    if (sortValue === "recent") {

        visibleCards.sort(
            (a, b) =>
                Number(a.dataset.order) -
                Number(b.dataset.order)
        );

    }


    if (sortValue === "match") {

        visibleCards.sort(
            (a, b) =>
                Number(b.dataset.match) -
                Number(a.dataset.match)
        );

    }


    /* Hide all */

    cards.forEach(card => {

        card.style.display = "none";

    });


    /* Show selected */

    visibleCards.forEach(card => {

        card.style.display = "flex";


        if (typeof gsap !== "undefined") {

            gsap.fromTo(
                card,
                {
                    opacity: 0,
                    y: 10
                },
                {
                    opacity: 1,
                    y: 0,
                    duration: .35,
                    ease: "power2.out"
                }
            );

        }

    });


    /* Empty state */

    if (visibleCards.length === 0) {

        noApplications.style.display =
            "block";

    } else {

        noApplications.style.display =
            "none";

    }

}


/* =========================================================
   MATCH CIRCLE ANIMATION
   ========================================================= */

function animateMatchCircles() {

    const circles =
        document.querySelectorAll(
            ".circle-progress"
        );


    circles.forEach(circle => {

        const progress =
            Number(
                circle.dataset.progress
            );


        const circumference =
            2 * Math.PI * 17;


        const offset =
            circumference -
            (progress / 100) *
            circumference;


        circle.style.strokeDasharray =
            circumference;


        circle.style.strokeDashoffset =
            circumference;


        if (typeof gsap !== "undefined") {

            gsap.to(circle, {

                strokeDashoffset:
                    offset,

                duration:
                    1.4,

                ease:
                    "power2.out",

                delay:
                    .25

            });

        } else {

            circle.style.strokeDashoffset =
                offset;

        }

    });

}


/* =========================================================
   GSAP PAGE ANIMATION
   ========================================================= */

function pageAnimation() {

    if (typeof gsap === "undefined") {

        return;

    }


    const timeline =
        gsap.timeline();


    timeline.from(
        ".applications-hero-copy",
        {
            opacity: 0,
            x: -25,
            duration: .65,
            ease: "power2.out"
        }
    );


    timeline.from(
        ".applications-visual",
        {
            opacity: 0,
            scale: .88,
            duration: .7,
            ease: "back.out(1.5)"
        },
        "-=.45"
    );


    timeline.from(
        ".applications-toolbar",
        {
            opacity: 0,
            y: 15,
            duration: .45
        },
        "-=.35"
    );


    timeline.from(
        ".application-card",
        {
            opacity: 0,
            y: 18,
            stagger: .08,
            duration: .4,
            ease: "power2.out"
        },
        "-=.2"
    );


    gsap.to(
        ".application-document",
        {
            y: -8,
            rotate: 2,
            duration: 2.3,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        }
    );


    gsap.to(
        ".floating-status-card",
        {
            y: -7,
            duration: 2,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        }
    );


    gsap.to(
        ".application-glow",
        {
            scale: 1.12,
            opacity: .75,
            duration: 2.5,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        }
    );

}


/* =========================================================
   CARD HOVER
   ========================================================= */

function cardHover() {

    const cards =
        document.querySelectorAll(
            ".application-card"
        );


    cards.forEach(card => {

        card.addEventListener(
            "mouseenter",
            () => {

                if (
                    window.innerWidth > 850
                ) {

                    gsap.to(
                        card,
                        {
                            rotateX: 1,
                            y: -3,
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

                if (
                    window.innerWidth > 850
                ) {

                    gsap.to(
                        card,
                        {
                            rotateX: 0,
                            y: 0,
                            duration: .3,
                            ease: "power2.out"
                        }
                    );

                }

            }
        );

    });

}


/* =========================================================
   VIEW DETAILS
   ========================================================= */

document
    .querySelectorAll(".view-button")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                window.location.href =
                    "internship-detail.html";

            }
        );

    });


/* =========================================================
   START
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        pageAnimation();

        animateMatchCircles();

        cardHover();

    }
);