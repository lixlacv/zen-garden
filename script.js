/**
 * Zen Garden - Професійна логіка малювання з адаптивним розміром ліній
 */

/* DOM-посилання ініціалізуються в initDOMBindings */
let canvas = null;
let ctx = null;
let brushSlider = null;
let musicBtn = null;
let bgMusic = null;
let clearBtn = null;
let rakeToolBtn = null;
let stoneToolBtn = null;
let treeToolBtn = null;

/* Auth DOM */
let loginBtn = null;
let registerBtn = null;
let logoutBtn = null;
let authStatus = null;
let authModal = null;
let authBackdrop = null;
let authCloseBtn = null;
let authForm = null;
let authModeInput = null;
let authEmail = null;
let authName = null;
let authPassword = null;
let authSwitch = null;
let authMessage = null;
let authSubmit = null; // added: submit button reference

/**
 * Ініціалізація DOM-зв'язків і слухачів.
 * Викликайте після того, як потрібні елементи додані в document (наприклад у тестах).
 */
export function initDOMBindings() {
  canvas = document.getElementById('sandCanvas');
  ctx = canvas ? canvas.getContext('2d') : null;
  brushSlider = document.getElementById('brushSize');
  musicBtn = document.getElementById('musicBtn');
  bgMusic = document.getElementById('bgMusic');
  clearBtn = document.getElementById('clearBtn');
  rakeToolBtn = document.getElementById('rakeTool');
  stoneToolBtn = document.getElementById('stoneTool');
  treeToolBtn = document.getElementById('treeTool');

  // Auth DOM bindings
  loginBtn = document.getElementById('loginBtn');
  registerBtn = document.getElementById('registerBtn');
  logoutBtn = document.getElementById('logoutBtn');
  authStatus = document.getElementById('authStatus');
  authModal = document.getElementById('authModal');
  authBackdrop = document.getElementById('authBackdrop');
  authCloseBtn = document.getElementById('authCloseBtn');
  authForm = document.getElementById('authForm');
  authModeInput = document.getElementById('authMode');
  authEmail = document.getElementById('authEmail');
  authName = document.getElementById('authName');
  authPassword = document.getElementById('authPassword');
  authSwitch = document.getElementById('authSwitch');
  authMessage = document.getElementById('authMessage');
  authSubmit = document.getElementById('authSubmit'); // added assignment

  // Безпечні прив'язки: перевіряємо наявність елементів перед викликом
  if (rakeToolBtn) rakeToolBtn.addEventListener('click', () => window.setTool('rake'));
  if (stoneToolBtn) stoneToolBtn.addEventListener('click', () => window.setTool('stone'));
  if (treeToolBtn) treeToolBtn.addEventListener('click', () => window.setTool('tree'));

  // Make rake active on first page load (тільки якщо setTool доступний)
  if (typeof window.setTool === 'function') window.setTool('rake');

  // Ініціалізуємо кастомний курсор (створюється лише якщо canvas існує)
  if (canvas && brushSlider) createRakeCursor();

  // Canvas mouse handlers (тільки якщо canvas існує)
  if (canvas) {
    canvas.addEventListener('mousedown', (e) => {
      isDrawing = true;
      lastX = e.clientX;
      lastY = e.clientY;
      lastTime = performance.now();
      skipInitial = false;
      pts = [{ x: lastX, y: lastY }];
      if (currentTool === 'stone') addStone(e.clientX, e.clientY);
      if (currentTool === 'tree') addTree(e.clientX, e.clientY);
    });

    canvas.addEventListener('mousemove', (e) => {
      if (!isDrawing || currentTool !== 'rake') return;
      drawRake(e.clientX, e.clientY);
    });
  }

  // Auth UI handlers
  if (loginBtn) loginBtn.addEventListener('click', () => showAuthModal('login'));
  if (registerBtn) registerBtn.addEventListener('click', () => showAuthModal('register'));
  if (logoutBtn) logoutBtn.addEventListener('click', () => {
    logoutUser();
    posthog?.capture?.('user_logged_out');
    updateAuthUI();
  });
  if (authBackdrop) authBackdrop.addEventListener('click', closeAuthModal);
  if (authCloseBtn) authCloseBtn.addEventListener('click', closeAuthModal);

  if (authSwitch) {
    authSwitch.addEventListener('click', () => {
      const mode = (authModeInput && authModeInput.value) === 'login' ? 'register' : 'login';
      setAuthMode(mode);
    });
  }

  if (authForm) {
    authForm.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      authMessage.innerText = '';
      const mode = authModeInput.value;
      const email = (authEmail.value || '').trim().toLowerCase();
      const name = (authName.value || '').trim();
      const password = authPassword.value || '';

      if (!email || !password) {
        authMessage.innerText = 'Будь ласка, заповніть email і пароль.';
        return;
      }

      try {
        if (mode === 'register') {
          const user = await registerUser({ email, name, password });
          // Set Sentry user context after successful registration
          Sentry?.setUser?.({
            id: user.id,           // numeric id now
            email: user.email,
            segment: 'standard_user'
          });
          posthog?.capture?.('user_registered', { email });
          Sentry?.captureMessage?.('User registered', { level: 'info' });
          closeAuthModal();
        } else {
          const user = await loginUser({ email, password });
          // Set Sentry user context after successful login
          Sentry?.setUser?.({
            id: user.id,           // numeric id now
            email: user.email,
            segment: 'standard_user'
          });
          posthog?.capture?.('user_logged_in', { email });
          Sentry?.captureMessage?.('User logged in', { level: 'info' });
          closeAuthModal();
        }
        updateAuthUI();
      } catch (err) {
        authMessage.innerText = err.message || 'Помилка автентифікації';
        Sentry?.captureException?.(err);
      }
    });
  }

  // Global handlers
  window.addEventListener('mouseup', () => (isDrawing = false));
  if (musicBtn && bgMusic) {
    musicBtn.addEventListener('click', () => {
      if (bgMusic.paused) {
        bgMusic.play().catch(() => {});
        musicBtn.innerText = '🎵 Музика: Вкл';

        // Відстежуємо увімкнення музики
      posthog.capture('music_toggled', { 
        action: 'play',
        status: 'on' 
      });

      } else {
        bgMusic.pause();
        musicBtn.innerText = '🎵 Музика: Викл';

        // Відстежуємо вимкнення музики
      posthog.capture('music_toggled', { 
        action: 'pause',
        status: 'off' 
      });

      }
    });
  }

