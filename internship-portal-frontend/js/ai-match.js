document.addEventListener("DOMContentLoaded", () => {

    loadStudentData();

    initAnimations();

    initMobileSidebar();

    initLogout();

    initNotification();

});



/* ==========================================================
   LOAD STUDENT DATA
   ========================================================== */

function loadStudentData() {

    const storedProfile =
        sessionStorage.getItem(
            "smartInternStudentProfile"
        );


    if (!storedProfile) {
        return;
    }


    try {

        const profile =
            JSON.parse(storedProfile);


        const fullName =
            profile.fullName ||
            profile.name ||
            "Student";


        const initials =
            fullName
                .trim()
                .split(/\s+/)
                .map(
                    name =>
                        name.charAt(0)
                )
                .join("")
                .substring(0, 2)
                .toUpperCase();


        const sidebarName =
            document.getElementById(
                "sidebarStudentName"
            );


        const topbarName =
            document.getElementById(
                "topbarStudentName"
            );


        const sidebarAvatar =
            document.querySelector(
                ".sidebar-avatar"
            );


        const topbarAvatar =
            document.getElementById(
                "topbarAvatar"
            );


        if (sidebarName) {

            sidebarName.textContent =
                fullName;

        }


        if (topbarName) {

            topbarName.textContent =
                fullName;

        }


        if (sidebarAvatar) {

            sidebarAvatar.textContent =
                initials;

        }


        if (topbarAvatar) {

            topbarAvatar.textContent =
                initials;

        }


    } catch (error) {

        console.error(
            "Unable to load student profile:",
            error
        );

    }

}



/* ==========================================================
   GSAP ANIMATIONS
   ========================================================== */

function initAnimations() {

    if (
        typeof gsap === "undefined"
    ) {
        return;
    }


    const timeline =
        gsap.timeline({
            defaults: {
                ease: "power2.out"
            }
        });


    timeline.from(
        ".match-hero-copy",
        {
            y: 25,
            opacity: 0,
            duration: .7
        }
    );


    timeline.from(
        ".match-hero-visual",
        {
            scale: .8,
            opacity: 0,
            duration: .7
        },
        "-=.45"
    );


    timeline.from(
        ".match-summary-card",
        {
            y: 20,
            opacity: 0,
            duration: .45,
            stagger: .1
        },
        "-=.3"
    );


    timeline.from(
        ".top-matches-card",
        {
            y: 22,
            opacity: 0,
            duration: .55
        },
        "-=.25"
    );


    timeline.from(
        ".match-insight-card",
        {
            y: 22,
            opacity: 0,
            duration: .55
        },
        "-=.4"
    );


    timeline.from(
        ".match-explanation",
        {
            y: 18,
            opacity: 0,
            duration: .5
        },
        "-=.25"
    );


    /* Floating crystal */

    gsap.to(
        ".match-crystal",
        {
            y: -8,
            rotation: 3,
            duration: 2.2,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        }
    );


    /* AI badge */

    gsap.to(
        ".match-ai-badge",
        {
            y: -5,
            duration: 1.8,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        }
    );


    /* Orbit */

    gsap.to(
        ".orbit-one",
        {
            rotation: 360,
            duration: 14,
            repeat: -1,
            ease: "none"
        }
    );


    gsap.to(
        ".orbit-two",
        {
            rotation: -360,
            duration: 18,
            repeat: -1,
            ease: "none"
        }
    );


    gsap.to(
        ".orbit-three",
        {
            rotation: 360,
            duration: 22,
            repeat: -1,
            ease: "none"
        }
    );


    /* Percentage breathing */

    gsap.to(
        ".percentage-circle",
        {
            scale: 1.035,
            duration: 1.5,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        }
    );

}



/* ==========================================================
   MOBILE SIDEBAR
   ========================================================== */

function initMobileSidebar() {

    const menuButton =
        document.getElementById(
            "mobileMenu"
        );


    const sidebar =
        document.getElementById(
            "dashboardSidebar"
        );


    const overlay =
        document.getElementById(
            "sidebarOverlay"
        );


    if (
        !menuButton ||
        !sidebar ||
        !overlay
    ) {
        return;
    }


    menuButton.addEventListener(
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

}



/* ==========================================================
   LOGOUT
   ========================================================== */

function initLogout() {

    const logoutLink =
        document.getElementById(
            "logoutLink"
        );


    if (!logoutLink) {
        return;
    }


    logoutLink.addEventListener(
        "click",
        event => {

            event.preventDefault();


            sessionStorage.removeItem(
                "smartInternToken"
            );


            sessionStorage.removeItem(
                "smartInternLogin"
            );


            sessionStorage.removeItem(
                "smartInternRole"
            );
        if (window.SmartInternSession) { window.SmartInternSession.clear(); }


            window.location.href =
                "login.html";

        }
    );

}



/* ==========================================================
   NOTIFICATION
   ========================================================== */

function initNotification() {

    const notificationButton =
        document.getElementById(
            "notificationButton"
        );


    if (!notificationButton) {
        return;
    }


    notificationButton.addEventListener(
        "click",
        () => {

            notificationButton.classList.toggle(
                "active"
            );

        }
    );

}