import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Flame, Filter } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getFoodDetail } from '../lib/api';

export function FoodDetailPage() {
  const { foodName = '' } = useParams();
  const navigate = useNavigate();
  const decodedFoodName = useMemo(() => decodeURIComponent(foodName), [foodName]);
  const { data, isLoading, error } = useQuery({
    queryKey: ['food-detail', decodedFoodName],
    queryFn: () => getFoodDetail(decodedFoodName),
    enabled: Boolean(decodedFoodName)
  });

  return (
    <section className="section">
      <div className="section-header">
        <div>
          <h3 className="section-title">Ringkasan makanan</h3>
          <p className="section-description">Lihat informasi utama dari makanan yang Anda pilih dalam satu tampilan.</p>
        </div>
        <button className="btn btn-ghost" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Kembali
        </button>
      </div>

      <div className="grid-2">
        <div className="form-card">
          <div className="field">
            <span className="field-label">Nama makanan</span>
            <h4 className="card-title" style={{ fontSize: '2rem' }}>{decodedFoodName}</h4>
            <p className="field-help">
              Informasi ini membantu Anda melihat isi makanan dengan lebih jelas.
            </p>
          </div>

          <div className="toolbar" style={{ marginTop: 18 }}>
            <span className="status status-success">
              <Flame size={14} /> Ringkasan tersedia
            </span>
            <span className="status status-warning">
              <Filter size={14} /> Referensi 100 g
            </span>
          </div>

          <div className="footer-note">
            Gunakan halaman ini untuk membandingkan makanan satu dengan yang lain.
          </div>
        </div>

        <div className="result-card">
          {isLoading ? <div className="empty-state">Memuat ringkasan makanan...</div> : null}
          {error ? <div className="empty-state">Ringkasan makanan belum bisa dimuat.</div> : null}
          {data?.nutrition_info ? (
            <div className="list">
              {Object.entries(data.nutrition_info)
                .filter(([key, value]) => typeof value === 'number' && ['Energy', 'Protein', 'Fat', 'CHO', 'Ca', 'P', 'Fe', 'Water'].includes(key))
                .map(([key, value]) => (
                  <div className="list-item" key={key}>
                    <strong>{key}</strong>
                    <span>{String(value)}</span>
                  </div>
                ))}
            </div>
          ) : null}
          {data?.nutrition_info ? (
            <p className="footer-note">Data ini ditampilkan per 100 gram dan bisa dipakai untuk memperkirakan porsi.</p>
          ) : null}
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <Link className="btn btn-secondary" to="/scan">
          Pakai hasil ini saat scan
        </Link>
      </div>
    </section>
  );
}
