# GymReco 資料結構 — v2.2.0

> 依 Project 內實際檔案整理。圖中「→」表示 import / 呼叫關係。
> 標示 ★ 的是 v2.2.0 新增或變更的部分（字體縮放、iOS PWA 鍵盤與縮放處理）。

## 1. 專案目錄樹

```
gymreco/
├─ package.json                    版本號由 build 腳本同步；scripts: start / build / deploy / init-data
├─ public/
│  ├─ index.html                   viewport-fit=cover、★maximum-scale=1（見 §7）、theme-color、apple-touch-icon、manifest 連結
│  ├─ manifest.json                start_url=/gymreco/，standalone；icons: favicon / logo192 / logo512
│  ├─ service-worker.js            HTML/JS/CSS 網路優先（3 秒逾時退回快取）；圖示快取優先
│  └─ (favicon.ico, logo192.png, logo512.png, apple-touch-icon.png)
├─ scripts/
│  ├─ sync-sw-version.js           build 後讀 AboutTab 的 APP_VERSION → 寫入 service-worker 的 CACHE_NAME 與 package.json 的 version
│  └─ export-initial-data.js       備份 JSON → src/data/initialData.js（預設僅預覽，加 --write 才輸出；可平移/指定訓練日期）
└─ src/
   ├─ App.jsx                      根元件：全域 state、導覽堆疊、持久化、匯入/重設/清除；
   │                               ★鍵盤處理（vvHeight 外殼高度、inputFocused）、★字體縮放 state 與 Provider、★Toast 可換行
   ├─ theme.js                     色彩（LIGHT/DARK）、RADIUS/SPACING/FONT、玻璃感、Card 陰影、月曆漸層 Context、
   │                               ★FONT_SCALES / FontScaleCtx / useFontScale / fs()（字體縮放）
   ├─ data/
   │  ├─ i18n.js                   LangCtx、T（zh/en 文案，★新增 fontSize* 系列）、MG_EN
   │  ├─ constants.js              色盤、部位、星期、記錄模式、規律週期/比對類型
   │  └─ initialData.js            INIT_LIBRARY / INIT_WORKOUTS / INIT_ROUTINES（範例資料）
   ├─ hooks/
   │  └─ useStorage.js             lsGet、lsSet（寫入延後一個 tick）
   ├─ utils/
   │  ├─ date.js                   todayStr、localDate、uid、fmtDate
   │  ├─ paceUtils.js              距離/配速的拆合、格式化、總時間↔配速、整體配速
   │  ├─ routineUtils.js           週/月區間、規律達標計算、LogTab 預覽「再算 1 天」
   │  ├─ exportUtils.js            Markdown 匯出（動作庫段落、單日段落、依範圍匯出）
   │  └─ logDraft.js               訓練草稿：讀/寫/清除、3 小時期限、補登日期保護
   ├─ components/
   │  ├─ ui.jsx                    Div、Card（含 tint）、SLabel、StatusBar、BottomNav
   │  ├─ Button.jsx                Button（見 §4）、InfoButton、CloseButton、BackButton
   │  ├─ AutoGrowTextarea.jsx      AutoGrowTextarea（編輯，自動增高；★增高時保存/還原外層捲動位置、聚焦後捲到可視區）、
   │  │                            CollapsibleText（顯示，可收合）
   │  ├─ SelectionControls.jsx     SegmentedControl、ColorPicker、ChipGroup、ExerciseFieldsGroup
   │  ├─ BottomSheet.jsx           底部玻璃面板（把手拖曳關閉）
   │  ├─ ConfirmDialog.jsx         確認彈窗
   │  ├─ SwipeBackView.jsx         子頁左緣右滑返回外殼
   │  ├─ WeightSetEditor.jsx       重量/組次編輯 → RepsPicker
   │  ├─ LengthPaceEditor.jsx      距離/配速編輯（配速/總時間切換）→ NumberPicker
   │  ├─ NumberPicker.jsx          滾輪式數字選擇
   │  └─ RepsPicker.jsx            NumberPicker 的次數版（1–50）
   └─ tabs/
      ├─ HomeTab.jsx               總覽：統計卡、月曆（漸層）、最近紀錄、「開始／繼續本次訓練」；
      │                            ★標題列新增「Aa」按鈕與字體大小 BottomSheet
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

★ BottomNav 的顯示條件：不在子頁、鍵盤未開（!vvHeight）、沒有文字輸入框聚焦（!inputFocused）
```

