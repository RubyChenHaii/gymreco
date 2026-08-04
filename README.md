# 💪 GymReco 🤳

**A mobile-first PWA workout tracker｜手機優先的健身紀錄 App （漸進式網頁應用程式）**

> Log your workouts, build your exercise library, and track your progress — all stored locally on your device.

> 輕鬆紀錄訓練、管理動作庫、追蹤進度。資料全部存在你的手機本地端。

---

## ✨ Features｜功能

### Workout Library｜訓練動作庫

- 📋 Log workouts with weight, sets, reps, and session notes
  
  - 紀錄重量、組數、次數與當次訓練筆記。

- 📚 Personal exercise library with persistent exercise notes
  
  - 建立自己的動作庫，並為每個動作保存永久筆記。

### Training Calendar｜訓練月曆

- 📅 Calendar overview with one dot per colour per day for quick visual scanning.
  
  - 月曆每日每種顏色最多顯示一次，方便快速辨識當天訓練類型。

- 📆 Monthly collapsible history view.
  
  - 訓練紀錄可依月份收合，瀏覽更整潔。

- ⏪ Log workouts up to 10 days in the past.
  
  - 支援補登 10 天內的訓練紀錄。

### Hassle-Free Experience｜輕鬆使用

- 🌐 Bilingual interface (中文 / English) + Night Mode.
  
  - 內建中英文介面與深色模式。

- 📱 Install as a PWA, works offline, and updates automatically.
  
  - 可安裝至桌面，支援離線使用並自動更新。

### Data & Privacy｜資料與隱私

- 💾 All data stays in your browser via localStorage — no account required.
  
  - 所有資料皆儲存在瀏覽器 localStorage，不需登入帳號。

- 📤 Export to JSON / CSV and import from JSON.
  
  - 存檔 / 讀檔：支援 JSON／CSV 匯出，以及 JSON 匯入。

- 🔄 Restore sample data or start with a clean library anytime.
  
  - 可隨時恢復範例資料，或一鍵清空，從自己的訓練開始。

---

## 🚀 Try it now｜立即使用

Open with iPhone Safari or Android Chrome:

👉 **https://rubychenhaii.github.io/gymreco/**

Then: **Share → Add to Home Screen** for full-screen experience.

請以 iPhone Safari 或 Android Chrome 打開以下連結：

👉 **https://rubychenhaii.github.io/gymreco/**

接著：**分享 → 加入主畫面**，以全螢幕使用。原生App體驗！

---

## 📸 Screenshots

<img src="public/screenshots/IMG_2621.PNG" width="250"> <img src="public/screenshots/IMG_2622.PNG" width="250"> <img src="public/screenshots/IMG_2624.PNG" width="250">

---

## 💾 資料儲存說明｜Data Storage Notice

‼️ GymReco 的所有資料均儲存於你的手機本機，位於**瀏覽器的 localStorage**。

因此，請注意以下情況可能導致資料永久消失：

- 在瀏覽器設定中清除「網站資料」或「localStorage」
- 換手機或換瀏覽器（資料不會自動轉移）
- 重灌手機作業系統

自設計之初，GymReco 刻意不使用任何雲端同步、帳號和API呼叫。

你的資料永遠屬於你——所有資料都只存在於你的本機、完全無需網路、永遠不上傳。

All data is stored in your **browser's localStorage**.
Data will be permanently lost if you clear site data, switch devices, or reinstall your OS.

By design, this app intentionally avoids cloud sync, accounts, and external APIs.
Your data is yours — stored locally, fully offline-capable, and never leaves your device.

---

### 簡單管理你的紀錄

GymReco 提供「**輸出為JSON**」功能，輸出一個輕量檔案進行存檔/讀檔。

輸出為 JSON 功能，位於「關於」頁面。

JSON/CSV export and JSON import are now available in the About page.

handy for backing up or restoring your data!

---

### 範例資料 - 讓你瞭解 GymReco 的運作！

App 中預設顯示之紀錄為範例資料。目的為展示資料型態，讓初次使用者瞭解 GymReco 的運作模式。

GymReco 提供「**清除 GymReco**」功能，一鍵將範例資料全數刪除。讓嶄新的 GymReco 陪你開始健身旅程。

清除 GymReco 功能，位於「關於」頁面。

The workout records shown by default are sample data. Feel free to delete them!

Start Fresh as a feature, is now available in the About Page. 

Ready to make GymReco yours? Remove the sample data and start from day one! 

---

## 🛠️ Local Development｜本機開發

```bash
git clone https://github.com/rubychenhaii/workout-tracker.git
cd workout-tracker
npm install
npm start
```

To deploy:

```bash
npm run deploy
```

---

## 📦 Tech Stack｜技術

- React 19
- PWA + Service Worker (offline support)
- localStorage (no backend required)
- Deployed via GitHub Pages
- Developed with help from Claude Sonnet 4.6

---

## ⛓️ Architecture｜架構 (v1.8.0 - )

<img src="public/screenshots/architecture.png" width="500">

---

## 🎯 Product Philosophy

GymReco is built around one simple goal:

> **Create a workout tracker that I genuinely enjoy using every day.**

Every feature in GymReco exists because it solves a real problem encountered during my own training.

Some examples:

- 📴 **Local-first.** No accounts, no cloud sync, and no external APIs.
- ⚡ **Lightweight by design.** Small bundle size, fast startup, and offline support through PWA.
- 📅 **Simple over complex.** Monthly history is enough—no unnecessary nesting or configuration.
- ⏪ **10-day Back-log.** Enough flexibility to catch up, while encouraging timely workout logging.
- 🎨 **Meaningful calendar.** Calendar dots represent workout categories rather than every individual exercise.
- 📈 **Record first, analyze later.** Advanced analytics intentionally belong in GymStats (coming soon), keeping GymReco focused and lightweight.

As the saying goes:

> **If it ain't broke, don't fix it.**

GymReco evolves only when real-world use reveals a genuine need.

---

### 🤖 Development

GymReco was created through conversational AI-assisted development with Claude.

Instead of writing code directly, I focused on product design, workflow planning, UX refinement, testing, debugging, and iterative decision-making.

Today, GymReco continues to evolve through daily real-world use rather than feature chasing.

---

## 📋 Changelog｜版本紀錄

**v1.9.1**

- Calendar dots now deduplicated by colour (one dot per colour per day), preserving workout order
- Exercise library now shows a hint explaining the calendar dot behaviour

- Added "Stretching" as a new muscle group category in the exercise library

- Maintenance tools in About page: Reset to sample data / Start Fresh (clear all data)

**v1.9.0**

- Full codebase refactor: from a single 1,700-line file into 15 modular component files

- Service Worker updated to network-first strategy for automatic silent updates

- Strengthened JSON import validation

- Full i18n audit: all UI strings now go through the translation system

- Monthly grouping with collapsible sections in History tab

- Inline session editing in Detail view

- Back-log: log workouts up to 10 days in the past, with a custom date picker

**v1.6.0**

- JSON/CSV export and JSON import (About page)

**v1.0–1.5**

- Initial build, feature expansion, PWA deployment, security hardening

---

## 👤 Author｜作者

**Ruby Chen**
GitHub: [@rubychenhaii](https://github.com/rubychenhaii)

---

## 📄 License

MIT © 2026 Ruby Chen
