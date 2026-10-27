/* =========================================================
   SMARTINTERN — AI SKILL GAP
   ========================================================= */


/* =========================================================
   MOBILE SIDEBAR
   ========================================================= */

const mobileMenu =
    document.getElementById("mobileMenu");

const dashboardSidebar =
    document.getElementById("dashboardSidebar");

const sidebarOverlay =
    document.getElementById("sidebarOverlay");


if (mobileMenu) {

    mobileMenu.addEventListener(
        "click",
        function () {

            dashboardSidebar.classList.add("open");

            sidebarOverlay.classList.add("show");

        }
    );

}


if (sidebarOverlay) {

    sidebarOverlay.addEventListener(
        "click",
        function () {

            dashboardSidebar.classList.remove("open");

            sidebarOverlay.classList.remove("show");

        }
    );

}


/* =========================================================
   CLOSE SIDEBAR WHEN LINK IS CLICKED
   ========================================================= */

const sidebarLinks =
    document.querySelectorAll(".sidebar-link");


sidebarLinks.forEach(function (link) {

    link.addEventListener(
        "click",
        function () {

            dashboardSidebar.classList.remove("open");

            sidebarOverlay.classList.remove("show");

        }
    );

});


/* =========================================================
   LOGOUT
   ========================================================= */

if (logoutLink) {

    logoutLink.addEventListener(
        "click",
        async event => {

            event.preventDefault();

            const confirmLogout =
                await SmartDialog.confirm({
                    title: "Log out?",
                    message: "Are you sure you want to log out?",
                    confirmText: "Yes, log out"
                });

            if (confirmLogout) {

                window.location.href =
                    "login.html";

            }

        }
    );

}


/* =========================================================
   NOTIFICATION PANEL
   ========================================================= */

const notificationButton =
    document.getElementById("notificationButton");


if (notificationButton) {

    notificationButton.addEventListener(
        "click",
        function () {

            let panel =
                document.querySelector(
                    ".notification-panel"
                );


            if (!panel) {

                panel =
                    document.createElement("div");

                panel.className =
                    "notification-panel";

                panel.innerHTML = `

                    <div class="notification-panel-head">

                        <strong>
                            Notifications
                        </strong>

                    </div>


                    <div class="panel-notification">

                        <strong>
                            AI Skill Analysis
                        </strong>

                        <p>
                            Your latest skill analysis
                            is ready to review.
                        </p>

                    </div>


                    <div class="panel-notification">

                        <strong>
                            New Internship Match
                        </strong>

                        <p>
                            A new internship matches
                            your current skills.
                        </p>

                    </div>


                    <div class="panel-notification">

                        <strong>
                            Resume Update
                        </strong>

                        <p>
                            Keep your resume updated
                            for better AI matching.
                        </p>

                    </div>

                `;

                document.body.appendChild(panel);

            }


            panel.classList.toggle("show");

        }
    );

}


/* =========================================================
   GSAP PAGE ANIMATION
   ========================================================= */

if (typeof gsap !== "undefined") {

    gsap.from(
        ".skill-intro",
        {
            opacity: 0,
            y: 18,
            duration: 0.7,
            ease: "power2.out"
        }
    );


    gsap.from(
        ".summary-card",
        {
            opacity: 0,
            y: 15,
            duration: 0.5,
            stagger: 0.1,
            delay: 0.2,
            ease: "power2.out"
        }
    );


    gsap.from(
        ".skill-card",
        {
            opacity: 0,
            y: 18,
            duration: 0.6,
            stagger: 0.12,
            delay: 0.35,
            ease: "power2.out"
        }
    );


    gsap.from(
        ".target-card",
        {
            opacity: 0,
            y: 15,
            duration: 0.6,
            delay: 0.55,
            ease: "power2.out"
        }
    );


    gsap.from(
        ".skill-action",
        {
            opacity: 0,
            y: 15,
            duration: 0.6,
            delay: 0.65,
            ease: "power2.out"
        }
    );


    /* AI CORE FLOAT */

    gsap.to(
        ".visual-core",
        {
            y: -8,
            rotate: 4,
            duration: 2.4,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        }
    );


    /* AI BADGE FLOAT */

    gsap.to(
        ".visual-badge",
        {
            y: -5,
            duration: 2,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        }
    );

}


/* =========================================================
   CLOSE NOTIFICATION WHEN CLICKING OUTSIDE
   ========================================================= */

document.addEventListener(
    "click",
    function (event) {

        const panel =
            document.querySelector(
                ".notification-panel"
            );


        if (
            panel &&
            panel.classList.contains("show") &&
            !panel.contains(event.target) &&
            !notificationButton.contains(event.target)
        ) {

            panel.classList.remove("show");

        }

    }
);