## 3. 資料與持久化

### localStorage keys

| key                   | 內容                                     | 寫入者                              |
| --------------------- | ---------------------------------------- | ----------------------------------- |
| `wt_workouts`         | 訓練紀錄陣列（新→舊）                    | App（lsSet）                        |
| `wt_library`          | 動作庫陣列（含各動作 history）           | App（lsSet）                        |
| `wt_routines`         | 規律陣列（上限 5 條）                    | App（lsSet）                        |
| `wt_lang`             | `"zh"` / `"en"`                          | App                                 |
| `wt_dark`             | 深色模式                                 | App                                 |
| `wt_homeStatPeriod`   | 首頁統計看週或月規律                     | App                                 |
| `wt_calGradientMode`  | `animated` / `static` / `off`            | App                                 |
| `wt_calGradientStyle` | `linear` / `conic`                       | App                                 |
| `wt_fontScale` ★      | `normal` / `large` / `xlarge`            | App（讀取時若不是合法值，退回 `normal`） |
| `wt_logDraft`         | 草稿 `{ updatedAt, selectedDate, rows }` | logDraft.js（同步寫入，不經 lsSet） |

偏好設定類（`wt_lang`、`wt_dark`、`wt_homeStatPeriod`、`wt_calGradient*`、`wt_fontScale`）不包含在 JSON 備份內，也不受匯入／重設／清除影響。

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
- ★ `Button` 的字級來自 `SIZE_STYLES`（`FONT` token 數值），輸出時以 `fs()` 包裝，會跟著字體縮放
- `InfoButton`：LibraryTab、RoutineTab×2、LengthPaceEditor
- `BackButton`：DetailTab×2、RoutineTab、LibraryTab（LibItemDetail）
- `CloseButton`：目前沒有任何呼叫處

| 使用者                           | 用到                           |
| -------------------------------- | ------------------------------ |
| AboutTab、HomeTab、LogTab        | Button                         |
| DetailTab                        | Button、BackButton             |
| LibraryTab、RoutineTab           | Button、BackButton、InfoButton |
| LengthPaceEditor                 | InfoButton                     |
| ConfirmDialog、SelectionControls | Button                         |

### AutoGrowTextarea 家族（`components/AutoGrowTextarea.jsx`）

| 元件               | tone / 設定                  | 使用處                                         |
| ------------------ | ---------------------------- | ---------------------------------------------- |
| `AutoGrowTextarea` | `feeling`（預設，最小高 64） | LogTab 當次感受、DetailTab 當次感受            |
| `AutoGrowTextarea` | `plain`，最小高 54           | LogTab 器材設定、DetailTab 器材設定            |
| `AutoGrowTextarea` | `plain`，最小高 90           | LogTab 動作知識筆記                            |
| `CollapsibleText`  | `feeling`，預設收合 5 行     | DayDetailTab 當次感受、LibraryTab 訓練歷史感受 |

刻意保持手刻：DayDetailTab 的動作知識筆記（收合保留 1 行）、各處唯讀的器材設定顯示、LibItemDetail 的筆記欄位（自己的增高機制）。

### 其他共用元件被誰使用

| 元件                                  | 使用者                                                  |
| ------------------------------------- | ------------------------------------------------------- |
| `BottomSheet`                         | AboutTab、LogTab×2、RoutineTab、★HomeTab（字體大小）    |
| `ConfirmDialog`                       | AboutTab×3、DetailTab、LibraryTab、RoutineTab           |
| `SelectionControls`                   | AboutTab、LogTab、LibraryTab、RoutineTab、★HomeTab      |
| `SwipeBackView`                       | App（detail／daydetail／routine）、LibraryTab           |
| `WeightSetEditor`／`LengthPaceEditor` | LogTab、DetailTab                                       |
| `NumberPicker`                        | RoutineTab、LengthPaceEditor、RepsPicker                |

## 5. 模組依賴（簡圖）

