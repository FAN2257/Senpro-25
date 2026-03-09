# Skema Database SnapEats

## 1. Overview Database Design

SnapEats menggunakan **Azure SQL Database** sebagai primary datastore dengan:
- **Approach**: Relational database dengan normalized schema
- **Normalization Level**: 3NF (Third Normal Form)
- **Total Tables**: 12 core tables
- **Relationships**: Foreign keys untuk data integrity

---

## 2. Database Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                         USERS DOMAIN                             │
├──────────────────────────────────────────────────────────────────┤
│
│   ┌─────────────────────────┐
│   │        Users (UK: id)    │
│   ├─────────────────────────┤
│   │ id (PK)                 │
│   │ email (UNIQUE)          │
│   │ password_hash           │
│   │ full_name               │
│   │ profile_picture_url     │
│   │ date_of_birth           │
│   │ gender                  │
│   │ height_cm               │
│   │ weight_kg               │
│   │ target_weight_kg        │
│   │ activity_level          │
│   │ dietary_restrictions    │
│   │ health_conditions       │
│   │ created_at              │
│   │ updated_at              │
│   │ last_login_at           │
│   │ is_active               │
│   └────────┬────────────────┘
│            │ (1:1)
│            │
│   ┌────────▼──────────────────────────┐
│   │  UserProfiles (UK: user_id)        │
│   ├────────────────────────────────────┤
│   │ id (PK)                            │
│   │ user_id (FK → Users)               │
│   │ daily_calorie_goal                 │
│   │ protein_goal_g                     │
│   │ carbs_goal_g                       │
│   │ fat_goal_g                         │
│   │ fiber_goal_g                       │
│   │ sodium_goal_mg                     │
│   │ notification_preferences (JSON)    │
│   │ language                           │
│   │ timezone                           │
│   │ created_at                         │
│   └────────────────────────────────────┘
│
│   ┌────────────────────────────────────┐
│   │  UserSessions (UK: user_id, token) │
│   ├────────────────────────────────────┤
│   │ id (PK)                            │
│   │ user_id (FK → Users)               │
│   │ session_token                      │
│   │ refresh_token (HASHED)             │
│   │ device_name                        │
│   │ ip_address                         │
│   │ created_at                         │
│   │ expires_at                         │
│   │ device_id (for offline sync)       │
│   └────────────────────────────────────┘
│
│   ┌────────────────────────────────────┐
│   │  UserHealthMetrics (UK: user_id)   │
│   ├────────────────────────────────────┤
│   │ id (PK)                            │
│   │ user_id (FK → Users)               │
│   │ date (clustered index)             │
│   │ weight_kg                          │
│   │ waist_circumference_cm             │
│   │ blood_pressure_sys                 │
│   │ blood_pressure_dia                 │
│   │ blood_glucose_mg_dl                │
│   │ notes                              │
│   │ created_at                         │
│   └────────────────────────────────────┘
│
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                    FOOD & NUTRITION DOMAIN                       │
├──────────────────────────────────────────────────────────────────┤
│
│   ┌──────────────────────────────┐
│   │    FoodCategories (UK: id)   │
│   ├──────────────────────────────┤
│   │ id (PK)                      │
│   │ name (UNIQUE)                │
│   │ description                  │
│   │ icon_url                      │
│   │ color_code                    │
│   │ created_at                    │
│   └────────┬─────────────────────┘
│            │ (1:N)
│            │
│   ┌────────▼──────────────────────────────┐
│   │  Foods (UK: id)                        │
│   ├────────────────────────────────────────┤
│   │ id (PK)                                │
│   │ name                                   │
│   │ category_id (FK → FoodCategories)     │
│   │ description                            │
│   │ serving_size_str (e.g., "100g")       │
│   │ serving_size_unit                     │
│   │ serving_size_grams                    │
│   │ calories_per_serving                  │
│   │ protein_g                             │
│   │ carbs_g                               │
│   │ fat_g                                 │
│   │ fiber_g                               │
│   │ sodium_mg                             │
│   │ sugar_g                               │
│   │ cholesterol_mg                        │
│   │ image_url                             │
│   │ source (USDA/Custom/User)             │
│   │ is_verified                           │
│   │ created_by_user_id (FK → Users)       │
│   │ created_at                            │
│   │ updated_at                            │
│   │ INDEX: (name, category_id)            │
│   └──────────────────────────────────────┘
│
│   ┌──────────────────────────────────────┐
│   │  FoodAllergens (UK: food_id, allergen)
│   ├──────────────────────────────────────┤
│   │ id (PK)                              │
│   │ food_id (FK → Foods)                 │
│   │ allergen_name                        │
│   │ (eggs, peanuts, tree nuts, milk, etc)
│   └──────────────────────────────────────┘
│
│   ┌──────────────────────────────────────┐
│   │  FoodAlternatives (UK: food_id, alt) │
│   ├──────────────────────────────────────┤
│   │ id (PK)                              │
│   │ food_id (FK → Foods)                 │
│   │ alternative_food_id (FK → Foods)     │
│   │ similarity_score (0-100)              │
│   │ notes (reason for alternative)       │
│   │ created_at                           │
│   └──────────────────────────────────────┘
│
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│              FOOD CONSUMPTION & RECORDS DOMAIN                   │
├──────────────────────────────────────────────────────────────────┤
│
│   ┌────────────────────────────────────┐
│   │  FoodRecords (UK: id)              │
│   ├────────────────────────────────────┤
│   │ id (PK)                            │
│   │ user_id (FK → Users)               │
│   │ food_id (FK → Foods)               │
│   │ consumed_date (clustered index)    │
│   │ consumed_time                      │
│   │ meal_type (breakfast/lunch/dinner) │
│   │ quantity_number                    │
│   │ quantity_unit (servings/grams/ml)  │
│   │ quantity_grams                     │
│   │ confidence_score                   │
│   │ photo_url                          │
│   │ notes                              │
│   │ is_approved_by_user                │
│   │ detection_method (manual/ai/import)│
│   │ created_at                         │
│   │ updated_at                         │
│   │ INDEX: (user_id, consumed_date)    │
│   └────────┬─────────────────────────┘
│            │ (1:1)
│            │
│   ┌────────▼──────────────────────────────────┐
│   │  FoodRecordDetections (UK: record_id)     │
│   ├───────────────────────────────────────────┤
│   │ id (PK)                                   │
│   │ record_id (FK → FoodRecords)              │
│   │ detected_food_name                        │
│   │ detected_quantity                         │
│   │ confidence_score                          │
│   │ bounding_box_json (coordinates in image)  │
│   │ created_at                                │
│   └───────────────────────────────────────────┘
│
│   ┌───────────────────────────────────┐
│   │  NutritionSnapshots (Daily)       │
│   ├───────────────────────────────────┤
│   │ id (PK)                           │
│   │ user_id (FK → Users)              │
│   │ snapshot_date (UNIQUE per user)   │
│   │ total_calories                    │
│   │ total_protein_g                   │
│   │ total_carbs_g                     │
│   │ total_fat_g                       │
│   │ total_fiber_g                     │
│   │ total_sodium_mg                   │
│   │ total_sugar_g                     │
│   │ meal_count                        │
│   │ water_intake_ml                   │
│   │ notes                             │
│   │ created_at                        │
│   │ updated_at                        │
│   │ TRIGGER: auto-calculate dari FR   │
│   │ INDEX: (user_id, snapshot_date)   │
│   └───────────────────────────────────┘
│
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│              ANALYTICS & RECOMMENDATIONS DOMAIN                  │
├──────────────────────────────────────────────────────────────────┤
│
│   ┌──────────────────────────────────────┐
│   │  WeeklyNutritionSummary              │
│   ├──────────────────────────────────────┤
│   │ id (PK)                              │
│   │ user_id (FK → Users)                 │
│   │ week_start_date                      │
│   │ avg_daily_calories                   │
│   │ avg_daily_protein_g                  │
│   │ avg_daily_carbs_g                    │
│   │ avg_daily_fat_g                      │
│   │ most_consumed_food_ids (JSON array)  │
│   │ macro_distribution (% protein/c/f)   │
│   │ days_goal_met                        │
│   │ notes                                │
│   │ created_at                           │
│   │ INDEX: (user_id, week_start_date)    │
│   └──────────────────────────────────────┘
│
│   ┌────────────────────────────────────┐
│   │  HealthRecommendations              │
│   ├────────────────────────────────────┤
│   │ id (PK)                             │
│   │ user_id (FK → Users)                │
│   │ recommendation_type (nutrient/food) │
│   │ title                               │
│   │ description                         │
│   │ priority (high/medium/low)          │
│   │ data_json                           │
│   │ generated_at                        │
│   │ acknowledged_at (nullable)          │
│   │ is_active                           │
│   │ INDEX: (user_id, is_active)         │
│   └────────────────────────────────────┘
│
│   ┌────────────────────────────────────┐
│   │  ActivityLogs (Audit Trail)        │
│   ├────────────────────────────────────┤
│   │ id (PK)                             │
│   │ user_id (FK → Users)                │
│   │ action_type (create/update/delete)  │
│   │ entity_type (FoodRecord/etc)        │
│   │ entity_id                           │
│   │ changes_json                        │
│   │ ip_address                          │
│   │ user_agent                          │
│   │ timestamp                           │
│   │ INDEX: (user_id, timestamp)         │
│   └────────────────────────────────────┘
│
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                  SYSTEM & CONFIGURATION DOMAIN                   │
├──────────────────────────────────────────────────────────────────┤
│
│   ┌────────────────────────────────┐
│   │  SystemConfig                  │
│   ├────────────────────────────────┤
│   │ id (PK)                        │
│   │ key (UNIQUE)                   │
│   │ value                          │
│   │ description                    │
│   │ updated_at                     │
│   │ (Stores: API versions, etc)    │
│   └────────────────────────────────┘
│
│   ┌────────────────────────────────┐
│   │  FoodDetectionModels           │
│   ├────────────────────────────────┤
│   │ id (PK)                        │
│   │ model_name                     │
│   │ model_version                  │
│   │ accuracy_score                 │
│   │ status (active/archived)       │
│   │ weights_path                   │
│   │ deployed_at                    │
│   │ updated_at                     │
│   └────────────────────────────────┘
│
└──────────────────────────────────────────────────────────────────┘
```

---

## 3. Detailed Table Schemas

### 3.1 Users Table

```sql
CREATE TABLE Users (
    id BIGINT PRIMARY KEY IDENTITY(1,1),
    email NVARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(MAX) NOT NULL,
    full_name NVARCHAR(255) NOT NULL,
    profile_picture_url NVARCHAR(512),
    date_of_birth DATE,
    gender ENUM('Male', 'Female', 'Other', 'Prefer Not To Say'),
    height_cm SMALLINT,
    weight_kg DECIMAL(5,2),
    target_weight_kg DECIMAL(5,2),
    activity_level ENUM('Sedentary', 'Light', 'Moderate', 'Very Active', 'Extremely Active'),
    dietary_restrictions NVARCHAR(MAX), -- JSON array
    health_conditions NVARCHAR(MAX), -- JSON array (diabetes, hypertension, etc)
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    last_login_at DATETIME2,
    is_active BIT NOT NULL DEFAULT 1,
    
    -- Indexes
    INDEX idx_email (email),
    INDEX idx_created_at (created_at)
);
```

**Penggunaan**: Master table untuk user accounts

---

### 3.2 UserProfiles Table

```sql
CREATE TABLE UserProfiles (
    id BIGINT PRIMARY KEY IDENTITY(1,1),
    user_id BIGINT NOT NULL UNIQUE,
    daily_calorie_goal INT,
    protein_goal_g DECIMAL(6,2),
    carbs_goal_g DECIMAL(6,2),
    fat_goal_g DECIMAL(6,2),
    fiber_goal_g DECIMAL(6,2),
    sodium_goal_mg INT,
    notification_preferences NVARCHAR(MAX) NOT NULL, -- JSON
    language NVARCHAR(10) DEFAULT 'id',
    timezone NVARCHAR(50) DEFAULT 'Asia/Jakarta',
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
);
```

**Penggunaan**: User preferences dan goal nutrisi personal

---

### 3.3 UserSessions Table

```sql
CREATE TABLE UserSessions (
    id BIGINT PRIMARY KEY IDENTITY(1,1),
    user_id BIGINT NOT NULL,
    session_token VARCHAR(512) NOT NULL UNIQUE,
    refresh_token VARCHAR(512) NOT NULL,
    device_name NVARCHAR(255),
    device_id NVARCHAR(255), -- untuk sync offline
    ip_address VARCHAR(45), -- IPv4 & IPv6
    user_agent NVARCHAR(512),
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    expires_at DATETIME2 NOT NULL,
    last_activity_at DATETIME2,
    
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    INDEX idx_user_session (user_id, expires_at),
    INDEX idx_token_exp (session_token, expires_at)
);
```

**Penggunaan**: Track user sessions & devices untuk logout/invalidation

---

### 3.4 Foods Table

```sql
CREATE TABLE Foods (
    id BIGINT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(255) NOT NULL,
    category_id BIGINT NOT NULL,
    description NVARCHAR(MAX),
    serving_size_str NVARCHAR(100), -- e.g., "1 cup", "100g"
    serving_size_unit NVARCHAR(50), -- cups, grams, ml, etc
    serving_size_grams DECIMAL(8,2), -- standardized to grams
    
    -- Nutrition per serving
    calories_per_serving DECIMAL(8,2) NOT NULL,
    protein_g DECIMAL(8,2),
    carbs_g DECIMAL(8,2),
    fat_g DECIMAL(8,2),
    fiber_g DECIMAL(8,2),
    sodium_mg DECIMAL(10,2),
    sugar_g DECIMAL(8,2),
    cholesterol_mg DECIMAL(8,2),
    iron_mg DECIMAL(6,2),
    calcium_mg DECIMAL(8,2),
    potassium_mg DECIMAL(10,2),
    
    image_url NVARCHAR(512),
    source ENUM('USDA', 'Custom', 'User Contributed') DEFAULT 'USDA',
    is_verified BIT NOT NULL DEFAULT 0,
    barcode NVARCHAR(19), -- EAN-13
    created_by_user_id BIGINT, -- NULL jika dari USDA
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    FOREIGN KEY (category_id) REFERENCES FoodCategories(id),
    FOREIGN KEY (created_by_user_id) REFERENCES Users(id) ON DELETE SET NULL,
    INDEX idx_name (name),
    INDEX idx_category (category_id),
    INDEX idx_barcode (barcode),
    FULLTEXT INDEX ftx_food_search (name, description)
);
```

**Penggunaan**: Master data makanan dengan nutrition facts

---

### 3.5 FoodRecords Table

```sql
CREATE TABLE FoodRecords (
    id BIGINT PRIMARY KEY IDENTITY(1,1),
    user_id BIGINT NOT NULL,
    food_id BIGINT,
    consumed_date DATE NOT NULL,
    consumed_time TIME,
    meal_type ENUM('Breakfast', 'Lunch', 'Dinner', 'Snack') NOT NULL,
    quantity_number DECIMAL(8,3) NOT NULL, -- e.g., 1.5 (servings)
    quantity_unit NVARCHAR(50), -- servings, grams, ml
    quantity_grams DECIMAL(10,2), -- standardized
    
    -- AI Detection metadata
    confidence_score DECIMAL(3,2), -- 0.0 to 1.0
    photo_url NVARCHAR(512),
    notes NVARCHAR(MAX),
    is_approved_by_user BIT NOT NULL DEFAULT 0,
    detection_method ENUM('Manual', 'AI Detected', 'Imported') DEFAULT 'Manual',
    
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (food_id) REFERENCES Foods(id) ON DELETE SET NULL,
    INDEX idx_user_date (user_id, consumed_date),
    INDEX idx_user_meal (user_id, consumed_date, meal_type),
    INDEX idx_created_at (created_at)
);
```

**Penggunaan**: Rekam setiap konsumsi makanan user dengan waktu & jumlah

---

### 3.6 FoodRecordDetections Table

```sql
CREATE TABLE FoodRecordDetections (
    id BIGINT PRIMARY KEY IDENTITY(1,1),
    record_id BIGINT NOT NULL UNIQUE,
    detected_food_name NVARCHAR(255),
    detected_quantity NVARCHAR(100),
    detected_portion_grams DECIMAL(10,2),
    confidence_score DECIMAL(3,2),
    bounding_box_json NVARCHAR(MAX), -- JSON: {"x": 10, "y": 20, "width": 100, "height": 80}
    raw_detection_json NVARCHAR(MAX), -- Full response dari Computer Vision API
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    FOREIGN KEY (record_id) REFERENCES FoodRecords(id) ON DELETE CASCADE
);
```

**Penggunaan**: Store hasil AI detection untuk audit & improvement

---

### 3.7 NutritionSnapshots Table

```sql
CREATE TABLE NutritionSnapshots (
    id BIGINT PRIMARY KEY IDENTITY(1,1),
    user_id BIGINT NOT NULL,
    snapshot_date DATE NOT NULL,
    
    total_calories DECIMAL(8,2),
    total_protein_g DECIMAL(8,2),
    total_carbs_g DECIMAL(8,2),
    total_fat_g DECIMAL(8,2),
    total_fiber_g DECIMAL(8,2),
    total_sodium_mg DECIMAL(10,2),
    total_sugar_g DECIMAL(8,2),
    meal_count INT,
    water_intake_ml INT,
    notes NVARCHAR(MAX),
    
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    UNIQUE (user_id, snapshot_date),
    INDEX idx_user_date (user_id, snapshot_date),
    -- Trigger: auto-calculate dari FoodRecords setiap hari
    -- Trigger: update when FoodRecords created/updated/deleted
);
```

**Penggunaan**: Daily nutrition summary untuk quick lookup & analytics

---

### 3.8 WeeklyNutritionSummary Table

```sql
CREATE TABLE WeeklyNutritionSummary (
    id BIGINT PRIMARY KEY IDENTITY(1,1),
    user_id BIGINT NOT NULL,
    week_start_date DATE NOT NULL, -- Monday of the week
    
    avg_daily_calories DECIMAL(8,2),
    avg_daily_protein_g DECIMAL(8,2),
    avg_daily_carbs_g DECIMAL(8,2),
    avg_daily_fat_g DECIMAL(8,2),
    
    -- Macro distribution percentages
    protein_percentage DECIMAL(5,2),
    carbs_percentage DECIMAL(5,2),
    fat_percentage DECIMAL(5,2),
    
    most_consumed_food_ids NVARCHAR(MAX), -- JSON array of top 5
    days_goal_met INT, -- 0 to 7
    total_days_tracked INT,
    
    notes NVARCHAR(MAX),
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    INDEX idx_user_week (user_id, week_start_date)
);
```

**Penggunaan**: Weekly aggregation untuk dashboard & trend analysis

---

### 3.9 FoodCategories Table

```sql
CREATE TABLE FoodCategories (
    id BIGINT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(100) NOT NULL UNIQUE,
    description NVARCHAR(MAX),
    icon_url NVARCHAR(512),
    color_code VARCHAR(7), -- hex color
    display_order INT,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    INDEX idx_name (name)
);
```

**Sample data**:
```sql
INSERT INTO FoodCategories (name, color_code) VALUES
('Vegetables', '#2d5016'),
('Fruits', '#e63946'),
('Proteins', '#ff9f1c'),
('Grains', '#ffbf69'),
('Dairy', '#ffffff'),
('Fats & Oils', '#ffd60a'),
('Sweets', '#ffc300'),
('Beverages', '#4cc9f0');
```

---

### 3.10 HealthRecommendations Table

```sql
CREATE TABLE HealthRecommendations (
    id BIGINT PRIMARY KEY IDENTITY(1,1),
    user_id BIGINT NOT NULL,
    recommendation_type ENUM('Nutrient Goal', 'Food Suggestion', 'Allergy Warning', 'Health Alert'),
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    priority ENUM('High', 'Medium', 'Low') DEFAULT 'Medium',
    data_json NVARCHAR(MAX), -- Flexible JSON for various data
    generated_at DATETIME2 NOT NULL,
    acknowledged_at DATETIME2,
    is_active BIT NOT NULL DEFAULT 1,
    
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    INDEX idx_user_active (user_id, is_active),
    INDEX idx_generated (generated_at)
);
```

---

### 3.11 ActivityLogs Table

```sql
CREATE TABLE ActivityLogs (
    id BIGINT PRIMARY KEY IDENTITY(1,1),
    user_id BIGINT NOT NULL,
    action_type ENUM('Create', 'Update', 'Delete', 'View') NOT NULL,
    entity_type ENUM('FoodRecord', 'UserProfile', 'Goal', 'Setting'),
    entity_id BIGINT,
    changes_json NVARCHAR(MAX), -- JSON diff
    ip_address VARCHAR(45),
    user_agent NVARCHAR(512),
    timestamp DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    INDEX idx_user_time (user_id, timestamp),
    INDEX idx_entity (entity_type, entity_id)
);
```

**Penggunaan**: Audit trail untuk compliance & debugging

---

## 4. Key Constraints & Relationships

### Primary Key Strategy
- **BIGINT IDENTITY**: Auto-incrementing long integers untuk semua ID

### Foreign Keys
- `CASCADE DELETE` untuk user-owned data (FoodRecords, Sessions)
- `SET NULL` untuk optional references (created_by_user_id, food_id in deletion)

### Unique Constraints
- `Users.email`: Prevent duplicate accounts
- `UserProfiles.user_id`: One profile per user
- `NutritionSnapshots.user_id + snapshot_date`: One snapshot per day
- `FoodCategories.name`: Unique category names

### Composite Indexes (untuk frequent queries)
- `FoodRecords(user_id, consumed_date)` - untuk filter konsumsi user by date
- `NutritionSnapshots(user_id, snapshot_date)` - untuk analytics
- `WeeklyNutritionSummary(user_id, week_start_date)` - untuk dashboard

---

## 5. Sample Data Inserts

```sql
-- 1. Insert Food Categories
INSERT INTO FoodCategories (name, color_code) VALUES
('Vegetables', '#2d5016'),
('Fruits', '#e63946'),
('Proteins', '#ff9f1c'),
('Grains', '#ffbf69'),
('Dairy', '#ffffff'),
('Fats & Oils', '#ffd60a');