const breakBtn = document.getElementById('breakBtn');

if (breakBtn) {
  breakBtn.addEventListener('click', () => {
    Sentry?.captureMessage?.("Simulating critical error...");

    // 1. Спочатку показуємо повідомлення користувачу
    alert("Зараз буде згенеровано помилку для Sentry!");

    // 2. Потім викидаємо помилку, яку перехопить Sentry
    throw new Error("Sentry Test Error: Something went wrong!");
  });
}

  // Надійне прив'язання кнопки очищення:
  if (clearBtn) {
    const handler = (ev) => {
      if (ev) ev.preventDefault(); // Додаємо безпеку
      clearObstacles();
    };
    clearBtn.addEventListener('click', handler);
  }

  // Делегований обробник (додається лише один раз)
  if (!initDOMBindings._delegationAdded) {
    document.addEventListener('click', (ev) => {
      const t = ev && ev.target;
      if (t && t.id === 'clearBtn') {
        clearObstacles();
      }
    });
    initDOMBindings._delegationAdded = true;
  }

  // Resize binding (safe)
  window.addEventListener('resize', () => {
    if (typeof resize === 'function') resize();
  });

  // Update music label on load if elements exist
  if (musicBtn) updateMusicButtonLabel();

  // Ensure auth UI reflects current state on init
  updateAuthUI();

  // Custom email validation message
  if (authEmail) {
    // Clear custom message when user types
    authEmail.addEventListener('input', () => authEmail.setCustomValidity(''));

    // Provide custom text instead of browser's native "include @..." message
    authEmail.addEventListener('invalid', () => {
      if (!authEmail.value) {
        authEmail.setCustomValidity('Будь ласка, введіть email.');
      } else {
        authEmail.setCustomValidity('Введіть пошту у форматі user@email.com');
      }
    });

    // Optional: show message immediately on blur if field invalid
    authEmail.addEventListener('blur', () => {
      if (!authEmail.checkValidity()) authEmail.reportValidity();
    });
  }
}

