# GymReco 資料結構 — v2.4.0_b1

> 依 Project 內實際檔案（已同步至 v2.4.0_b1）整理。圖中「→」表示 import / 呼叫關係；★ 表示相對 v2.1.5 新增或有結構性改動。
> 欄位逐項定義、單位列舉與讀取規則，請見 `GymReco資料契約`（schemaVersion 1）。

## 1. 專案目錄樹

```
gymreco/
├─ package.json                    版本號由 build 腳本同步；scripts: start / build / deploy / init-data
├─ README.md
├─ public/
│  ├─ index.html                   viewport-fit=cover、theme-color、apple-touch-icon、manifest 連結
│  ├─ manifest.json                start_url=/gymreco/，standalone；icons: favicon / logo192 / logo512
│  ├─ service-worker.js            HTML/JS/CSS 網路優先（3 秒逾時退回快取）；圖示快取優先
│  └─ (favicon.ico, logo192.png, logo512.png, apple-touch-icon.png, screenshots/)
├─ scripts/
│  ├─ sync-sw-version.js           build 後讀 AboutTab 的 APP_VERSION → 寫入 service-worker 的 CACHE_NAME 與 package.json 的 version
│  ├─ export-initial-data.js       備份 JSON → src/data/initialData.js（預設僅預覽，加 --write 才輸出；可平移/指定訓練日期；輸出時移除 library[].history）
│  └─ migrate-data.js ★            舊備份 → schemaVersion 1：重量字串轉 { value, unit, note }、距離單位轉代碼、補快照、移除 library[].history（孤兒檢查）、加 schemaVersion
└─ src/
   ├─ App.jsx                      根元件：全域 state、導覽堆疊、持久化、載入轉換、匯入/重設/清除、歷史現算
   ├─ theme.js                     色彩（LIGHT/DARK）、RADIUS/SPACING/FONT、fluidSize、玻璃感、Card 陰影、月曆漸層 Context、全域字體縮放（FONT_SCALES / fs）
   ├─ data/
   │  ├─ i18n.js                   LangCtx、T（zh/en 文案）、MG_EN
   │  ├─ constants.js              色盤、部位（12 種）、星期、記錄模式、規律週期/比對類型、SCHEMA_VERSION ★
   │  └─ initialData.js            INIT_LIBRARY / INIT_WORKOUTS / INIT_ROUTINES（範例資料；目前仍為舊形狀，載入時經 migrateData 轉換）
   ├─ hooks/
   │  └─ useStorage.js             lsGet、lsSet（寫入延後一個 tick）
   ├─ utils/
   │  ├─ date.js                   todayStr、localDate、uid、fmtDate
   │  ├─ paceUtils.js              距離/配速的拆合、格式化、總時間↔配速、整體配速
   │  ├─ routineUtils.js           週/月區間、規律達標計算、LogTab 預覽「再算 1 天」
   │  ├─ exportUtils.js            Markdown 匯出（動作庫段落、單日段落、依範圍匯出）
   │  ├─ logDraft.js               訓練草稿：讀/寫/清除、3 小時期限、補登日期保護
   │  ├─ setUtils.js ★             重量/圈數組次工具：單位清單、舊字串解析、upgradeWeightSets、顯示文字（coreText / noteText）、存檔前檢查、距離單位別名
   │  └─ migrateData.js ★          載入與匯入時的唯一轉換入口（見 §3）；檔頭定義 schemaVersion 1
   ├─ components/
   │  ├─ ui.jsx                    Div、Card（含 tint）、SLabel、StatusBar、BottomNav
   │  ├─ Button.jsx                Button（見 §4）、InfoButton、CloseButton、BackButton
   │  ├─ AutoGrowTextarea.jsx      AutoGrowTextarea（編輯，自動增高）、CollapsibleText（顯示，可收合）
   │  ├─ SelectionControls.jsx     SegmentedControl、ColorPicker、ChipGroup、ExerciseFieldsGroup
   │  ├─ BottomSheet.jsx           底部玻璃面板（把手拖曳關閉）
   │  ├─ ConfirmDialog.jsx         確認彈窗
   │  ├─ SwipeBackView.jsx         子頁左緣右滑返回外殼
   │  ├─ WeightSetEditor.jsx ★     數據/組次編輯：重量｜圈數切換、數字＋單位＋備註、滾輪次數 → RepsPicker
   │  ├─ LengthPaceEditor.jsx      距離/配速編輯（配速/總時間切換；單位為固定選單 ★）→ NumberPicker
   │  ├─ NumberPicker.jsx          滾輪式數字選擇
   │  └─ RepsPicker.jsx            NumberPicker 的次數版（1–50）
   └─ tabs/
      ├─ HomeTab.jsx               總覽：統計卡、月曆（漸層）、最近紀錄、「開始／繼續本次訓練」、字體大小面板
      ├─ LogTab.jsx                記錄訓練：草稿、規律預覽、動作卡片（上次資料由歷史現算）
      ├─ HistoryTab.jsx            歷史：年→月→日分組、搜尋；預覽只顯示實質資料
      ├─ DetailTab.jsx             DetailTab（編輯單次訓練）、DayDetailTab（單日檢視）
      ├─ LibraryTab.jsx            動作庫列表＋動作詳情（LibItemDetail）；歷史由 App 傳入
      ├─ RoutineTab.jsx            規律管理
      └─ AboutTab.jsx              關於、版本號、匯出/匯入（含 schemaVersion 檢查 ★）、月曆漸層、維護
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

| key                   | 內容                                                 | 寫入者                              |
| --------------------- | ---------------------------------------------------- | ----------------------------------- |
| `wt_workouts`         | 訓練紀錄陣列（新存的在前）— **唯一的訓練資料來源** ★ | App（lsSet）                        |
| `wt_library`          | 動作庫陣列（**不含 history** ★）                     | App（lsSet）                        |
| `wt_routines`         | 規律陣列（上限 5 條）                                | App（lsSet）                        |
| `wt_lang`             | `"zh"` / `"en"`                                      | App                                 |
| `wt_dark`             | 深色模式                                             | App                                 |
| `wt_fontScale`        | `normal` / `large` / `xlarge`                        | App                                 |
| `wt_homeStatPeriod`   | 首頁統計看週或月規律                                 | App                                 |
| `wt_calGradientMode`  | `animated` / `static` / `off`                        | App                                 |
| `wt_calGradientStyle` | `linear` / `conic`                                   | App                                 |
| `wt_logDraft`         | 草稿 `{ updatedAt, selectedDate, rows }`             | logDraft.js（同步寫入，不經 lsSet） |

草稿清除時機：完成訓練（LogTab 同步清除）、`handleImport`／`handleReset`／`handleClear`、卡片全部移除、超過 3 小時、動作全被刪除。
偏好設定（lang／dark／fontScale／homeStatPeriod／calGradient*）與草稿都不進備份 JSON。

### 資料形狀（schemaVersion 1）

```
workout   { id, date:"YYYY-MM-DD", weekday, muscleGroups[], exercises[] }
exercise  { libId, muscleGroup, color,                 // muscleGroup / color 為「紀錄當下」的快照
            mode:"weight_sets"|"length_pace", equipment, feeling,
            setKind:"weight"|"laps", weightSets:[{ value, unit, note, reps[] }]      // mode = weight_sets
          | lengthPace:[{ distance, unit, paceMin, paceSec }] }                      // mode = length_pace（無 setKind）
