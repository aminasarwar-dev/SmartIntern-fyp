/* =========================================================
   SMARTINTERN COMPANY DASHBOARD
   Same behaviour/animation as Student Dashboard
   ========================================================= */


document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadCompanyData();

        initDashboardAnimations();

        initMobileSidebar();

        initNotifications();

        initLogout();

        initCardTilt();

    }
);



/* =========================================================
   LOAD COMPANY DATA
   ========================================================= */

function loadCompanyData() {

    const savedProfile =
        sessionStorage.getItem(
            "smartInternCompanyProfile"
        ) ||
        sessionStorage.getItem(
            "user_data"
        );


    if (!savedProfile) {

        return;

    }


    try {

        const profile =
            JSON.parse(savedProfile);


        const name =
            profile.companyName ||
            profile.company_name ||
            profile.name ||
            "Company";


        const firstName =
            name.split(" ")[0];


        const initials =
            getInitials(name);


        const sidebarName =
            document.getElementById(
                "sidebarCompanyName"
            );


        const topbarName =
            document.getElementById(
                "topbarCompanyName"
            );


        const welcomeName =
            document.getElementById(
                "welcomeCompanyName"
            );


        const sidebarAvatar =
            document.getElementById(
                "sidebarCompanyAvatar"
            );


        const topbarAvatar =
            document.getElementById(
                "topbarCompanyAvatar"
            );


        if (sidebarName) {

            sidebarName.textContent =
                name;

        }


        if (topbarName) {

            topbarName.textContent =
                name;

        }


        if (welcomeName) {

            welcomeName.textContent =
                firstName + ".";

        }


        if (sidebarAvatar) {

            sidebarAvatar.textContent =
                initials;

        }


        if (topbarAvatar) {

            topbarAvatar.textContent =
                initials;

        }

    }
    catch (error) {

        console.log(
            "Could not load company profile."
        );

    }

}



/* =========================================================
   INITIALS
   ========================================================= */

function getInitials(name) {

    return name

        .split(" ")

        .filter(Boolean)

        .slice(0, 2)

        .map(
            word =>
                word
                    .charAt(0)
                    .toUpperCase()
        )

        .join("");

}



/* =========================================================
   GSAP DASHBOARD ANIMATIONS
   SAME TIMING STYLE AS STUDENT
   ========================================================= */

function initDashboardAnimations() {

    if (
        typeof gsap === "undefined"
    ) {

        return;

    }


    /* TOPBAR */

    gsap.from(
        ".dashboard-topbar",
        {

            opacity: 0,

            y: -15,

            duration: .6,

            ease: "power3.out"

        }
    );



    /* WELCOME */

    gsap.from(
        ".dashboard-welcome",
        {

            opacity: 0,

            y: 25,

            scale: .98,

            duration: .7,

            delay: .1,

            ease: "power3.out"

        }
    );



    /* PROFILE */

    gsap.from(
        ".profile-progress-card",
        {

            opacity: 0,

            y: 18,

            duration: .5,

            delay: .25,

            ease: "power3.out"

        }
    );



    /* STATS */

    gsap.from(
        ".stat-card",
        {

            opacity: 0,

            y: 18,

            duration: .45,

            stagger: .07,

            delay: .3,

            ease: "power3.out"

        }
    );



    /* INTERNSHIPS */

    gsap.from(
        ".internship-card",
        {

            opacity: 0,

            x: -18,

            duration: .5,

            stagger: .1,

            delay: .4,

            ease: "power3.out"

        }
    );



    /* RIGHT COLUMN */

    gsap.from(
        ".ai-match-card, .upcoming-card",
        {

            opacity: 0,

            x: 18,

            duration: .55,

            stagger: .1,

            delay: .45,

            ease: "power3.out"

        }
    );



    /* BOTTOM */

    gsap.from(
        ".applications-card, .notifications-card",
        {

            opacity: 0,

            y: 20,

            duration: .5,

            stagger: .1,

            delay: .55,

            ease: "power3.out"

        }
    );



    /* PROFILE CARD */

    gsap.from(
        ".resume-dashboard-card",
        {

            opacity: 0,

            y: 20,

            duration: .5,

            delay: .65,

            ease: "power3.out"

        }
    );



    /* =====================================================
       FLOATING AI MATCH CARD
       ===================================================== */

    gsap.to(
        ".floating-match-card",
        {

            y: -8,

            duration: 2.3,

            repeat: -1,

            yoyo: true,

            ease: "sine.inOut"

        }
    );



    /* =====================================================
       CRYSTAL
       ===================================================== */

    gsap.to(
        ".visual-crystal",
        {

            rotation: "+=360",

            duration: 18,

            repeat: -1,

            ease: "none"

        }
    );



    /* =====================================================
       ORBIT 1
       ===================================================== */

    gsap.to(
        ".orbit-one",
        {

            rotation: "+=360",

            duration: 15,

            repeat: -1,

            ease: "none"

        }
    );



    /* =====================================================
       ORBIT 2
       ===================================================== */

    gsap.to(
        ".orbit-two",
        {

            rotation: "-=360",

            duration: 20,

            repeat: -1,

            ease: "none"

        }
    );

}



