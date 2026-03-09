/**
 * @jest-environment jsdom
 */

describe('Zen Garden: Direct Script Tests', () => {
  let garden;

  beforeEach(() => {
    // 1. �����ު�� HTML ����� ������������� �������
    document.body.innerHTML = `
            <canvas id="sandCanvas"></canvas>
            <input type="range" id="brushSize" value="30" />
            <button id="musicBtn"></button>
            <button id="clearBtn"></button>
            <audio id="bgMusic"></audio>
            <button id="rakeTool"></button>
            <button id="stoneTool"></button>
        `;

    // 2. ������� CANV�S
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
      clearRect: jest.fn(),
    }));

    // 3. ��������Ӫ�� ������ (������� ���, ��� �� ������������ ������ ��� ������� �����)
    jest.resetModules();
    garden = require('../script.js');
  });

  // ���� 1: �������� ������������
  test('initSand should run without errors', () => {
    // ����������, �� ������ ������� �� ������� "������" �������
    expect(() => garden.initSand()).not.toThrow();
  });

  // ���� 2: ���� �����������
  test('setTool should change current tool to stone', () => {
    window.setTool('stone');
    expect(garden.getCurrentTool()).toBe('stone');
  });

  // ���� 3: �������� ����� ������� (�������)
  test('isTooCloseToObstacle should return true if objects overlap', () => {
    garden.setObstacles([{ x: 100, y: 100, size: 20, type: 'stone' }]);
    expect(garden.isTooCloseToObstacle(105, 105)).toBe(true);
  });

  // ���� 4: �������� ����� ������� (������)
  test('isTooCloseToObstacle should return false if objects are far', () => {
    garden.setObstacles([{ x: 100, y: 100, size: 20, type: 'stone' }]);
    expect(garden.isTooCloseToObstacle(300, 300)).toBe(false);
  });

  // ���� 5: �������� ���� ����� ������
  test('clearBtn should reset obstacles array', () => {
    garden.setObstacles([{ x: 10, y: 10, size: 5 }]);
    const clearBtn = document.getElementById('clearBtn');
    clearBtn.click();
    expect(garden.getObstacles().length).toBe(0);
  });

  // ���� 6: �������� UI ��������� �����
  test('setTool should add active class to button', () => {
    window.setTool('stone');
    const stoneBtn = document.getElementById('stoneTool');
    expect(stoneBtn.classList.contains('active')).toBe(true);
  });

  // ���� 7: ������ � ��������� (brushSlider)
  test('brush size should be readable from DOM', () => {
    const slider = document.getElementById('brushSize');
    slider.value = '50';
    // ����������, �� ������� ������������ ���� ���������� ��� �������
    expect(() => garden.initSand()).not.toThrow();
  });
});
