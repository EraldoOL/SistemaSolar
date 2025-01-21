let scene, camera, renderer, controls;
let planets = []; // Declare planetas uma vez globalmente
let moonAngle = 0;
let isTeleporting = false; // Variável global para controlar o teleporte

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

    // Posição da câmera ajustada para estar em frente da Terra com zoom
    const earthData = planetData.earth;
    const initialDistance = earthData.distance / 1.5; // Ajuste a distância da câmera
    camera.position.set(initialDistance, 0, 0);  // Coloca a câmera na frente da Terra
    camera.lookAt(new THREE.Vector3(earthData.distance / 2, 0, 0)); // Olha para a Terra

    // Ajuste de controle de órbita
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true; // Habilitar o zoom
    controls.minDistance = earthData.size * 0.1;  // Permitir aproximar mais dos planetas
    controls.maxDistance = 10000;  // Limite máximo do zoom (para Netuno)
    controls.zoomSpeed = 3; // Ajustar a velocidade do zoom

    // Adicionar luz ambiente e luz direcional
    const light = new THREE.AmbientLight(0x404040, 1); // Luz ambiente
    scene.add(light);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // Luz direcional
    directionalLight.position.set(10, 10, 10).normalize();
    scene.add(directionalLight);

    // Iniciar animação
    animate();
}

function createSkybox() {
    const textureLoader = new THREE.TextureLoader();

    // Primeira camada do fundo
    const backgroundTexture1 = textureLoader.load('assets/textures/stars_milky_way.jpg', (texture) => {
        const backgroundSphere1 = new THREE.Mesh(
            new THREE.SphereGeometry(10000, 64, 64), // Esfera gigantesca para o fundo
            new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide })
        );
        scene.add(backgroundSphere1);
    });

    // Segunda camada do fundo (opcional, para maior profundidade)
    const backgroundTexture2 = textureLoader.load('assets/textures/stars.jpg', (texture) => {
        const backgroundSphere2 = new THREE.Mesh(
            new THREE.SphereGeometry(20000, 64, 64), // Outra esfera ainda maior
            new THREE.MeshBasicMaterial({
                map: texture,
                side: THREE.BackSide,
                opacity: 0.5, // Transparência opcional
                transparent: true,
            })
        );
        scene.add(backgroundSphere2);
    });
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
    const earthDistance = earthData.distance / .5;

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
    if (isTeleporting) return; // Impede teleportação enquanto já está teletransportando

    isTeleporting = true; // Ativa o estado de teleporte

    const planet = planets.find(p => p.name === planetName);
    if (planet) {
        // Calcular a nova posição da câmera
        const distanceFactor = 2; // Ajuste a distância entre o planeta e a câmera
        camera.position.set(planet.distance * distanceFactor, 0, 0); // Posiciona a câmera

        // A câmera deve olhar para o centro (o Sol)
        camera.lookAt(new THREE.Vector3(0, 0, 0));

        // Aumenta o zoom para ter uma visão mais próxima do planeta
        controls.maxDistance = planet.distance * distanceFactor;  // Limita o zoom máximo
        controls.minDistance = planet.size * 0.5;  // Limita o zoom mínimo
        controls.update();

        // Ajusta a distância para a Terra, se for o caso
        if (planetName === 'earth') {
            camera.position.set(planet.distance * 1.5, 0, 0); // Distância ajustada para a Terra
        }

        // Espera um segundo e redefine o estado de teleporte
        setTimeout(() => {
            isTeleporting = false; // Reseta o estado de teleporte
        }, 1000);
    }
}

function animate() {
    requestAnimationFrame(animate);

    // Verifica se a câmera está teleportando, e se sim, impede que os planetas girem
    if (isTeleporting) return;

    // Atualiza a posição dos planetas em órbita
    planets.forEach(planet => {
        if (planet.name !== 'moon') {
            planet.angle += (2 * Math.PI) / (planet.orbitTime * 100); // Controle da velocidade de órbita
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