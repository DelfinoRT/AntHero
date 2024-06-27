document.addEventListener("DOMContentLoaded", function() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 600;

    // Define paths to individual frames
    const antIdleFrames = [
        "/static/images/idle001.gif",
        "/static/images/idle002.gif",
        "/static/images/idle003.gif"
    ];

    const antWalkFrames = [
        "/static/images/walk001.gif",
        "/static/images/walk002.gif"
    ];

    let antImages = antIdleFrames.map(src => {
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

    let antHP = 30; // Initial health points
    let maxHP = 100; // Maximum health points

    // Initialize keysPressed object to track keyboard inputs
    let keysPressed = {};

    document.addEventListener('keydown', (event) => {
        keysPressed[event.key] = true;
    });

    document.addEventListener('keyup', (event) => {
        keysPressed[event.key] = false;
    });

    function update() {
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

        // Update animation frames based on movement
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

    function draw() {
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
        if (frame) {
            ctx.drawImage(frame, -25, -25, 50, 50); // Draw the ant
        }

        ctx.restore();

        // Draw HP bar
        ctx.save();
        ctx.translate(antX, antY - 20); // Position relative to ant's top center

        // Background bar
        ctx.fillStyle = "gray";
        ctx.fillRect(-25, 0, 50, 8);

        // HP bar
        let hpPercentage = antHP / maxHP;
        let hpColor = `rgb(${Math.floor(255 * (1 - hpPercentage))}, ${Math.floor(255 * hpPercentage)}, 0)`;
        ctx.fillStyle = hpColor;
        ctx.fillRect(-25, 0, 50 * hpPercentage, 8);

        // HP text
        ctx.font = "10px Arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText(`HP: ${antHP}`, 0, -10);

        ctx.restore();
    }

    function gameLoop() {
        update();
        draw();
        antFrameCount++;
        if (antFrameCount >= antFrameRate) {
            antFrame = (antFrame + 1) % antImages.length;
            antFrameCount = 0;
        }
        requestAnimationFrame(gameLoop);
    }

    gameLoop(); // Start the animation loop
});
