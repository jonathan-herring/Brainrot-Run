document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const startButton = document.getElementById('startButton');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let score = 0;
    let round = 1; // Start with round 1
    const laneWidth = canvas.width / 3;
    const player = {
        lane: 1, // Start in the middle lane (0 = left, 1 = middle, 2 = right)
        width: 50,
        height: 50,
        speed: 10,
        get x() {
            return this.lane * laneWidth + laneWidth / 2 - this.width / 2;
        },
        y: canvas.height - 100
    };

    const memes = [];
    const memeSize = 100;
    let memeSpeed = 2; // Initial meme speed
    const spawnInterval = 5000;
    let nextSpawnTime = Date.now() + spawnInterval;

    const memeImages = [
        { image: new Image(), src: 'assets/images/bingchilling.png', audio: new Audio('assets/audio/bingchilling.mp3') },
        { image: new Image(), src: 'assets/images/dreamybull.png', audio: new Audio('assets/audio/dreamybull.mp3') },
        { image: new Image(), src: 'assets/images/johnpork.png', audio: new Audio('assets/audio/johnpork.mp3') },
        { image: new Image(), src: 'assets/images/lebonbon.png', audio: new Audio('assets/audio/lebonbon.mp3') },
        { image: new Image(), src: 'assets/images/mao.png', audio: new Audio('assets/audio/mao.mp3') },
        { image: new Image(), src: 'assets/images/noway.png', audio: new Audio('assets/audio/noway.mp3') },
        { image: new Image(), src: 'assets/images/opennanoor.png', audio: new Audio('assets/audio/opennanoor.mp3') },
        { image: new Image(), src: 'assets/images/skibiditoilet.png', audio: new Audio('assets/audio/skibiditoilet.mp3') },
        { image: new Image(), src: 'assets/images/stupidnugget.png', audio: new Audio('assets/audio/stupidnugget.mp3') }
    ];

    // Log the file paths to ensure they are correct
    memeImages.forEach(meme => {
        console.log(`Loading image: ${meme.src}`);
        console.log(`Loading audio: ${meme.audio.src}`);
        meme.image.src = meme.src;
        meme.audio.load();
    });

    let currentAudio = null;
    let targetMeme = null;

    function drawPlayer() {
        ctx.fillStyle = 'blue';
        ctx.fillRect(player.x, player.y, player.width, player.height);
    }

    function updatePlayer() {
        // Player position is automatically updated based on lane
    }

    function getRandomMemes() {
        const shuffledMemes = [...memeImages].sort(() => 0.5 - Math.random());
        return shuffledMemes.slice(0, 3);
    }

    function spawnMemes() {
        const chosenMemes = getRandomMemes();
        memes.length = 0; // Clear the previous memes

        for (let lane = 0; lane < 3; lane++) {
            const meme = chosenMemes[lane];
            const x = lane * laneWidth + laneWidth / 2 - memeSize / 2;
            memes.push({ x, y: 0, image: meme.image, audio: meme.audio });
        }

        // Play the audio of one randomly selected meme from the spawned row
        const randomMemeIndex = Math.floor(Math.random() * chosenMemes.length);
        targetMeme = memes[randomMemeIndex];

        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
        }

        currentAudio = targetMeme.audio;
        currentAudio.play().catch(error => {
            console.error('Error playing audio:', error);
        });
        console.log('Playing audio:', currentAudio.src);
    }

    function drawMemes() {
        memes.forEach(meme => {
            if (meme.image.complete && meme.image.naturalHeight !== 0) {
                ctx.drawImage(meme.image, meme.x, meme.y, memeSize, memeSize);
            } else {
                console.warn(`Image not loaded: ${meme.image.src}`);
            }
        });
    }

    function updateMemes() {
        memes.forEach(meme => {
            meme.y += memeSpeed;
        });

        // Remove memes that have gone off the screen
        for (let i = memes.length - 1; i >= 0; i--) {
            if (memes[i].y > canvas.height) {
                if (memes[i] === targetMeme) {
                    alert('You missed the correct meme! Game Over!');
                    document.location.reload();
                }
                memes.splice(i, 1);
                score -= 0; // Penalize for missed memes
                updateScore();
            }
        }
    }

    function detectCollisions() {
        memes.forEach((meme, index) => {
            if (
                player.x < meme.x + memeSize &&
                player.x + player.width > meme.x &&
                player.y < meme.y + memeSize &&
                player.y + player.height > meme.y
            ) {
                memes.splice(index, 1);

                if (meme === targetMeme) {
                    score += 100; // Award 100 points for catching the correct meme
                    round++; // Increase the round count
                    updateMemeSpeed(); // Update the meme speed
                } else {
                    score += 0; // Reward for catching a meme
                }

                updateScore();

                // Spawn a new row of memes when a collision is detected
                if (memes.length === 0) {
                    spawnMemes();
                }
            }
        });
    }

    function updateScore() {
        document.getElementById('score').innerText = `Score: ${score}`;
    }

    function clear() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    function update() {
        clear();

        updatePlayer();
        drawPlayer();

        updateMemes();
        drawMemes();

        detectCollisions();

        if (Date.now() >= nextSpawnTime) {
            spawnMemes();
            nextSpawnTime = Date.now() + spawnInterval;
        }

        requestAnimationFrame(update);
    }

    function updateMemeSpeed() {
        // Increase the meme speed every 5 rounds
        if (round % 2 === 0) {
            memeSpeed += 0.1;
        }
    }

    function moveRight() {
        if (player.lane < 2) {
            player.lane++;
        }
    }

    function moveLeft() {
        if (player.lane > 0) {
            player.lane--;
        }
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'd') {
            moveRight();
        } else if (e.key === 'ArrowLeft' || e.key === 'a') {
            moveLeft();
        }
        });
        function startGame() {
            startButton.style.display = 'none';
            spawnMemes();
            update();
        }
        
        startButton.addEventListener('click', startGame);});