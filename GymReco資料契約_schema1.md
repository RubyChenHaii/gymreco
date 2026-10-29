# GymReco 資料契約

- App 版本：v2.4.0_b
- 資料結構版本（`schemaVersion`）：**1**
- 本文件以 `src/utils/migrateData.js` 檔頭的 schemaVersion 1 定義為準；兩者不一致時，以程式碼為準，並請同步修正本文件。

---

## 1. 儲存位置

全部存於瀏覽器 localStorage，沒有後端。

| Key                                                                                               | 內容                             | 進備份 JSON |
| ------------------------------------------------------------------------------------------------- | -------------------------------- | ----------- |
| `wt_workouts`                                                                                     | 訓練紀錄（陣列，新存的在前）     | ✅           |
| `wt_library`                                                                                      | 動作庫                           | ✅           |
| `wt_routines`                                                                                     | 規律（每週／每月目標）           | ✅           |
| `wt_logDraft`                                                                                     | 訓練頁尚未完成的草稿，3 小時期限 | ❌           |
| `wt_lang` `wt_dark` `wt_fontScale` `wt_homeStatPeriod` `wt_calGradientMode` `wt_calGradientStyle` | 偏好設定                         | ❌           |

**唯一的訓練資料來源是 `wt_workouts`。** 動作庫裡不再存訓練歷史；每個動作的「歷史」一律由 `workouts` 現算（見第 6 節）。

---

## 2. 備份 JSON 格式

```json
{
  "version": "2.4.0_b",
  "schemaVersion": 1,
  "exportedAt": "2026-10-29T08:00:00.000Z",
  "workouts": [],
  "library": [],
  "routines": []
}
```

- `version`：App 版本字串，僅供參考。
- `schemaVersion`：整數，資料形狀改變時才遞增。**沒有此欄位的備份視為舊格式**；比 App 認得的更大則拒絕匯入。
- `routines` 為選填；舊備份沒有時匯入後為空陣列。

---

## 3. Workout（`workouts[]`）

一筆 = 一次訓練（session）。同一天可以有多筆。

| 欄位           | 型別             | 說明                                                                           |
| -------------- | ---------------- | ------------------------------------------------------------------------------ |
| `id`           | string \| number | 不透明識別碼。新資料為 UUID 字串；早期範例資料為數字。**比較前請一律轉成字串** |
| `date`         | `"YYYY-MM-DD"`   | 本地時間日期，沒有時分秒                                                       |
| `weekday`      | string           | 英文全名（`"Monday"`…），由 `date` 推得                                        |
| `muscleGroups` | string[]         | 該次訓練的部位（繁中名稱，見第 7 節）。存檔時寫入，之後不隨動作庫變動          |
| `exercises`    | Exercise[]       | 見下節                                                                         |

**排序**：陣列是「最後存檔的在前」，**不保證依 `date` 排序**（補登舊日期的訓練會排在前面）。需要時間順序請自行依 `date` 排序，同日再依陣列位置。

---

## 4. Exercise（`workouts[].exercises[]`）

| 欄位          | 型別                               | 說明                                                                     |
| ------------- | ---------------------------------- | ------------------------------------------------------------------------ |
| `libId`       | string                             | 對應 `library[].id`。動作被刪除後可能找不到（懸空）                      |
| `muscleGroup` | string                             | **快照**：紀錄當下該動作的部位                                           |
| `color`       | string                             | **快照**：紀錄當下該動作的顏色（hex）                                    |
| `mode`        | `"weight_sets"` \| `"length_pace"` | 紀錄模式。缺少時視為 `"weight_sets"`                                     |
| `equipment`   | string                             | 器材設定，可為空字串                                                     |
| `feeling`     | string                             | 當次感受，可為空字串                                                     |
| `setKind`     | `"weight"` \| `"laps"`             | **僅 `weight_sets` 有**。缺少時視為 `"weight"`；`length_pace` 沒有此欄位 |
| `weightSets`  | WeightSet[]                        | 僅 `mode = "weight_sets"`                                                |
| `lengthPace`  | LengthPaceSegment[]                | 僅 `mode = "length_pace"`                                                |

### 快照規則（`muscleGroup`、`color`）

