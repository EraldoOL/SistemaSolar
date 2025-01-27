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

for (let planetName in planetData) {
    let planet;

    if (planetName === 'saturn') {
        planet = createSaturn(); // Usar a função especial para Saturno
    } else {
        planet = createPlanet(planetName, planetData[planetName]);
    }

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

// Função para carregar a textura do anel e garantir que ela está sendo carregada
function loadRingTexture() {
    const texture = new THREE.TextureLoader().load('assets/textures/saturn.jpg', function (texture) {
        console.log('Textura carregada com sucesso!');
    }, undefined, function (error) {
        console.error('Erro ao carregar a textura do anel:', error);
    });
    return texture;
}

function createSaturn() {
    const saturnGroup = new THREE.Group(); // Grupo para Saturno e seus anéis

    // Criar o planeta Saturno
    const saturnGeometry = new THREE.SphereGeometry(4.5, 32, 32);
    const saturnTexture = new THREE.TextureLoader().load('assets/textures/saturn.jpg');
    const saturnMaterial = new THREE.MeshBasicMaterial({ map: saturnTexture });
    const saturn = new THREE.Mesh(saturnGeometry, saturnMaterial);

    // Adicionar o planeta ao grupo
    saturnGroup.add(saturn);

    // Criar os anéis de Saturno
    const ringGeometry = new THREE.RingGeometry(6, 10, 64); // Raio interno, externo e segmentos
    const ringTexture = new THREE.TextureLoader().load('assets/textures/saturn_ring_alpha.png');
    const ringMaterial = new THREE.MeshBasicMaterial({
        map: ringTexture,
        side: THREE.DoubleSide, // Ambos os lados visíveis
        transparent: true,     // Transparência para o fundo
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);

    // Rotacionar e posicionar os anéis
    ring.rotation.x = Math.PI / 2; // Horizontal
    ring.position.set(0, 0, 0);

    // Adicionar os anéis ao grupo
    saturnGroup.add(ring);

    // Posicionar o grupo no sistema solar
    const saturnData = planetData.saturn;
    saturnGroup.position.set(saturnData.distance / 2, 0, 0);

    // Adicionar o grupo à cena
    scene.add(saturnGroup);

    return {
        name: 'saturn',
        mesh: saturnGroup, // O grupo inclui o planeta e os anéis
        orbitTime: saturnData.orbitTime,
        angle: 0,
        distance: saturnData.distance / 2,
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


init();
