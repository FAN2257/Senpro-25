import { ChangeEvent, useMemo } from 'react';
import { CameraOff, Clock3, ImagePlus, ScanSearch, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { predictFood } from '../lib/api';
import type { DetectionItem } from '../types/api';
import { useScanStore } from '../store/scanStore';
import { MotionSection } from '../components/MotionSection';

export function ScanPage() {
  const {
    file,
    previewUrl,
    result,
    loading,
    error,
    history,
    setFile,
    setResult,
    setError,
    setLoading,
    pushHistory,
    reset
  } = useScanStore();

  const totalDetections = useMemo(() => result?.detections.length ?? 0, [result]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] ?? null;
    setFile(selectedFile);

    if (selectedFile) {
      toast.success('Foto siap dianalisis.');
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      const message = 'Pilih gambar makanan terlebih dahulu.';
      setError(message);
      toast.error(message);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await predictFood(file);
      setResult(response);
      pushHistory(file.name, response);
      if (response.detections.length > 0) {
        toast.success(`${response.detections.length} item terdeteksi.`);
      } else {
        toast('Tidak ada item yang terdeteksi, coba foto yang lebih jelas.', { icon: 'i' });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal memproses gambar.';
      setError(message);
      toast.error('Analisis gagal. Periksa koneksi atau format gambar.');
    } finally {
      setLoading(false);
    }
  };

  const renderDetection = (item: DetectionItem) => {
    const nutrition = typeof item.nutrition_info === 'string' ? null : item.nutrition_info;

    return (
      <article className="result-card" key={`${item.food_name}-${item.confidence}`}>
        <div className="toolbar" style={{ justifyContent: 'space-between' }}>
          <span className="chip">{item.food_name}</span>
          <span className="status status-success">{Math.round(item.confidence * 100)}% confidence</span>
        </div>

        <div className="grid-2" style={{ marginTop: 16 }}>
          <div className="stack">
            <div className="field">
              <span className="field-label">Bounding box</span>
              <p className="field-help">
                x: {item.bounding_box.x_min} to {item.bounding_box.x_max} | y: {item.bounding_box.y_min} to{' '}
                {item.bounding_box.y_max}
              </p>
            </div>
            <div className="field">
              <span className="field-label">Nutrition status</span>
              <p className="field-help">
                {nutrition ? 'Data gizi ditemukan dan siap ditampilkan.' : 'Data gizi belum tersedia untuk kelas ini.'}
              </p>
            </div>
          </div>

          {nutrition ? (
            <div className="list">
              {['Energy', 'Protein', 'Fat', 'CHO', 'Ca', 'Fe'].map((key) => (
                <div className="list-item" key={key}>
                  <strong>{key}</strong>
                  <span>{nutrition[key] ?? 0}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              Data nutrisi belum dimuat untuk item ini.
            </div>
          )}
        </div>
      </article>
    );
  };

  return (
    <MotionSection className="section">
      <div className="section-header">
        <div>
          <h3 className="section-title">Scan makanan</h3>
          <p className="section-description">Upload foto makanan, panggil endpoint /predict, lalu tampilkan hasilnya dengan struktur yang mudah dibaca.</p>
        </div>
        <span className="chip">
          <Sparkles size={14} /> API-compatible
        </span>
      </div>

      <div className="grid-2">
        <div className="form-card">
          <div className="field">
            <label className="field-label" htmlFor="food-image">Pilih gambar</label>
            <input id="food-image" className="input" type="file" accept="image/*" onChange={handleFileChange} />
            <p className="field-help">Gunakan foto yang cukup terang agar deteksi lebih stabil.</p>
          </div>

          <div className="form-actions" style={{ marginTop: 18 }}>
            <button className="btn btn-primary" type="button" onClick={handleSubmit} disabled={loading}>
              <ScanSearch size={16} /> {loading ? 'Memproses...' : 'Analisis Gambar'}
            </button>
            <button className="btn btn-secondary" type="button" onClick={reset}>
              <CameraOff size={16} /> Reset
            </button>
          </div>

          {error ? <p className="status status-danger" style={{ marginTop: 18 }}>{error}</p> : null}

          <div className="preview-card" style={{ marginTop: 20 }}>
            {previewUrl ? (
              <img src={previewUrl} alt="Preview makanan" style={{ borderRadius: 20, width: '100%', objectFit: 'cover' }} />
            ) : (
              <div className="empty-state">
                <div className="stack">
                  <ImagePlus size={28} />
                  <span>Preview gambar akan muncul di sini</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="stack">
          <div className="metric">
            <p className="metric-label">Detections</p>
            <h4 className="metric-value">{totalDetections}</h4>
            <p className="metric-note">Hasil ini datang langsung dari response backend FastAPI.</p>
          </div>

          <div className="card">
            <div className="toolbar" style={{ justifyContent: 'space-between' }}>
              <h4 className="card-title">Recent scans</h4>
              <span className="chip"><Clock3 size={14} /> {history.length} tersimpan</span>
            </div>
            {history.length > 0 ? (
              <div className="list" style={{ marginTop: 12 }}>
                {history.slice(0, 3).map((item) => (
                  <div className="list-item" key={item.id}>
                    <strong>{item.filename}</strong>
                    <span>{item.detectionCount} deteksi</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{ marginTop: 12 }}>Belum ada riwayat scan.</div>
            )}
          </div>

          {result?.detections?.length ? result.detections.map(renderDetection) : (
            <div className="empty-state">
              Hasil scan akan tampil di sini setelah gambar diproses.
            </div>
          )}
        </div>
      </div>
    </MotionSection>
  );
}
