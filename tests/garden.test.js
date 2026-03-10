/**
 * @vitest-environment jsdom
 */
import { describe, expect, beforeEach, test, vi } from 'vitest';

describe('Zen Garden: Direct Script Tests', () => {
  let garden;

  beforeEach(async () => {
    // 1. Глобальна заглушка для Vite-змінних
    if (typeof global.import === 'undefined') {
      global.import = { meta: { env: { VITE_APP_STATUS: 'testing' } } };
    }

    // 2. Готуємо HTML
    document.body.innerHTML = `
      <canvas id="sandCanvas"></canvas>
      <input type="range" id="brushSize" value="30" />
      <button id="musicBtn"></button>
      <button id="clearBtn"></button>
      <audio id="bgMusic"></audio>
      <button id="rakeTool"></button>
      <button id="stoneTool"></button>
    `;

    // 3. Створюємо єдиний mock для контексту
    const mockContext = {
      fillRect: vi.fn(),
      beginPath: vi.fn(),
      ellipse: vi.fn(),
      fill: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      arc: vi.fn(),
      stroke: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      clearRect: vi.fn(),
      scale: vi.fn(),
      translate: vi.fn(),
      quadraticCurveTo: vi.fn(),
      strokeText: vi.fn(),
      measureText: vi.fn(() => ({ width: 0 })),
      getContextAttributes: vi.fn(() => ({})),
    };

    // Прив'язуємо mock до прототипу Canvas
    HTMLCanvasElement.prototype.getContext = vi.fn(() => mockContext);
    
    // Заглушка для getImageData (потрібна для initSand)
    mockContext.getImageData = vi.fn(() => ({
      data: new Uint8ClampedArray(100 * 100 * 4)
    }));
    mockContext.putImageData = vi.fn();

    // 4. Очищення кешу та завантаження модуля
    vi.resetModules();
    const module = await import('../script.js');
    garden = module.default || module;
  });

  test('initSand should run without errors', () => {
    expect(() => garden.initSand()).not.toThrow();
  });

  test('setTool should change current tool to stone', () => {
    window.setTool('stone');
    expect(garden.getCurrentTool()).toBe('stone');
  });

  test('isTooCloseToObstacle should return true if objects overlap', () => {
    garden.setObstacles([{ x: 100, y: 100, size: 20, type: 'stone' }]);
    expect(garden.isTooCloseToObstacle(105, 105)).toBe(true);
  });

  test('isTooCloseToObstacle should return false if objects are far', () => {
    garden.setObstacles([{ x: 100, y: 100, size: 20, type: 'stone' }]);
    expect(garden.isTooCloseToObstacle(300, 300)).toBe(false);
  });

  test('clearBtn should reset obstacles array', async () => {
    // Ініціалізуємо прив'язки для поточного DOM
    garden.initDOMBindings();

    // Додаємо перешкоду
    garden.setObstacles([{ x: 10, y: 10, size: 5, type: 'stone' }]);
    expect(garden.getObstacles().length).toBe(1);

    // Знаходимо кнопку та викликаємо подію, що "спливає"
    const clearBtn = document.getElementById('clearBtn');
    clearBtn.dispatchEvent(new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
    }));

    expect(garden.getObstacles().length).toBe(0);
  });

  test('setTool should add active class to button', () => {
    window.setTool('stone');
    const stoneBtn = document.getElementById('stoneTool');
    expect(stoneBtn.classList.contains('active')).toBe(true);
  });

  test('brush size should be readable from DOM', () => {
    const slider = document.getElementById('brushSize');
    slider.value = '50';
    expect(() => garden.initSand()).not.toThrow();
  });
});