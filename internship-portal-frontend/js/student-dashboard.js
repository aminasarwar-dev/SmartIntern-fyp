/* =========================================================
   SMARTINTERN STUDENT DASHBOARD
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadStudentData();

        initDashboardAnimations();

        initMobileSidebar();

        initNotifications();

        initDashboard3D();

        initCardTilt();

        initHeroParallax();

    }
);


/* =========================================================
   LOAD STUDENT DATA
   ========================================================= */

function loadStudentData() {

    const savedProfile =
        sessionStorage.getItem(
            "smartInternStudentProfile"
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
            profile.name ||
            profile.full_name ||
            profile.fullName ||
            "Student";


        const firstName =
            name.split(" ")[0];


        const initials =
            getInitials(name);


        const sidebarName =
            document.getElementById(
                "sidebarStudentName"
            );


        const topbarName =
            document.getElementById(
                "topbarStudentName"
            );


        const welcomeName =
            document.getElementById(
                "welcomeStudentName"
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
            "Could not load student profile."
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
   ========================================================= */

function initDashboardAnimations() {

    if (
        typeof gsap === "undefined"
    ) {

        return;

    }


    gsap.from(
        ".dashboard-topbar",
        {

            opacity: 0,

            y: -15,

            duration: .6,

            ease: "power3.out"

        }
    );


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


    /* Floating AI card */

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


    /* Crystal */

    gsap.to(
        ".visual-crystal",
        {

            rotation: "+=360",

            duration: 18,

            repeat: -1,

            ease: "none"

        }
    );


    /* Orbits */

    gsap.to(
        ".orbit-one",
        {

            rotation: "+=360",

            duration: 15,

            repeat: -1,

            ease: "none"

        }
    );


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


    /*
     * Notification opens when the notification
     * button is clicked.
     *
     * It does NOT close when the user clicks
     * somewhere else.
     */

    button.addEventListener(
        "click",
        (event) => {

            event.stopPropagation();

            panel.classList.add(
                "show"
            );

        }
    );


    /*
     * Notification closes ONLY
     * from the X button.
     */

    if (close) {

        close.addEventListener(
            "click",
            (event) => {

                event.stopPropagation();

                panel.classList.remove(
                    "show"
                );

            }
        );

    }

}


/* =========================================================
   THREE.JS DASHBOARD 3D
   ========================================================= */

function initDashboard3D() {

    const canvas =
        document.getElementById(
            "dashboard3D"
        );


    if (
        !canvas ||
        typeof THREE === "undefined"
    ) {

        return;

    }


    const scene =
        new THREE.Scene();


    const camera =
        new THREE.PerspectiveCamera(
            45,
            canvas.clientWidth /
                canvas.clientHeight,
            0.1,
            100
        );


    camera.position.z = 5;


    const renderer =
        new THREE.WebGLRenderer({

            canvas: canvas,

            alpha: true,

            antialias: true

        });


    renderer.setPixelRatio(
        Math.min(
            window.devicePixelRatio,
            2
        )
    );


    renderer.setSize(
        canvas.clientWidth,
        canvas.clientHeight,
        false
    );


    /* =====================================
       CRYSTAL
    ===================================== */

    const geometry =
        new THREE.IcosahedronGeometry(
            1.15,
            1
        );


    const material =
        new THREE.MeshPhysicalMaterial({

            color: 0xb38bd7,

            transparent: true,

            opacity: 0.78,

            roughness: 0.18,

            metalness: 0.05,

            transmission: 0.25,

            thickness: 0.8

        });


    const crystal =
        new THREE.Mesh(
            geometry,
            material
        );


    scene.add(
        crystal
    );


    /* =====================================
       INNER CRYSTAL
    ===================================== */

    const innerGeometry =
        new THREE.IcosahedronGeometry(
            0.72,
            1
        );


    const innerMaterial =
        new THREE.MeshBasicMaterial({

            color: 0xe8a8c7,

            transparent: true,

            opacity: 0.25,

            wireframe: true

        });


    const innerCrystal =
        new THREE.Mesh(
            innerGeometry,
            innerMaterial
        );


    scene.add(
        innerCrystal
    );


    /* =====================================
       LIGHTING
    ===================================== */

    const ambientLight =
        new THREE.AmbientLight(
            0xffffff,
            1.5
        );


    scene.add(
        ambientLight
    );


    const purpleLight =
        new THREE.PointLight(
            0xb38bd7,
            4,
            10
        );


    purpleLight.position.set(
        2,
        2,
        4
    );


    scene.add(
        purpleLight
    );


    const pinkLight =
        new THREE.PointLight(
            0xe8a8c7,
            3,
            8
        );


    pinkLight.position.set(
        -2,
        -1,
        3
    );


    scene.add(
        pinkLight
    );


    /* =====================================
       FLOATING PARTICLES
    ===================================== */

    const particleGeometry =
        new THREE.BufferGeometry();


    const particleCount = 100;


    const positions =
        new Float32Array(
            particleCount * 3
        );


    for (
        let i = 0;
        i < particleCount * 3;
        i++
    ) {

        positions[i] =
            (Math.random() - 0.5) * 7;

    }


    particleGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(
            positions,
            3
        )
    );


    const particleMaterial =
        new THREE.PointsMaterial({

            color: 0xcaa9df,

            size: 0.035,

            transparent: true,

            opacity: 0.65

        });


    const particles =
        new THREE.Points(
            particleGeometry,
            particleMaterial
        );


    scene.add(
        particles
    );


    /* =====================================
       MOUSE INTERACTION
    ===================================== */

    let mouseX = 0;

    let mouseY = 0;


    window.addEventListener(
        "mousemove",
        (event) => {

            mouseX =
                (
                    event.clientX /
                    window.innerWidth
                ) - 0.5;


            mouseY =
                (
                    event.clientY /
                    window.innerHeight
                ) - 0.5;

        }
    );


    /* =====================================
       ANIMATION
    ===================================== */

    function animate() {

        requestAnimationFrame(
            animate
        );


        crystal.rotation.x +=
            0.003;

        crystal.rotation.y +=
            0.006;


        innerCrystal.rotation.x -=
            0.004;

        innerCrystal.rotation.y -=
            0.008;


        particles.rotation.y +=
            0.0005;


        crystal.rotation.x +=
            (
                mouseY * 0.15 -
                crystal.rotation.x
            ) * 0.02;


        crystal.rotation.y +=
            (
                mouseX * 0.2 -
                crystal.rotation.y
            ) * 0.02;


        renderer.render(
            scene,
            camera
        );

    }


    animate();


    /* =====================================
       RESIZE
    ===================================== */

    window.addEventListener(
        "resize",
        () => {

            const width =
                canvas.clientWidth;


            const height =
                canvas.clientHeight;


            if (
                width === 0 ||
                height === 0
            ) {

                return;

            }


            camera.aspect =
                width / height;


            camera.updateProjectionMatrix();


            renderer.setSize(
                width,
                height,
                false
            );

        }
    );


    /* =====================================
       GSAP FLOATING
    ===================================== */

    if (
        typeof gsap !== "undefined"
    ) {

        gsap.to(
            crystal.scale,
            {

                x: 1.08,

                y: 1.08,

                z: 1.08,

                duration: 2.5,

                repeat: -1,

                yoyo: true,

                ease: "sine.inOut"

            }
        );

    }

}


/* =========================================================
   CARD 3D TILT
   ========================================================= */

function initCardTilt() {

    const cards =
        document.querySelectorAll(
            ".stat-card, .internship-card, .ai-match-card, .upcoming-interview"
        );


    cards.forEach(
        card => {

            card.addEventListener(
                "mousemove",
                (event) => {

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
                        (
                            (y - centerY) /
                            centerY
                        ) * -3;


                    const rotateY =
                        (
                            (x - centerX) /
                            centerX
                        ) * 3;


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
                        "perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0)";

                }
            );

        }
    );

}


/* =========================================================
   HERO PARALLAX
   ========================================================= */

function initHeroParallax() {

    const hero =
        document.querySelector(
            ".welcome-hero"
        );


    if (!hero) {

        return;

    }


    window.addEventListener(
        "mousemove",
        (event) => {

            const x =
                (
                    event.clientX /
                    window.innerWidth
                ) - 0.5;


            const y =
                (
                    event.clientY /
                    window.innerHeight
                ) - 0.5;


            if (
                typeof gsap !== "undefined"
            ) {

                gsap.to(
                    hero,
                    {

                        rotateY:
                            x * 1.5,

                        rotateX:
                            y * -1.5,

                        duration: 0.7,

                        ease: "power2.out",

                        transformPerspective:
                            1200

                    }
                );

            }

        }
    );


    hero.addEventListener(
        "mouseleave",
        () => {

            if (
                typeof gsap !== "undefined"
            ) {

                gsap.to(
                    hero,
                    {

                        rotateY: 0,

                        rotateX: 0,

                        duration: 0.8,

                        ease: "power3.out"

                    }
                );

            }

        }
    );

}