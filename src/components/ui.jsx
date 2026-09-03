import { useState, useEffect } from "react";
import { useC } from "../theme.js";
import { useLang, T } from "../data/i18n.js";

export function Div({ left=0 }) {
  const C = useC();
  return <div style={{ height:1, background:C.sep, marginLeft:left }} />;
}

export function Card({ children, style={}, onClick }) {
  const C = useC();
  return (
    <div onClick={onClick} style={{ background:C.card, borderRadius:16, overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,0.12)", cursor:onClick?"pointer":"default", ...style }}>
      {children}
    </div>
  );
}

export function SLabel({ children }) {
  const C = useC();
  return (
    <div style={{ fontSize:12, fontWeight:500, color:C.label, letterSpacing:0.4, marginBottom:8, paddingLeft:2, textTransform:"uppercase" }}>
      {children}
    </div>
  );
}

export function StatusBar() {
  const C = useC();
  const [t, setT] = useState(new Date());
  useEffect(() => {
    const i = setInterval(() => setT(new Date()), 1000);
    return () => clearInterval(i);
  }, []);
  const h = t.getHours().toString().padStart(2, "0");
  const m = t.getMinutes().toString().padStart(2, "0");
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 24px 6px", fontSize:15, fontWeight:600, color:C.text, background:C.card, flexShrink:0, position:"relative" }}>
      <span>{h}:{m}</span>
      <div style={{ position:"absolute", left:"50%", transform:"translateX(-50%)", width:120, height:34, background:"#000", borderRadius:20, zIndex:1 }} />
      <div style={{ display:"flex", gap:5, alignItems:"center", fontSize:12 }}>
        <span>●●●</span><span>WiFi</span><span>🔋</span>
      </div>
    </div>
  );
}

export function BottomNav({ tab, setTab }) {
  const lang = useLang();
  const t = T[lang];
  const C = useC();
  const items = [
    { id:"home",    label:t.navHome,
      svg:(active) => <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke={active?C.blue:C.label} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12L12 4l9 8"/><path d="M5 10v9a1 1 0 001 1h4v-4h4v4h4a1 1 0 001-1v-9"/></svg> },
    { id:"history", label:t.navHistory,
      svg:(active) => <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke={active?C.blue:C.label} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="3" width="14" height="18" rx="2"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg> },
    { id:"log",     label:t.navLog,
      svg:(active) => <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke={active?C.blue:C.label} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg> },
    { id:"library", label:t.navLibrary,
      svg:(active) => <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke={active?C.blue:C.label} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4h6a4 4 0 014 4v12a3 3 0 00-3-3H2V4z"/><path d="M22 4h-6a4 4 0 00-4 4v12a3 3 0 013-3h7V4z"/></svg> },    
    { id:"about",   label:t.navAbout,
      svg:(active) => <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke={active?C.blue:C.label} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="8.5"/><line x1="12" y1="12" x2="12" y2="16"/></svg> },
  ];
  return (
    <div style={{ display:"flex", background:C.card, borderTop:`1px solid ${C.sep}`, flexShrink:0 }}>
      {items.map(item => {
        const active = tab === item.id;
        return (
          <button key={item.id} onClick={() => setTab(item.id)}
            style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:4, border:"none", background:"none", cursor:"pointer", padding:"10px 0 22px", position:"relative" }}>
            {active && <div style={{ position:"absolute", top:0, left:"50%", transform:"translateX(-50%)", width:20, height:2, borderRadius:1, background:C.blue }} />}
            {item.svg(active)}
            <span style={{ fontSize:10, fontWeight:active?600:400, color:active?C.blue:C.label, letterSpacing:0.2 }}>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