- 新訓練：存檔時取動作庫的**現值**。
- 編輯舊訓練：**沿用原本的快照**，不會被覆蓋；原本沒有才補。
- 之後在動作庫改該動作的部位或顏色，**不會回頭改過去的訓練**。
- 載入時（`migrateData`）會把缺快照的舊紀錄用動作庫現值補一次。動作已從動作庫刪除、又沒有快照的紀錄補不出來，這類 exercise 沒有這兩個欄位。
- GymReco 自己的月曆圓點與規律達標，讀的是動作庫**現值**；統計類用途請讀快照。

### WeightSet（`mode = "weight_sets"`）

```json
{ "value": 60, "unit": "kg", "note": "左右各 15kg", "reps": [5, 5, 5] }
```

| 欄位    | 說明                                                                                 |
| ------- | ------------------------------------------------------------------------------------ |
| `value` | 實質資料，≥ 0 的數字。`setKind = "weight"` 時為每組負重；`"laps"` 時為**每圈的距離** |
| `unit`  | `weight`：`kg` \| `lb`。`laps`：`m` \| `km` \| `mi`                                  |
| `note`  | 自由文字，選填，可為空字串。不納入計算                                               |
| `reps`  | 整數陣列（1–50）。`weight`：每組的次數。`laps`：每組跑／游的圈數                     |

- 自重動作慣例為 `value: 0`、`unit: "kg"`、`note: "BW"`。使用者自己輸入 0 也會是同樣的形狀，無法單靠 `value` 區分。
- 圈數模式的總距離 = `value × reps 總和`（單位同 `unit`）。
- **例外（舊格式殘留）**：需要人工判斷的組別會維持舊形狀 `{ "weight": "BW", "reps": [2] }`（沒有 `unit`）。讀取端遇到沒有 `unit` 的組別，應視為「舊格式、單位不明」，不要當成錯誤，也不要猜單位。

### LengthPaceSegment（`mode = "length_pace"`）

```json
{ "distance": 2, "unit": "km", "paceMin": 6, "paceSec": 30 }
```

| 欄位                 | 說明                                             |
| -------------------- | ------------------------------------------------ |
| `distance`           | 該段距離，以 0.1 為單位的小數（單段上限約 10.9） |
| `unit`               | `m` \| `km` \| `mi`（固定代碼）                  |
| `paceMin`、`paceSec` | 每 1 個 `unit` 的配速，分／秒（整數）            |

- 「總時間」輸入模式只是輸入方式：存檔時會換算成配速，**總時間本身不另存**。要還原總時間請用 `distance × 配速`，會有最多秒級的四捨五入誤差。
- 各段單位不同時，App 不計算整體配速。

---

## 5. Library（`library[]`）與 Routine（`routines[]`）

### 動作庫項目

| 欄位            | 型別                               | 說明                                                                |
| --------------- | ---------------------------------- | ------------------------------------------------------------------- |
| `id`            | string                             | 範例資料為 `"lib1"` 這類字串，新增的為 UUID                         |
| `name`          | string                             | 動作名稱                                                            |
| `muscleGroup`   | string                             | 目前的部位（見第 7 節）                                             |
| `color`         | string                             | 目前的顏色（hex）。**不保證屬於內建色盤**，範例資料就有色盤以外的值 |
| `recordingMode` | `"weight_sets"` \| `"length_pace"` | 新增時選擇。舊動作可能沒有，視為 `"weight_sets"`                    |
| `note`          | string                             | 動作知識筆記，**每個動作只存一份**，不會複製到各筆訓練              |

筆記的寫入時機：在訓練頁修改的筆記先存在該動作卡片的草稿，按「完成訓練」時才寫進動作庫；在動作庫頁直接編輯則立即寫入。

### 規律

| 欄位          | 說明                                                              |
| ------------- | ----------------------------------------------------------------- |
| `id`          | string                                                            |
| `period`      | `"week"` \| `"month"`（一週以週日為起點）                         |
| `matchType`   | `"exercise"` \| `"color"` \| `"muscleGroup"`                      |
| `matchValue`  | 依 `matchType`：動作 `id`、顏色 hex、部位名稱。動作被刪除後會懸空 |
| `targetCount` | 至少次數；同一天同一條規律最多算 1 次                             |

App 內最多 5 條規律。

