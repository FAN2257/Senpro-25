import {
  FoodDetailResponse,
  FoodsResponse,
  MealCalculationResponse,
  MealHistoryResponse,
  MealRequest,
  ModelStatusResponse,
  NutritionPredictionResponse,
  SaveMealHistoryPayload,
  SaveMealHistoryResponse
} from '../types/api';
import { supabase } from './supabase';

const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

const API_BASE_URL = import.meta.env.PROD
  ? '/api'
  : configuredApiBaseUrl || 'http://localhost:8000/api';

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...(init?.headers ?? {})
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function predictFood(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/predict`, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Prediction request failed');
  }

  return response.json() as Promise<NutritionPredictionResponse>;
}

export function getFoods() {
  return apiFetch<FoodsResponse>('/foods');
}

export function getFoodDetail(foodName: string) {
  return apiFetch<FoodDetailResponse>(`/foods/${encodeURIComponent(foodName)}`);
}

export function calculateMeal(payload: MealRequest) {
  return apiFetch<MealCalculationResponse>('/calculate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
}

export function getMealHistory(limit = 10) {
  return apiFetch<MealHistoryResponse>(`/history/meals?limit=${limit}`);
}

export function saveMealHistory(payload: SaveMealHistoryPayload) {
  return apiFetch<SaveMealHistoryResponse>('/history/meals', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
}

export function getModelStatus() {
  return apiFetch<ModelStatusResponse>('/model-status');
}

export function getDatabaseStatus() {
  return apiFetch<{ status: string; db_ready: boolean; connection_configured: boolean; meal_history_table_ready: boolean }>('/db-status');
}

export function getApiBaseUrl() {
  return API_BASE_URL;
}

export async function getCurrentUserEmail() {
  const profile = await getCurrentUserProfile();
  return profile?.email ?? null;
}

export async function getCurrentUserProfile() {
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return null;
  }

  const email = data.user.email ?? null;
  const rawName = String(
    data.user.user_metadata?.full_name ??
      data.user.user_metadata?.name ??
      data.user.user_metadata?.display_name ??
      ''
  ).trim();

  return {
    email,
    fullName: rawName || null,
    displayName: rawName || (email ? email.split('@')[0] : 'Pengguna')
  };
}
