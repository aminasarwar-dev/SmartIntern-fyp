/* =========================================================
   SMARTINTERN ADMIN — SETTINGS
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       MOBILE SIDEBAR
    ====================================================== */

    const mobileMenu =
        document.getElementById("mobileMenu");

    const sidebar =
        document.getElementById("dashboardSidebar");

    const sidebarOverlay =
        document.getElementById("sidebarOverlay");


    function openSidebar() {
        if (!sidebar || !sidebarOverlay) return;

        sidebar.classList.add("open");
        sidebarOverlay.classList.add("show");
    }


    function closeSidebar() {
        if (!sidebar || !sidebarOverlay) return;

        sidebar.classList.remove("open");
        sidebarOverlay.classList.remove("show");
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
       Opens with button.
       Closes ONLY with X.
       No outside-click closing.
    ====================================================== */

    const notificationButton =
        document.getElementById("notificationButton");

    const notificationPanel =
        document.getElementById("notificationPanel");

    const notificationClose =
        document.getElementById("notificationClose");


    if (notificationButton && notificationPanel) {

        notificationButton.addEventListener(
            "click",
            (event) => {

                event.stopPropagation();

                notificationPanel.classList.toggle("show");
            }
        );
    }


    if (notificationClose && notificationPanel) {

        notificationClose.addEventListener(
            "click",
            () => {

                notificationPanel.classList.remove(
                    "show"
                );
            }
        );
    }


    /* =====================================================
       SETTINGS MENU
    ====================================================== */

    const menuItems =
        document.querySelectorAll(
            ".settings-menu-item"
        );

    const settingsSections =
        document.querySelectorAll(
            ".settings-section"
        );


    menuItems.forEach((item) => {

        item.addEventListener(
            "click",
            () => {

                const targetId =
                    item.dataset.section;

                if (!targetId) return;


                menuItems.forEach((menuItem) => {
                    menuItem.classList.remove(
                        "active"
                    );
                });


                settingsSections.forEach(
                    (section) => {
                        section.classList.remove(
                            "active"
                        );
                    }
                );


                item.classList.add("active");


                const targetSection =
                    document.getElementById(
                        targetId
                    );


                if (targetSection) {

                    targetSection.classList.add(
                        "active"
                    );


                    if (
                        typeof gsap !==
                        "undefined"
                    ) {

                        gsap.fromTo(
                            targetSection,
                            {
                                opacity: 0,
                                y: 8
                            },
                            {
                                opacity: 1,
                                y: 0,
                                duration: .28,
                                ease: "power2.out"
                            }
                        );
                    }
                }
            }
        );

    });


    /* =====================================================
       SAVE ACCOUNT
    ====================================================== */

    const saveAccountBtn =
        document.getElementById(
            "saveAccountBtn"
        );


    if (saveAccountBtn) {

        saveAccountBtn.addEventListener(
            "click",
            () => {

                const name =
                    document.getElementById(
                        "adminName"
                    )?.value.trim();

                const email =
                    document.getElementById(
                        "adminEmail"
                    )?.value.trim();


                if (!name || !email) {

                    alert(
                        "Please complete the required account information."
                    );

                    return;
                }


                alert(
                    "Account settings saved successfully."
                );
            }
        );
    }


    /* =====================================================
       CHANGE AVATAR
    ====================================================== */

    const changeAvatarBtn =
        document.getElementById(
            "changeAvatarBtn"
        );


    if (changeAvatarBtn) {

        changeAvatarBtn.addEventListener(
            "click",
            () => {

                alert(
                    "Profile image update will be connected to the backend later."
                );
            }
        );
    }


    /* =====================================================
       UPDATE PASSWORD
    ====================================================== */

    const updatePasswordBtn =
        document.getElementById(
            "updatePasswordBtn"
        );


    if (updatePasswordBtn) {

        updatePasswordBtn.addEventListener(
            "click",
            () => {

                const currentPassword =
                    document.getElementById(
                        "currentPassword"
                    )?.value;

                const newPassword =
                    document.getElementById(
                        "newPassword"
                    )?.value;

                const confirmPassword =
                    document.getElementById(
                        "confirmPassword"
                    )?.value;


                if (
                    !currentPassword ||
                    !newPassword ||
                    !confirmPassword
                ) {

                    alert(
                        "Please fill in all password fields."
                    );

                    return;
                }


                if (
                    newPassword !==
                    confirmPassword
                ) {

                    alert(
                        "New password and confirm password do not match."
                    );

                    return;
                }


                if (newPassword.length < 6) {

                    alert(
                        "Password must contain at least 6 characters."
                    );

                    return;
                }


                alert(
                    "Password updated successfully."
                );


                document.getElementById(
                    "currentPassword"
                ).value = "";

                document.getElementById(
                    "newPassword"
                ).value = "";

                document.getElementById(
                    "confirmPassword"
                ).value = "";
            }
        );
    }


    /* =====================================================
       PLATFORM SAVE
    ====================================================== */

    const savePlatformBtn =
        document.getElementById(
            "savePlatformBtn"
        );


    if (savePlatformBtn) {

        savePlatformBtn.addEventListener(
            "click",
            () => {

                alert(
                    "Platform preferences saved successfully."
                );
            }
        );
    }


    /* =====================================================
       TOGGLE FEEDBACK
    ====================================================== */

    const settingToggles =
        document.querySelectorAll(
            ".toggle input"
        );


    settingToggles.forEach((toggle) => {

        toggle.addEventListener(
            "change",
            () => {

                const settingName =
                    toggle.dataset.setting ||
                    "setting";

                console.log(
                    `${settingName}: ${toggle.checked}`
                );
            }
        );

    });


    /* =====================================================
       GSAP PAGE ANIMATION
       Content remains visible even if GSAP fails.
    ====================================================== */

    if (typeof gsap !== "undefined") {

        const intro =
            document.querySelector(
                ".settings-intro"
            );

        const menu =
            document.querySelector(
                ".settings-menu"
            );

        const activeCard =
            document.querySelector(
                ".settings-section.active"
            );


        if (intro) {

            gsap.fromTo(
                intro,
                {
                    opacity: 0,
                    y: 12
                },
                {
                    opacity: 1,
                    y: 0,
                    duration: .55,
                    ease: "power2.out"
                }
            );
        }


        if (menu) {

            gsap.fromTo(
                menu,
                {
                    opacity: 0,
                    x: -10
                },
                {
                    opacity: 1,
                    x: 0,
                    duration: .5,
                    delay: .08,
                    ease: "power2.out"
                }
            );
        }


        if (activeCard) {

            gsap.fromTo(
                activeCard,
                {
                    opacity: 0,
                    y: 12
                },
                {
                    opacity: 1,
                    y: 0,
                    duration: .55,
                    delay: .12,
                    ease: "power2.out"
                }
            );
        }
    }

});