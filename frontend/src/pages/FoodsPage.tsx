import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getFoods } from '../lib/api';
import type { FoodsResponse } from '../types/api';

export function FoodsPage() {
  const [query, setQuery] = useState('');
  const { data, isLoading, error } = useQuery<FoodsResponse>({ queryKey: ['foods'], queryFn: getFoods });

  const foods = useMemo(() => {
    const list = data?.foods ?? [];
    return list.filter((food) => food.toLowerCase().includes(query.toLowerCase()));
  }, [data?.foods, query]);

  return (
    <section className="section">
      <div className="section-header">
        <div>
          <h3 className="section-title">Referensi makanan</h3>
          <p className="section-description">Halaman ini opsional jika Anda ingin menelusuri makanan yang sering muncul di hasil scan.</p>
        </div>
        <span className="chip"><BookOpen size={14} /> {data?.total_items ?? 0} item</span>
      </div>

      <div className="form-card">
        <div className="field">
          <label className="field-label" htmlFor="food-search">Cari makanan</label>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: 14, color: '#64748b' }} />
            <input
              id="food-search"
              className="input"
              style={{ paddingLeft: 40 }}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Contoh: Rendang, Bakso, Nasi Padang"
            />
          </div>
        </div>
      </div>

      {isLoading ? <div className="empty-state">Memuat daftar makanan...</div> : null}
      {error ? <div className="empty-state">Referensi makanan belum bisa dimuat.</div> : null}

      <div className="grid-3">
        {foods.map((food) => (
          <article className="card" key={food}>
            <span className="chip">Tersedia</span>
            <h4 className="card-title" style={{ marginTop: 12 }}>{food}</h4>
            <p className="muted" style={{ lineHeight: 1.7 }}>
              Buka detail untuk melihat quick analytic per 100 g, termasuk makro dan mikro yang paling relevan.
            </p>
            <Link className="btn btn-secondary" to={`/foods/${encodeURIComponent(food)}`}>
              Lihat detail
            </Link>
          </article>
        ))}
      </div>

      {!isLoading && foods.length === 0 ? <div className="empty-state">Tidak ada makanan yang cocok dengan pencarian.</div> : null}
    </section>
  );
}
