# 🌸 Zen Garden Interactive

[![CI/CD Pipeline](https://github.com/lixlacv/zen-garden/actions/workflows/main.yml/badge.svg)](https://github.com/lixlacv/zen-garden/actions/workflows/main.yml)

Інтерактивна гра для віртуальної медитації «Сад каменів». 
Проєкт побудований на **HTML5 Canvas** і дозволяє малювати граблями на піску, розставляти камінці на полі, а також містить функцію очищення та звуковий супровід.

---

## 🚀 Жива демо-версія (Production)
Подивитися проєкт: [Zen-garden](https://zen-garden-khaki.vercel.app/)

## 🛠 Технології
* **Vite** — швидка збірка проєкту.
* **Vitest / Jest** — автоматичне тестування (CI).
* **ESLint / Prettier** — контроль якості коду.
* **GitHub Actions** — автоматизація Pipeline.
* **Vercel** — автоматичне розгортання (CD).

## ⚙️ Як працює CI/CD у цьому проєкті
1. **Linting**: Перевірка синтаксису та стилю коду.
2. **Testing**: Запуск юніт-тестів для логіки саду.
3. **Security**: Робота з секретами GitHub для захищених даних.
4. **Deployment**: Автоматичний деплой на Vercel після успішних перевірок у гілці `main`.