/* --- Кінець initDOMBindings --- */

/* Налаштування полотна */
function resize() {
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  initSand();
}

let isDrawing = false;
let currentTool = 'rake';
let lastX = 0;
let lastY = 0;
let lastTime = 0;
let velocity = 0;
const PAUSE_SKIP_MS = 120; // If pointer was idle longer than this, skip the first stroke segment to avoid a start "blob"
let skipInitial = false;   // skip the first small movement after a pause
let obstacles = [];
window.obstacles = obstacles;

// Points buffer for midpoint smoothing
let pts = [];

/* ---------------------------
   Simple client-only auth
   - stores users in localStorage under "zg_users"
   - current user email stored under "zg_currentUser"
   - uses SHA-256 for password hashing via Web Crypto
 --------------------------- */

function getUsers() {
  try {
    const raw = localStorage.getItem('zg_users');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function saveUsers(arr) {
  localStorage.setItem('zg_users', JSON.stringify(arr || []));
}
function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem('zg_currentUser') || 'null');
  } catch {
    return null;
  }
}
function setCurrentUser(userObj) {
  localStorage.setItem('zg_currentUser', JSON.stringify(userObj || null));
}

async function hashPassword(password) {
  const enc = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', enc);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Replace existing registerUser with this
async function registerUser({ email, name = '', password }) {
  const users = getUsers();
  if (users.find(u => u.email === email)) {
    throw new Error('Користувач з таким email вже існує.');
  }
  const pwdHash = await hashPassword(password);
  const id = getNextUserId();
  const user = { id, email, name, pwdHash, createdAt: new Date().toISOString() };
  users.push(user);
  saveUsers(users);

  // persist current user including numeric id
  setCurrentUser({ id: user.id, email: user.email, name: user.name });

  return user;
}

// Replace existing loginUser with this
async function loginUser({ email, password }) {
  const users = getUsers();
  const user = users.find(u => u.email === email);
  if (!user) throw new Error('Користувача не знайдено.');
  const pwdHash = await hashPassword(password);
  if (pwdHash !== user.pwdHash) throw new Error('Невірний пароль.');

  // If this user record was created before ids existed, assign one now (migration)
  if (!user.id) {
    user.id = getNextUserId();
    saveUsers(users); // persist migration
  }

  // persist current user including numeric id
  setCurrentUser({ id: user.id, email: user.email, name: user.name || '' });
  return user;
}

function logoutUser() {
  setCurrentUser(null);
  // Clear Sentry user context on logout to avoid cross-session leakage
  try {
    Sentry?.setUser?.(null);
  } catch {
    // ignore if Sentry not available
  }
}

// Add near getUsers/saveUsers
function getNextUserId() {
  const users = getUsers();
  // find max numeric id, fallback 0
  let max = 0;
  for (const u of users) {
    const n = Number(u.id);
    if (!Number.isNaN(n) && n > max) max = n;
  }
  return max + 1;
}

/* UI helpers for auth modal */
function showAuthModal(mode = 'login') {
  if (!authModal) return;
  setAuthMode(mode);
  authModal.style.display = '';
  document.body.style.overflow = 'hidden';
}
function closeAuthModal() {
  if (!authModal) return;
  authModal.style.display = 'none';
  document.body.style.overflow = '';
  authForm && authForm.reset();
  authMessage && (authMessage.innerText = '');
}
function setAuthMode(mode) {
  if (!authModeInput) return;
  authModeInput.value = mode;
  const isRegister = mode === 'register';
  const title = isRegister ? 'Реєстрація' : 'Вхід';
  document.getElementById('authTitle').innerText = title;
  authForm.querySelector('#nameRow').style.display = isRegister ? '' : 'none';
  authSwitch.innerText = isRegister ? 'Перейти до входу' : 'Перейти до реєстрації';
  authSubmit.innerText = isRegister ? 'Зареєструватися' : 'Увійти';
}

/* Update auth UI area */
function updateAuthUI() {
  const cu = getCurrentUser();
  if (cu && cu.email) {
    if (loginBtn) loginBtn.style.display = 'none';
    if (registerBtn) registerBtn.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = '';
    if (authStatus) authStatus.innerText = `Ви увійшли як ${cu.name || cu.email}`;
  } else {
    if (loginBtn) loginBtn.style.display = '';
    if (registerBtn) registerBtn.style.display = '';
    if (logoutBtn) logoutBtn.style.display = 'none';
    if (authStatus) authStatus.innerText = 'Ви не увійшли';
  }
}

/**
 * ГЕНЕРАЦІЯ ЗЕРНИСТОГО ПІСКУ (ЯК НА РЕФЕРЕНСІ)
 */
export function initSand() {
  if (!ctx || !canvas) return;
  const sandBase = '#f2ece0';
  ctx.fillStyle = sandBase;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;

  // Створення дуже щільного шуму для ефекту зернистості
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 15;
    data[i]     = 242 + noise; // R
    data[i + 1] = 236 + noise; // G
    data[i + 2] = 224 + noise; // B
    data[i + 3] = 255;         // A
  }

  ctx.putImageData(imgData, 0, 0);

  // Додаткові мікро-цятки для об'єму
  ctx.save();
  for (let i = 0; i < 20000; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.03)';
    ctx.fillRect(x, y, 1, 1);
  }
  ctx.restore();

  // Перемальовка всіх об'єктів
  obstacles.forEach(drawObstacle);
}

