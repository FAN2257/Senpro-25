import { FoodDetailResponse, FoodsResponse, MealRequest, NutritionPredictionResponse } from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

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
  return apiFetch('/calculate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
}

export function getApiBaseUrl() {
  return API_BASE_URL;
}
