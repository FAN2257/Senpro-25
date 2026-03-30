"""
Pydantic Models for SnapEats Backend
"""

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List


class NutritionEntry(BaseModel):
    """Model for individual nutrition entry"""
    id: Optional[int] = None
    user_id: int
    food_name: str = Field(..., min_length=1, description="Nama makanan")
    calories: float = Field(..., ge=0, description="Kalori dalam kcal")
    protein: float = Field(..., ge=0, description="Protein dalam gram")
    carbs: float = Field(..., ge=0, description="Karbohidrat dalam gram")
    fat: float = Field(..., ge=0, description="Lemak dalam gram")
    fiber: Optional[float] = Field(0, ge=0, description="Serat dalam gram")
    portion_size: str = Field(..., description="Ukuran porsi (cth: 1 bowl, 100g)")
    meal_type: str = Field(..., regex="^(breakfast|lunch|dinner|snack)$", description="Jenis makanan")
    timestamp: Optional[datetime] = None
    image_url: Optional[str] = None
    notes: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "user_id": 1,
                "food_name": "Nasi Goreng",
                "calories": 450,
                "protein": 15,
                "carbs": 55,
                "fat": 18,
                "fiber": 3,
                "portion_size": "1 piring",
                "meal_type": "lunch",
                "notes": "Dengan telur dan sayuran"
            }
        }


class NutritionEntryCreate(BaseModel):
    """Model for creating nutrition entry"""
    food_name: str = Field(..., min_length=1)
    calories: float = Field(..., ge=0)
    protein: float = Field(..., ge=0)
    carbs: float = Field(..., ge=0)
    fat: float = Field(..., ge=0)
    fiber: Optional[float] = Field(0, ge=0)
    portion_size: str = Field(...)
    meal_type: str = Field(..., regex="^(breakfast|lunch|dinner|snack)$")
    notes: Optional[str] = None
    image_url: Optional[str] = None


class DailyNutritionSummary(BaseModel):
    """Model for daily nutrition summary"""
    date: str = Field(..., description="Tanggal dalam format YYYY-MM-DD")
    total_calories: float
    total_protein: float
    total_carbs: float
    total_fat: float
    total_fiber: float
    meal_count: int
    entries: List[NutritionEntry]

    class Config:
        json_schema_extra = {
            "example": {
                "date": "2026-03-30",
                "total_calories": 2000,
                "total_protein": 100,
                "total_carbs": 250,
                "total_fat": 60,
                "total_fiber": 30,
                "meal_count": 3,
                "entries": []
            }
        }


class Response(BaseModel):
    """Generic response model"""
    success: bool
    message: str
    data: Optional[dict] = None


class NutritionGoals(BaseModel):
    """Model for user nutrition goals"""
    id: Optional[int] = None
    user_id: int
    daily_calories: float = Field(..., gt=0)
    daily_protein: float = Field(..., gt=0)
    daily_carbs: float = Field(..., gt=0)
    daily_fat: float = Field(..., gt=0)
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        json_schema_extra = {
            "example": {
                "user_id": 1,
                "daily_calories": 2500,
                "daily_protein": 125,
                "daily_carbs": 312,
                "daily_fat": 83
            }
        }
