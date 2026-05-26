import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { CameraOff, Clock3, ImagePlus, ScanSearch, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { getCurrentUserEmail, getModelStatus, predictFood, saveMealHistory } from '../lib/api';
import type { DetectionItem } from '../types/api';
import { formatNutrition } from '../lib/nutrition';
import { useScanStore } from '../store/scanStore';
import { MotionSection } from '../components/MotionSection';

const isMobileDevice = () => { return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent); };

const NUTRITION_KEYS = ['Energy', 'Protein', 'Fat', 'CHO', 'Ca', 'P', 'Fe', 'Water'] as const;

const DEFAULT_PORTION_GRAM = 100;

const MACRO_KEYS = ['Energy', 'Protein', 'Fat', 'CHO'] as const;
const MICRO_KEYS = ['Ca', 'P', 'Fe', 'Water'] as const;

function scaleNutrition(
  nutrition: Record<(typeof NUTRITION_KEYS)[number], number>,
  portionGram: number,
) {
  const ratio = portionGram / DEFAULT_PORTION_GRAM;

  return NUTRITION_KEYS.reduce(
    (accumulator, key) => ({
      ...accumulator,
      [key]: Number((nutrition[key] * ratio).toFixed(2))
    }),
    {} as Record<(typeof NUTRITION_KEYS)[number], number>
  );
}

function buildScanSummary(detections: DetectionItem[]) {
  const totalNutrition = NUTRITION_KEYS.reduce((accumulator, key) => ({ ...accumulator, [key]: 0 }), {} as Record<(typeof NUTRITION_KEYS)[number], number>);

  const foodItems = detections.map((item) => ({
    food_name: item.food_name,
    quantity_gram: 100
  }));

  for (const detection of detections) {
    const nutrition = typeof detection.nutrition_info === 'string' ? null : detection.nutrition_info;

    if (!nutrition) {
      continue;
    }

    for (const key of NUTRITION_KEYS) {
      totalNutrition[key] += Number(nutrition[key] ?? 0);
    }
  }

  return {
    foodItems,
    totalNutrition,
    dominantFood: detections[0] ?? null,
    topConfidenceFood: detections.reduce<DetectionItem | null>((best, current) => {
      if (!best || current.confidence > best.confidence) {
        return current;
      }

      return best;
    }, null)
  };
}