-- 2. Insert Sample Foods
INSERT INTO Foods (name, category_id, serving_size_str, serving_size_grams, 
                   calories_per_serving, protein_g, carbs_g, fat_g, is_verified)
VALUES
('Chicken Breast (Cooked)', 3, '100g', 100, 165, 31, 0, 3.6, 1),
('White Rice (Cooked)', 4, '100g', 100, 130, 2.7, 28, 0.3, 1),
('Broccoli (Raw)', 1, '1 cup', 100, 34, 2.8, 7, 0.4, 1),
('Apple (Medium)', 2, '1 whole', 182, 95, 0.5, 25, 0.3, 1);

-- 3. Insert Sample User
INSERT INTO Users (email, password_hash, full_name, height_cm, weight_kg)
VALUES ('user@example.com', '$2y$10$...hash...', 'John Doe', 175, 75);

-- 4. Create User Profile
INSERT INTO UserProfiles (user_id, daily_calorie_goal, protein_goal_g, 
                         carbs_goal_g, fat_goal_g, notification_preferences)
VALUES (1, 2000, 150, 200, 65, '{"email": true, "push": false}');
```

---

## 6. Database Performance Optimization

### Indexing Strategy
1. **Clustered Index**: Primary key (id)
2. **Non-clustered Indexes**:
   - High-volume tables: (user_id, date) untuk quick filtering
   - Search tables: FULLTEXT index pada Foods
   - Time-series: (user_id, timestamp) untuk historical queries

### Materialized Views
```sql
CREATE VIEW v_UserDailyStats AS
SELECT 
    u.id,
    u.email,
    ns.snapshot_date,
    ns.total_calories,
    ns.total_protein_g,
    (ns.total_protein_g * 4 / ns.total_calories * 100) as protein_pct