// Вибір інструменту
window.setTool = function (tool) {
  currentTool = tool;
  document.querySelectorAll('button').forEach((btn) => btn.classList.remove('active'));
  document.getElementById(tool + 'Tool')?.classList.add('active');

  // Оновлюємо вигляд курсора негайно при зміні інструменту
  const cursorCanvas = document.getElementById('rakeCursorCanvas');
  if (cursorCanvas) {
    if (currentTool !== 'rake') {
      cursorCanvas.style.display = 'none';
      if (canvas) canvas.style.cursor = 'default';
    }
  }
};

/* --- Custom rake cursor overlay (перетворено на функцію) --- */
function createRakeCursor() {
  if (!canvas || !brushSlider) return;

  const CURSOR_PX = 64;
  if (document.getElementById('rakeCursorCanvas')) return;

  const cursorCanvas = document.createElement('canvas');
  cursorCanvas.id = 'rakeCursorCanvas';
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  cursorCanvas.width = CURSOR_PX * dpr;
  cursorCanvas.height = CURSOR_PX * dpr;
  cursorCanvas.style.width = CURSOR_PX + 'px';
  cursorCanvas.style.height = CURSOR_PX + 'px';
  cursorCanvas.style.position = 'fixed';
  cursorCanvas.style.pointerEvents = 'none';
  cursorCanvas.style.zIndex = 99999;
  cursorCanvas.style.transformOrigin = '50% 50%';
  cursorCanvas.style.left = '0px';
  cursorCanvas.style.top = '0px';
  cursorCanvas.style.display = 'none';
  document.body.appendChild(cursorCanvas);

  const cctx = cursorCanvas.getContext('2d');
  cctx.scale(dpr, dpr);

  function drawRakeStatic() {
    const w = CURSOR_PX;
    const h = CURSOR_PX;
    cctx.clearRect(0, 0, w, h);
    cctx.save();
    cctx.translate(w / 2, h / 2);

    cctx.strokeStyle = 'rgba(60,60,60,0.95)';
    cctx.lineWidth = 3;
    cctx.lineCap = 'round';
    cctx.beginPath();
    cctx.moveTo(-10, 0);
    cctx.lineTo(8, 0);
    cctx.stroke();

    cctx.beginPath();
    cctx.moveTo(8, -12);
    cctx.lineTo(8, 12);
    cctx.stroke();

    for (let y = -10; y <= 10; y += 5) {
      cctx.beginPath();
      cctx.moveTo(8, y);
      cctx.lineTo(18, y);
      cctx.stroke();
    }
    cctx.restore();
  }
  drawRakeStatic();

  // State
  let lastMouseX = 0;
  let lastMouseY = 0;
  // eslint-disable-next-line no-unused-vars
  let lastMoveTime = 0;
  let angle = 0;
  let scale = Math.max(0.6, parseInt(brushSlider.value || 30) / 30);
  let isOverCanvas = false;

  function updateScaleFromSlider() {
    const b = parseInt(brushSlider.value || 30);
    scale = Math.max(0.5, Math.min(2.0, b / 30));
  }
  if (brushSlider) brushSlider.addEventListener('input', updateScaleFromSlider);
  updateScaleFromSlider();

  function onMove(e) {
    const x = e.clientX;
    const y = e.clientY;

    // Якщо миша не над полотном або вибрано не граблі — ховаємо кастомний курсор
    if (!isOverCanvas || currentTool !== 'rake') {
      cursorCanvas.style.display = 'none';
      if (isOverCanvas && canvas) canvas.style.cursor = 'default';
      return;
    }

    cursorCanvas.style.display = '';
    if (canvas) canvas.style.cursor = 'none';

    const now = performance.now();
    const dx = x - lastMouseX;
    const dy = y - lastMouseY;

    if (Math.hypot(dx, dy) > 1) {
      angle = Math.atan2(dy, dx) + Math.PI;
    }
    lastMouseX = x;
    lastMouseY = y;
    lastMoveTime = now;

    cursorCanvas.style.left = x + 'px';
    cursorCanvas.style.top = y + 'px';
    cursorCanvas.style.transform = `translate(-50%,-50%) rotate(${angle}rad) scale(${scale})`;
  }

  function onEnter() {
    isOverCanvas = true;
    if (currentTool === 'rake') {
      cursorCanvas.style.display = '';
      if (canvas) canvas.style.cursor = 'none';
    } else {
      cursorCanvas.style.display = 'none';
      if (canvas) canvas.style.cursor = 'default';
    }
  }

  function onLeave() {
    isOverCanvas = false;
    cursorCanvas.style.display = 'none';
    if (canvas) canvas.style.cursor = 'default';
  }

  canvas.addEventListener('mouseenter', onEnter);
  canvas.addEventListener('mouseleave', onLeave);
  document.addEventListener('mousemove', onMove);
  window.addEventListener('blur', onLeave);
}

