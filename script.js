let scene, camera, renderer, player, score = 0;
let lanes = [], images = [], correctLane, audio, clock;
const startScreen = document.getElementById("start-screen");
const gameOverScreen = document.getElementById("game-over");
const finalScore = document.getElementById("final-score");
const gameContainer = document.getElementById("game-container");

document.addEventListener("keydown", startGame);

function startGame() {
    startScreen.style.display = "none";
    gameOverScreen.style.display = "none";
    score = 0;

    init();
    animate();

    document.removeEventListener("keydown", startGame);
    document.addEventListener("keydown", handleKeyPress);
}

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    gameContainer.appendChild(renderer.domElement);

    clock = new THREE.Clock();

    // Set up the player model
    const loader = new THREE.GLTFLoader();
    loader.load('assets/models/Zuck.glb', function (gltf) {
        player = gltf.scene;
        player.position.set(0, 0, -10);
        scene.add(player);
    });

    // Set up lanes
    for (let i = -1; i <= 1; i++) {
        const lane = new THREE.Mesh(
            new THREE.PlaneGeometry(5, 20),
            new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide })
        );
        lane.position.set(i * 6, 0, 0);
        scene.add(lane);
        lanes.push(lane);
    }

    camera.position.z = 5;
    nextRound();
}

function handleKeyPress(e) {
    if (e.key === "ArrowLeft" && player.position.x > -6) {
        player.position.x -= 6;
    } else if (e.key === "ArrowRight" && player.position.x < 6) {
        player.position.x += 6;
    }
}

async function nextRound() {
    images = await loadImages();
    correctLane = Math.floor(Math.random() * 3);
    audio = new Audio(`assets/audio/${images[correctLane]}.mp3`);
    audio.play();

    lanes.forEach((lane, index) => {
        lane.material.map = new THREE.TextureLoader().load(`assets/images/${images[index]}.png`);
    });

    setTimeout(checkResult, 5000);
}

function checkResult() {
    if (player.position.x === lanes[correctLane].position.x) {
        score++;
        nextRound();
    } else {
        gameOver();
    }
}

function gameOver() {
    document.removeEventListener("keydown", handleKeyPress);
    finalScore.textContent = `Your score: ${score}`;
    gameOverScreen.style.display = "block";
    document.addEventListener("keydown", startGame);
}

function loadImages() {
    return fetch('assets/images/images.json')
        .then(response => response.json())
        .then(data => {
            const imageFilenames = data.images.map(image => image.replace('.png', ''));
            return shuffleArray(imageFilenames).slice(0, 3);
        })
        .catch(error => {
            console.error('Error loading images:', error);
            return ["default1", "default2", "default3"]; // fallback images
        });
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    player.position.z += delta * 2; // Adjust speed as needed

    renderer.render(scene, camera);
}
