import js from '@eslint/js';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        // ������ ��������� ����� ��� Jest �� Cypress
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        jest: 'readonly',
        cy: 'readonly',
        Cypress: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': 'error', // �������, ���� � �����, �� �� ����������������
      'no-console': 'warn', // ������������, ���� ������ console.log
      semi: ['error', 'always'], // ����'������ ������ � ����� (�㳺�� ����)
      'no-undef': 'error', // �������, ���� ��������������� ����������� �����
    },
  },
];