/* --- Кінець кастомного курсора --- */

/**
 * Obstacle collision helpers
 */
function pointInRect(x, y, rx, ry, rw, rh) {
  return x >= rx && x <= rx + rw && y >= ry && y <= ry + rh;
}

function pointNearCircle(px, py, cx, cy, r) {
  const dx = cx - px;
  const dy = cy - py;
  return (dx * dx + dy * dy) <= r * r;
}

function treeCollisionPoint(obj, x, y, pad = 3) {
  const canopyCx = obj.x;
  const canopyCy = obj.y - obj.size;
  const canopyR = obj.size / 2.8 + pad;
  if (pointNearCircle(x, y, canopyCx, canopyCy, canopyR)) return true;

  const rx = obj.x - 2 - pad;
  const ry = obj.y - obj.size - pad;
  const rw = 4 + pad * 2;
  const rh = obj.size + pad * 2;
  return pointInRect(x, y, rx, ry, rw, rh);
}

function obstacleCollisionPoint(obj, x, y, pad = 3) {
  if (obj.type === 'tree') return treeCollisionPoint(obj, x, y, pad);
  // stones: circular-ish ellipse approximated by size radius
  const dx = obj.x - x;
  const dy = obj.y - y;
  // Reduced padding for stones to allow rake lines to get closer
  const r = obj.size + pad;
  return dx * dx + dy * dy <= r * r;
}

export function isTooCloseToObstacle(x, y, margin = 10) {
  return obstacles.some((obj) => obstacleCollisionPoint(obj, x, y, margin));
}

