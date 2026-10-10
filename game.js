const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const groundY = 370;

// Player Properties
const player = {
  x: 100, y: 300, width: 32, height: 48,
  vx: 0, vy: 0, speed: 4.5, jumpPower: -11,
  grounded: false, hp: 100, coins: 0, keys: 0,
  facing: 'right', attacking: false, attackTimer: 0,
  weaponLevel: 1 // 1: Wooden Sword, 2: Iron Sword
};

// Enemy Properties (Goblin / Monster)
const enemy = {
  x: 520, y: 330, width: 40, height: 40,
  hp: 40, maxHp: 40, alive: true, dir: 1, patrolTimer: 0
};

// Treasure Chest
const chest = {
  x: 700, y: 335, width: 36, height: 35, opened: false
};

const keys = {};

window.addEventListener('keydown', e => {
  keys[e.code] = true;

  // Sword Attack (J key)
  if (e.code === 'KeyJ' && !player.attacking) {
    player.attacking = true;
    player.attackTimer = 12; // Active attack frames
  }

  // Chest Interaction (E key)
  if (e.code === 'KeyE') {
    if (!chest.opened && Math.abs(player.x - chest.x) < 40) {
      chest.opened = true;
      player.coins += 100;
      player.keys += 1;
      player.weaponLevel = 2;
      document.getElementById('weapon').innerText = "Iron Sword ⚔️";
      document.getElementById('coins').innerText = player.coins;
      document.getElementById('keys').innerText = player.keys;
    }
  }
});

window.addEventListener('keyup', e => {
  keys[e.code] = false;
});

function update() {
  // Movement Logic
  if (keys['ArrowRight'] || keys['KeyD']) {
    player.vx = player.speed;
    player.facing = 'right';
  } else if (keys['ArrowLeft'] || keys['KeyA']) {
    player.vx = -player.speed;
    player.facing = 'left';
  } else {
    player.vx = 0;
  }

  // Jump Logic
  if ((keys['ArrowUp'] || keys['KeyW'] || keys['Space']) && player.grounded) {
    player.vy = player.jumpPower;
    player.grounded = false;
  }

  // Apply Gravity
  player.vy += 0.55;

  player.x += player.vx;
  player.y += player.vy;

  // Ground Collision
  if (player.y + player.height >= groundY) {
    player.y = groundY - player.height;
    player.vy = 0;
    player.grounded = true;
  }

  // Screen Boundaries
  player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));

  // Attack Hit Detection
  if (player.attacking) {
    player.attackTimer--;
    if (player.attackTimer <= 0) player.attacking = false;

    if (enemy.alive) {
      let attackBoxX = player.facing === 'right' ? player.x + player.width : player.x - 35;
      if (attackBoxX < enemy.x + enemy.width && attackBoxX + 35 > enemy.x &&
          player.y < enemy.y + enemy.height && player.y + player.height > enemy.y) {
        enemy.hp -= player.weaponLevel === 2 ? 8 : 4;
        if (enemy.hp <= 0) enemy.alive = false;
      }
    }
  }

  // Enemy AI Movement
  if (enemy.alive) {
    enemy.x += enemy.dir * 1.5;
    if (enemy.x > 650 || enemy.x < 450) enemy.dir *= -1;
  }
}

function render() {
  // Clear Screen (Sky Gradient background)
  let bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  bgGrad.addColorStop(0, '#1e293b');
  bgGrad.addColorStop(1, '#0f172a');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw Ground / Terrain
  ctx.fillStyle = '#334155';
  ctx.fillRect(0, groundY + 30, canvas.width, canvas.height - groundY);
  ctx.fillStyle = '#10b981'; // Grass top layer
  ctx.fillRect(0, groundY, canvas.width, 30);

  // Draw Chest
  ctx.fillStyle = chest.opened ? '#78350f' : '#f59e0b';
  ctx.fillRect(chest.x, chest.y, chest.width, chest.height);

  // Draw Enemy (Monster)
  if (enemy.alive) {
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

    // Enemy Health Bar
    ctx.fillStyle = '#000';
    ctx.fillRect(enemy.x, enemy.y - 12, enemy.width, 6);
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(enemy.x, enemy.y - 12, (enemy.hp / enemy.maxHp) * enemy.width, 6);
  }

  // Draw Player Character
  ctx.fillStyle = '#3b82f6';
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // Draw Sword Slash Effect
  if (player.attacking) {
    ctx.fillStyle = '#fbbf24';
    let slashX = player.facing === 'right' ? player.x + player.width : player.x - 30;
    ctx.fillRect(slashX, player.y + 12, 30, 14);
  }
}

function gameLoop() {
  update();
  render();
  requestAnimationFrame(gameLoop);
}

gameLoop();
