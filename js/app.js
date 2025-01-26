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

// Função para carregar a textura do anel e garantir que ela está sendo carregada
function loadRingTexture() {
    const texture = new THREE.TextureLoader().load('assets/textures/saturn.jpg', function (texture) {
        console.log('Textura carregada com sucesso!');
    }, undefined, function (error) {
        console.error('Erro ao carregar a textura do anel:', error);
    });
    return texture;
}

// Função para criar os anéis de Saturno
function createSaturnRings() {
    // Carregando a textura
    const ringTexture = loadRingTexture();
    
    // Se a textura não carregar corretamente, a função não deve prosseguir
    if (!ringTexture) {
        console.error("A textura do anel não foi carregada corretamente.");
        return;
    }

    const saturnRingGeometry = new THREE.RingGeometry(6, 10, 100); // Raio interno 6, raio externo 10, e 100 segmentos
    const saturnRingMaterial = new THREE.MeshBasicMaterial({
        map: ringTexture, // Usando a textura carregada
        side: THREE.DoubleSide, // Tornando ambos os lados visíveis
        transparent: true, // Tornando a textura transparente
        alphaTest: 0.1, // Definindo o teste de transparência
    });
    
    const saturnRings = new THREE.Mesh(saturnRingGeometry, saturnRingMaterial);
    saturnRings.rotation.x = Math.PI / 2; // Coloca o anel na posição correta (horizontal)
    
    // Garantir que o anel de Saturno está posicionado no centro de Saturno
    saturnRings.position.set(0, 0, 0); // Ajuste a posição do anel
    
    return saturnRings; // Retorna o objeto para ser adicionado à cena
}

// Função para criar o planeta Saturno com anéis
function createSaturn() {
    const saturnGeometry = new THREE.SphereGeometry(4.5, 32, 32); // Criando a esfera de Saturno
    const saturnTexture = new THREE.TextureLoader().load('assets/textures/saturn.jpg'); // Textura de Saturno
    const saturnMaterial = new THREE.MeshBasicMaterial({ map: saturnTexture });
    const saturn = new THREE.Mesh(saturnGeometry, saturnMaterial);
    
    // Criar os anéis de Saturno
    const saturnRings = createSaturnRings();
    
    if (saturnRings) {
        // Posicionar Saturno e seus anéis
        saturn.position.set(1429, 0, 0); // Ajuste a distância de Saturno conforme necessário
        scene.add(saturn); // Adiciona Saturno à cena
        scene.add(saturnRings); // Adiciona os anéis de Saturno à cena
    }

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
                planet.angle += (2 * Math.PI) / (planet.orbitTime * 1);
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
