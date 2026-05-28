import { useEffect, useMemo, useState } from 'react';
import { calculateMeal, getMealHistory, saveMealHistory } from '../lib/api';
import { formatNutrition } from '../lib/nutrition';
import type { MealCalculationResponse, MealHistoryEntry, MealItem } from '../types/api';

const starterItems: MealItem[] = [
  { food_name: 'Nasi Padang', quantity_gram: 150 },
  { food_name: 'Ayam Goreng', quantity_gram: 100 }
];

function isSameLocalDay(left: string, right: Date) {
  const leftDate = new Date(left);
  return leftDate.getFullYear() === right.getFullYear()
    && leftDate.getMonth() === right.getMonth()
    && leftDate.getDate() === right.getDate();
}

function aggregateNutrition(entries: MealHistoryEntry[]) {
  return entries.reduce((accumulator, entry) => {
    const totalNutrition = entry.total_nutrition ?? {};
    return {
      Energy: accumulator.Energy + Number(totalNutrition.Energy ?? 0),
      Protein: accumulator.Protein + Number(totalNutrition.Protein ?? 0),
      Fat: accumulator.Fat + Number(totalNutrition.Fat ?? 0),
      CHO: accumulator.CHO + Number(totalNutrition.CHO ?? 0),
      Ca: accumulator.Ca + Number(totalNutrition.Ca ?? 0),
      Fe: accumulator.Fe + Number(totalNutrition.Fe ?? 0)
    };
  }, { Energy: 0, Protein: 0, Fat: 0, CHO: 0, Ca: 0, Fe: 0 });
}

