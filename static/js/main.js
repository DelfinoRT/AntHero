document.addEventListener("DOMContentLoaded", function() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas(); // Initial canvas size adjustment

    const antIdleFrames = [
        "/static/images/idle01.png",
        "/static/images/idle02.png",
        "/static/images/idle03.png"
    ];

    const antWalkFrames = [
        "/static/images/walking01.png",
        "/static/images/walking02.png"
    ];

    const antIdleBoostFrames = [
        "/static/images/idle01-boost.png",
        "/static/images/idle02-boost.png",
        "/static/images/idle03-boost.png"
    ];

    const antWalkBoostFrames = [
        "/static/images/walking01-boost.png",
        "/static/images/walking02-boost.png"
    ];

    const items = [
        { name: 'boots', src: '/static/images/boots.png', effect: 'speed', duration: 5000, value: 1.5 },
        { name: 'diamond', src: '/static/images/diamond.png', effect: 'points', value: 60 },
        { name: 'golden-grapes', src: '/static/images/golden-grapes.png', effect: 'hp', value: 10, points: 5 },
        { name: 'cherries', src: '/static/images/cherries.png', effect: 'hp', value: 10, points: 2 },
        { name: 'pineapples', src: '/static/images/pineapples.png', effect: 'hp', value: 10, points: 2 },
        { name: 'blueberries', src: '/static/images/blueberries.png', effect: 'hp', value: 10, points: 2 },
        { name: 'bananas', src: '/static/images/bananas.png', effect: 'hp', value: 10, points: 2 },
        { name: 'stars', src: '/static/images/star.png', effect: 'hp', value: 10, points: 2 },
        { name: 'grapes', src: '/static/images/grapes.png', effect: 'hp', value: 10, points: 2 }
    ];

    const enemies = [
        { name: 'ghost1', src: '/static/images/ghost1.png', effect: 'damage', value: 25 },
        { name: 'ghost2', src: '/static/images/ghost2.png', effect: 'damage', value: 25 },
        { name: 'ghost3', src: '/static/images/ghost3.png', effect: 'damage', value: 25 },
        { name: 'ghost4', src: '/static/images/ghost4.png', effect: 'damage', value: 25 }
    ];

    const particleConfig = {
        color: '#ffcc00',   // Yellow color for particles
        radius: 1.5,          // Particle radius
        speed: 2,           // Particle speed
        lifespan: 30,       // Frames the particle will last
        maxParticles: 30    // Maximum number of particles per burst
    };

    let particles = []; // Array to hold active particles

    let antImages = antIdleFrames.map(src => {
        let img = new Image();
        img.src = src;
        return img;
    });

    let antBoostIdleImages = antIdleBoostFrames.map(src => {
        let img = new Image();
        img.src = src;
        return img;
    });

    let antBoostWalkImages = antWalkBoostFrames.map(src => {
        let img = new Image();
        img.src = src;
        return img;
    });

    let antX = 100;
    let antY = 100;
    let antFrame = 0;
    let antFrameRate = 10;
    let antFrameCount = 0;
    let antSpeed = 1; // Initial speed of the ant
    let antDirection = "north"; // Initial direction of the ant (north)
    let antHP = 100; // Initial health points
    let maxHP = 100; // Maximum health points
    let points = 0; // Initial points
    let activeHalo = false; // Flag to track active halo
    let enemiesHit = 0;
    let isSpeedBoostActive = false;
    let keysPressed = {};
    let activeItems = [];
    let activeEnemies = [];
    let dealtDamage = {};
    let collectedItems = {}; // Object to store collected items
    let itemLifespan = 10000; // 10 seconds before starting to fade
    let itemFadeDuration = 5000; // 5 seconds fade out
    let enemyLifespan = 15000; // 15 seconds

    let gameOver = false; // Game over flag

    document.addEventListener('keydown', (event) => {
        keysPressed[event.key] = true;
    });

    document.addEventListener('keyup', (event) => {
        keysPressed[event.key] = false;
    });

    function spawnItem() {
        const item = items[Math.floor(Math.random() * items.length)];
        const x = Math.random() * (canvas.width - 50);
        const y = Math.random() * (canvas.height - 50);
        const startTime = Date.now();

        const itemImage = new Image();
        itemImage.src = item.src;
        itemImage.onerror = function() {
            console.error('Failed to load image:', item.src);
        };

        activeItems.push({ ...item, x, y, startTime, image: itemImage });
    }

    function spawnEnemy() {
      const enemy = enemies[Math.floor(Math.random() * enemies.length)];
      const x = Math.random() * (canvas.width - 50);
      const y = Math.random() * (canvas.height - 50);
      const startTime = Date.now();

      const enemyImage = new Image();
      enemyImage.src = enemy.src;
      enemyImage.onerror = function() {
        console.error('Failed to load image:', enemy.src);
      };
        
        // Assign random velocities for the enemy movement
        const velocityX = (Math.random() - 0.5) * 2;
        const velocityY = (Math.random() - 0.5) * 2;
        
      activeEnemies.push({ ...enemy, x, y, startTime, image: enemyImage, dealtDamage: false, velocityX, velocityY }); // Add dealtDamage property
    }

    function updateAnt() {
        if (gameOver) return;

        // Handle movement and direction
        if (keysPressed['ArrowRight'] && keysPressed['ArrowDown']) {
            antX += antSpeed;
            antY += antSpeed;
            antDirection = "southeast";
        } else if (keysPressed['ArrowRight'] && keysPressed['ArrowUp']) {
            antX += antSpeed;
            antY -= antSpeed;
            antDirection = "northeast";
        } else if (keysPressed['ArrowLeft'] && keysPressed['ArrowDown']) {
            antX -= antSpeed;
            antY += antSpeed;
            antDirection = "southwest";
        } else if (keysPressed['ArrowLeft'] && keysPressed['ArrowUp']) {
            antX -= antSpeed;
            antY -= antSpeed;
            antDirection = "northwest";
        } else if (keysPressed['ArrowRight']) {
            antX += antSpeed;
            antDirection = "east";
        } else if (keysPressed['ArrowLeft']) {
            antX -= antSpeed;
            antDirection = "west";
        } else if (keysPressed['ArrowDown']) {
            antY += antSpeed;
            antDirection = "south";
        } else if (keysPressed['ArrowUp']) {
            antY -= antSpeed;
            antDirection = "north";
        }

        // Prevent the ant from moving out of the canvas
        antX = Math.max(0, Math.min(canvas.width - 50, antX));
        antY = Math.max(0, Math.min(canvas.height - 50, antY));

        // Update animation frames based on movement
        if (isSpeedBoostActive) {
            antImages = (keysPressed['ArrowRight'] || keysPressed['ArrowLeft'] ||
                        keysPressed['ArrowDown'] || keysPressed['ArrowUp']) ? 
                        antBoostWalkImages : antBoostIdleImages;
        } else {
            antImages = (keysPressed['ArrowRight'] || keysPressed['ArrowLeft'] ||
                 keysPressed['ArrowDown'] || keysPressed['ArrowUp']) ? 
                antWalkFrames.map(src => {
                    let img = new Image();
                    img.src = src;
                    return img;
                }) : 
                antIdleFrames.map(src => {
                    let img = new Image();
                    img.src = src;
                    return img;
                });
        }

    }

    function drawAnt() {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

        // Draw the ant with rotation based on direction
        ctx.save();
        ctx.translate(antX + 25, antY + 25); // Translate to the ant's center

        let angle = 0; // Default angle (north)

        switch (antDirection) {
            case "east":
                angle = Math.PI / 2; // 90 degrees (east)
                break;
            case "southeast":
                angle = Math.PI * 0.75; // 135 degrees (southeast)
                break;
            case "south":
                angle = Math.PI; // 180 degrees (south)
                break;
            case "southwest":
                angle = -Math.PI * 0.75; // -135 degrees (southwest)
                break;
            case "west":
                angle = -Math.PI / 2; // -90 degrees (west)
                break;
            case "northwest":
                angle = -Math.PI * 0.25; // -45 degrees (northwest)
                break;
            case "north":
                angle = 0; // Default is north, angle = 0
                break;
            case "northeast":
            default:
                angle = Math.PI * 0.25; // 45 degrees (northeast)
                break;
        }

        ctx.rotate(angle); // Rotate the context
        
        let frame = antImages[antFrame];
        if (frame && frame.complete && frame.naturalWidth !== 0) {
            if (isSpeedBoostActive) {
                ctx.fillStyle = 'rgba(0, 0, 255, 0)'; // Blue tint
                ctx.fillRect(-25, -25, 50, 50); // Draw blue overlay
            }
            ctx.drawImage(frame, -25, -25, 50, 50); // Draw the ant
            if (activeHalo) {
                drawHalo(); // Draw the halo if active
            }
        }

        ctx.restore();

          drawHPBar(); // Draw the HP bar
    }

    function drawHalo() {
      // Draw a blue circle around the ant with a slight transparency
      ctx.beginPath();
      ctx.arc(0, 0, 30, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(0, 0, 255, 0)'; // Blue with transparency
      ctx.fill();
      ctx.closePath();
    }

    function checkAntHP() {
        if (antHP <= 0 && !gameOver) {
            endGame();
        }
    }

    function drawHPBar() {
        // Draw the HP bar above the ant
        const barWidth = 50;
        const barHeight = 5;
        const barX = antX;
        const barY = antY - 10;

        ctx.fillStyle = 'red';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        const hpWidth = (antHP / maxHP) * barWidth;
        ctx.fillStyle = 'green';
        ctx.fillRect(barX, barY, hpWidth, barHeight);
    }

    function drawItems() {
        const currentTime = Date.now();

        activeItems.forEach((item, index) => {
            const elapsed = currentTime - item.startTime;
            if (elapsed > itemLifespan + itemFadeDuration) {
                activeItems.splice(index, 1);
            } else {
                if (elapsed > itemLifespan) {
                    const fadeTime = elapsed - itemLifespan;
                    const alpha = 1 - (fadeTime / itemFadeDuration);
                    ctx.globalAlpha = alpha;
                }
                ctx.drawImage(item.image, item.x, item.y, 30, 30);
                ctx.globalAlpha = 1; // Reset alpha
            }
        });
    }

    function drawEnemies() {
        const currentTime = Date.now();

        activeEnemies.forEach((enemy, index) => {
            const elapsed = currentTime - enemy.startTime;
            if (elapsed > enemyLifespan) {
                activeEnemies.splice(index, 1);
            } else {
                ctx.drawImage(enemy.image, enemy.x, enemy.y, 50, 50);
            }
        });
    }

    function moveEnemies() {
        for (let i = 0; i < activeEnemies.length; i++) {
            const enemy = activeEnemies[i];

            // Update enemy position based on velocity
            enemy.x += enemy.velocityX;
            enemy.y += enemy.velocityY;

            // Bounce off edges
            if (enemy.x <= 0 || enemy.x >= canvas.width - 50) {
                enemy.velocityX *= -1;
            }
            if (enemy.y <= 0 || enemy.y >= canvas.height - 50) {
                enemy.velocityY *= -1;
            }

            // Draw the enemy
            ctx.drawImage(enemy.image, enemy.x, enemy.y, 50, 50);
        }
    }

    function spawnParticles(x, y) {
        for (let i = 0; i < particleConfig.maxParticles; i++) {
            let angle = Math.random() * Math.PI * 2;
            let particle = new Particle(x, y, angle);
            particles.push(particle);
        }
    }

    class Particle {
        constructor(x, y, angle) {
            this.x = x;
            this.y = y;
            this.angle = angle;
            this.speed = particleConfig.speed;
            this.radius = particleConfig.radius;
            this.life = particleConfig.lifespan;
        }

        update() {
            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed;
            this.life--;
        }

        draw(ctx) {
            ctx.save();
            ctx.fillStyle = particleConfig.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    function updateParticles() {
        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].update();
            if (particles[i].life <= 0) {
                particles.splice(i, 1); // Remove dead particles
            }
        }
    }

    function drawParticles() {
        particles.forEach(particle => {
            particle.draw(ctx);
        });
    }
    
    function checkItemCollisions() {
        for (let i = 0; i < activeItems.length; i++) {
            let item = activeItems[i];
            if (antX < item.x + 30 &&
                antX + 50 > item.x &&
                antY < item.y + 30 &&
                antY + 50 > item.y) {
                switch (item.effect) {
                    case 'speed':
                        antSpeed *= item.value;
                        isSpeedBoostActive = true; // Activate speed boost effect
                        setTimeout(() => {
                            antSpeed /= item.value;
                            isSpeedBoostActive = false; // Deactivate speed boost effect
                        }, item.duration);
                        break;
                    case 'points':
                        points += item.value;
                        break;
                    case 'hp':
                        antHP = Math.min(maxHP, antHP + item.value);
                        points += item.points;
                        break;
                }

                // Trigger particle effect
                spawnParticles(antX + 25, antY + 25);

                // Update collected items
                if (!collectedItems[item.name]) {
                    collectedItems[item.name] = { src: item.src, count: 0 };
                }
                collectedItems[item.name].count++;

                // Remove the item
                activeItems.splice(i, 1);
                i--;
            }
        }
    }

    function checkEnemyCollisions() {
      for (let i = activeEnemies.length - 1; i >= 0; i--) { // Iterate backwards
        let enemy = activeEnemies[i];
        if (antX < enemy.x + 50 &&
            antX + 50 > enemy.x &&
            antY < enemy.y + 50 &&
            antY + 50 > enemy.y) {
          if (!enemy.dealtDamage) { // Check if damage has already been dealt
            antHP = Math.max(0, antHP - enemy.value); // Deduct HP from ant
            points = Math.max(0, points - 50);
            enemy.dealtDamage = true; // Mark damage dealt
            enemiesHit++; // Increment enemies hit counter
          }

          activeEnemies.splice(i, 1); // Remove enemy sprite immediately
        }
      }
    }

    function endGame() {
        gameOver = true;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2);
        ctx.font = '24px Arial';
        ctx.fillText(`Points: ${points}`, canvas.width / 2, canvas.height / 2 + 50);

        // Display collected items
        let itemsText = 'Items Collected:\n';
        for (let key in collectedItems) {
            let item = collectedItems[key];
            itemsText += `${item.count} x ${item.name}\n`;
        }
        ctx.fillText(itemsText, canvas.width / 2, canvas.height / 2 + 100);

        let countdown = 10;
        const countdownInterval = setInterval(() => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'white';
            ctx.font = '48px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2);
            ctx.font = '24px Arial';
            ctx.fillText(`Points: ${points}`, canvas.width / 2, canvas.height / 2 + 50);
            ctx.fillText(itemsText, canvas.width / 2, canvas.height / 2 + 100);
            ctx.fillText(`Restarting in ${countdown}...`, canvas.width / 2, canvas.height / 2 + 150);

            if (countdown === 0) {
                clearInterval(countdownInterval);
                resetGame();
            }
            countdown--;
        }, 1000);
    }

    function resetGame() {
        antX = 100;
        antY = 100;
        antHP = maxHP;
        antSpeed = 1;
        points = 0;
        collectedItems = {};
        activeItems = [];
        activeEnemies = [];
        gameOver = false;
        gameLoop(); // Restart the game loop
    }

    function updateInfoPanel() {
        document.getElementById('health').innerText = antHP;
        document.getElementById('speed').innerText = antSpeed.toFixed(2);
        document.getElementById('points').innerText = points;
        document.getElementById('enemiesHit').innerText = enemiesHit;

        const itemsList = document.getElementById('collectedItems');
        itemsList.innerHTML = ''; // Clear previous items

        for (let key in collectedItems) {
            let item = collectedItems[key];
            let listItem = document.createElement('div');
            listItem.innerHTML = `<img src="${item.src}" style="width:20px;height:20px;"> x ${item.count}`;
            itemsList.appendChild(listItem);
        }
    }

    function gameLoop() {
        if (!gameOver) {
            updateAnt();
            checkItemCollisions();
            checkEnemyCollisions();
            updateParticles(); // Update particles
            drawAnt();
            drawItems();
            drawEnemies();
            moveEnemies();
            drawParticles(); // Draw particles
            updateInfoPanel();
            antFrameCount++;
            if (antFrameCount >= antFrameRate) {
                antFrame = (antFrame + 1) % antImages.length;
                antFrameCount = 0;
            }
            checkAntHP(); // Check ant's HP for game over
            requestAnimationFrame(gameLoop);
        }
    }

    setInterval(spawnItem, 3000); // Spawn a new item every 3 seconds
    setInterval(spawnEnemy, 5000); // Spawn a new enemy every 5 seconds
    gameLoop(); // Start the animation loop
});