```
App ─┬─ tabs/*（Home, Log, History, Detail, Library, Routine, About）
     ├─ components/ui、SwipeBackView
     ├─ hooks/useStorage
     ├─ utils/logDraft            （匯入／重設／清除時清草稿）
     └─ data/i18n、data/initialData、theme（★含 FONT_SCALES、FontScaleCtx、fs）

HomeTab    → Button、★BottomSheet、★SelectionControls、ui、routineUtils、logDraft（hasLogDraft）、date、theme
LogTab     → Button、ui、BottomSheet、SelectionControls、WeightSetEditor、LengthPaceEditor、
             AutoGrowTextarea、routineUtils、logDraft、date、theme
DetailTab  → Button、ui、ConfirmDialog、WeightSetEditor、LengthPaceEditor、AutoGrowTextarea、paceUtils、date
LibraryTab → Button、ui、ConfirmDialog、SelectionControls、SwipeBackView、AutoGrowTextarea、paceUtils、date
RoutineTab → Button、ui、BottomSheet、ConfirmDialog、SelectionControls、NumberPicker、routineUtils、date
AboutTab   → Button、ui、BottomSheet、ConfirmDialog、SelectionControls、exportUtils、date
HistoryTab → ui、paceUtils、date

utils/logDraft → date        utils/routineUtils → date        utils/exportUtils → paceUtils
components/AutoGrowTextarea → theme（useC）
★ 除 theme.js 本身與 NumberPicker 外，凡有字級的 tabs / components 皆 import theme 的 fs
```

## 6. ★ 字體縮放（無障礙）

### 為什麼有這個功能

為了修正 iOS 聚焦輸入框時的自動放大，viewport 加上 `maximum-scale=1`，整個 App 因此無法雙指縮放。字體縮放是對應的補償：使用者可在 App 內選擇文字大小。

### 機制

```
App（fontScaleKey，存 wt_fontScale）
 ├─ 最外層 div：style["--fs-scale"] = FONT_SCALES[fontScaleKey]       ← CSS 變數，供 fs() 使用
 └─ <FontScaleCtx.Provider value={數字}>                             ← 同一個數字，供需要 JS 數值的元件使用（useFontScale）
```

- `FONT_SCALES = { normal: 1, large: 1.15, xlarge: 1.3 }`
- `fs(px)` 回傳 `calc(${px}px * var(--fs-scale, 1))`；沒設定變數時退回 1，100% 時結果與原本的 px 完全相同
- 變數設在最外層，因此 `position:fixed` 的 BottomSheet、ConfirmDialog（DOM 上仍是後代）也讀得到
- 入口：HomeTab 標題列「Aa」按鈕 → BottomSheet 內以 SegmentedControl 切換（預設／大／特大），並附一段範例文字即時預覽

### 撰寫規則

**新增或修改任何字級時，一律寫 `fontSize: fs(13)`，不要寫死 `fontSize: 13`。** 可用下列指令找出遺漏：

```bash
grep -rn "fontSize" src | grep -v "fs("
```

### 目前刻意不縮放的部分

| 位置                                   | 原因                                                              |
| -------------------------------------- | ----------------------------------------------------------------- |
| `NumberPicker` 的數字（14／17px）      | 原尺寸已接近 130% 的一般文字；格高與寬度為固定值，且與捲動計算綁定 |
| `LengthPaceEditor` 的單位輸入框        | 寬度由 `fluidSize(30, 40)` 固定，放大後 "km" 會被切掉             |
| `StatusBar`                            | 僅桌機預覽外殼使用                                                |
| SVG 圖示、色點、圓形按鈕               | 非文字                                                            |
| `theme.js` 的 `FONT` token             | 尚未直接使用；`Button` 透過 `fs(s.fontSize)` 間接縮放             |

## 7. ★ iOS PWA 鍵盤與縮放處理

實測環境：iPhone 16 Pro Max、iOS 27.0.1、加入主畫面的 PWA 獨立視窗。**下列多項是針對 iOS 行為調整出來的，iOS 版本更新後若出現新的跳動，優先檢查這裡。**

### 7.1 禁止聚焦自動放大

`index.html` 的 viewport 使用 `maximum-scale=1`。iOS 在輸入框字級小於 16px 時會於聚焦時自動放大，這是最小改動的解法，代價是整個 App 無法雙指縮放，以字體縮放（§6）補償。

