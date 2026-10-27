/* =====================================================
   SMARTINTERN — THREE.JS HERO
   Based on the supplied reference main.js
===================================================== */
(function () {
    const canvas = document.getElementById("three-canvas");
    if (!canvas || typeof THREE === "undefined") return;

    const scene = new THREE.Scene();

    const getSize = () => ({
        width: canvas.clientWidth || 600,
        height: canvas.clientHeight || 600
    });

    let size = getSize();

    const camera = new THREE.PerspectiveCamera(
        45,
        size.width / size.height,
        0.1,
        1000
    );

    camera.position.z = 6;

    const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(size.width, size.height, false);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xd8a8e6, 4, 100);
    pointLight.position.set(3, 3, 5);
    scene.add(pointLight);

    const geometry = new THREE.IcosahedronGeometry(1.35, 2);

    const material = new THREE.MeshPhysicalMaterial({
        color: 0xd9bce4,
        roughness: 0.25,
        metalness: 0.1,
        transparent: true,
        opacity: 0.85,
        transmission: 0.25
    });

    const mainObject = new THREE.Mesh(geometry, material);
    scene.add(mainObject);

    const innerGeometry = new THREE.IcosahedronGeometry(0.85, 1);

    const innerMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true,
        transparent: true,
        opacity: 0.45
    });

    const innerObject = new THREE.Mesh(innerGeometry, innerMaterial);
    scene.add(innerObject);

    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 120;
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < positions.length; i++) {
        positions[i] = (Math.random() - 0.5) * 9;
    }

    particleGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
    );

    const particleMaterial = new THREE.PointsMaterial({
        color: 0xb88acb,
        size: 0.035,
        transparent: true,
        opacity: 0.7
    });

    const particles = new THREE.Points(
        particleGeometry,
        particleMaterial
    );

    scene.add(particles);

    const orbitGeometry = new THREE.TorusGeometry(
        1.8,
        0.015,
        16,
        100
    );

    const orbitMaterial = new THREE.MeshBasicMaterial({
        color: 0xc9a8d5,
        transparent: true,
        opacity: 0.45
    });

    const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
    orbit.rotation.x = Math.PI / 2.7;
    scene.add(orbit);

    let mouseX = 0;
    let mouseY = 0;

    window.addEventListener("mousemove", (event) => {
        mouseX = event.clientX / window.innerWidth - 0.5;
        mouseY = event.clientY / window.innerHeight - 0.5;
    });

    function animate() {
        requestAnimationFrame(animate);

        mainObject.rotation.x += 0.003;
        mainObject.rotation.y += 0.006;

        innerObject.rotation.x -= 0.002;
        innerObject.rotation.y -= 0.004;

        orbit.rotation.z += 0.002;
        particles.rotation.y += 0.0008;

        mainObject.position.x +=
            (mouseX * 0.5 - mainObject.position.x) * 0.02;

        mainObject.position.y +=
            (-mouseY * 0.5 - mainObject.position.y) * 0.02;

        renderer.render(scene, camera);
    }

    animate();

    window.addEventListener("resize", () => {
        size = getSize();
        camera.aspect = size.width / size.height;
        camera.updateProjectionMatrix();
        renderer.setSize(size.width, size.height, false);
    });
})();
