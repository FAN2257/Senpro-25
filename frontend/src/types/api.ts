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
