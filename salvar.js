/*let scene, camera, renderer, controls;
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



function savePlanetPositions() {
    const positions = planets.map(planet => ({
        name: planet.name,
        angle: planet.angle
    }));
    localStorage.setItem('planetPositions', JSON.stringify(positions));
}

function loadPlanetPositions() {
    const savedData = localStorage.getItem('planetPositions');
    if (savedData) {
        const positions = JSON.parse(savedData);
        positions.forEach(savedPlanet => {
            const planet = planets.find(p => p.name === savedPlanet.name);
            if (planet) planet.angle = savedPlanet.angle;
        });
    }
}



function teleportToPlanet(planetName) {
    if (isTeleporting) return;

    isTeleporting = true;
    const planet = planets.find(p => p.name === planetName);
    if (planet) {
        const targetPosition = new THREE.Vector3(
            planet.mesh.position.x + 10,
            planet.mesh.position.y + 10,
            planet.mesh.position.z + 10
        );
        camera.position.copy(targetPosition);
        camera.lookAt(planet.mesh.position);
        controls.update();

        setTimeout(() => {
            isTeleporting = false;
        }, 1500); // Tempo de teleporte
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
}


init();





let scene, camera, renderer, controls;
let planets = [];
let moonAngle = 0;
let isTeleporting = false;

const scale = 0.1;

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
    camera.position.set(earthData.distance / 1.5, 0, 0);
    camera.lookAt(new THREE.Vector3(earthData.distance / 2, 0, 0));

    // Ajustar controles de órbita
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;
    controls.minDistance = earthData.size * 0.1;
    controls.maxDistance = 10000;
    controls.zoomSpeed = 3;

    // Adicionar luzes
    const light = new THREE.AmbientLight(0x404040, 1);
    scene.add(light);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 10).normalize();
    scene.add(directionalLight);

    // Iniciar animação
    animate();
}

function createSkybox() {
    const textureLoader = new THREE.TextureLoader();
    const backgroundTexture = textureLoader.load('assets/textures/stars_milky_way.jpg');
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

// Função para criar os anéis de Saturno
function createSaturnRings() {
    const saturnRingGeometry = new THREE.RingGeometry(6, 10, 100); // Raio interno 6, raio externo 10, e 100 segmentos
    const saturnRingMaterial = new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load('assets/textures/saturn_ring_alpha.png'), // Carregando a textura correta
        side: THREE.DoubleSide, // Tornando ambos os lados visíveis
        transparent: true, // Garantindo que a transparência da textura seja aplicada
        alphaTest: 0.5, // Definindo o limiar de transparência
    });
    
    const saturnRings = new THREE.Mesh(saturnRingGeometry, saturnRingMaterial);
    saturnRings.rotation.x = Math.PI / 2; // Coloca o anel na posição correta (horizontal)
    saturnRings.position.set(0, 0, 0); // Posiciona os anéis no centro de Saturno

    return saturnRings; // Retorna o objeto para ser adicionado à cena
}

// Função para criar o planeta Saturno
function createSaturn() {
    const saturnGeometry = new THREE.SphereGeometry(4.5, 32, 32); // Criando a esfera de Saturno
    const saturnTexture = new THREE.TextureLoader().load('assets/textures/saturn.jpg'); // Textura de Saturno
    const saturnMaterial = new THREE.MeshBasicMaterial({ map: saturnTexture });
    const saturn = new THREE.Mesh(saturnGeometry, saturnMaterial);
    
    // Criar os anéis de Saturno
    const saturnRings = createSaturnRings();
    
    // Posicionar Saturno
    saturn.position.set(1429, 0, 0); // Ajuste a distância de Saturno conforme necessário

    scene.add(saturn); // Adiciona Saturno à cena
    scene.add(saturnRings); // Adiciona os anéis de Saturno à cena

    return saturn;
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

function savePlanetPositions() {
    const positions = planets.map(planet => ({
        name: planet.name,
        position: {
            x: planet.mesh.position.x,
            y: planet.mesh.position.y,
            z: planet.mesh.position.z
        },
        angle: planet.angle
    }));
    localStorage.setItem('planetPositions', JSON.stringify(positions));
}

function loadPlanetPositions() {
    const savedPositions = JSON.parse(localStorage.getItem('planetPositions'));
    if (savedPositions) {
        savedPositions.forEach(savedPlanet => {
            const planet = planets.find(p => p.name === savedPlanet.name);
            if (planet && savedPlanet.position) {
                const { x, y, z } = savedPlanet.position;
                planet.mesh.position.set(x, y, z);
                planet.angle = savedPlanet.angle || 0;
            }
        });
    }
}

function teleportToPlanet(planetName) {
    if (isTeleporting) return;

    isTeleporting = true;
    const planet = planets.find(p => p.name === planetName);
    if (planet) {
        // Ajuste da posição da câmera
        const distanceFactor = 3; // Distância maior para o planeta
        const newPosition = new THREE.Vector3(planet.mesh.position.x * distanceFactor, 0, planet.mesh.position.z * distanceFactor);

        // Teleportar a câmera para o planeta
        camera.position.copy(newPosition);

        // Olhar para o Sol
        camera.lookAt(new THREE.Vector3(0, 0, 0)); // O Sol está na posição (0,0,0)

        // Atualizar os controles de órbita
        controls.target.set(0, 0, 0);  // Focar no Sol
        controls.update();

        // Atualizar a cena após o teleporte
        setTimeout(() => {
            isTeleporting = false;
        }, 1000); // Aguarda um tempo para evitar o teleporte simultâneo
    }
}

function animate() {
    requestAnimationFrame(animate);

    if (!isTeleporting) {
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
    }

    savePlanetPositions(); // Salvar posições em cada frame
    renderer.render(scene, camera);
}

init();




//3



let scene, camera, renderer, controls;
let planets = [];
let moonAngle = 0;
let isTeleporting = false;

const scale = 0.1;

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
    camera.position.set(earthData.distance / 1.5, 0, 0);
    camera.lookAt(new THREE.Vector3(earthData.distance / 2, 0, 0));

    // Ajustar controles de órbita
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;
    controls.minDistance = earthData.size * 0.1;
    controls.maxDistance = 10000;
    controls.zoomSpeed = 3;

    // Adicionar luzes
    const light = new THREE.AmbientLight(0x404040, 1);
    scene.add(light);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 10).normalize();
    scene.add(directionalLight);

    // Iniciar animação
    animate();
}

function createSkybox() {
    const textureLoader = new THREE.TextureLoader();
    const backgroundTexture = textureLoader.load('assets/textures/stars_milky_way.jpg');
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

function createSaturnRings(planet) {
    // Geometria do anel (tamanho ajustável)
    const ringGeometry = new THREE.RingGeometry(12, 18, 64); // Raio interno e externo
    const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0xcccccc, // Cor do anel
        side: THREE.DoubleSide, // Renderizar ambos os lados
        transparent: true,
        opacity: 0.8 // Para deixar um pouco translúcido
    });

    const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);

    // Rotação para alinhar com o planeta
    ringMesh.rotation.x = Math.PI / 2; // Deitar o anel no eixo X
    ringMesh.position.set(planet.position.x, planet.position.y, planet.position.z);

    return ringMesh;
}

// Criar Saturno e seus anéis
function createSaturn() {
    const saturnGeometry = new THREE.SphereGeometry(10, 32, 32);
    const saturnMaterial = new THREE.MeshPhongMaterial({ color: 0xd3b58d });
    const saturnMesh = new THREE.Mesh(saturnGeometry, saturnMaterial);

    // Posição de Saturno no espaço
    saturnMesh.position.set(150, 0, 160);

    // Criar e adicionar os anéis de Saturno
    const saturnRings = createSaturnRings(saturnMesh);
    scene.add(saturnMesh);
    scene.add(saturnRings);
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

function savePlanetPositions() {
    const positions = planets.map(planet => ({
        name: planet.name,
        position: {
            x: planet.mesh.position.x,
            y: planet.mesh.position.y,
            z: planet.mesh.position.z
        },
        angle: planet.angle
    }));
    localStorage.setItem('planetPositions', JSON.stringify(positions));
}

function loadPlanetPositions() {
    const savedPositions = JSON.parse(localStorage.getItem('planetPositions'));
    if (savedPositions) {
        savedPositions.forEach(savedPlanet => {
            const planet = planets.find(p => p.name === savedPlanet.name);
            if (planet && savedPlanet.position) {
                const { x, y, z } = savedPlanet.position;
                planet.mesh.position.set(x, y, z);
                planet.angle = savedPlanet.angle || 0;
            }
        });
    }
}

function teleportToPlanet(planetId) {
    const planet = document.getElementById(planetId);

    if (!planet) {
        console.error(`Planeta ${planetId} não encontrado!`);
        return;
    }

    // Posição do planeta no espaço 3D (exemplo fictício)
    const planetPosition = {
        mercury: { x: 10, y: 0, z: 20 },
        venus: { x: 30, y: 0, z: 40 },
        earth: { x: 50, y: 0, z: 60 },
        mars: { x: 70, y: 0, z: 80 },
        jupiter: { x: 100, y: 0, z: 120 },
        saturn: { x: 150, y: 0, z: 160 },
        uranus: { x: 200, y: 0, z: 220 },
        neptune: { x: 250, y: 0, z: 260 }
    }[planetId];

    if (!planetPosition) {
        console.error(`Posição do planeta ${planetId} não definida!`);
        return;
    }

    // Configuração da câmera
    const cameraPosition = {
        x: planetPosition.x,
        y: planetPosition.y + 10, // Um pouco acima do plano do planeta
        z: planetPosition.z - 30 // Mais próximo do planeta
    };

    // Animação usando TWEEN.js
    const currentCameraPosition = { x: camera.position.x, y: camera.position.y, z: camera.position.z };

    new TWEEN.Tween(currentCameraPosition)
        .to(cameraPosition, 2000) // Transição em 2 segundos
        .easing(TWEEN.Easing.Quadratic.Out)
        .onUpdate(() => {
            camera.position.set(currentCameraPosition.x, currentCameraPosition.y, currentCameraPosition.z);
        })
        .start();
}

function animate() {
    requestAnimationFrame(animate);

    if (!isTeleporting) {
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
    }

    savePlanetPositions(); // Salvar posições em cada frame
    renderer.render(scene, camera);
}

init();




//4



let scene, camera, renderer, controls;
let planets = [];
let moonAngle = 0;
let isTeleporting = false;

const scale = 0.1;

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
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 10000);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Adicionar o Skybox como fundo
    createSkybox();

    // Criar o Sol
    const sunGeometry = new THREE.SphereGeometry(50, 64, 64);
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
    camera.position.set(earthData.distance / 1.5, 0, 0);
    camera.lookAt(new THREE.Vector3(earthData.distance / 2, 0, 0));

    // Ajustar controles de órbita
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;
    controls.minDistance = earthData.size * 0.1;
    controls.maxDistance = 10000;
    controls.zoomSpeed = 3;

    // Adicionar luzes
    const light = new THREE.AmbientLight(0x404040, 1);
    scene.add(light);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 10).normalize();
    scene.add(directionalLight);

    // Iniciar animação
    animate();
}

function createSkybox() {
    const textureLoader = new THREE.TextureLoader();
    const backgroundTexture = textureLoader.load('assets/textures/stars_milky_way.jpg');
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

// Função para criar os anéis de Saturno
function createSaturnRings() {
    const saturnRingGeometry = new THREE.RingGeometry(6, 10, 100); // Raio interno 6, raio externo 10, e 100 segmentos
    const saturnRingMaterial = new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load('assets/textures/saturn_ring_alpha.png'), // Carregando a textura correta
        side: THREE.DoubleSide, // Tornando ambos os lados visíveis
        transparent: true, // Garantindo que a transparência da textura seja aplicada
        alphaTest: 0.5, // Definindo o limiar de transparência
    });
    
    const saturnRings = new THREE.Mesh(saturnRingGeometry, saturnRingMaterial);
    saturnRings.rotation.x = Math.PI / 2; // Coloca o anel na posição correta (horizontal)
    saturnRings.position.set(0, 0, 0); // Posiciona os anéis no centro de Saturno

    return saturnRings; // Retorna o objeto para ser adicionado à cena
}

// Função para criar o planeta Saturno
function createSaturn() {
    const saturnGeometry = new THREE.SphereGeometry(4.5, 32, 32); // Criando a esfera de Saturno
    const saturnTexture = new THREE.TextureLoader().load('assets/textures/saturn.jpg'); // Textura de Saturno
    const saturnMaterial = new THREE.MeshBasicMaterial({ map: saturnTexture });
    const saturn = new THREE.Mesh(saturnGeometry, saturnMaterial);
    
    // Criar os anéis de Saturno
    const saturnRings = createSaturnRings();
    
    // Posicionar Saturno
    saturn.position.set(1429, 0, 0); // Ajuste a distância de Saturno conforme necessário

    scene.add(saturn); // Adiciona Saturno à cena
    scene.add(saturnRings); // Adiciona os anéis de Saturno à cena

    return saturn;
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

function savePlanetPositions() {
    const positions = planets.map(planet => ({
        name: planet.name,
        position: {
            x: planet.mesh.position.x,
            y: planet.mesh.position.y,
            z: planet.mesh.position.z
        },
        angle: planet.angle
    }));
    localStorage.setItem('planetPositions', JSON.stringify(positions));
}

function loadPlanetPositions() {
    const savedPositions = JSON.parse(localStorage.getItem('planetPositions'));
    if (savedPositions) {
        savedPositions.forEach(savedPlanet => {
            const planet = planets.find(p => p.name === savedPlanet.name);
            if (planet && savedPlanet.position) {
                const { x, y, z } = savedPlanet.position;
                planet.mesh.position.set(x, y, z);
                planet.angle = savedPlanet.angle || 0;
            }
        });
    }
}

function teleportToPlanet(planetName) {
    if (isTeleporting) return;

    isTeleporting = true;
    const planet = planets.find(p => p.name === planetName);
    if (planet) {
        // Ajuste da posição da câmera
        const distanceFactor = 1.1; // Distância maior para o planeta
        const newPosition = new THREE.Vector3(planet.mesh.position.x * distanceFactor, 0, planet.mesh.position.z * distanceFactor);

        // Teleportar a câmera para o planeta
        camera.position.copy(newPosition);

        // Olhar para o Sol
        camera.lookAt(new THREE.Vector3(0, 0, 0)); // O Sol está na posição (0,0,0)

        // Atualizar os controles de órbita
        controls.target.set(0, 0, 0);  // Focar no Sol
        controls.update();

        // Atualizar a cena após o teleporte
        setTimeout(() => {
            isTeleporting = false;
        }, 10000); // Aguarda um tempo para evitar o teleporte simultâneo
    }
}

function animate() {
    requestAnimationFrame(animate);

    if (!isTeleporting) {
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
    }

    savePlanetPositions(); // Salvar posições em cada frame
    renderer.render(scene, camera);
}

init();






//camera mais ou menos

let scene, camera, renderer, controls;
let planets = [];
let moonAngle = 0;
let isTeleporting = false;
let cameraOrbitAngle = 0;

const scale = 0.1;

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
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 10000);
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
    camera.position.set(earthData.distance / 1.9, 0, 0);
    camera.lookAt(new THREE.Vector3(earthData.distance / 2, 0, 0));

    // Ajustar controles de órbita
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;
    controls.minDistance = earthData.size * 0.1;
    controls.maxDistance = 10000;
    controls.zoomSpeed = 3;

    // Adicionar luzes
    const light = new THREE.AmbientLight(0x404040, 1);
    scene.add(light);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 10).normalize();
    scene.add(directionalLight);

    // Iniciar animação
    animate();
}

function createSkybox() {
    const textureLoader = new THREE.TextureLoader();
    const backgroundTexture = textureLoader.load('assets/textures/stars_milky_way.jpg');
    const backgroundSphere = new THREE.Mesh(
        new THREE.SphereGeometry(10000, 0, 0),
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

// Função para criar os anéis de Saturno
function createSaturnRings() {
    const saturnRingGeometry = new THREE.RingGeometry(6, 10, 100); // Raio interno 6, raio externo 10, e 100 segmentos
    const saturnRingMaterial = new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load('assets/textures/saturn_ring_alpha.png'), // Carregando a textura correta
        side: THREE.DoubleSide, // Tornando ambos os lados visíveis
        transparent: true, // Garantindo que a transparência da textura seja aplicada
        alphaTest: 1, // Definindo o limiar de transparência
    });
    
    const saturnRings = new THREE.Mesh(saturnRingGeometry, saturnRingMaterial);
    saturnRings.rotation.x = Math.PI / 2; // Coloca o anel na posição correta (horizontal)
    saturnRings.position.set(0, 0, 0); // Posiciona os anéis no centro de Saturno

    return saturnRings; // Retorna o objeto para ser adicionado à cena
}

// Função para criar o planeta Saturno
function createSaturn() {
    const saturnGeometry = new THREE.SphereGeometry(4.5, 32, 32); // Criando a esfera de Saturno
    const saturnTexture = new THREE.TextureLoader().load('assets/textures/saturn.jpg'); // Textura de Saturno
    const saturnMaterial = new THREE.MeshBasicMaterial({ map: saturnTexture });
    const saturn = new THREE.Mesh(saturnGeometry, saturnMaterial);
    
    // Criar os anéis de Saturno
    const saturnRings = createSaturnRings();
    
    // Posicionar Saturno
    saturn.position.set(1429, 0, 0); // Ajuste a distância de Saturno conforme necessário

    scene.add(saturn); // Adiciona Saturno à cena
    scene.add(saturnRings); // Adiciona os anéis de Saturno à cena

    return saturn;
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

function savePlanetPositions() {
    const positions = planets.map(planet => ({
        name: planet.name,
        position: {
            x: planet.mesh.position.x,
            y: planet.mesh.position.y,
            z: planet.mesh.position.z
        },
        angle: planet.angle
    }));
    localStorage.setItem('planetPositions', JSON.stringify(positions));
}

function loadPlanetPositions() {
    const savedPositions = JSON.parse(localStorage.getItem('planetPositions'));
    if (savedPositions) {
        savedPositions.forEach(savedPlanet => {
            const planet = planets.find(p => p.name === savedPlanet.name);
            if (planet && savedPlanet.position) {
                const { x, y, z } = savedPlanet.position;
                planet.mesh.position.set(x, y, z);
                planet.angle = savedPlanet.angle || 0;
            }
        });
    }
}

let isOrbiting = false; // Variável de controle para o movimento de órbita

function teleportToPlanet(planetName) {
    if (isTeleporting) return;

    isTeleporting = true;
    const planet = planets.find(p => p.name === planetName);
    if (planet) {
        // Ajuste da posição da câmera
        const distanceFactor = 1.1; // Distância maior para o planeta
        const newPosition = new THREE.Vector3(planet.mesh.position.x * distanceFactor, 0, planet.mesh.position.z * distanceFactor);

        // Teleportar a câmera para o planeta
        camera.position.copy(newPosition);

        // Olhar para o Sol
        camera.lookAt(new THREE.Vector3(0, 0, 0)); // O Sol está na posição (0,0,0)

        // Ativar movimento de órbita da câmera
        isOrbiting = true;

        // Atualizar os controles de órbita
        controls.target.set(planet.mesh.position.x, planet.mesh.position.y, planet.mesh.position.z); // Focar no planeta
        controls.update();

        // Atualizar a cena após o teleporte
        setTimeout(() => {
            isTeleporting = false;
        }, 1); // Aguarda um tempo para evitar o teleporte simultâneo
    }
}

// Adiciona evento de clique na tela para alternar entre modo de órbita e modo livre
window.addEventListener('click', () => {
    if (isOrbiting) {
        isOrbiting = false; // Desativa o modo de órbita
        controls.enableRotate = true; // Habilita a rotação livre
    } else {
        controls.enableRotate = false; // Desativa a rotação livre
    }
});

function animate() {
    requestAnimationFrame(animate);

    if (isOrbiting) {
        // Mantém a câmera orbitando ao redor do planeta
        const planet = planets.find(p => p.name === 'earth'); // Usando a Terra como exemplo
        if (planet) {
            const angle = Date.now() * 0.0005;
            const radius = planet.distance * 1.5; // Distância da órbita da câmera em relação ao planeta
            camera.position.x = planet.mesh.position.x + Math.cos(angle) * radius;
            camera.position.z = planet.mesh.position.z + Math.sin(angle) * radius;
            camera.lookAt(planet.mesh.position); // Sempre olhar para o planeta
        }
    }

    savePlanetPositions(); // Salvar posições em cada frame
    renderer.render(scene, camera);
}

function animate() {
    requestAnimationFrame(animate);

    if (!isTeleporting) {
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

        // Se a câmera estiver em órbita ao redor de um planeta
        if (cameraOrbitAngle !== undefined) {
            const planet = planets.find(p => p.name === 'earth'); // Ou qualquer planeta que você tenha teleportado para
            if (planet) {
                // Atualizar o ângulo da órbita da câmera
                cameraOrbitAngle += 0.001; // Ajuste a velocidade da órbita da câmera

                // Calcular a nova posição da câmera com base no ângulo
                const orbitDistance = planet.distance * .5; // Distância da câmera ao planeta
                camera.position.x = planet.mesh.position.x + orbitDistance * Math.cos(cameraOrbitAngle);
                camera.position.z = planet.mesh.position.z + orbitDistance * Math.sin(cameraOrbitAngle);

                // A câmera deve olhar para o planeta
                camera.lookAt(planet.mesh.position);

                // Atualizar os controles
                controls.update();
            }
        }
    }

    savePlanetPositions(); // Salvar posições em cada frame
    renderer.render(scene, camera);
}

function resizeCanvas() {
    renderer.setSize(window.innerWidth, window.innerHeight); // Atualiza o tamanho do renderer
    camera.aspect = window.innerWidth / window.innerHeight; // Atualiza o aspecto da câmera
    camera.updateProjectionMatrix(); // Recalcula a matriz de projeção
}

// Adicione um evento para redimensionar o canvas quando a tela mudar de tamanho
window.addEventListener('resize', resizeCanvas);


init();


















//esta ótimo

let scene, camera, renderer, controls;
let planets = [];
let moonAngle = 0;
let isTeleporting = false;

const scale = 0.1;

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
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 10000);
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
    camera.position.set(earthData.distance / 1.9, 0, 0);
    camera.lookAt(new THREE.Vector3(earthData.distance / 2, 0, 0));

    // Ajustar controles de órbita
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;
    controls.minDistance = earthData.size * 0.1;
    controls.maxDistance = 10000;
    controls.zoomSpeed = 3;

    // Adicionar luzes
    const light = new THREE.AmbientLight(0x404040, 1);
    scene.add(light);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 10).normalize();
    scene.add(directionalLight);

    // Iniciar animação
    animate();
}

function createSkybox() {
    const textureLoader = new THREE.TextureLoader();
    const backgroundTexture = textureLoader.load('assets/textures/stars_milky_way.jpg');
    const backgroundSphere = new THREE.Mesh(
        new THREE.SphereGeometry(10000, 0, 0),
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

// Função para criar os anéis de Saturno
function createSaturnRings() {
    const saturnRingGeometry = new THREE.RingGeometry(6, 10, 100); // Raio interno 6, raio externo 10, e 100 segmentos
    const saturnRingMaterial = new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load('assets/textures/saturn_ring_alpha.png'), // Carregando a textura correta
        side: THREE.DoubleSide, // Tornando ambos os lados visíveis
        transparent: true, // Garantindo que a transparência da textura seja aplicada
        alphaTest: 1, // Definindo o limiar de transparência
    });
    
    const saturnRings = new THREE.Mesh(saturnRingGeometry, saturnRingMaterial);
    saturnRings.rotation.x = Math.PI / 2; // Coloca o anel na posição correta (horizontal)
    saturnRings.position.set(0, 0, 0); // Posiciona os anéis no centro de Saturno

    return saturnRings; // Retorna o objeto para ser adicionado à cena
}

// Função para criar o planeta Saturno
function createSaturn() {
    const saturnGeometry = new THREE.SphereGeometry(4.5, 32, 32); // Criando a esfera de Saturno
    const saturnTexture = new THREE.TextureLoader().load('assets/textures/saturn.jpg'); // Textura de Saturno
    const saturnMaterial = new THREE.MeshBasicMaterial({ map: saturnTexture });
    const saturn = new THREE.Mesh(saturnGeometry, saturnMaterial);
    
    // Criar os anéis de Saturno
    const saturnRings = createSaturnRings();
    
    // Posicionar Saturno
    saturn.position.set(1429, 0, 0); // Ajuste a distância de Saturno conforme necessário

    scene.add(saturn); // Adiciona Saturno à cena
    scene.add(saturnRings); // Adiciona os anéis de Saturno à cena

    return saturn;
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

function savePlanetPositions() {
    const positions = planets.map(planet => ({
        name: planet.name,
        position: {
            x: planet.mesh.position.x,
            y: planet.mesh.position.y,
            z: planet.mesh.position.z
        },
        angle: planet.angle
    }));
    localStorage.setItem('planetPositions', JSON.stringify(positions));
}

function loadPlanetPositions() {
    const savedPositions = JSON.parse(localStorage.getItem('planetPositions'));
    if (savedPositions) {
        savedPositions.forEach(savedPlanet => {
            const planet = planets.find(p => p.name === savedPlanet.name);
            if (planet && savedPlanet.position) {
                const { x, y, z } = savedPlanet.position;
                planet.mesh.position.set(x, y, z);
                planet.angle = savedPlanet.angle || 0;
            }
        });
    }
}

function teleportToPlanet(planetName) {
    if (isTeleporting) return;

    isTeleporting = true;
    const planet = planets.find(p => p.name === planetName);
    if (planet) {
        // Ajuste da posição da câmera
        const distanceFactor = 1.1; // Distância maior para o planeta
        const newPosition = new THREE.Vector3(planet.mesh.position.x * distanceFactor, 0, planet.mesh.position.z * distanceFactor);

        // Teleportar a câmera para o planeta
        camera.position.copy(newPosition);

        // Olhar para o Sol
        camera.lookAt(new THREE.Vector3(0, 0, 0)); // O Sol está na posição (0,0,0)

        // Atualizar os controles de órbita
        controls.target.set(0, 0, 0);  // Focar no Sol
        controls.update();

        // Atualizar a cena após o teleporte
        setTimeout(() => {
            isTeleporting = false;
        }, 1); // Aguarda um tempo para evitar o teleporte simultâneo
    }
}

function animate() {
    requestAnimationFrame(animate);

    if (!isTeleporting) {
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
    }

    savePlanetPositions(); // Salvar posições em cada frame
    renderer.render(scene, camera);
}

function resizeCanvas() {
    renderer.setSize(window.innerWidth, window.innerHeight); // Atualiza o tamanho do renderer
    camera.aspect = window.innerWidth / window.innerHeight; // Atualiza o aspecto da câmera
    camera.updateProjectionMatrix(); // Recalcula a matriz de projeção
}

// Adicione um evento para redimensionar o canvas quando a tela mudar de tamanho
window.addEventListener('resize', resizeCanvas);


init();*/

