import { useC, useGlass, GLASS_BLUR } from "../theme.js";
import { Button } from "./Button.jsx";

// ConfirmDialog：專案內原本 6 處「刪除／清除／匯入」確認彈窗共用的元件
// - 統一遮罩＋卡片＋標題＋訊息＋按鈕列的結構，避免逐字重複
// - 取消/確認按鈕改用共用 Button 元件（ghost / primary / danger）
// - 套用與 BottomSheet 相同的玻璃感（此處為覆蓋層情境，backdrop-filter 有實際效果）
export function ConfirmDialog({
  open, onClose, onConfirm,
  title, titleColor,
  message,
  warning,                      // 選填：額外的警示色提示框文字（例如 AboutTab 匯入確認用）
  cancelLabel, confirmLabel,
  confirmVariant = "primary",   // "primary" | "danger"
  zIndex = 300,
}) {
  const C = useC();
  const glass = useGlass();
  if (!open) return null;

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex, padding:"20px" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        borderRadius:16, padding:"24px 20px", width:"100%", maxWidth:320,
        background:glass.background, backdropFilter:GLASS_BLUR, WebkitBackdropFilter:GLASS_BLUR,
        border:glass.borderTop, // 沿用玻璃 token 的髮絲邊框值，這裡改成四邊都套用（原本 BottomSheet 只用在頂部）
        boxSizing:"border-box",
      }}>
        <div style={{ fontSize:17, fontWeight:700, color:titleColor || C.text, marginBottom:10, textAlign:"center" }}>{title}</div>
        <div style={{ fontSize:14, color:C.sub, marginBottom: warning ? 8 : 20, textAlign:"center", lineHeight:1.6 }}>{message}</div>
        {warning && (
          <div style={{ fontSize:13, color:C.red, marginBottom:20, textAlign:"center", lineHeight:1.6, background:`${C.red}10`, borderRadius:10, padding:"8px 12px" }}>
            {warning}
          </div>
        )}
        <div style={{ display:"flex", gap:10 }}>
          <Button variant="ghost" size="md" onClick={onClose} style={{ flex:1 }}>{cancelLabel}</Button>
          <Button variant={confirmVariant} size="md" onClick={onConfirm} style={{ flex:1 }}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}