let scene, camera, renderer, controls;
let planets = []; // Lista de planetas
let moonAngle = 0;
let isTeleporting = false; // Variável para controlar o teleporte

const scale = 0.1; // Escala para distâncias e tamanhos

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
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Adicionar o Skybox como fundo
    createSkybox();

    // Criar o Sol
    const sunGeometry = new THREE.SphereGeometry(15, 32, 32);
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

    // Adicionar Lua orbitando a Terra
    addMoon();

    // Carregar posições salvas
    loadPlanetPositions();

    // Configurar câmera inicial
    const earthData = planetData.earth;
    camera.position.set(earthData.distance / 2, 20, 50);
    camera.lookAt(new THREE.Vector3(earthData.distance / 2, 0, 0));

    // Ajustar controles de órbita
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;
    controls.zoomSpeed = 3;

    // Adicionar luzes
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(50, 50, 50);
    scene.add(directionalLight);

    // Iniciar animação
    animate();
}

function createSkybox() {
    const textureLoader = new THREE.TextureLoader();
    const backgroundTexture = textureLoader.load('assets/textures/stars.jpg');
    const backgroundSphere = new THREE.Mesh(
        new THREE.SphereGeometry(10000, 64, 64),
        new THREE.MeshBasicMaterial({ map: backgroundTexture, side: THREE.BackSide })
    );
    scene.add(backgroundSphere);
}

function createPlanet(name, data) {
    const geometry = new THREE.SphereGeometry(data.size, 32, 32);
    const texture = new THREE.TextureLoader().load(data.texture);
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const mesh = new THREE.Mesh(geometry, material);

    const distance = data.distance / 2;
    mesh.position.x = distance;

    return {
        name,
        mesh,
        orbitTime: data.orbitTime,
        angle: 0,
        distance: distance
    };
}

function addMoon() {
    const earthData = planetData.earth;
    const earthDistance = earthData.distance / 2;

    const moonGeometry = new THREE.SphereGeometry(0.27, 32, 32);
    const moonTexture = new THREE.TextureLoader().load('assets/textures/moon.jpg');
    const moonMaterial = new THREE.MeshBasicMaterial({ map: moonTexture });
    const moon = new THREE.Mesh(moonGeometry, moonMaterial);

    moon.position.set(earthDistance + 2, 0, 0);
    scene.add(moon);

    planets.push({
        name: 'moon',
        mesh: moon,
        orbitTime: 27,
        angle: 0,
        distance: 2
    });
}

// Salvar posições dos planetas no localStorage
function savePlanetPositions() {
    const planetPositions = planets.map(planet => ({
        name: planet.name,
        position: planet.mesh.position
    }));
    localStorage.setItem('planetPositions', JSON.stringify(planetPositions));
}

// Carregar posições dos planetas do localStorage
function loadPlanetPositions() {
    const savedPositions = JSON.parse(localStorage.getItem('planetPositions'));
    if (savedPositions) {
        savedPositions.forEach(savedPlanet => {
            const planet = planets.find(p => p.name === savedPlanet.name);
            if (planet && savedPlanet.position) {
                // Verificar se 'position' tem os valores necessários
                const { x, y, z } = savedPlanet.position;
                if (x !== undefined && y !== undefined && z !== undefined) {
                    planet.mesh.position.set(x, y, z);
                }
            }
        });
    }
}

function animate() {
    requestAnimationFrame(animate);

    planets.forEach(planet => {
        if (planet.name !== 'moon') {
            planet.angle += (2 * Math.PI) / (planet.orbitTime * 100);
            planet.mesh.position.x = planet.distance * Math.cos(planet.angle);
            planet.mesh.position.z = planet.distance * Math.sin(planet.angle);
        } else {
            const earth = planets.find(p => p.name === 'earth');
            if (earth) {
                moonAngle += (2 * Math.PI) / (planet.orbitTime * 100);
                planet.mesh.position.x = earth.mesh.position.x + planet.distance * Math.cos(moonAngle);
                planet.mesh.position.z = earth.mesh.position.z + planet.distance * Math.sin(moonAngle);
            }
        }
    });

    renderer.render(scene, camera);

    // Salvar posições em cada frame
    savePlanetPositions();
}

init();