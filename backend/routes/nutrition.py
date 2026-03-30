"""
Nutrition Tracking Routes for SnapEats Backend
Endpoints untuk pencatatan gizi harian
"""

from fastapi import APIRouter, HTTPException, Query, Path, Depends
from datetime import datetime, timedelta
from typing import List, Optional
import logging

from backend.models import (
    NutritionEntry,
    NutritionEntryCreate,
    DailyNutritionSummary,
    Response,
    NutritionGoals
)

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/nutrition",
    tags=["nutrition"],
    responses={404: {"description": "Not found"}}
)

# In-memory storage (untuk development - akan diganti dengan database)
nutrition_database: dict = {}
user_goals: dict = {}
entry_id_counter = 1


@router.post("/entries", response_model=NutritionEntry, status_code=201)
async def create_nutrition_entry(
    user_id: int,
    entry: NutritionEntryCreate
):
    """
    Membuat entri pencatatan gizi baru
    
    Parameter:
    - user_id: ID pengguna
    - entry: Data gizi (nama makanan, kalori, protein, karb, lemak, tipe makanan)
    
    Returns: Entri gizi yang baru dibuat
    """
    global entry_id_counter
    
    try:
        # Validasi user_id
        if user_id <= 0:
            raise HTTPException(status_code=400, detail="User ID harus lebih dari 0")
        
        # Buat entri baru
        new_entry = NutritionEntry(
            id=entry_id_counter,
            user_id=user_id,
            food_name=entry.food_name,
            calories=entry.calories,
            protein=entry.protein,
            carbs=entry.carbs,
            fat=entry.fat,
            fiber=entry.fiber,
            portion_size=entry.portion_size,
            meal_type=entry.meal_type,
            timestamp=datetime.now(),
            image_url=entry.image_url,
            notes=entry.notes
        )
        
        # Simpan ke database
        if user_id not in nutrition_database:
            nutrition_database[user_id] = []
        
        nutrition_database[user_id].append(new_entry)
        entry_id_counter += 1
        
        logger.info(f"Entri gizi baru dibuat untuk user {user_id}: {new_entry.food_name}")
        return new_entry
        
    except Exception as e:
        logger.error(f"Error membuat entri gizi: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.get("/entries/{user_id}", response_model=List[NutritionEntry])
async def get_user_entries(
    user_id: int = Path(..., gt=0, description="ID pengguna"),
    limit: int = Query(100, ge=1, le=1000, description="Jumlah maksimal hasil"),
    offset: int = Query(0, ge=0, description="Offset hasil")
):
    """
    Mendapatkan semua entri gizi untuk pengguna tertentu
    
    Parameter:
    - user_id: ID pengguna
    - limit: Jumlah maksimal hasil (default: 100)
    - offset: Offset untuk pagination (default: 0)
    
    Returns: Daftar entri gizi pengguna
    """
    try:
        if user_id not in nutrition_database:
            return []
        
        entries = nutrition_database[user_id]
        # Urutkan berdasarkan timestamp (terbaru dulu)
        entries = sorted(entries, key=lambda x: x.timestamp, reverse=True)
        
        # Apply pagination
        paginated = entries[offset:offset + limit]
        
        logger.info(f"Mengambil {len(paginated)} entri untuk user {user_id}")
        return paginated
        
    except Exception as e:
        logger.error(f"Error mengambil entri gizi: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.get("/daily-summary/{user_id}", response_model=DailyNutritionSummary)
async def get_daily_nutrition_summary(
    user_id: int = Path(..., gt=0, description="ID pengguna"),
    date: Optional[str] = Query(None, regex="^\\d{4}-\\d{2}-\\d{2}$", description="Tanggal dalam format YYYY-MM-DD (default: hari ini)")
):
    """
    Mendapatkan ringkasan gizi harian untuk pengguna
    
    Parameter:
    - user_id: ID pengguna
    - date: Tanggal (format YYYY-MM-DD), default adalah hari ini
    
    Returns: Ringkasan gizi harian dengan total nutrisi
    """
    try:
        # Jika date tidak diberikan, gunakan hari ini
        if date is None:
            date = datetime.now().strftime("%Y-%m-%d")
        
        # Parse tanggal
        target_date = datetime.strptime(date, "%Y-%m-%d").date()
        
        # Ambil entri untuk user ini
        entries = nutrition_database.get(user_id, [])
        
        # Filter entries untuk tanggal yang sesuai
        daily_entries = []
        for entry in entries:
            if entry.timestamp and entry.timestamp.date() == target_date:
                daily_entries.append(entry)
        
        # Hitung total nutrisi
        total_calories = sum(e.calories for e in daily_entries)
        total_protein = sum(e.protein for e in daily_entries)
        total_carbs = sum(e.carbs for e in daily_entries)
        total_fat = sum(e.fat for e in daily_entries)
        total_fiber = sum(e.fiber or 0 for e in daily_entries)
        
        summary = DailyNutritionSummary(
            date=date,
            total_calories=total_calories,
            total_protein=total_protein,
            total_carbs=total_carbs,
            total_fat=total_fat,
            total_fiber=total_fiber,
            meal_count=len(daily_entries),
            entries=daily_entries
        )
        
        logger.info(f"Ringkasan gizi untuk user {user_id} pada {date}: {total_calories} kcal")
        return summary
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Format tanggal tidak valid. Gunakan YYYY-MM-DD")
    except Exception as e:
        logger.error(f"Error mendapatkan ringkasan gizi: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.get("/weekly-summary/{user_id}")
async def get_weekly_nutrition_summary(
    user_id: int = Path(..., gt=0, description="ID pengguna"),
    end_date: Optional[str] = Query(None, regex="^\\d{4}-\\d{2}-\\d{2}$", description="Tanggal akhir (default: hari ini)")
):
    """
    Mendapatkan ringkasan gizi mingguan untuk pengguna
    
    Parameter:
    - user_id: ID pengguna
    - end_date: Tanggal akhir (format YYYY-MM-DD), default adalah hari ini
    
    Returns: Ringkasan gizi untuk 7 hari terakhir
    """
    try:
        if end_date is None:
            end_date = datetime.now().strftime("%Y-%m-%d")
        
        target_end = datetime.strptime(end_date, "%Y-%m-%d").date()
        target_start = target_end - timedelta(days=6)
        
        entries = nutrition_database.get(user_id, [])
        
        # Kelompokkan per hari
        daily_summaries = {}
        for i in range(7):
            current_date = target_start + timedelta(days=i)
            date_str = current_date.strftime("%Y-%m-%d")
            daily_summaries[date_str] = {
                "date": date_str,
                "total_calories": 0,
                "total_protein": 0,
                "total_carbs": 0,
                "total_fat": 0,
                "total_fiber": 0,
                "meal_count": 0
            }
        
        # Isi data
        for entry in entries:
            if entry.timestamp:
                entry_date = entry.timestamp.date()
                if target_start <= entry_date <= target_end:
                    date_str = entry_date.strftime("%Y-%m-%d")
                    daily_summaries[date_str]["total_calories"] += entry.calories
                    daily_summaries[date_str]["total_protein"] += entry.protein
                    daily_summaries[date_str]["total_carbs"] += entry.carbs
                    daily_summaries[date_str]["total_fat"] += entry.fat
                    daily_summaries[date_str]["total_fiber"] += entry.fiber or 0
                    daily_summaries[date_str]["meal_count"] += 1
        
        logger.info(f"Ringkasan mingguan untuk user {user_id}: {target_start} - {target_end}")
        return {
            "start_date": target_start.strftime("%Y-%m-%d"),
            "end_date": target_end.strftime("%Y-%m-%d"),
            "days": list(daily_summaries.values()),
            "avg_daily_calories": sum(d["total_calories"] for d in daily_summaries.values()) / 7
        }
        
    except ValueError:
        raise HTTPException(status_code=400, detail="Format tanggal tidak valid. Gunakan YYYY-MM-DD")
    except Exception as e:
        logger.error(f"Error mendapatkan ringkasan mingguan: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.delete("/entries/{entry_id}")
async def delete_nutrition_entry(
    entry_id: int = Path(..., gt=0, description="ID entri gizi")
):
    """
    Menghapus entri gizi berdasarkan ID
    
    Parameter:
    - entry_id: ID entri gizi yang akan dihapus
    
    Returns: Pesan kesuksesan
    """
    try:
        found = False
        for user_id, entries in nutrition_database.items():
            for i, entry in enumerate(entries):
                if entry.id == entry_id:
                    deleted_entry = entries.pop(i)
                    logger.info(f"Entri gizi {entry_id} dihapus")
                    found = True
                    return Response(
                        success=True,
                        message=f"Entri gizi '{deleted_entry.food_name}' berhasil dihapus",
                        data={"deleted_id": entry_id}
                    )
        
        if not found:
            raise HTTPException(status_code=404, detail="Entri gizi tidak ditemukan")
            
    except Exception as e:
        logger.error(f"Error menghapus entri gizi: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.put("/entries/{entry_id}", response_model=NutritionEntry)
async def update_nutrition_entry(
    entry_id: int = Path(..., gt=0, description="ID entri gizi"),
    entry_update: NutritionEntryCreate = None
):
    """
    Memperbarui entri gizi yang sudah ada
    
    Parameter:
    - entry_id: ID entri gizi
    - entry_update: Data gizi yang diperbarui
    
    Returns: Entri gizi yang sudah diperbarui
    """
    try:
        for user_id, entries in nutrition_database.items():
            for i, entry in enumerate(entries):
                if entry.id == entry_id:
                    # Update fields
                    entry.food_name = entry_update.food_name
                    entry.calories = entry_update.calories
                    entry.protein = entry_update.protein
                    entry.carbs = entry_update.carbs
                    entry.fat = entry_update.fat
                    entry.fiber = entry_update.fiber
                    entry.portion_size = entry_update.portion_size
                    entry.meal_type = entry_update.meal_type
                    entry.notes = entry_update.notes
                    entry.image_url = entry_update.image_url
                    
                    logger.info(f"Entri gizi {entry_id} diperbarui")
                    return entries[i]
        
        raise HTTPException(status_code=404, detail="Entri gizi tidak ditemukan")
        
    except Exception as e:
        logger.error(f"Error memperbarui entri gizi: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.post("/goals/{user_id}", response_model=NutritionGoals, status_code=201)
async def set_nutrition_goals(
    user_id: int = Path(..., gt=0, description="ID pengguna"),
    goals: NutritionGoals = None
):
    """
    Menetapkan target nutrisi harian untuk pengguna
    
    Parameter:
    - user_id: ID pengguna
    - goals: Target kalori, protein, karb, dan lemak harian
    
    Returns: Target nutrisi yang telah disimpan
    """
    try:
        goals.user_id = user_id
        goals.created_at = datetime.now()
        goals.updated_at = datetime.now()
        
        user_goals[user_id] = goals
        logger.info(f"Target nutrisi untuk user {user_id} telah ditetapkan")
        return goals
        
    except Exception as e:
        logger.error(f"Error menetapkan target nutrisi: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.get("/goals/{user_id}", response_model=NutritionGoals)
async def get_nutrition_goals(
    user_id: int = Path(..., gt=0, description="ID pengguna")
):
    """
    Mendapatkan target nutrisi untuk pengguna
    
    Parameter:
    - user_id: ID pengguna
    
    Returns: Target nutrisi pengguna atau error jika tidak ada
    """
    try:
        if user_id not in user_goals:
            raise HTTPException(status_code=404, detail="Target nutrisi tidak ditemukan untuk pengguna ini")
        
        return user_goals[user_id]
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise
        logger.error(f"Error mendapatkan target nutrisi: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.get("/entries/{user_id}/by-meal-type")
async def get_entries_by_meal_type(
    user_id: int = Path(..., gt=0, description="ID pengguna"),
    meal_type: str = Query(..., regex="^(breakfast|lunch|dinner|snack)$", description="Jenis makanan"),
    date: Optional[str] = Query(None, regex="^\\d{4}-\\d{2}-\\d{2}$", description="Tanggal (YYYY-MM-DD, default: hari ini)")
):
    """
    Mendapatkan entri gizi berdasarkan jenis makanan (breakfast, lunch, dinner, snack)
    
    Parameter:
    - user_id: ID pengguna
    - meal_type: Jenis makanan (breakfast/lunch/dinner/snack)
    - date: Tanggal (YYYY-MM-DD), default adalah hari ini
    
    Returns: Daftar entri gizi untuk jenis makanan tertentu
    """
    try:
        if date is None:
            date = datetime.now().strftime("%Y-%m-%d")
        
        target_date = datetime.strptime(date, "%Y-%m-%d").date()
        
        entries = nutrition_database.get(user_id, [])
        filtered_entries = [
            e for e in entries
            if e.meal_type == meal_type and e.timestamp and e.timestamp.date() == target_date
        ]
        
        logger.info(f"Mengambil {len(filtered_entries)} entri {meal_type} untuk user {user_id}")
        return {
            "meal_type": meal_type,
            "date": date,
            "entries": filtered_entries,
            "total_calories": sum(e.calories for e in filtered_entries)
        }
        
    except ValueError:
        raise HTTPException(status_code=400, detail="Format tanggal tidak valid. Gunakan YYYY-MM-DD")
    except Exception as e:
        logger.error(f"Error mengambil entri berdasarkan jenis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
