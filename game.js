// game.js
import * as THREE from './libs/three.module.min.js';
import { Howl } from './libs/howler.min.js';

let scene, camera, renderer, player;
const lanes = [-1, 0, 1]; // Lane positions
let currentLane = 1;
let score = 0;
let highScore = 0;
let images = []; // Array to hold image meshes
let correctImageIndex;

const memeAudios = [
    new Howl({ src: ['assets/audio/audio0.mp3'] }),
    new Howl({ src: ['assets/audio/audio1.mp3'] }),
    new Howl({ src: ['assets/audio/audio2.mp3'] })
];

function init() {
    // Set up scene
    scene = new THREE.Scene();

    // Set up camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 10;

    // Set up renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Set up player
    player = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshBasicMaterial({ color: 0x00ff00 })
    );
    player.position.z = 5;
    scene.add(player);

    // Set up event listeners
    window.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowLeft' && currentLane > 0) {
            currentLane--;
        } else if (event.key === 'ArrowRight' && currentLane < 2) {
            currentLane++;
        }
        player.position.x = lanes[currentLane];
    });

    // Spawn initial images and start animation loop
    spawnImages();
    animate();
}

function spawnImages() {
    // Remove existing images
    images.forEach(image => scene.remove(image));
    images = [];

    // Determine which audio to play and corresponding correct image
    const audioIndex = Math.floor(Math.random() * memeAudios.length);
    correctImageIndex = Math.floor(Math.random() * 3);

    // Load the correct image
    let texture = new THREE.TextureLoader().load(`assets/images/image${audioIndex}.png`);
    let correctImage = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshBasicMaterial({ map: texture })
    );
    correctImage.position.x = lanes[correctImageIndex];
    correctImage.position.z = -10;
    images.push(correctImage);
    scene.add(correctImage);

    // Load random images for the other lanes
    for (let i = 0; i < 3; i++) {
        if (i === correctImageIndex) continue;

        let randomImageIndex;
        do {
            randomImageIndex = Math.floor(Math.random() * memeAudios.length);
        } while (randomImageIndex === audioIndex);

        texture = new THREE.TextureLoader().load(`assets/images/image${randomImageIndex}.png`);
        let image = new THREE.Mesh(
            new THREE.BoxGeometry(1, 1, 1),
            new THREE.MeshBasicMaterial({ map: texture })
        );
        image.position.x = lanes[i];
        image.position.z = -10;
        images.push(image);
        scene.add(image);
    }

    // Play the corresponding audio
    memeAudios[audioIndex].play();
}

function checkCollision() {
    images.forEach((image, index) => {
        if (player.position.distanceTo(image.position) < 1) {
            if (index === correctImageIndex) {
                score++;
            } else {
                highScore = Math.max(score, highScore);
                score = 0;
                // Add logic to display game over and restart
                alert(`Game Over! Your score: ${score}. High score: ${highScore}`);
                location.reload();
                return;
            }
            spawnImages();
        }
    });
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    checkCollision();

    // Move images towards the player
    images.forEach(image => {
        image.position.z += 0.1; // Adjust speed as needed
    });

    // Update scores
    document.getElementById('score').innerText = `Score: ${score}`;
    document.getElementById('highScore').innerText = `High Score: ${highScore}`;
}

// Initialize the game
init();
