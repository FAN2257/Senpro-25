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
          <h3 className="section-title">Riwayat & kalkulasi meal</h3>
          <p className="section-description">Halaman ini memperlihatkan alur akumulasi nutrisi, sangat cocok untuk demo fitur yang paling bernilai.</p>
        </div>
      </div>

      <div className="grid-2">
        <div className="form-card">
          <h4 className="form-title">Meal builder</h4>
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

          <div className="footer-note">Total item dalam meal: {totalItems}</div>
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
          <h4 className="form-title">Ringkasan kalkulasi</h4>
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
              Jalankan kalkulasi untuk menampilkan total nutrisi.
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <h4 className="card-title">Value angle untuk presentasi</h4>
        <p className="muted" style={{ lineHeight: 1.7 }}>
          Riwayat makan yang terstruktur membuat produk terasa lebih bernilai daripada sekadar demo AI image recognition.
          Ini membuka narasi product-market fit untuk diet tracking, clinical tracking, dan healthy habit monitoring.
        </p>
      </div>
    </section>
  );
}
