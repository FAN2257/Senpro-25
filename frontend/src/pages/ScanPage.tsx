import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { CameraOff, Clock3, ImagePlus, ScanSearch, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { getModelStatus, predictFood } from '../lib/api';
import type { DetectionItem } from '../types/api';
import { useScanStore } from '../store/scanStore';
import { MotionSection } from '../components/MotionSection';

const isMobileDevice = () => { return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent); };

export function ScanPage() {
  const [isMobile] = useState(isMobileDevice());
  const [modelReady, setModelReady] = useState(false);
  const [modelStatusText, setModelStatusText] = useState('Memeriksa kesiapan model...');
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
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

  useEffect(() => {
    let mounted = true;

    const refreshModelStatus = async () => {
      try {
        const status = await getModelStatus();
        if (!mounted) return;

        setModelReady(status.model_loaded);
        setModelStatusText(
          status.model_loaded
            ? 'Model siap dipakai'
            : status.load_error
              ? `Model belum siap: ${status.load_error}`
              : 'Model masih warming up'
        );
      } catch {
        if (!mounted) return;
        setModelReady(false);
        setModelStatusText('Tidak bisa memeriksa status backend');
      }
    };

    void refreshModelStatus();
    const intervalId = window.setInterval(refreshModelStatus, 5000);

    return () => {
      mounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] ?? null;
    event.target.value = '';

    if (!selectedFile) {
      return;
    }

    setFile(selectedFile);
    toast.success('Foto siap diproses.');
  };

  const openGalleryPicker = () => {
    galleryInputRef.current?.click();
  };

  const openCameraPicker = () => {
    cameraInputRef.current?.click();
  };

  const handleSubmit = async () => {
    if (!file) {
      const message = 'Pilih gambar makanan terlebih dahulu.';
      setError(message);
      toast.error(message);
      return;
    }

    if (!modelReady) {
      const message = 'Model masih memuat, tunggu sebentar lalu coba lagi.';
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
        toast.success(`${response.detections.length} makanan ditemukan.`);
      } else {
        toast('Belum ada makanan yang terlihat jelas, coba foto yang lebih terang.', { icon: 'i' });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal memproses gambar.';
      setError(message);
      toast.error('Gambar belum bisa diproses. Coba lagi dengan foto yang lebih jelas.');
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
          <span className="status status-success">Tingkat cocok {Math.round(item.confidence * 100)}%</span>
        </div>
        <div className="grid-2" style={{ marginTop: 16 }}>
          <div className="stack">
            <div className="field">
              <span className="field-label">Posisi deteksi</span>
              <p className="field-help">
                x: {item.bounding_box.x_min} to {item.bounding_box.x_max} | y: {item.bounding_box.y_min} to{' '}
                {item.bounding_box.y_max}
              </p>
            </div>
            <div className="field">
              <span className="field-label">Status gizi</span>
              <p className="field-help">
                {nutrition ? 'Ringkasan gizi tersedia.' : 'Ringkasan gizi belum tersedia untuk item ini.'}
              </p>
            </div>
          </div>
          {nutrition ? (
            <div className="list">
              {['Energy', 'Protein', 'Fat', 'CHO', 'Ca', 'Fe'].map((key) => (
                <div className="list-item" key={key}>
                  <strong>{key}</strong>
                  <span>{(nutrition as any)[key] ?? 0}</span>
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
          <p className="section-description">Unggah foto makanan, lalu lihat ringkasan hasilnya dengan cepat dan jelas.</p>
        </div>
        <span className="chip">
          <Sparkles size={14} /> {modelReady ? 'Siap dipakai' : 'Memuat model'}
        </span>
      </div>
      <div className="empty-state" style={{ marginBottom: 16 }}>
        {modelStatusText}
      </div>
      <div className="grid-2">
        <div className="form-card">
          <div className="field">
            <label className="field-label" htmlFor="food-image">Pilih gambar</label>
            {isMobile ? (
              <div className="mobile-upload-actions">
                <input
                  ref={galleryInputRef}
                  id="food-image-gallery"
                  className="sr-only"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <input
                  ref={cameraInputRef}
                  id="food-image-camera"
                  className="sr-only"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                />
                <button className="btn btn-secondary" type="button" onClick={openGalleryPicker}>
                  <ImagePlus size={16} /> Buka Galeri
                </button>
                <button className="btn btn-primary" type="button" onClick={openCameraPicker}>
                  <ImagePlus size={16} /> Buka Kamera
                </button>
              </div>
            ) : (
              <input id="food-image" className="input" type="file" accept="image/*" onChange={handleFileChange} />
            )}
            <p className="field-help">Di ponsel, pilih galeri atau kamera. Di desktop, Anda bisa pilih file foto.</p>
          </div>
          <div className="form-actions" style={{ marginTop: 18 }}>
            <button className="btn btn-primary" type="button" onClick={handleSubmit} disabled={loading || !modelReady}>
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
            <p className="metric-note">Jumlah makanan yang berhasil dikenali dari foto Anda.</p>
          </div>
          <div className="card">
            <div className="toolbar" style={{ justifyContent: 'space-between' }}>
              <h4 className="card-title">Riwayat terakhir</h4>
              <span className="chip"><Clock3 size={14} /> {history.length} tersimpan</span>
            </div>
            {history.length > 0 ? (
              <div className="list" style={{ marginTop: 12 }}>
                {history.slice(0, 3).map((item) => (
                  <div className="list-item" key={item.id}>
                    <strong>{item.filename}</strong>
                    <span>{item.detectionCount} hasil</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{ marginTop: 12 }}>Belum ada riwayat scan yang tersimpan.</div>
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

