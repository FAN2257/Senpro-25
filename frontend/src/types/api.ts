export interface NutritionInfo {
  Energy?: number;
  Protein?: number;
  Fat?: number;
  CHO?: number;
  Ca?: number;
  P?: number;
  Fe?: number;
  Water?: number;
  [key: string]: number | string | number[] | undefined;
}

export interface DetectionItem {
  food_name: string;
  confidence: number;
  bounding_box: {
    x_min: number;
    y_min: number;
    x_max: number;
    y_max: number;
  };
  nutrition_info: NutritionInfo | string;
}

export interface NutritionPredictionResponse {
  status: string;
  detections: DetectionItem[];
}

export interface ModelStatusResponse {
  status: string;
  model_path: string;
  model_path_exists: boolean;
  model_loaded: boolean;
  load_error: string | null;
}

export interface FoodsResponse {
  status: string;
  total_items: number;
  foods: string[];
}

export interface FoodDetailResponse {
  status: string;
  food_name: string;
  nutrition_info: NutritionInfo;
}

export interface MealItem {
  food_name: string;
  quantity_gram: number;
}

export interface MealRequest {
  foods: MealItem[];
}

export interface MealCalculationResponse {
  status: string;
  total_nutrition: Record<string, number>;
  details: unknown[];
}

export interface MealHistoryEntry {
  id: string;
  meal_label: string | null;
  user_email: string | null;
  food_items: MealItem[];
  total_nutrition: Record<string, number>;
  details: unknown[];
  source: string;
  created_at: string;
}

export interface MealHistoryResponse {
  status: string;
  total_items: number;
  items: MealHistoryEntry[];
}

export interface SaveMealHistoryPayload {
  meal_label?: string | null;
  user_email?: string | null;
  food_items: MealItem[];
  total_nutrition: Record<string, number>;
  details?: unknown[];
  source?: string;
}

export interface SaveMealHistoryResponse {
  status: string;
  message: string;
  record: {
    id: string;
    created_at: string;
  };
}
