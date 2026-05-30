import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { NutritionPredictionResponse } from '../types/api';

interface ScanHistoryItem {
  id: string;
  filename: string;
  createdAt: string;
  detectionCount: number;
  result: NutritionPredictionResponse;
}

interface ScanStoreState {
  file: File | null;
  previewUrl: string;
  loading: boolean;
  error: string;
  result: NutritionPredictionResponse | null;
  history: ScanHistoryItem[];
  setFile: (file: File | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string) => void;
  setResult: (result: NutritionPredictionResponse | null) => void;
  pushHistory: (filename: string, result: NutritionPredictionResponse) => void;
  removeHistoryItem: (id: string) => void;
  reset: () => void;
}

export const useScanStore = create<ScanStoreState>()(
  persist(
    (set, get) => ({
      file: null,
      previewUrl: '',
      loading: false,
      error: '',
      result: null,
      history: [],
      setFile: (file) => {
        const previousUrl = get().previewUrl;
        if (previousUrl) {
          URL.revokeObjectURL(previousUrl);
        }

        set({
          file,
          previewUrl: file ? URL.createObjectURL(file) : '',
          result: null,
          error: ''
        });
      },
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      setResult: (result) => set({ result }),
      pushHistory: (filename, result) => {
        set((state) => ({
          history: [
            {
              id: crypto.randomUUID(),
              filename,
              createdAt: new Date().toISOString(),
              detectionCount: result.detections.length,
              result
            },
            ...state.history
          ].slice(0, 10)
        }));
      },
      removeHistoryItem: (id) => {
        set((state) => ({
          history: state.history.filter((item) => item.id !== id)
        }));
      },
      reset: () => {
        const previousUrl = get().previewUrl;
        if (previousUrl) {
          URL.revokeObjectURL(previousUrl);
        }

        set({
          file: null,
          previewUrl: '',
          loading: false,
          error: '',
          result: null
        });
      }
    }),
    {
      name: 'snapeats-scan-store',
      partialize: (state) => ({ history: state.history })
    }
  )
);