library   { id, name, muscleGroup, color, recordingMode, note }                      // 不含 history
routine   { id, period:"week"|"month", matchType:"exercise"|"color"|"muscleGroup", matchValue, targetCount }
draft row { libId, mode, equipment, setKind, weightSets, lengthPace, feeling, noteLocal, noteDirty }
backup    { version, schemaVersion, exportedAt, workouts, library, routines }

單位：重量 kg / lb；距離（圈數的每圈距離、配速）m / km / mi（固定代碼）
缺省值：mode 缺少 → weight_sets；setKind 缺少 → weight；recordingMode 缺少 → weight_sets
例外：需人工判斷的組別保持舊形狀 { weight, reps }（沒有 unit），讀取端視為「舊格式、單位不明」
```

**現算資料（不儲存）**

```
historyByLib（App 以 useMemo 由 workouts 現算）
  Map< libId, [{ date, workoutId, ...exercise 內容（不含 libId / muscleGroup / color） }] >
  依 date 由舊到新排序、同日依存檔順序；最後一筆就是「上次」
  → LibraryTab（上次器材/組次、歷史列表、筆數）、LogTab（新增動作帶入上次資料、選單的「上次」日期）
```

### 資料流

```
啟動
  localStorage ─lsGet→ migrateData（舊重量字串轉換、距離單位別名、補快照、丟棄舊 history）→ state → 持久化 effect 寫回

