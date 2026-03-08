/**
 * @jest-environment jsdom
 */

describe('Zen Garden: Direct Script Tests', () => {
    let garden;

    beforeEach(() => {
        // 1. СТВОРЮЄМО HTML ПЕРЕД ЗАВАНТАЖЕННЯМ СКРИПТА
        document.body.innerHTML = `
            <canvas id="sandCanvas"></canvas>
            <input type="range" id="brushSize" value="30" />
            <button id="musicBtn"></button>
            <button id="clearBtn"></button>
            <audio id="bgMusic"></audio>
            <button id="rakeTool"></button>
            <button id="stoneTool"></button>
        `;

        // 2. МОКАЄМО CANVАS
        HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
            fillRect: jest.fn(),
            beginPath: jest.fn(),
            ellipse: jest.fn(),
            fill: jest.fn(),
            save: jest.fn(),
            restore: jest.fn(),
            arc: jest.fn(),
            stroke: jest.fn(),
            moveTo: jest.fn(),
            lineTo: jest.fn(),
            clearRect: jest.fn()
        }));

        // 3. ЗАВАНТАЖУЄМО СКРИПТ (скидаємо кеш, щоб він завантажився заново для кожного тесту)
        jest.resetModules();
        garden = require('../script.js');
    });

    // ТЕСТ 1: Перевірка ініціалізації
    test('initSand should run without errors', () => {
        // Перевіряємо, що виклик функції не викликає "падіння" скрипта
        expect(() => garden.initSand()).not.toThrow();
    });

    // ТЕСТ 2: Зміна інструменту
    test('setTool should change current tool to stone', () => {
        window.setTool('stone');
        expect(garden.getCurrentTool()).toBe('stone');
    });

    // ТЕСТ 3: Перевірка логіки зіткнень (близько)
    test('isTooCloseToObstacle should return true if objects overlap', () => {
        garden.setObstacles([{ x: 100, y: 100, size: 20, type: 'stone' }]);
        expect(garden.isTooCloseToObstacle(105, 105)).toBe(true);
    });

    // ТЕСТ 4: Перевірка логіки зіткнень (далеко)
    test('isTooCloseToObstacle should return false if objects are far', () => {
        garden.setObstacles([{ x: 100, y: 100, size: 20, type: 'stone' }]);
        expect(garden.isTooCloseToObstacle(300, 300)).toBe(false);
    });

    // ТЕСТ 5: Очищення саду через кнопку
    test('clearBtn should reset obstacles array', () => {
        garden.setObstacles([{ x: 10, y: 10, size: 5 }]);
        const clearBtn = document.getElementById('clearBtn');
        clearBtn.click();
        expect(garden.getObstacles().length).toBe(0);
    });

    // ТЕСТ 6: Перевірка UI активного класу
    test('setTool should add active class to button', () => {
        window.setTool('stone');
        const stoneBtn = document.getElementById('stoneTool');
        expect(stoneBtn.classList.contains('active')).toBe(true);
    });

    // ТЕСТ 7: Робота з повзунком (brushSlider)
    test('brush size should be readable from DOM', () => {
        const slider = document.getElementById('brushSize');
        slider.value = "50";
        // Перевіряємо, чи функція ініціалізації саду спрацювала без помилок
        expect(() => garden.initSand()).not.toThrow();
    });
});