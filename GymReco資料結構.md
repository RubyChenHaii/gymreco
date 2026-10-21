# GymReco 資料結構 — v2.1.5_b

> 依 Project 內實際檔案（已同步至 v2.1.5_b）整理。圖中「→」表示 import / 呼叫關係。

## 1. 專案目錄樹

```
gymreco/
├─ package.json                    版本號由 build 腳本同步；scripts: start / build / deploy / init-data
├─ public/
│  ├─ index.html                   viewport-fit=cover、theme-color、apple-touch-icon、manifest 連結
│  ├─ manifest.json                start_url=/gymreco/，standalone；icons: favicon / logo192 / logo512
│  ├─ service-worker.js            HTML/JS/CSS 網路優先（3 秒逾時退回快取）；圖示快取優先
│  └─ (favicon.ico, logo192.png, logo512.png, apple-touch-icon.png)
├─ scripts/
│  ├─ sync-sw-version.js           build 後讀 AboutTab 的 APP_VERSION → 寫入 service-worker 的 CACHE_NAME 與 package.json 的 version
│  └─ export-initial-data.js       備份 JSON → src/data/initialData.js（預設僅預覽，加 --write 才輸出；可平移/指定訓練日期）
└─ src/
   ├─ App.jsx                      根元件：全域 state、導覽堆疊、持久化、匯入/重設/清除
   ├─ theme.js                     色彩（LIGHT/DARK）、RADIUS/SPACING/FONT、玻璃感、Card 陰影、月曆漸層 Context
   ├─ data/
   │  ├─ i18n.js                   LangCtx、T（zh/en 文案）、MG_EN
   │  ├─ constants.js              色盤、部位、星期、記錄模式、規律週期/比對類型
   │  └─ initialData.js            INIT_LIBRARY / INIT_WORKOUTS / INIT_ROUTINES（範例資料）
   ├─ hooks/
   │  └─ useStorage.js             lsGet、lsSet（寫入延後一個 tick）
   ├─ utils/
   │  ├─ date.js                   todayStr、localDate、uid、fmtDate
   │  ├─ paceUtils.js              距離/配速的拆合、格式化、總時間↔配速、整體配速
   │  ├─ routineUtils.js           週/月區間、規律達標計算、LogTab 預覽「再算 1 天」
   │  ├─ exportUtils.js            Markdown 匯出（動作庫段落、單日段落、依範圍匯出）
   │  └─ logDraft.js               ★ 訓練草稿：讀/寫/清除、3 小時期限、補登日期保護
   ├─ components/
   │  ├─ ui.jsx                    Div、Card（含 tint）、SLabel、StatusBar、BottomNav
   │  ├─ Button.jsx                Button（見 §4）、InfoButton、CloseButton、BackButton
   │  ├─ AutoGrowTextarea.jsx      ★ AutoGrowTextarea（編輯，自動增高）、CollapsibleText（顯示，可收合）
   │  ├─ SelectionControls.jsx     SegmentedControl、ColorPicker、ChipGroup、ExerciseFieldsGroup
   │  ├─ BottomSheet.jsx           底部玻璃面板（把手拖曳關閉）
   │  ├─ ConfirmDialog.jsx         確認彈窗
   │  ├─ SwipeBackView.jsx         子頁左緣右滑返回外殼
   │  ├─ WeightSetEditor.jsx       重量/組次編輯 → RepsPicker
   │  ├─ LengthPaceEditor.jsx      距離/配速編輯（配速/總時間切換）→ NumberPicker
   │  ├─ NumberPicker.jsx          滾輪式數字選擇
   │  └─ RepsPicker.jsx            NumberPicker 的次數版（1–50）
   └─ tabs/
      ├─ HomeTab.jsx               總覽：統計卡、月曆（漸層）、最近紀錄、「開始／繼續本次訓練」
      ├─ LogTab.jsx                記錄訓練：草稿、規律預覽、動作卡片
      ├─ HistoryTab.jsx            歷史：年→月→日分組、搜尋
      ├─ DetailTab.jsx             DetailTab（編輯單次訓練）、DayDetailTab（單日檢視）
      ├─ LibraryTab.jsx            動作庫列表＋動作詳情（LibItemDetail）
      ├─ RoutineTab.jsx            規律管理
      └─ AboutTab.jsx              關於、版本號、匯出/匯入、月曆漸層、維護
```

## 2. 導覽與畫面

```
App（tab state + navStack）
├─ 底部分頁：home｜history｜log｜library｜about        （BottomNav，切換時清空堆疊）
└─ 子頁（SUB_TABS，進入時把來源頁推入 navStack，不顯示 BottomNav）
   ├─ detail     DetailTab      ← DayDetailTab 的「編輯此訓練」
   ├─ daydetail  DayDetailTab   ← HomeTab 月曆/最近紀錄、HistoryTab 卡片
   └─ routine    RoutineTab     ← HomeTab 統計卡、LogTab 規律區塊
   以上三個子頁與 LibItemDetail 皆包在 SwipeBackView 內（邊緣右滑返回）
   「動作庫 →」→ LibraryTab 詳情；libItemFromSub 標記讓返回回到來源頁
```

## 3. 資料與持久化

### localStorage keys

| key | 內容 | 寫入者 |
|---|---|---|
| `wt_workouts` | 訓練紀錄陣列（新→舊） | App（lsSet） |
| `wt_library` | 動作庫陣列（含各動作 history） | App（lsSet） |
| `wt_routines` | 規律陣列（上限 5 條） | App（lsSet） |
| `wt_lang` | `"zh"` / `"en"` | App |
| `wt_dark` | 深色模式 | App |
| `wt_homeStatPeriod` | 首頁統計看週或月規律 | App |
| `wt_calGradientMode` | `animated` / `static` / `off` | App |
| `wt_calGradientStyle` | `linear` / `conic` | App |
| `wt_logDraft` ★ | 草稿 `{ updatedAt, selectedDate, rows }` | logDraft.js（同步寫入，不經 lsSet） |

