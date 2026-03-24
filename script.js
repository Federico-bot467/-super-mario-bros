const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const GRAVITY = 0.8;
const WORLD_WIDTH = 2000;
let cameraX = 0;

let player = {
    x: 100, y: 200, width: 40, height: 40,
    velX: 0, velY: 0, speed: 6, jumpPower: -18, grounded: false
};

let keys = {};
let moveLeft = false;
let moveRight = false;

let platforms = [
    {x: 0, y: 350, width: WORLD_WIDTH, height: 50},
    {x: 300, y: 280, width: 200, height: 20},
    {x: 600, y: 200, width: 150, height: 20},
    {x: 900, y: 280, width: 250, height: 20},
    {x: 1300, y: 150, width: 180, height: 20},
    {x: 1600, y: 250, width: 300, height: 20}
];

let coins = [
    {x: 400, y: 230, width: 25, height: 25, collected: false},
    {x: 700, y: 150, width: 25, height: 25, collected: false},
    {x: 1000, y: 230, width: 25, height: 25, collected: false},
    {x: 1400, y: 100, width: 25, height: 25, collected: false}
];

let enemies = [
    {x: 500, y: 320, width: 35, height: 35, velX: -3, alive: true},
    {x: 1200, y: 320, width: 35, height: 35, velX: 3, alive: true}
];

let score = 0;
let gameOver = false;
let won = false;
const goalX = 1900;