---

## 6. 由 workouts 現算的資料（不儲存）

每個動作的訓練歷史（動作庫的「上次」、歷史列表、訓練頁帶入的上次資料）：

1. 依 `libId` 把所有 `workouts[].exercises[]` 分組。
2. 每一筆為 `{ date, workoutId, ...exercise 內容（不含 libId、muscleGroup、color） }`。
3. 依 `date` 由舊到新排序，同日依存檔順序；最後一筆就是「上次」。
4. 同一動作在同一次訓練出現兩次時，兩筆都會計入。

---

## 7. 列舉值

**部位（`muscleGroup`，共 12 種）**

| 繁中（儲存值） | 英文顯示   |
| -------------- | ---------- |
| 胸肌           | Chest      |
| 背部           | Back       |
| 腿部           | Legs       |
| 肩部           | Shoulders  |
| 手臂           | Arms       |
| 腹部           | Abs        |
| 核心           | Core       |
| 臀部           | Glutes     |
| 有氧           | Cardio     |
| 跑步           | Running    |
| 伸展運動       | Stretching |
| 其他           | Other      |

儲存值永遠是繁中；英文只是顯示用。資料中不保證只出現這 12 種，讀取端遇到未知值請原樣保留。

**內建色盤（`COLOR_OPTS`）**：`#FF6B6B` `#EA0000` `#FF9500` `#FFCC00` `#34C759` `#5AC8FA` `#007AFF` `#5856D6` `#AF52DE` `#8E8E93`

**單位**：重量 `kg`、`lb`；距離 `m`、`km`、`mi`。

---

## 8. 載入與轉換

載入 localStorage 與匯入備份都經過同一個入口 `migrateData`（純函式、可重複執行；沒有東西要轉換時原樣回傳）：

1. 重量組次：`{ weight: "15kg", reps }` → `{ value, unit, note, reps }`，並補 `setKind`。
2. 距離單位別名（`KM`、`公里`、`miles`…）統一成 `m` / `km` / `mi`；認不得的原樣保留。
3. 補存 `muscleGroup` / `color` 快照。
4. 丟棄舊的 `library[].history`。

**會保持舊格式、交給腳本處理的情況**：解析不出數字加單位的字串、`有氧` / `跑步` 動作的自重（可能是游泳或跑步的圈數）、同一筆同時出現重量與距離單位。

**轉換腳本**：`node scripts/migrate-data.js <備份.json> [--write] [--out 路徑] [--drop-orphans] [--answers 答案.json]`

- 預設只預覽，加 `--write` 才輸出；不會覆蓋原檔。
- 涵蓋上述四項，加上 `schemaVersion`；無法自動判斷時會詢問，同一種資料只問一次。
- 移除 `library[].history` 前會做孤兒檢查（history 在 workouts 找不到對應訓練）；有孤兒時必須加 `--drop-orphans` 才會輸出。
- 輸出的備份結構與 App 匯出的一致。

---

## 9. 給資料讀取端（例如 GymStats）的重點

1. 只讀 `workouts`；忽略舊備份可能殘留的 `library[].history`。
2. 部位與顏色一律讀 exercise 上的快照；缺少時才退回動作庫現值，兩者都沒有就標為未知。
3. `workout.id` 當不透明字串處理。
4. `mode` 缺少視為 `weight_sets`，`setKind` 缺少視為 `weight`，動作的 `recordingMode` 缺少視為 `weight_sets`。
5. 沒有 `unit` 的組別是舊格式殘留，不要猜單位。
6. 總時間不另存；配速是唯一的時間資料。
7. 資料中沒有訓練時長或時刻，只有日期。

---

## 10. 結構版本紀錄

| schemaVersion | 內容                                                                                                                                                                                                         |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 無（舊格式）  | 重量為 `{ weight: "15kg", reps }` 字串；距離單位為自由文字；`library[].history` 與 `workouts` 各存一份；exercise 無快照                                                                                      |
| 1             | 重量組次為 `{ value, unit, note, reps }` 並有 `setKind`；距離單位固定為 `m` / `km` / `mi`；exercise 有 `muscleGroup` / `color` 快照；移除 `library[].history`，`workouts` 為唯一來源；匯出帶 `schemaVersion` |