export function HistoryPage() {
  const [items, setItems] = useState<MealItem[]>(starterItems);
  const [foodName, setFoodName] = useState('');
  const [quantity, setQuantity] = useState(100);
  const [result, setResult] = useState<MealCalculationResponse | null>(null);
  const [savedHistory, setSavedHistory] = useState<MealHistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  const totalItems = useMemo(() => items.length, [items]);
  const today = useMemo(() => new Date(), []);
  const todayHistory = useMemo(() => savedHistory.filter((entry) => isSameLocalDay(entry.created_at, today)), [savedHistory, today]);
  const todayScanHistory = useMemo(() => todayHistory.filter((entry) => entry.source === 'scan'), [todayHistory]);
  const todayNutrition = useMemo(() => aggregateNutrition(todayScanHistory), [todayScanHistory]);
  const latestSavedEntry = useMemo(() => savedHistory[0] ?? null, [savedHistory]);

  const latestNutrition = useMemo(() => {
    if (!latestSavedEntry) {
      return null;
    }

    const totalNutrition = latestSavedEntry.total_nutrition;

    return {
      energy: totalNutrition.Energy ?? 0,
      protein: totalNutrition.Protein ?? 0,
      fat: totalNutrition.Fat ?? 0,
      cho: totalNutrition.CHO ?? 0,
      calcium: totalNutrition.Ca ?? 0,
      iron: totalNutrition.Fe ?? 0
    };
  }, [latestSavedEntry]);

  useEffect(() => {
    let isActive = true;

    const loadHistory = async () => {
      setHistoryLoading(true);
      try {
        const response = await getMealHistory(50);
        if (isActive) {
          setSavedHistory(response.items);
        }
      } catch {
        if (isActive) {
          setSavedHistory([]);
        }
      } finally {
        if (isActive) {
          setHistoryLoading(false);
        }
      }
    };

    loadHistory();

    return () => {
      isActive = false;
    };
  }, []);

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

      try {
        await saveMealHistory({
          meal_label: `Menu ${new Date().toLocaleDateString('id-ID')}`,
          food_items: items,
          total_nutrition: response.total_nutrition,
          details: response.details,
          source: 'history-page'
        });

        const refreshed = await getMealHistory(50);
        setSavedHistory(refreshed.items);
      } catch {
        // Riwayat tetap bisa dihitung walau penyimpanan gagal.
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section">
      <div className="section-header">
        <div>
          <h3 className="section-title">Riwayat makan</h3>
          <p className="section-description">Lihat porsi hari ini, gabungkan semua hasil scan, lalu simpan riwayat makan yang lebih berguna.</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="toolbar" style={{ justifyContent: 'space-between' }}>
          <h4 className="card-title">Tracker hari ini</h4>
          <span className="chip">{todayScanHistory.length} scan</span>
        </div>
        {todayScanHistory.length > 0 ? (
          <div className="grid-3" style={{ marginTop: 16 }}>
            <div className="empty-state">
                <h4 className="card-title">Riwayat Tersimpan</h4>
              <div className="metric-value" style={{ marginTop: 8 }}>{formatNutrition('Energy', todayNutrition.Energy)}</div>
              <div className="muted" style={{ marginTop: 6 }}>Akumulasi seluruh scan hari ini.</div>
            </div>
            <div className="empty-state">
              <strong>Makro utama</strong>
              <div className="muted" style={{ marginTop: 8 }}>Protein: {formatNutrition('Protein', todayNutrition.Protein)}</div>
              <div className="muted" style={{ marginTop: 6 }}>Lemak: {formatNutrition('Fat', todayNutrition.Fat)}</div>
              <div className="muted" style={{ marginTop: 6 }}>Karbohidrat: {formatNutrition('CHO', todayNutrition.CHO)}</div>
            </div>
            <div className="empty-state">
              <strong>Jejak makan hari ini</strong>
              <div className="metric-value" style={{ marginTop: 8 }}>{todayHistory.reduce((sum, entry) => sum + entry.food_items.length, 0)}</div>
              <div className="muted" style={{ marginTop: 6 }}>Item scan yang sudah masuk tracker.</div>
            </div>
          </div>
        ) : (
          <div className="empty-state" style={{ marginTop: 16 }}>
            Belum ada hasil scan yang tersimpan hari ini.
          </div>
        )}
        {todayScanHistory.length > 0 ? (
          <div className="list" style={{ marginTop: 16 }}>
            {todayScanHistory.slice(0, 5).map((entry) => (
              <div className="list-item" key={entry.id}>
                <div>
                  <strong>{entry.meal_label ?? 'Hasil scan'}</strong>
                  <div className="muted">{new Date(entry.created_at).toLocaleTimeString('id-ID')}</div>
                </div>
                <span>{formatNutrition('Energy', entry.total_nutrition?.Energy ?? 0)}</span>
              </div>
            ))}
          </div>
        ) : null}
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
                  <span>{formatNutrition(key, value as number)}</span>
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

      {latestSavedEntry && latestNutrition ? (
        <div className="card" style={{ marginTop: 20 }}>
          <div className="toolbar" style={{ justifyContent: 'space-between' }}>
            <h4 className="card-title">Ringkasan terakhir tersimpan</h4>
            <span className="chip">{latestSavedEntry.source === 'scan' ? 'Hasil scan' : latestSavedEntry.source}</span>
          </div>
          <div className="grid-3" style={{ marginTop: 16 }}>
            <div className="empty-state">
              <strong>{latestSavedEntry.meal_label ?? 'Menu tersimpan'}</strong>
              <div className="muted" style={{ marginTop: 8 }}>
                {new Date(latestSavedEntry.created_at).toLocaleString('id-ID')}
              </div>
            </div>
            <div className="empty-state">
              <strong>Kalori total</strong>
              <div className="metric-value" style={{ marginTop: 8 }}>{formatNutrition('Energy', latestNutrition.energy)}</div>
            </div>
            <div className="empty-state">
              <strong>Item</strong>
              <div className="metric-value" style={{ marginTop: 8 }}>{latestSavedEntry.food_items.length}</div>
            </div>
          </div>
          <div className="grid-2" style={{ marginTop: 16 }}>
            <div className="list">
              <div className="list-item"><strong>Protein</strong><span>{formatNutrition('Protein', latestNutrition.protein)}</span></div>
              <div className="list-item"><strong>Lemak</strong><span>{formatNutrition('Fat', latestNutrition.fat)}</span></div>
              <div className="list-item"><strong>Karbohidrat</strong><span>{formatNutrition('CHO', latestNutrition.cho)}</span></div>
            </div>
            <div className="list">
              <div className="list-item"><strong>Kalsium</strong><span>{latestNutrition.calcium}</span></div>
              <div className="list-item"><strong>Zat Besi</strong><span>{latestNutrition.iron}</span></div>
              <div className="list-item"><strong>Detail scan</strong><span>{latestSavedEntry.details.length} entri</span></div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="card">
        <h4 className="card-title">Kenapa fitur ini berguna</h4>
        <p className="muted" style={{ lineHeight: 1.7 }}>
          Riwayat yang tersusun membantu Anda melihat total asupan harian, membandingkan pilihan makanan, dan membuat keputusan berikutnya lebih mudah.
        </p>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <div className="toolbar" style={{ justifyContent: 'space-between' }}>
          <h4 className="card-title">Riwayat tersimpan</h4>
          <span className="chip">{historyLoading ? 'Memuat...' : `${savedHistory.length} data`}</span>
        </div>
        {savedHistory.length > 0 ? (
          <div className="list" style={{ marginTop: 12 }}>
            {savedHistory.map((entry) => (
              <div className="list-item" key={entry.id}>
                <div>
                  <strong>{entry.meal_label ?? 'Menu tersimpan'}</strong>
                  <div className="muted">{new Date(entry.created_at).toLocaleString('id-ID')}</div>
                </div>
                <span>{entry.food_items.length} item</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state" style={{ marginTop: 12 }}>
            {historyLoading ? 'Memuat riwayat dari server...' : 'Belum ada riwayat yang tersimpan ke database.'}
          </div>
        )}
      </div>
    </section>
  );
}