function quadIntersectsAnyObstacle(s, c, e, margin = 3, samples = 7) {
  if (!obstacles.length) return false;
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const it = 1 - t;
    const x = it * it * s.x + 2 * it * t * c.x + t * t * e.x;
    const y = it * it * s.y + 2 * it * t * c.y + t * t * e.y;
    for (let j = 0; j < obstacles.length; j++) {
      if (obstacleCollisionPoint(obstacles[j], x, y, margin)) return true;
    }
  }
  return false;
}

/**
 * ПЛАВНЕ МАЛЮВАННЯ ГРАБЛЯМИ
 */
function drawRake(x, y) {
  const now = performance.now();
  const dx = x - lastX;
  const dy = y - lastY;
  const distance = Math.hypot(dx, dy);
  const dt = Math.max(1, now - (lastTime || now));
  velocity = distance / dt * 16.67;
  lastTime = now;

  if (distance < 0.8) return;

  if (dt > PAUSE_SKIP_MS) {
    pts = [{ x, y }];
    lastX = x;
    lastY = y;
    lastTime = now;
    skipInitial = true;
    return;
  }

  pts.push({ x, y });

  const rakeWidth = parseInt((brushSlider && brushSlider.value) || 30);
  const baseLW = Math.max(0.5, rakeWidth / (18 * (0.9 + velocity * 0.5)));
  if (skipInitial) {
    if (distance < baseLW * 1.2) {
      lastX = x; lastY = y; lastTime = now;
      return;
    } else {
      skipInitial = false;
    }
  }

  if (pts.length < 3) {
    lastX = x; lastY = y;
    return;
  }

  const p0 = pts[pts.length - 3];
  const p1 = pts[pts.length - 2];
  const p2 = pts[pts.length - 1];

  const mx1 = { x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2 };
  const mx2 = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };

  const tx = p2.x - p0.x;
  const ty = p2.y - p0.y;
  const tlen = Math.hypot(tx, ty) || 1;
  const nx = -ty / tlen;
  const ny = tx / tlen;

  const speedFactor = Math.min(3, Math.max(0.6, 1 / (0.3 + velocity)));
  const numLines = 5;
  const spacing = rakeWidth / (numLines - 1) * (0.9 + (1 - speedFactor) * 0.5);

  // 1) carve groove using quadratic curve between midpoints
  if (Math.hypot(mx2.x - mx1.x, mx2.y - mx1.y) > baseLW * 0.6) {
    // FIX: Only erase if the path doesn't hit an obstacle (reduced margin to 1)
    if (!quadIntersectsAnyObstacle(mx1, p1, mx2, 1, 10)) {
      if (ctx) {
        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = `rgba(0,0,0,${Math.min(0.18, 0.06 + (1 - speedFactor) * 0.14)})`;
        ctx.lineWidth = baseLW * 1.8;
        ctx.beginPath();
        ctx.moveTo(mx1.x, mx1.y);
        ctx.quadraticCurveTo(p1.x, p1.y, mx2.x, mx2.y);
        ctx.stroke();
        ctx.restore();
      }
    }
  }

  if (!ctx) return;
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const shadowBase = '#dfd5bd';
  const deepBase = '#d3c7a8';
  const lightBase = '#f9f7f2';

  for (let i = 0; i < numLines; i++) {
    const offset = (i - (numLines - 1) / 2) * spacing;
    const ox = nx * offset;
    const oy = ny * offset;

    const s = { x: mx1.x + ox, y: mx1.y + oy };
    const e = { x: mx2.x + ox, y: mx2.y + oy };
    const c = { x: p1.x + ox, y: p1.y + oy };

    // Reduced margin to 1 to allow lines to be very close to stones
    if (quadIntersectsAnyObstacle(s, c, e, 1, 12)) continue;

    ctx.save();
    ctx.filter = 'blur(1px)';
    ctx.strokeStyle = shadowBase;
    ctx.lineWidth = baseLW * 2.6 * speedFactor;
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.quadraticCurveTo(c.x, c.y, e.x, e.y);
    ctx.stroke();
    ctx.restore();

    ctx.strokeStyle = lightBase;
    ctx.lineWidth = baseLW * 1.1 * (1.1 - velocity * 0.05);
    ctx.globalAlpha = Math.min(1, 0.9 + (1 - speedFactor) * 0.4);
    ctx.beginPath();
    ctx.moveTo(s.x - baseLW / 2, s.y - baseLW / 2);
    ctx.quadraticCurveTo(c.x - baseLW / 2, c.y - baseLW / 2, e.x - baseLW / 2, e.y - baseLW / 2);
    ctx.stroke();

    ctx.strokeStyle = deepBase;
    ctx.lineWidth = Math.max(0.4, baseLW * 0.9 * speedFactor);
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.moveTo(s.x + 0.35, s.y + 0.35);
    ctx.quadraticCurveTo(c.x + 0.35, c.y + 0.35, e.x + 0.35, e.y + 0.35);
    ctx.stroke();
  }

  ctx.restore();
  if (pts.length > 30) pts = pts.slice(-6);
  lastX = x;
  lastY = y;
}