export function ScanPage() {
  const [isMobile] = useState(isMobileDevice());
  const [modelReady, setModelReady] = useState(false);
  const [modelStatusText, setModelStatusText] = useState('Memeriksa kesiapan model...');
  const [scanInsights, setScanInsights] = useState<ReturnType<typeof buildScanSummary> | null>(null);
  const [otherCandidates, setOtherCandidates] = useState<DetectionItem[]>([]);
  const [selectedOtherKeys, setSelectedOtherKeys] = useState<Record<string, boolean>>({});
  const [portionGram, setPortionGram] = useState(DEFAULT_PORTION_GRAM);
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

  const displayNutrition = useMemo(() => {
    if (!scanInsights) {
      return null;
    }

    const base = scaleNutrition(scanInsights.totalNutrition, portionGram);

    const extras = { ...base } as Record<(typeof NUTRITION_KEYS)[number], number>;
    for (const cand of otherCandidates) {
      const key = `${cand.food_name}-${cand.confidence}`;
      if (!selectedOtherKeys[key]) continue;
      const nutrition = typeof cand.nutrition_info === 'string' ? null : cand.nutrition_info;
      if (!nutrition) continue;
      const scaled = scaleNutrition(nutrition as Record<(typeof NUTRITION_KEYS)[number], number>, portionGram);
      for (const k of NUTRITION_KEYS) {
        extras[k] = Number((extras[k] + (scaled[k] ?? 0)).toFixed(2));
      }
    }

    return extras;
  }, [scanInsights, portionGram, otherCandidates, selectedOtherKeys]);

  const dominantFoodDisplay = useMemo(() => {
    if (!scanInsights?.dominantFood || typeof scanInsights.dominantFood.nutrition_info === 'string') {
      return null;
    }

    return scaleNutrition(scanInsights.dominantFood.nutrition_info as Record<(typeof NUTRITION_KEYS)[number], number>, portionGram);
  }, [scanInsights, portionGram]);

  useEffect(() => {
    if (!result?.detections.length) {
      setScanInsights(null);
      setOtherCandidates([]);
      return;
    }

    setScanInsights(buildScanSummary(result.detections));
    setOtherCandidates(result.other_candidates ?? []);
  }, [result]);

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

      try {
        const userEmail = await getCurrentUserEmail();
        const summary = buildScanSummary(response.detections);
        const scaledTotalNutrition = scaleNutrition(summary.totalNutrition, portionGram);

        await saveMealHistory({
          meal_label: `Scan ${new Date().toLocaleString('id-ID')}`,
          user_email: userEmail,
          food_items: summary.foodItems,
          total_nutrition: scaledTotalNutrition,
          details: response.detections,
          source: 'scan'
        });
      } catch {
        // Scan tetap tampil walau penyimpanan riwayat server gagal.
      }

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
    const displayedNutrition = nutrition ? scaleNutrition(nutrition as Record<(typeof NUTRITION_KEYS)[number], number>, portionGram) : null;
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
                {nutrition ? 'Quick analytic tersedia untuk item ini.' : 'Ringkasan gizi belum tersedia untuk item ini.'}
              </p>
            </div>
          </div>
          {nutrition ? (
            <div className="list">
              {MACRO_KEYS.map((key) => (
                <div className="list-item" key={key}>
                  <strong>{key === 'Energy' ? 'Kalori' : key === 'CHO' ? 'Karbohidrat' : key === 'Protein' ? 'Protein' : 'Lemak'}</strong>
                  <span>{formatNutrition(key, displayedNutrition ? displayedNutrition[key as keyof typeof displayedNutrition] : 0)}</span>
                </div>
              ))}
              {MICRO_KEYS.map((key) => (
                <div className="list-item" key={key}>
                  <strong>{key === 'Ca' ? 'Kalsium' : key === 'P' ? 'Fosfor' : key === 'Fe' ? 'Zat Besi' : 'Air'}</strong>
                  <span>{formatNutrition(key, displayedNutrition ? displayedNutrition[key as keyof typeof displayedNutrition] : 0)}</span>
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

  const toggleOtherSelection = (item: DetectionItem) => {
    const key = `${item.food_name}-${item.confidence}`;
    setSelectedOtherKeys((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const saveWithSelectedOthers = async () => {
    if (!scanInsights) return;

    const selected = otherCandidates.filter((c) => selectedOtherKeys[`${c.food_name}-${c.confidence}`]);
    const combinedFoodItems = [
      ...scanInsights.foodItems,
      ...selected.map((s) => ({ food_name: s.food_name, quantity_gram: 100 }))
    ];

    const totalNutrition = displayNutrition ?? scaleNutrition(scanInsights.totalNutrition, portionGram);

    try {
      const userEmail = await getCurrentUserEmail();
      await saveMealHistory({
        meal_label: `Scan ${new Date().toLocaleString('id-ID')}`,
        user_email: userEmail,
        food_items: combinedFoodItems,
        total_nutrition: totalNutrition,
        details: result?.detections ?? [],
        source: 'scan'
      });
      toast.success('Hasil tersimpan dengan kandidat tambahan.');
    } catch {
      toast.error('Penyimpanan riwayat gagal.');
    }
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
          {scanInsights ? (
            <div className="card">
              <div className="toolbar" style={{ justifyContent: 'space-between' }}>
                <div>
                  <h4 className="card-title">Quick analytic nutrisi</h4>
                  <p className="muted" style={{ marginTop: 4 }}>Ringkasan makro dan mikro untuk porsi yang Anda pilih.</p>
                </div>
                <span className="chip">Basis {portionGram} g</span>
              </div>
              <div className="field" style={{ marginTop: 12 }}>
                <label className="field-label" htmlFor="portion-gram">Basis porsi tampilan</label>
                <input
                  id="portion-gram"
                  className="input"
                  type="number"
                  min={1}
                  value={portionGram}
                  onChange={(event) => setPortionGram(Math.max(1, Number(event.target.value) || DEFAULT_PORTION_GRAM))}
                />
                <p className="field-help">Nilai di bawah akan disesuaikan dari basis 100 g ke porsi yang Anda pilih.</p>
              </div>
              <div className="grid-2" style={{ marginTop: 12 }}>
                <div className="card" style={{ background: 'rgba(15, 118, 110, 0.05)', border: '1px solid rgba(15, 118, 110, 0.15)' }}>
                  <div className="grid-2" style={{ gap: 12 }}>
                    <div className="empty-state" style={{ marginBottom: 0 }}>
                      <strong>Kalori total</strong>
                      <div className="metric-value" style={{ marginTop: 8 }}>{formatNutrition('Energy', displayNutrition?.Energy ?? 0)}</div>
                      <div className="muted" style={{ marginTop: 6 }}>Berdasarkan porsi {portionGram} g.</div>
                    </div>
                    <div className="empty-state" style={{ marginBottom: 0 }}>
                      <strong>Makro utama</strong>
                      <div className="muted" style={{ marginTop: 8 }}>Protein: {formatNutrition('Protein', displayNutrition?.Protein ?? 0)}</div>
                      <div className="muted" style={{ marginTop: 6 }}>Lemak: {formatNutrition('Fat', displayNutrition?.Fat ?? 0)}</div>
                      <div className="muted" style={{ marginTop: 6 }}>Karbohidrat: {formatNutrition('CHO', displayNutrition?.CHO ?? 0)}</div>
                    </div>
                  </div>
                </div>
                <div className="stack">
                  <div className="empty-state" style={{ marginBottom: 0 }}>
                    <strong>Contoh quick analytic</strong>
                    <div className="muted" style={{ marginTop: 8 }}>
                      {scanInsights.dominantFood && dominantFoodDisplay ? (
                        `Dalam ${portionGram} g ${scanInsights.dominantFood.food_name}, terdapat ${formatNutrition('Energy', dominantFoodDisplay.Energy)}, ${formatNutrition('Protein', dominantFoodDisplay.Protein)}, ${formatNutrition('Fat', dominantFoodDisplay.Fat)} dan ${formatNutrition('CHO', dominantFoodDisplay.CHO)}.`
                      ) : 'Contoh per-porsi akan muncul setelah item dengan nutrisi berhasil terdeteksi.'}
                    </div>
                  </div>
                  <div className="empty-state" style={{ marginBottom: 0 }}>
                    <strong>Food summary</strong>
                    <div className="muted" style={{ marginTop: 8 }}>
                      {scanInsights.topConfidenceFood ? `Item paling yakin: ${scanInsights.topConfidenceFood.food_name}` : 'Belum ada item terdeteksi.'}
                    </div>
                    <div className="muted" style={{ marginTop: 8 }}>
                      {scanInsights.dominantFood ? `Item pertama: ${scanInsights.dominantFood.food_name}` : 'Tidak ada data analitik.'}
                    </div>
                  </div>
                </div>
              </div>
              <p className="footer-note" style={{ marginTop: 8 }}>
                Quick analytic ini menampilkan makro dan mikro pada basis {portionGram} g, sementara detail item tetap mengacu ke referensi 100 g.
              </p>
            </div>
          ) : null}

          {otherCandidates && otherCandidates.length > 0 ? (
            <div className="card" style={{ marginTop: 12 }}>
              <div className="toolbar" style={{ justifyContent: 'space-between' }}>
                <h4 className="card-title">Other possible detections</h4>
                <span className="chip">{otherCandidates.length} kandidat</span>
              </div>
              <div className="list" style={{ marginTop: 12 }}>
                {otherCandidates.map((cand) => {
                  const key = `${cand.food_name}-${cand.confidence}`;
                  return (
                    <div className="list-item" key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong>{cand.food_name}</strong>
                        <div className="muted" style={{ fontSize: 12 }}>{Math.round(cand.confidence * 100)}% confidence</div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <input type="checkbox" checked={!!selectedOtherKeys[key]} onChange={() => toggleOtherSelection(cand)} />
                          <span style={{ fontSize: 12 }}>Include</span>
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="form-actions" style={{ marginTop: 12 }}>
                <button className="btn btn-primary" type="button" onClick={saveWithSelectedOthers}>Include selected & Save</button>
              </div>
            </div>
          ) : null}
          {result?.detections?.length ? result.detections.map(renderDetection) : (
            <div className="empty-state">
              Hasil scan akan tampil di sini setelah gambar diproses.
            </div>
          )}
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
        </div>
      </div>
    </MotionSection>
  );
}

