export const NUTRITION_UNITS: Record<string, string> = {
  Energy: 'kcal',
  Protein: 'g',
  Fat: 'g',
  CHO: 'g',
  Ca: 'mg',
  P: 'mg',
  Fe: 'mg',
  Water: 'g'
};

export function formatNutrition(key: string, value: number | string | undefined) {
  const v = value ?? 0;
  const unit = NUTRITION_UNITS[key] ?? '';
  // Keep numeric formatting concise
  const num = typeof v === 'number' ? (Number.isInteger(v) ? v : Number(v).toFixed(1)) : v;
  return unit ? `${num} ${unit}` : String(num);
}
