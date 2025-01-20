let scene, camera, renderer;
let planets = [];

const scale = 0.1; // Fator de escala para distâncias e tamanhos

const planetData = {
    mercury: { distance: 57.9, size: 0.4, texture: 'assets/textures/mercury.jpg', orbitTime: 88 },
    venus: { distance: 108.2, size: 0.95, texture: 'assets/textures/venus.jpg', orbitTime: 225 },
    earth: { distance: 149.6, size: 1, texture: 'assets/textures/earth.jpg', orbitTime: 365 },
    mars: { distance: 227.9, size: 0.8, texture: 'assets/textures/mars.jpg', orbitTime: 687 },
    jupiter: { distance: 778.3, size: 5, texture: 'assets/textures/jupiter.jpg', orbitTime: 4333 },
    saturn: { distance: 1429, size: 4.5, texture: 'assets/textures/saturn.jpg', orbitTime: 10759 },
    uranus: { distance: 2877, size: 3.5, texture: 'assets/textures/uranus.jpg', orbitTime: 30687 },
    neptune: { distance: 4503, size: 3, texture: 'assets/textures/neptune.jpg', orbitTime: 60190 }
};

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Adicionar o fundo com duas texturas
    const textureLoader = new THREE.TextureLoader();
    const backgroundTexture1 = textureLoader.load('assets/textures/space-background1.jpg'); // Primeira textura
    const backgroundTexture2 = textureLoader.load('assets/textures/space-background2.jpg'); // Segunda textura

    // Criar o fundo com duas camadas
    createBackgroundLayer(backgroundTexture1, 0);
    createBackgroundLayer(backgroundTexture2, 100);

    // Sol
    const sunGeometry = new THREE.SphereGeometry(5, 32, 32); // Tamanho do sol
    const sunTexture = new THREE.TextureLoader().load('assets/textures/sun.jpg');
    const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);

    // Criar os planetas
    for (let planetName in planetData) {
        let planet = createPlanet(planetName, planetData[planetName]);
        planets.push(planet);
        scene.add(planet.mesh);
    }

    // Adicionar os anéis de Saturno
    addSaturnRings();

    // Terra e Lua
    const earthOrbit = 14.96; // Terra a 149,6 milhões de km
    const moonOrbit = 0.38; // Distância Lua da Terra: 0.38 milhões de km
    addMoon(earthOrbit, moonOrbit);

    // Ajuste a posição da câmera
    camera.position.z = 30;

    // Controle de órbita
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;

    // Animação
    animate();
}

function createPlanet(name, data) {
    const geometry = new THREE.SphereGeometry(data.size, 32, 32);
    const texture = new THREE.TextureLoader().load(data.texture);
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const mesh = new THREE.Mesh(geometry, material);

    // Posicionar o planeta na órbita
    const distance = data.distance / 10; // Ajuste de escala
    mesh.position.x = distance;

    // Retornar os dados do planeta
    return {
        name,
        mesh,
        orbitTime: data.orbitTime, // Tempo orbital em dias
        angle: 0, // Ângulo atual de órbita
        distance: distance
    };
}

function addSaturnRings() {
    const saturn = scene.children.find(child => child.position.x === planetData.saturn.distance / 10);
    if (saturn) {
        // Criar os anéis de Saturno
        const ringGeometry = new THREE.TorusGeometry(6, 1, 16, 100); // Tamanho e espessura dos anéis
        const ringTexture = new THREE.TextureLoader().load('assets/textures/saturn-rings.jpg'); // Textura dos anéis
        const ringMaterial = new THREE.MeshBasicMaterial({ map: ringTexture, side: THREE.DoubleSide });
        const rings = new THREE.Mesh(ringGeometry, ringMaterial);

        // Posicionar os anéis ao redor de Saturno
        rings.rotation.x = Math.PI / 2; // Girar para alinhar com o eixo do planeta
        saturn.add(rings); // Adicionar os anéis como filho de Saturno
    }
}

function addMoon(earthDistance, moonDistance) {
    const earth = scene.children.find(child => child.position.x === earthDistance / 10);
    if (earth) {
        const moonGeometry = new THREE.SphereGeometry(0.1, 32, 32);
        const moonMaterial = new THREE.MeshBasicMaterial({ color: 0xAAAAAA });
        const moon = new THREE.Mesh(moonGeometry, moonMaterial);

        // A Lua orbita a Terra
        moon.position.x = earthDistance + moonDistance;
        earth.add(moon); // A Lua vai ser filha da Terra, então orbita com ela
    }
}

// Função para criar camadas de fundo
function createBackgroundLayer(texture, distance) {
    const geometry = new THREE.PlaneGeometry(5000, 5000);
    const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide });
    const plane = new THREE.Mesh(geometry, material);
    plane.position.z = distance;
    scene.add(plane);
}

// Função de animação contínua
function animate() {
    requestAnimationFrame(animate);

    // Atualizar a órbita de cada planeta
    planets.forEach(planet => {
        planet.angle += (2 * Math.PI) / (planet.orbitTime * 365); // Velocidade proporcional ao tempo real
        planet.mesh.position.x = planet.distance * Math.cos(planet.angle);
        planet.mesh.position.z = planet.distance * Math.sin(planet.angle);
    });

    // Atualizar a órbita da Lua
    const earth = scene.children.find(child => child.position.x === planetData.earth.distance / 10);
    if (earth) {
        earth.children.forEach(moon => {
            moon.rotation.y += 0.01; // A Lua gira em torno de seu próprio eixo
        });
    }

    renderer.render(scene, camera);
}

init();