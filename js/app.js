// Inicialização
let scene, camera, renderer;

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Sol (Adicione texturas ou cores aqui)
    const geometry = new THREE.SphereGeometry(5, 32, 32);
    const texture = new THREE.TextureLoader().load('assets/textures/sun.jpg'); // Certifique-se do caminho
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const sun = new THREE.Mesh(geometry, material);
    scene.add(sun);

    // Ajuste a posição da câmera
    camera.position.z = 20;

    // Controle de órbita
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;

    // Animação
    animate();
}

// Animação contínua
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

init();


const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.screenSpacePanning = false;
controls.maxPolarAngle = Math.PI / 2;