LogTab 編輯 → wt_logDraft（含 noteLocal / noteDirty）
LogTab 完成訓練 → App.handleSave
  ├─ workouts：新增一筆（stampExercises 蓋上 muscleGroup / color 快照）
  └─ library：只同步有 noteDirty 的動作的 note
DetailTab 儲存 → App.handleUpdateWorkout → 只改 workouts（沿用原快照，缺少才補）
DetailTab 刪除 → App.handleDeleteWorkout → 只移除 workouts 那一筆
LibraryTab 編輯 → 只改 library（過去訓練的快照不變；月曆與規律讀動作庫現值）

匯出 → { version, schemaVersion, exportedAt, workouts, library, routines }
匯入 → 檢查 schemaVersion（比 App 認得的新就拒絕）→ 結構檢查 → handleImport → 清草稿 → migrateData → 覆蓋三份資料
重設 → 清草稿 → 範例資料 → migrateData
清除 → 清草稿 → workouts / library / routines 清空
```

## 4. 元件使用對照

### Button 家族（`components/Button.jsx`）

- `Button` variants：`primary`、`tinted`、`outline`、`ghost`、`danger`、`dangerOutline`、`dashed`、`segment`、`segmentOutline`；size：`lg`／`md`／`sm`
- `InfoButton`：LibraryTab、RoutineTab×2、LengthPaceEditor、WeightSetEditor ★
- `BackButton`：DetailTab×2、RoutineTab、LibraryTab（LibItemDetail）
- `CloseButton`：目前沒有任何呼叫處

| 使用者                            | 用到                           |
| --------------------------------- | ------------------------------ |
| AboutTab、HomeTab、LogTab         | Button                         |
| DetailTab                         | Button、BackButton             |
| LibraryTab、RoutineTab            | Button、BackButton、InfoButton |
| LengthPaceEditor、WeightSetEditor | InfoButton                     |
| ConfirmDialog、SelectionControls  | Button                         |

### AutoGrowTextarea 家族（`components/AutoGrowTextarea.jsx`）

| 元件               | tone / 設定                  | 使用處                                         |
| ------------------ | ---------------------------- | ---------------------------------------------- |
| `AutoGrowTextarea` | `feeling`（預設，最小高 64） | LogTab 當次感受、DetailTab 當次感受            |
| `AutoGrowTextarea` | `plain`，最小高 54           | LogTab 器材設定、DetailTab 器材設定            |
| `AutoGrowTextarea` | `plain`，最小高 90           | LogTab 動作知識筆記                            |
| `CollapsibleText`  | `feeling`，預設收合 5 行     | DayDetailTab 當次感受、LibraryTab 訓練歷史感受 |

刻意保持手刻：DayDetailTab 的動作知識筆記（收合保留 1 行）、各處唯讀的器材設定顯示、LibItemDetail 的筆記欄位（自己的增高機制）、WeightSetEditor 的「重量／圈數」切換與 LengthPaceEditor 的「配速／總時間」切換（各自的小型切換鈕，非 SegmentedControl）、WeightSetEditor 內的數字輸入框 `NumberField`（只在該檔使用）。

### 其他共用元件被誰使用

| 元件                                  | 使用者                                        |
| ------------------------------------- | --------------------------------------------- |
| `BottomSheet`                         | AboutTab、HomeTab、LogTab×3、RoutineTab       |
| `ConfirmDialog`                       | AboutTab×3、DetailTab、LibraryTab、RoutineTab |
| `SegmentedControl`                    | AboutTab×2、HomeTab、RoutineTab×3             |
| `ColorPicker`／`ChipGroup`            | RoutineTab                                    |
| `ExerciseFieldsGroup`                 | LogTab、LibraryTab×2                          |
| `SwipeBackView`                       | App（detail／daydetail／routine）、LibraryTab |
| `WeightSetEditor`／`LengthPaceEditor` | LogTab、DetailTab                             |
| `NumberPicker`                        | RoutineTab、LengthPaceEditor、RepsPicker      |
| `RepsPicker`                          | WeightSetEditor                               |

## 5. 模組依賴（簡圖）

```
App ─┬─ tabs/*（Home, Log, History, Detail, Library, Routine, About）
     ├─ components/ui、SwipeBackView
     ├─ hooks/useStorage
     ├─ utils/logDraft            （匯入／重設／清除時清草稿）
     ├─ utils/migrateData ★       （載入、匯入、重設時轉換）
     └─ data/i18n、data/initialData、theme

HomeTab    → Button、ui、BottomSheet、SelectionControls、routineUtils、logDraft（hasLogDraft）、date、theme
LogTab     → Button、ui、BottomSheet、SelectionControls、WeightSetEditor、LengthPaceEditor、
             AutoGrowTextarea、routineUtils、logDraft、setUtils、date、theme
DetailTab  → Button、ui、ConfirmDialog、WeightSetEditor、LengthPaceEditor、AutoGrowTextarea、paceUtils、setUtils、date
LibraryTab → Button、ui、ConfirmDialog、SelectionControls、SwipeBackView、AutoGrowTextarea、paceUtils、setUtils、date
RoutineTab → Button、ui、BottomSheet、ConfirmDialog、SelectionControls、NumberPicker、routineUtils、date
AboutTab   → Button、ui、BottomSheet、ConfirmDialog、SelectionControls、exportUtils、constants（SCHEMA_VERSION）、date
HistoryTab → ui、paceUtils、setUtils、date

WeightSetEditor  → Button（InfoButton）、RepsPicker、setUtils
LengthPaceEditor → Button（InfoButton）、NumberPicker、paceUtils、setUtils

utils/logDraft → date        utils/routineUtils → date        utils/exportUtils → paceUtils、setUtils
utils/migrateData → setUtils        setUtils、paceUtils、date：無依賴
components/RepsPicker → NumberPicker        ConfirmDialog、SelectionControls → Button
components/AutoGrowTextarea、NumberPicker、BottomSheet、SwipeBackView、Button → theme（useC）

scripts/*（CommonJS，獨立執行，不 import src）
  migrate-data.js 內複製了：setUtils.js 的 parseLegacyWeight 與距離別名表、migrateData.js 的 CARDIO_GROUPS、
  constants.js 的 SCHEMA_VERSION  ⚠️ 修改任一邊時，必須同步另一邊（檔內皆有註解標示）
```

## 6. 版本與建置

- 版本單一來源：`tabs/AboutTab.jsx` 的 `APP_VERSION`（目前 `2.4.0_b1`）
- 資料結構版本單一來源：`data/constants.js` 的 `SCHEMA_VERSION`（目前 `1`）；與 `APP_VERSION` 無關，只有資料形狀改變時才遞增
- `npm run build` 後由 `scripts/sync-sw-version.js` 把版本寫入 `build/service-worker.js` 的 `CACHE_NAME` 與 `package.json`
- 部署：`npm run deploy`（`gh-pages -d build`）
- 範例資料更新腳本：`npm run init-data -- <備份.json> [--shift-days N] [--set id=日期] [--edit] [--write]`
- 舊備份轉換腳本（非 npm script，直接執行）：`node scripts/migrate-data.js <備份.json> [--write] [--out 路徑] [--drop-orphans] [--answers 答案.json]`
