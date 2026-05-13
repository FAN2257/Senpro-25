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
          <h3 className="section-title">Detail makanan</h3>
          <p className="section-description">Halaman ini cocok untuk menjelaskan bagaimana database nutrisi lokal dihubungkan ke hasil AI.</p>
        </div>
        <button className="btn btn-ghost" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Kembali
        </button>
      </div>

      <div className="grid-2">
        <div className="form-card">
          <div className="field">
            <span className="field-label">Food name</span>
            <h4 className="card-title" style={{ fontSize: '2rem' }}>{decodedFoodName}</h4>
            <p className="field-help">
              Endpoint detail memungkinkan presentasi yang lebih meyakinkan karena menunjukkan struktur data yang rapi per item.
            </p>
          </div>

          <div className="toolbar" style={{ marginTop: 18 }}>
            <span className="status status-success">
              <Flame size={14} /> Nutrition-ready
            </span>
            <span className="status status-warning">
              <Filter size={14} /> 100 g reference
            </span>
          </div>

          <div className="footer-note">
            Gunakan halaman ini sebagai jembatan antara hasil deteksi dan insight nutrisi per makanan.
          </div>
        </div>

        <div className="result-card">
          {isLoading ? <div className="empty-state">Memuat detail makanan...</div> : null}
          {error ? <div className="empty-state">Gagal mengambil detail dari backend.</div> : null}
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
            <p className="footer-note">Data berasal dari endpoint /foods/{decodedFoodName} dan dapat digunakan untuk kalkulasi porsi.</p>
          ) : null}
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <Link className="btn btn-secondary" to="/scan">
          Gunakan hasil ini di scan flow
        </Link>
      </div>
    </section>
  );
}