function addStone(x, y) {
  const size = Math.max(15, parseInt((brushSlider && brushSlider.value) || 30) * 0.7);
  obstacles.push({ x, y, size, type: 'stone' });
  drawObstacle(obstacles[obstacles.length - 1]);

  // Додаємо відстеження події
  posthog.capture('obstacle_placed', {
    type: 'stone',
    size: size,
    x_pos: x,
    y_pos: y
  });
}

function addTree(x, y) {
  const size = Math.max(20, parseInt((brushSlider && brushSlider.value) || 30));
  obstacles.push({ x, y, size, type: 'tree' });
  drawObstacle(obstacles[obstacles.length - 1]);

  posthog.capture('obstacle_placed', {
    type: 'tree',
    size: size,
    x_pos: x,
    y_pos: y
  });
}

export function clearObstacles() {
  // Очищаємо масив, зберігаючи ту саму референцію
  obstacles.length = 0;

  // Скидаємо допоміжні буфери
  pts = [];
  lastX = 0;
  lastY = 0;
  lastTime = 0;
  skipInitial = false;

  posthog.capture('garden_cleared');

  // Перемалювати полотно, якщо є контекст
  if (typeof initSand === 'function') initSand();
}

function drawObstacle(obj) {
  if (!ctx) return;
  ctx.save();
  if (obj.type === 'stone') {
    ctx.shadowBlur = 12;
    ctx.shadowColor = 'rgba(0,0,0,0.12)';
    ctx.fillStyle = '#b0b0b0';
    ctx.beginPath();
    ctx.ellipse(obj.x, obj.y, obj.size, obj.size * 0.75, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.beginPath();
    ctx.ellipse(obj.x - obj.size / 3, obj.y - obj.size / 3, obj.size / 2, obj.size / 4, 0.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (obj.type === 'tree') {
    ctx.shadowBlur = 4;
    ctx.shadowColor = 'rgba(0,0,0,0.1)';
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(obj.x - 2, obj.y, 4, -obj.size);
    ctx.fillStyle = '#d81b60';
    for (let i = 0; i < 7; i++) {
      ctx.beginPath();
      ctx.arc(obj.x + Math.cos(i) * 9, obj.y - obj.size + Math.sin(i) * 7, obj.size / 2.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

/* Обробники resize/load для реального застосунку */
window.addEventListener('load', () => {
  // Викликаємо resize та ініціалізацію DOM, якщо елементи вже в документі
  if (!canvas) {
    // Якщо елементи ще не створені, initDOMBindings має бути викликаний зовні (наприклад у тестах)
    initDOMBindings();
  }
  resize();
  updateMusicButtonLabel();
});

/* Оновлення підпису кнопки музики */
function updateMusicButtonLabel() {
  if (!musicBtn) return;
  const isPlaying = !!(bgMusic && !bgMusic.paused);
  musicBtn.innerText = isPlaying ? '🎵 Музика: Вкл' : '🎵 Музика: Викл';
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initSand,
    isTooCloseToObstacle,
    getObstacles: () => obstacles,
    setObstacles: (val) => {
      // Мутуємо існуючий масив, щоб усі посилання бачили зміни
      obstacles.length = 0;
      if (Array.isArray(val) && val.length) obstacles.push(...val);
    },
    getCurrentTool: () => currentTool,
    setTool: window.setTool,
    initDOMBindings,
    clearObstacles,
    // auth exports
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    migrateAssignIds, // added export to avoid unused warning
  };
}

const appStatus = import.meta?.env?.VITE_APP_STATUS || 'dev';
const statusElement = typeof document !== 'undefined' ? document.getElementById('app-status') : null;
if (statusElement) statusElement.innerText = appStatus;


import posthog from 'posthog-js';

posthog.init('phc_2AmGqYGLTRz71IpBwJNBArZqDIOKewFQbaK4JS2w9Lg', {

    api_host: 'https://eu.i.posthog.com',

    person_profiles: 'identified_only'

});

posthog.onFeatureFlags(function() {
    if (posthog.isFeatureEnabled('show-special-tool')) {
        // Use Sentry or posthog instead of console.log to avoid lint warnings
        Sentry?.captureMessage?.("Feature Flag 'show-special-tool' is ACTIVE!");

        const injectSpecialButton = () => {
            // Шукаємо ПЕРШУ секцію з інструментами (там, де Граблі, Каміння, Сакура)
            const toolSections = document.querySelectorAll('.tool-section');
            const targetSection = toolSections[0]; // [0] — це перша секція в списку

            if (targetSection) {
                if (!document.getElementById('specialToolBtn')) {
                    const specialBtn = document.createElement('button');
                    specialBtn.id = 'specialToolBtn';
                    specialBtn.innerText = '✨ Золотий камінь';
                    
                    // Додаємо стилі, щоб кнопка виглядала як інші
                    specialBtn.style.backgroundColor = '#ffd700';
                    specialBtn.style.color = '#333';
                    specialBtn.style.fontWeight = 'bold';
                    specialBtn.style.marginTop = '8px'; // невеликий відступ зверху
                    specialBtn.style.border = 'none';
                    specialBtn.style.cursor = 'pointer';
                    
                    targetSection.appendChild(specialBtn);

                    specialBtn.addEventListener('click', () => {
                        // Використовуємо функцію setTool, яка вже є у вашому HTML (через onclick)
                        if (typeof window.setTool === 'function') {
                            window.setTool('stone'); // активуємо камінь
                            // Але змінюємо колір наступного каменю на золотий у логіці (опційно)
                        }
                        
                        posthog.capture('special_tool_selected', { color: 'gold' });
                        alert('Ви активували секретний золотий інструмент!');
                    });
                }
            } else {
                // replace console.error with Sentry message
                Sentry?.captureMessage?.("Не знайдено жодної секції .tool-section");
            }
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', injectSpecialButton);
        } else {
            injectSpecialButton();
        }
    }
});

import * as Sentry from "@sentry/browser";

Sentry.init({
  dsn: "https://a7b847eda962f9fe418681ac3e4cd7c4@o4511088752787456.ingest.de.sentry.io/4511088756785232",
  
  // Вказуємо середовище (автоматично визначаємо localhost або production)
  environment: window.location.hostname === 'localhost' ? "development" : "production",

  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration()
  ],

  // Tracing: 1.0 означає запис 100% транзакцій для аналізу продуктивності
  tracesSampleRate: 1.0, 

  // Session Replay: у розробці краще поставити 1.0, щоб бачити всі записи сесій
  replaysSessionSampleRate: 1.0, 
  replaysOnErrorSampleRate: 1.0,

  // Додай свій домен Vercel сюди для розподіленого трасування
  tracePropagationTargets: ["localhost", "https://zen-garden-khaki.vercel.app"],
});

// Run once to migrate existing users without id
function migrateAssignIds() {
  const users = getUsers();
  let max = users.reduce((m,u) => {
    const n = Number(u.id);
    return (!Number.isNaN(n) && n > m) ? n : m;
  }, 0);
  let changed = false;
  for (const u of users) {
    if (!u.id) {
      max += 1;
      u.id = max;
      changed = true;
    }
  }
  if (changed) saveUsers(users);
}