草稿清除時機：完成訓練（LogTab 同步清除）、`handleImport`／`handleReset`／`handleClear`、卡片全部移除、超過 3 小時、動作全被刪除。

### 資料形狀

```
workout   { id, date:"YYYY-MM-DD", weekday, muscleGroups[], exercises[] }
exercise  { libId, mode:"weight_sets"|"length_pace", equipment, feeling,
            weightSets:[{ weight, reps[] }]  |  lengthPace:[{ distance, unit, paceMin, paceSec }] }
library   { id, name, muscleGroup, color, recordingMode, note,
            history:[{ date, workoutId, mode, equipment, feeling, weightSets | lengthPace }] }
routine   { id, period:"week"|"month", matchType:"exercise"|"color"|"muscleGroup", matchValue, targetCount }
draft row { libId, mode, equipment, weightSets, lengthPace, feeling, noteLocal, noteDirty }
```

### 資料流

```
LogTab 完成訓練 → App.handleSave → workouts（新增）＋ library（history 追加、note 同步）
DetailTab 儲存 → App.handleUpdateWorkout → workouts ＋ library.history 同步
DetailTab 刪除 → App.handleDeleteWorkout → workouts ＋ library.history 清除
```

## 4. 元件使用對照

### Button 家族（`components/Button.jsx`）

- `Button` variants：`primary`、`tinted`、`outline`、`ghost`、`danger`、`dangerOutline`、`dashed`、`segment`、`segmentOutline`；size：`lg`／`md`／`sm`
- `InfoButton`：LibraryTab、RoutineTab×2、LengthPaceEditor
- `BackButton`：DetailTab×2、RoutineTab、LibraryTab（LibItemDetail）
- `CloseButton`：目前沒有任何呼叫處

| 使用者 | 用到 |
|---|---|
| AboutTab、HomeTab、LogTab | Button |
| DetailTab | Button、BackButton |
| LibraryTab、RoutineTab | Button、BackButton、InfoButton |
| LengthPaceEditor | InfoButton |
| ConfirmDialog、SelectionControls | Button |

### AutoGrowTextarea 家族（`components/AutoGrowTextarea.jsx`）

| 元件 | tone / 設定 | 使用處 |
|---|---|---|
| `AutoGrowTextarea` | `feeling`（預設，最小高 64） | LogTab 當次感受、DetailTab 當次感受 |
| `AutoGrowTextarea` | `plain`，最小高 54 | LogTab 器材設定、DetailTab 器材設定 |
| `AutoGrowTextarea` | `plain`，最小高 90 | LogTab 動作知識筆記 |
| `CollapsibleText` | `feeling`，預設收合 5 行 | DayDetailTab 當次感受、LibraryTab 訓練歷史感受 |

刻意保持手刻：DayDetailTab 的動作知識筆記（收合保留 1 行）、各處唯讀的器材設定顯示、LibItemDetail 的筆記欄位（自己的增高機制）。

### 其他共用元件被誰使用

| 元件 | 使用者 |
|---|---|
| `BottomSheet` | AboutTab、LogTab×2、RoutineTab |
| `ConfirmDialog` | AboutTab×3、DetailTab、LibraryTab、RoutineTab |
| `SelectionControls` | AboutTab、LogTab、LibraryTab、RoutineTab |
| `SwipeBackView` | App（detail／daydetail／routine）、LibraryTab |
| `WeightSetEditor`／`LengthPaceEditor` | LogTab、DetailTab |
| `NumberPicker` | RoutineTab、LengthPaceEditor、RepsPicker |

## 5. 模組依賴（簡圖）

```
App ─┬─ tabs/*（Home, Log, History, Detail, Library, Routine, About）
     ├─ components/ui、SwipeBackView
     ├─ hooks/useStorage
     ├─ utils/logDraft            （匯入／重設／清除時清草稿）
     └─ data/i18n、data/initialData、theme

HomeTab    → Button、ui、routineUtils、logDraft（hasLogDraft）、date、theme
LogTab     → Button、ui、BottomSheet、SelectionControls、WeightSetEditor、LengthPaceEditor、
             AutoGrowTextarea、routineUtils、logDraft、date、theme
DetailTab  → Button、ui、ConfirmDialog、WeightSetEditor、LengthPaceEditor、AutoGrowTextarea、paceUtils、date
LibraryTab → Button、ui、ConfirmDialog、SelectionControls、SwipeBackView、AutoGrowTextarea、paceUtils、date
RoutineTab → Button、ui、BottomSheet、ConfirmDialog、SelectionControls、NumberPicker、routineUtils、date
AboutTab   → Button、ui、BottomSheet、ConfirmDialog、SelectionControls、exportUtils、date
HistoryTab → ui、paceUtils、date

utils/logDraft → date        utils/routineUtils → date        utils/exportUtils → paceUtils
components/AutoGrowTextarea → theme（useC）
```

## 6. 版本與建置

- 版本單一來源：`tabs/AboutTab.jsx` 的 `APP_VERSION`（目前 `2.1.5_b`）
- `npm run build` 後由 `scripts/sync-sw-version.js` 把版本寫入 `build/service-worker.js` 的 `CACHE_NAME` 與 `package.json`
- 部署：`npm run deploy`（`gh-pages -d build`）
- 範例資料更新：`npm run init-data -- <備份.json> [--shift-days N] [--set id=日期] [--edit] [--write]`
