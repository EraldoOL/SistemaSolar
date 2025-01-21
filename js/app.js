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

function createBackgroundLayer(texture, distance) {
    const geometry = new THREE.SphereGeometry(5000, 32, 32); // Usar uma esfera ao invés de plano
    const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide });
    const sphere = new THREE.Mesh(geometry, material);

    // Posicionar a esfera de fundo muito atrás, para não interferir nos planetas
    sphere.position.set(0, 0, -1000); // Colocar no fundo distante da cena
    scene.add(sphere);
}

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Adicionar o fundo com duas texturas
    const textureLoader = new THREE.TextureLoader();
    const backgroundTexture1 = textureLoader.load('assets/textures/stars.jpg'); // Primeira textura
    const backgroundTexture2 = textureLoader.load('assets/textures/stars_milky_way.jpg'); // Segunda textura

    // Criar o fundo com duas camadas
    createBackgroundLayer(backgroundTexture1, 0);
    createBackgroundLayer(backgroundTexture2, 100);

    // Sol
    const sunGeometry = new THREE.SphereGeometry(15, 32, 32); // Tamanho do sol maior
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
    const distance = data.distance / 2; // Ajuste de escala
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
        // Criar os anéis de Saturno com geometria achatada
        const ringGeometry = new THREE.TorusGeometry(20, 5, 4, 100); // Raio do disco e espessura
        const ringTexture = new THREE.TextureLoader().load('assets/textures/saturn_ring_alpha.png'); // Textura dos anéis
        const ringMaterial = new THREE.MeshBasicMaterial({ 
            map: ringTexture, 
            side: THREE.DoubleSide, 
            opacity: 0.5, // Ajuste da opacidade
            transparent: false // Tornar o material transparente
        });
        const rings = new THREE.Mesh(ringGeometry, ringMaterial);

        // Achatar os anéis no eixo Y
        rings.scale.set(0.4, 0.4, 0); // Achatar os anéis no eixo Y

        // Posicionar os anéis em relação a Saturno
        rings.position.set(0, 0, 0); // Colocar no centro de Saturno
        saturn.add(rings); // Adicionar os anéis como filho de Saturno, para que circulem com ele

        // Ajustar os anéis para garantir que fiquem alinhados com a órbita de Saturno
        rings.rotation.x = Math.PI / 2; // Girar os anéis no eixo X para que fiquem planos
    }
}

function addMoon(earthOrbit, moonOrbit) {
    const earth = scene.children.find(child => child.position.x === earthOrbit / 10);
    if (earth) {
        const moonGeometry = new THREE.SphereGeometry(0.1, 32, 32);
        const moonTexture = new THREE.TextureLoader().load('assets/textures/moon.jpg');
        const moonMaterial = new THREE.MeshBasicMaterial({ map: moonTexture });
        const moon = new THREE.Mesh(moonGeometry, moonMaterial);

        // A Lua orbita a Terra
        moon.position.x = earthOrbit + moonOrbit; // A Lua começa a orbitar a Terra
        earth.add(moon); // A Lua vai ser filha da Terra, então orbita com ela

        // Adicionar a Lua ao planeta
        planets.push({ name: 'moon', mesh: moon });
    }
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
            moon.angle += (2 * Math.PI) / 27; // Lua orbita a Terra em 27 dias
            moon.position.x = earth.position.x + (planetData.earth.distance / 10 + 0.38) * Math.cos(moon.angle);
            moon.position.z = earth.position.z + (planetData.earth.distance / 10 + 0.38) * Math.sin(moon.angle);
        });
    }

    renderer.render(scene, camera);
}

init();