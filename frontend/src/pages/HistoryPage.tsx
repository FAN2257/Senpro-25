import { useMemo, useState } from 'react';
import { calculateMeal } from '../lib/api';
import type { MealItem } from '../types/api';

const starterItems: MealItem[] = [
  { food_name: 'Nasi Padang', quantity_gram: 150 },
  { food_name: 'Ayam Goreng', quantity_gram: 100 }
];

export function HistoryPage() {
  const [items, setItems] = useState<MealItem[]>(starterItems);
  const [foodName, setFoodName] = useState('');
  const [quantity, setQuantity] = useState(100);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const totalItems = useMemo(() => items.length, [items]);

  const addItem = () => {
    if (!foodName.trim()) return;
    setItems((current) => [...current, { food_name: foodName.trim(), quantity_gram: quantity }]);
    setFoodName('');
    setQuantity(100);
  };

  const runCalculation = async () => {
    setLoading(true);
    try {
      const response = await calculateMeal({ foods: items });
      setResult(response);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section">
      <div className="section-header">
        <div>
          <h3 className="section-title">Riwayat makan</h3>
          <p className="section-description">Simpan kombinasi makanan yang sering Anda pilih dan lihat perkiraan gizinya.</p>
        </div>
      </div>

      <div className="grid-2">
        <div className="form-card">
          <h4 className="form-title">Susun menu</h4>
          <div className="grid-2" style={{ marginTop: 16 }}>
            <div className="field">
              <label className="field-label" htmlFor="history-food">Nama makanan</label>
              <input id="history-food" className="input" value={foodName} onChange={(event) => setFoodName(event.target.value)} placeholder="Contoh: Rendang" />
            </div>
            <div className="field">
              <label className="field-label" htmlFor="history-qty">Jumlah (gram)</label>
              <input
                id="history-qty"
                className="input"
                type="number"
                min={1}
                value={quantity}
                onChange={(event) => setQuantity(Number(event.target.value))}
              />
            </div>
          </div>
          <div className="form-actions" style={{ marginTop: 16 }}>
            <button className="btn btn-primary" type="button" onClick={addItem}>Tambah item</button>
            <button className="btn btn-secondary" type="button" onClick={runCalculation} disabled={loading}>
              {loading ? 'Menghitung...' : 'Hitung nutrisi total'}
            </button>
          </div>

          <div className="footer-note">Total item yang Anda simpan: {totalItems}</div>
          <div className="list" style={{ marginTop: 12 }}>
            {items.map((item, index) => (
              <div className="list-item" key={`${item.food_name}-${index}`}>
                <strong>{item.food_name}</strong>
                <span>{item.quantity_gram} g</span>
              </div>
            ))}
          </div>
        </div>

        <div className="result-card">
          <h4 className="form-title">Perkiraan total gizi</h4>
          {result?.total_nutrition ? (
            <div className="list" style={{ marginTop: 16 }}>
              {Object.entries(result.total_nutrition).map(([key, value]) => (
                <div className="list-item" key={key}>
                  <strong>{key}</strong>
                  <span>{String(value)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ marginTop: 16 }}>
              Jalankan perhitungan untuk melihat total gizinya.
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <h4 className="card-title">Kenapa fitur ini berguna</h4>
        <p className="muted" style={{ lineHeight: 1.7 }}>
          Riwayat yang tersusun membantu Anda melihat kebiasaan makan dengan lebih jelas dan membuat keputusan berikutnya lebih mudah.
        </p>
      </div>
    </section>
  );
}
