/**
 * @vitest-environment jsdom
 */

// 1. Імпортуємо 'test' та замінюємо 'jest' на 'vi'
import { describe, it, expect, beforeEach, test, vi } from 'vitest';

describe('Zen Garden: Direct Script Tests', () => {
  let garden;

  beforeEach(() => {
    // 1. Готуємо HTML
    document.body.innerHTML = `
            <canvas id="sandCanvas"></canvas>
            <input type="range" id="brushSize" value="30" />
            <button id="musicBtn"></button>
            <button id="clearBtn"></button>
            <audio id="bgMusic"></audio>
            <button id="rakeTool"></button>
            <button id="stoneTool"></button>
        `;

    // 2. Фейковий CANVAS (замінюємо jest.fn на vi.fn)
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
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
    }));

    // 3. Скидаємо модулі (vi.resetModules замість jest)
    vi.resetModules();
    // Використовуємо динамічний імпорт або require, якщо налаштовано
    garden = require('../script.js');
  });

  test('initSand should run without errors', () => {
    expect(() => garden.initSand()).not.toThrow();
  });

  test('setTool should change current tool to stone', () => {
    // Якщо setTool прикріплений до window у вашому script.js
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

  test('clearBtn should reset obstacles array', () => {
    garden.setObstacles([{ x: 10, y: 10, size: 5 }]);
    const clearBtn = document.getElementById('clearBtn');
    clearBtn.click();
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