### 7.2 鍵盤開啟時的外殼高度（`App.jsx`）

- 監聽 `window.visualViewport` 的 `resize` / `scroll`；當 `window.innerHeight - vv.height > 100` 視為鍵盤開啟
- 鍵盤開啟時：`vvHeight = vv.height`，外殼高度改為 `vvHeight`（否則維持 `100dvh`），並呼叫 `window.scrollTo(0, 0)` 還原 iOS 為了顯示輸入框而做的畫面平移
- 最外層 flex 容器在手機版使用 `alignItems:"flex-start"`，避免外殼變矮時被垂直置中
- **不使用 `transform` 補位**：任何 transform 都會讓內部 `position:fixed` 的 BottomSheet／ConfirmDialog 改以該容器定位（`SwipeBackView` 內亦有同樣註解）

### 7.3 輸入框聚焦狀態（`inputFocused`，`App.jsx`）

BottomNav 在文字輸入框聚焦時隱藏，鍵盤收起（失焦）後回來。

- 唯一的真相來源是 `document.activeElement`，由 `sync()` 讀取並更新 state
- 觸發 `sync` 的時機：`focusin`（立即）、`focusout`（延遲 100ms，避免輸入框之間切換時閃爍）、`MutationObserver`（觀察 `#root` 的 `childList` 與 `subtree`）
- **必須有 MutationObserver 的原因**：聚焦中的輸入框被移除（例如返回手勢、關閉 Sheet、切頁）時，瀏覽器不會觸發 `focusout`，只靠事件配對記錄狀態會永久卡在「聚焦中」，BottomNav 不會回來
- 排除不會彈出鍵盤的 input 類型（checkbox、radio、button、submit、file、range、color）
- 為什麼不單靠 `vvHeight`：實測在 iOS PWA 中，`vvHeight` 要等輸入內容長到讓 iOS 平移畫面（約 11 行）才會有值，鍵盤剛開時不可靠

### 7.4 AutoGrowTextarea

- 增高前先記住外層可捲動祖先的 `scrollTop`，設完高度後還原（量測時高度會先塌縮成 `auto`，會讓捲動位置被夾回去而造成跳動）
- 聚焦後等 350ms（鍵盤動畫與外殼高度調整）再 `scrollIntoView({ block:"center" })`；350ms 為經驗值，非規格

### 7.5 刻意沒有做的事

- **沒有**在鍵盤收起時主動對輸入框 `blur()`：這在 Android 按返回鍵只收鍵盤（輸入框仍聚焦）時可補強，但在 iOS 可能因 `vvHeight` 回報不同步而誤判，在打字途中被踢出輸入。若日後 Android 實測確實遇到 BottomNav 沒回來，再依實際現象補上

### 7.6 其他

- Toast：`width:max-content` ＋ `maxWidth:calc(100% - 32px)` ＋ 置中文字。Toast 以 `left:50%` 定位，若只移除 `nowrap`，可用寬度只剩容器一半，會太早換行

## 8. 版本與建置

- 版本單一來源：`tabs/AboutTab.jsx` 的 `APP_VERSION`（目前 `2.2.0`）
- `npm run build` 後由 `scripts/sync-sw-version.js` 把版本寫入 `build/service-worker.js` 的 `CACHE_NAME` 與 `package.json`
- 部署：`npm run deploy`（`gh-pages -d build`）
- `export-initial-data.js` 範例資料更新腳本：`npm run init-data -- <備份.json> [--shift-days N] [--set id=日期] [--edit] [--write]`

## 9. 已知限制

- 字體縮放特大（130%）下，LibraryTab 標題「Exercise Library」可能換成兩行，使右側資訊按鈕貼近「新增」按鈕；影響不大，暫不處理
- `NumberPicker` 與 `LengthPaceEditor` 的滾輪寬度與觸控範圍為固定／半動態寬度，對視力或手部操作不便的使用者可能偏窄；若要改善需動到動態寬度計算，暫不處理
- Android 上以系統返回鍵只收鍵盤時，輸入框可能仍保持聚焦，BottomNav 可能維持隱藏；尚未在 Android 實機驗證（見 §7.5）
