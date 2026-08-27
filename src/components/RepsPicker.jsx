import { NumberPicker } from "./NumberPicker.jsx";

const MIN = 1;
const MAX = 50;

export function RepsPicker({ value, onChange }) {
  return <NumberPicker value={value} onChange={onChange} min={MIN} max={MAX} width={52} />;
}