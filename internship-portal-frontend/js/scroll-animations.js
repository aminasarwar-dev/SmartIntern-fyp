/* =====================================================
   SMARTINTERN — GSAP / SCROLL ANIMATIONS
===================================================== */
(function () {
    if (typeof gsap === "undefined") return;

    gsap.from(".navbar", {
        y: -100,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
    });

    gsap.from(".hero-content > *", {
        y: 35,
        opacity: 0,
        duration: 0.9,
        stagger: 0.12,
        delay: 0.3,
        ease: "power3.out"
    });

    gsap.from(".floating-card", {
        scale: 0.7,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        delay: 0.7,
        ease: "back.out(1.5)"
    });

    gsap.to(".card-one", {
        y: -12,
        duration: 2.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
    });

    gsap.to(".card-two", {
        y: 15,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
    });

    gsap.to(".card-three", {
        y: -10,
        duration: 2.8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
    });

    gsap.to(".about-center", {
        rotation: 8,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
    });

    gsap.to(".orbit-one", {
        rotation: 360,
        duration: 20,
        repeat: -1,
        ease: "none"
    });

    gsap.to(".orbit-two", {
        rotation: -360,
        duration: 14,
        repeat: -1,
        ease: "none"
    });

    // Subtle reveal for the lower landing sections.
    gsap.utils.toArray(".step-card, .about-content, .ai-content, .ai-demo, .stat, .cta-section").forEach((el) => {
        gsap.from(el, {
            y: 35,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out",
        });
    });
})();
