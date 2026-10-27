/* =========================================================
   SMARTINTERN — STUDENT PROFILE
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
   SIDEBAR LINKS
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
   SAVE PROFILE
   ========================================================= */

const saveProfile =
    document.getElementById("saveProfile");


/* Fields that are remembered (and reused by the Apply form) */

const PROFILE_FIELDS = [
    "fullName", "email", "phone", "location", "degree", "university",
    "graduationYear", "cgpa", "careerInterest", "experienceLevel", "about"
];

function fillProfileFields() {

    if (!window.SmartStudent) {
        return;
    }

    const details = window.SmartStudent.get();

    PROFILE_FIELDS.forEach(function (id) {

        const field = document.getElementById(id);

        if (field && details[id]) {
            field.value = details[id];
        }

    });

}

fillProfileFields();


if (saveProfile) {

    saveProfile.addEventListener(
        "click",
        function () {


            if (window.SmartStudent) {

                const values = {};

                PROFILE_FIELDS.forEach(function (id) {

                    const field = document.getElementById(id);

                    if (field) {
                        values[id] = field.value.trim();
                    }

                });

                window.SmartStudent.save(values);

            }


            const name =
                document.getElementById(
                    "fullName"
                ).value.trim();


            if (name !== "") {

                document.getElementById(
                    "sidebarStudentName"
                ).textContent = name;


                document.getElementById(
                    "topbarStudentName"
                ).textContent = name;


                document.querySelector(
                    ".profile-heading h2"
                ).textContent = name;

            }


            const message =
                document.createElement("span");

            message.className =
                "save-message";

            message.textContent =
                "Profile saved successfully";


            const saveArea =
                document.querySelector(
                    ".profile-save"
                );


            saveArea.insertBefore(
                message,
                saveProfile
            );


            setTimeout(
                function () {

                    message.remove();

                },
                2500
            );

        }
    );

}


/* =========================================================
   NOTIFICATION
   ========================================================= */

const notificationButton =
    document.getElementById(
        "notificationButton"
    );


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
                    document.createElement(
                        "div"
                    );

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
                            New AI Match
                        </strong>

                        <p>
                            You have a new internship
                            match based on your skills.
                        </p>

                    </div>

                    <div class="panel-notification">

                        <strong>
                            Application Update
                        </strong>

                        <p>
                            Your application status
                            has been updated.
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
   NOTIFICATION PANEL STYLE
   ========================================================= */

const notificationStyle =
    document.createElement("style");


notificationStyle.textContent = `

    .notification-panel {

        position: fixed;

        top: 88px;

        right: 38px;

        width: 320px;

        padding: 18px;

        border: 1px solid #eee5ed;

        border-radius: 17px;

        background: rgba(255,255,255,.96);

        backdrop-filter: blur(18px);

        box-shadow:
            0 20px 45px
            rgba(50,35,55,.12);

        z-index: 100;

        display: none;

    }


    .notification-panel.show {

        display: block;

    }


    .notification-panel-head {

        margin-bottom: 12px;

    }


    .notification-panel-head strong {

        font-family:
            "Playfair Display",
            Georgia,
            serif;

        font-size: 17px;

        font-weight: 500;

    }


    .panel-notification {

        padding: 11px 0;

        border-top:
            1px solid #f1eaf0;

    }


    .panel-notification strong {

        display: block;

        font-size: 9px;

    }


    .panel-notification p {

        margin: 4px 0 0;

        color: #8c818e;

        font-size: 8px;

        line-height: 1.5;

    }


    @media (max-width: 650px) {

        .notification-panel {

            left: 15px;

            right: 15px;

            width: auto;

        }

    }

`;


document.head.appendChild(
    notificationStyle
);