function collides(a, b) {
    return !(a.x + a.width < b.x || a.x > b.x + b.width || a.y + a.height < b.y || a.y > b.y + b.height);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Cielo
    ctx.fillStyle = '#5C94FC';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Nuvole
    ctx.fillStyle = 'white';
    ctx.globalAlpha = 0.8;
    ctx.beginPath(); ctx.ellipse(150 - cameraX*0.3, 60, 40, 25, 0, 0, 2*Math.PI); ctx.fill();
    ctx.beginPath(); ctx.ellipse(200 - cameraX*0.3, 60, 30, 25, 0, 0, 2*Math.PI); ctx.fill();
    ctx.beginPath(); ctx.ellipse(250 - cameraX*0.3, 70, 35, 20, 0, 0, 2*Math.PI); ctx.fill();
    ctx.beginPath(); ctx.ellipse(600 - cameraX*0.3, 100, 40, 25, 0, 0, 2*Math.PI); ctx.fill();
    ctx.beginPath(); ctx.ellipse(650 - cameraX*0.3, 100, 30, 25, 0, 0, 2*Math.PI); ctx.fill();
    ctx.globalAlpha = 1;
    
    // Piattaforme
    ctx.fillStyle = '#8B4513';
    for (let p of platforms) {
        let sx = p.x - cameraX;
        if (sx + p.width > 0 && sx < canvas.width) {
            ctx.fillRect(sx, p.y, p.width, p.height);
            ctx.fillStyle = '#228B22';
            ctx.fillRect(sx, p.y, p.width, 10);
            ctx.fillStyle = '#8B4513';
        }
    }
    
    // Monete
    ctx.fillStyle = '#FFCC00';
    for (let c of coins) {
        if (!c.collected) {
            let sx = c.x - cameraX;
            ctx.beginPath();
            ctx.arc(sx + 12, c.y + 12, 12, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // Nemici
    for (let e of enemies) {
        if (e.alive) {
            let sx = e.x - cameraX;
            ctx.fillStyle = '#8B0000';
            ctx.fillRect(sx, e.y, e.width, e.height);
            ctx.fillStyle = 'white';
            ctx.fillRect(sx + 5, e.y + 8, 8, 8);
            ctx.fillRect(sx + 22, e.y + 8, 8, 8);
            ctx.fillStyle = '#000';
            ctx.fillRect(sx + 8, e.y + 11, 3, 3);
            ctx.fillRect(sx + 25, e.y + 11, 3, 3);
        }
    }
    
    // Mario
    let px = player.x - cameraX;
    ctx.fillStyle = '#E4000F'; ctx.fillRect(px, player.y, 40, 12);
    ctx.fillStyle = '#FDD5A3'; ctx.fillRect(px + 8, player.y + 8, 24, 18);
    ctx.fillStyle = '#000'; 
    ctx.fillRect(px + 13, player.y + 13, 5, 5);
    ctx.fillRect(px + 24, player.y + 13, 5, 5);
    ctx.fillStyle = '#E4000F'; ctx.fillRect(px + 5, player.y + 22, 30, 15);
    ctx.fillStyle = '#0000FF'; ctx.fillRect(px + 5, player.y + 32, 30, 12);
    ctx.fillStyle = '#8B4513'; 
    ctx.fillRect(px + 5, player.y + 38, 12, 6);
    ctx.fillRect(px + 25, player.y + 38, 12, 6);
    
    // Testo
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Punti: ${score}`, 20, 40);
    ctx.fillText('1-1', 350, 40);
    
    if (gameOver) {
        ctx.fillStyle = 'red';
        ctx.font = '40px Arial';
        ctx.fillText('GAME OVER', 180, 200);
    }
    if (won) {
        ctx.fillStyle = '#FFD700';
        ctx.font = '40px Arial';
        ctx.fillText('HAI VINTO!', 180, 200);
    }
}

function update() {
    if (gameOver || won) return;
    
    player.velX = 0;
    if (moveLeft || keys['ArrowLeft'] || keys['a'] || keys['A']) player.velX = -player.speed;
    if (moveRight || keys['ArrowRight'] || keys['d'] || keys['D']) player.velX = player.speed;
    
    player.velY += GRAVITY;
    
    // Movimento X + collisione piattaforme
    player.x += player.velX;
    for (let p of platforms) {
        if (collides(player, p)) {
            if (player.velX > 0) player.x = p.x - player.width;
            if (player.velX < 0) player.x = p.x + p.width;
            player.velX = 0;
        }
    }
    
    // === CONFINI DEL MONDO (fix sparizione) ===
    if (player.x < 0) {
        player.x = 0;
        player.velX = 0;
    }
    if (player.x + player.width > WORLD_WIDTH) {
        player.x = WORLD_WIDTH - player.width;
        player.velX = 0;
    }
    
    // Movimento Y + collisione
    player.y += player.velY;
    player.grounded = false;
    for (let p of platforms) {
        if (collides(player, p)) {
            if (player.velY > 0) {
                player.y = p.y - player.height;
                player.velY = 0;
                player.grounded = true;
            } else if (player.velY < 0) {
                player.y = p.y + p.height;
                player.velY = 0;
            }
        }
    }
    
    // Morte se cadi dal basso
    if (player.y > 450) gameOver = true;
    
    // Telecamera
    cameraX = Math.max(0, Math.min(player.x - canvas.width / 3, WORLD_WIDTH - canvas.width));
    
    // Monete
    for (let c of coins) {
        if (!c.collected && collides(player, c)) {
            c.collected = true;
            score += 100;
        }
    }
    
    // Nemici
    for (let e of enemies) {
        if (e.alive) {
            e.x += e.velX;
            if (collides(player, e)) {
                if (player.velY > 0 && player.y + player.height - player.velY <= e.y + 5) {
                    e.alive = false;
                    player.velY = -14;
                    score += 200;
                } else {
                    gameOver = true;
                }
            }
        }
    }
    
    if (player.x > goalX) won = true;
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// === CONTROLLI TOUCH (perfetti per iPhone) ===
const leftBtn = document.getElementById('left-btn');
const rightBtn = document.getElementById('right-btn');
const jumpBtn = document.getElementById('jump-btn');

leftBtn.addEventListener('touchstart', e => { e.preventDefault(); moveLeft = true; });
leftBtn.addEventListener('touchend', () => moveLeft = false);
rightBtn.addEventListener('touchstart', e => { e.preventDefault(); moveRight = true; });
rightBtn.addEventListener('touchend', () => moveRight = false);

jumpBtn.addEventListener('touchstart', e => { 
    e.preventDefault(); 
    if (player.grounded) {
        player.velY = player.jumpPower;
        player.grounded = false;
    }
});

// Supporto tastiera (per prova su PC)
window.addEventListener('keydown', e => {
    keys[e.key] = true;
    if ((e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') && player.grounded) {
        player.velY = player.jumpPower;
        player.grounded = false;
    }
});
window.addEventListener('keyup', e => keys[e.key] = false);

gameLoop();