/* =========================================================
   MOBILE SIDEBAR
   ========================================================= */

function initMobileSidebar() {

    const menu =
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
        !menu ||
        !sidebar ||
        !overlay
    ) {

        return;

    }


    function toggleSidebar() {

        sidebar.classList.toggle(
            "open"
        );


        overlay.classList.toggle(
            "show"
        );

    }


    menu.addEventListener(
        "click",
        toggleSidebar
    );


    overlay.addEventListener(
        "click",
        toggleSidebar
    );


    document
        .querySelectorAll(
            ".sidebar-link"
        )
        .forEach(
            link => {

                link.addEventListener(
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
        );

}



/* =========================================================
   NOTIFICATIONS
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


    const close =
        document.getElementById(
            "closeNotifications"
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


    if (close) {

        close.addEventListener(
            "click",
            () => {

                panel.classList.remove(
                    "show"
                );

            }
        );

    }


    document.addEventListener(
        "click",
        event => {

            if (

                !panel.contains(
                    event.target
                )

                &&

                !button.contains(
                    event.target
                )

            ) {

                panel.classList.remove(
                    "show"
                );

            }

        }
    );

}



/* =========================================================
   LOGOUT
   ========================================================= */

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


            /*
             * Database account delete nahi hota.
             * Sirf current session clear hoti hai.
             */

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



/* =========================================================
   CARD 3D TILT
   SAME AS STUDENT DASHBOARD
   ========================================================= */

function initCardTilt() {

    const cards =
        document.querySelectorAll(
            ".stat-card, " +
            ".internship-card, " +
            ".ai-match-card, " +
            ".upcoming-card"
        );


    cards.forEach(
        card => {


            card.addEventListener(
                "mousemove",
                event => {


                    const rect =
                        card.getBoundingClientRect();


                    const x =
                        event.clientX -
                        rect.left;


                    const y =
                        event.clientY -
                        rect.top;


                    const centerX =
                        rect.width / 2;


                    const centerY =
                        rect.height / 2;


                    const rotateX =
                        ((y - centerY) /
                            centerY) * -3;


                    const rotateY =
                        ((x - centerX) /
                            centerX) * 3;


                    card.style.transform =
                        `perspective(900px)
                         rotateX(${rotateX}deg)
                         rotateY(${rotateY}deg)
                         translateY(-4px)`;

                }
            );



            card.addEventListener(
                "mouseleave",
                () => {

                    card.style.transform =
                        "perspective(900px) " +
                        "rotateX(0deg) " +
                        "rotateY(0deg) " +
                        "translateY(0)";

                }
            );


        }
    );

}