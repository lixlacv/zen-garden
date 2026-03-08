const canvas = document.getElementById('sandCanvas');
const ctx = canvas.getContext('2d');
const brushSlider = document.getElementById('brushSize');
const musicBtn = document.getElementById('musicBtn');
const bgMusic = document.getElementById('bgMusic');
const clearBtn = document.getElementById('clearBtn');

// Налаштування полотна
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let isDrawing = false;
let currentTool = 'rake';
let lastX = 0;
let lastY = 0;
let obstacles = []; // Тут зберігаємо і камені, і дерева
window.obstacles = obstacles; // Додайте цей рядок, щоб Cypress його бачив

// Ініціалізація піску
function initSand() {
    ctx.fillStyle = '#e8dec5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Зернистість
    for (let i = 0; i < 10000; i++) {
        ctx.fillStyle = 'rgba(0,0,0,0.02)';
        ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 1, 1);
    }
}
initSand();

// Вибір інструменту
window.setTool = function(tool) {
    currentTool = tool;
    // Візуальна активація кнопок
    document.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(tool + 'Tool')?.classList.add('active');
};

// Перевірка на зіткнення з об'єктами
function isTooCloseToObstacle(x, y) {
    return obstacles.some(obj => {
        const dist = Math.hypot(obj.x - x, obj.y - y);
        return dist < obj.size + 15; // 15px - безпечна зона
    });
}

function drawRake(x, y) {
    const numLines = 5;
    const spacing = parseInt(brushSlider.value) / 3;

    for (let i = 0; i < numLines; i++) {
        const offset = (i - (numLines - 1) / 2) * spacing;
        
        // Малюємо лінію тільки якщо вона не перетинає камінь
        if (!isTooCloseToObstacle(x + offset, y)) {
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(139, 121, 94, 0.2)';
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.moveTo(lastX + offset, lastY);
            ctx.lineTo(x + offset, y);
            ctx.stroke();
        }
    }
}

function addStone(x, y) {
    const size = parseInt(brushSlider.value) * 1.2;
    obstacles.push({ x, y, size, type: 'stone' });
    
    ctx.save();
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'rgba(0,0,0,0.2)';
    ctx.fillStyle = '#808080';
    ctx.beginPath();
    ctx.ellipse(x, y, size, size * 0.7, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function addTree(x, y) {
    const size = parseInt(brushSlider.value);
    obstacles.push({ x, y, size: size/2, type: 'tree' });

    // Стовбур
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(x - 2, y, 4, -size);
    // Крона
    ctx.fillStyle = '#ffc0cb';
    for(let i=0; i<5; i++) {
        ctx.beginPath();
        ctx.arc(x + Math.cos(i)*10, y - size + Math.sin(i)*10, size/2, 0, Math.PI*2);
        ctx.fill();
    }
}

// Події миші
canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    [lastX, lastY] = [e.clientX, e.clientY];
    
    if (currentTool === 'stone') addStone(e.clientX, e.clientY);
    if (currentTool === 'tree') addTree(e.clientX, e.clientY);
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDrawing || currentTool !== 'rake') return;
    drawRake(e.clientX, e.clientY);
    [lastX, lastY] = [e.clientX, e.clientY];
});

window.addEventListener('mouseup', () => isDrawing = false);

// Керування музикою
musicBtn.addEventListener('click', () => {
    if (bgMusic.paused) {
        bgMusic.play().catch(() => alert("Будь ласка, взаємодійте з екраном спочатку"));
        musicBtn.innerText = "🎵 Музика: Вкл";
    } else {
        bgMusic.pause();
        musicBtn.innerText = "🎵 Музика: Викл";
    }
});

// Очищення
clearBtn.addEventListener('click', () => {
    obstacles = [];
    window.obstacles = obstacles;
    initSand();
});

// Скидання розміру вікна
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initSand(); // При зміні розміру пісок оновиться
});

// Експорт для Jest (не заважає роботі в браузері)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initSand,
        isTooCloseToObstacle,
        getObstacles: () => obstacles,
        setObstacles: (val) => { obstacles = val; },
        getCurrentTool: () => currentTool,
        setTool: window.setTool
    };
}