FROM Users u
JOIN NutritionSnapshots ns ON u.id = ns.user_id
WHERE ns.total_calories > 0;
```

### Partitioning Strategy (Optional, untuk scale)
```sql
-- Partition NutritionSnapshots by date range
PARTITION BY RANGE (snapshot_date) (
    PARTITION p_2024_q1 VALUES LESS THAN ('2024-04-01'),
    PARTITION p_2024_q2 VALUES LESS THAN ('2024-07-01'),
    ...
);
```

---

## 7. ETL & Data Synchronization

### Azure Data Sync
- Sync dari Azure SQL → Cosmos DB untuk high-read cache
- Scheduled job setiap 1 jam untuk nutrition snapshots
- Real-time sync untuk active food records

---

## 8. Migration Plan (jika ada)

1. **Phase 1**: Create schema di Dev environment
2. **Phase 2**: Load USDA food database (~100k records)
3. **Phase 3**: User acceptance testing
4. **Phase 4**: Deploy ke production dengan backup

---

## 9. Data Privacy & Security

### Encryption
- **Passwords**: bcrypt dengan salt
- **Sensitive health data**: Transparent Data Encryption (TDE) di Azure SQL
- **PII**: Encrypted at rest & in transit

### GDPR Compliance
- Right to be forgotten: DELETE CASCADE implemented
- Data export: Generate CSV/JSON dari user data
- Consent logging di ActivityLogs

---

**Dokumentasi ini akan di-update saat implementasi.**

Terakhir update: March 9, 2026
Version: 1.0
