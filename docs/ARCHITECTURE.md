# Arsitektur Sistem SnapEats

## 1. Gambaran Umum Arsitektur

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Progressive Web App (PWA)                               │   │
│  │  - React/Vue.js (SPA Framework)                          │   │
│  │  - Service Worker (Offline Support)                      │   │
│  │  - Responsive Design (Mobile/Desktop)                    │   │
│  └──────────────────┬───────────────────────────────────────┘   │
└─────────────────────┼──────────────────────────────────────────┘
                      │ HTTPS/REST API
┌─────────────────────┼──────────────────────────────────────────┐
│                     │   API GATEWAY LAYER                      │
│  ┌──────────────────▼──────────────────────────────────────┐   │
│  │  Azure API Management                                   │   │
│  │  - Rate Limiting & Throttling                           │   │
│  │  - API Versioning                                       │   │
│  │  - Authentication (JWT/OAuth2)                          │   │
│  │  - CORS Handling                                        │   │
│  └──────────────────┬───────────────────────────────────────┘   │
└─────────────────────┼──────────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┬──────────────────┐
        │             │             │                  │
┌───────▼────┐ ┌─────▼─────┐ ┌────▼───────┐ ┌──────▼──────┐
│  User API  │ │ Food API  │ │ Record API │ │ Analytics   │
│  Service   │ │ Service   │ │ Service    │ │ Service     │
└───────┬────┘ └─────┬─────┘ └────┬───────┘ └──────┬──────┘
        │             │             │                │
        │      ┌──────┴─────┐       │                │
        │      │            │       │                │
   ┌────▼──────▼───┐  ┌────▼───────▼───┐  ┌────────▼────────┐
   │ Azure App      │  │ Azure Computer  │  │ Azure Machine   │
   │ Service        │  │ Vision API      │  │ Learning        │
   │ (Backend API)  │  │ (Food Detection)│  │ (Predictions)   │
   └────┬───────────┘  └────────────────┘  └────────────────┘
        │
        │
┌───────┼──────────────────────────────────────────────┐
│       │     DATA PERSISTENCE LAYER                   │
│       │                                               │
│  ┌────▼──────────┐  ┌────────────────┐              │
│  │ Azure SQL DB  │  │ Azure Cosmos DB│              │
│  │ - Users       │  │ - Activity Logs│              │
│  │ - Foods       │  │ - Cache Data   │              │
│  │ - Nutrition   │  │ - Sessions     │              │
│  │ - Records     │  └────────────────┘              │
│  └───────────────┘                                   │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │ Azure Blob Storage                           │   │
│  │ - User Profile Images                        │   │
│  │ - Food Photos (for detection)                │   │
│  │ - Reports/Exports                            │   │
│  └──────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────┘

        │
        ▼
┌────────────────────────────────────────────────────┐
│        EXTERNAL SERVICES & MESSAGING               │
├────────────────────────────────────────────────────┤
│ - Azure Service Bus (Async Processing)             │
│ - Azure Queue Storage (Background Jobs)            │
│ - SendGrid (Email Notifications)                   │
│ - Azure Key Vault (Secrets Management)             │
└────────────────────────────────────────────────────┘
```

---

## 2. Komponen Utama Arsitektur

### 2.1 Client Layer (Frontend)
**Teknologi**: React/Vue.js, Tailwind CSS, PWA
- **Features**:
  - Single Page Application (SPA)
  - Service Worker untuk offline support
  - Camera API untuk foto makanan
  - Local Storage untuk cache data
  - Responsive design untuk mobile & desktop

**Tanggung Jawab**:
- User authentication UI
- Food capture interface
- Dashboard & analytics visualization
- Settings & profile management

---

### 2.2 API Gateway Layer
**Teknologi**: Azure API Management
- **Fitur**:
  - Centralized API routing
  - Rate limiting (100 req/min per user)
  - JWT token validation
  - API versioning (v1, v2, dll)
  - CORS configuration
  - Request/response transformation

---

### 2.3 Backend Services (Azure App Service)
**Teknologi**: Node.js/Python (FastAPI/Express.js) + Docker

#### **2.3.1 User Service**
- Register/Login
- Profile management
- Authentication & authorization
- Social login (Google, Facebook)
- Two-factor authentication

#### **2.3.2 Food Service**
- Food database CRUD
- Food search & filtering
- Nutritional information database
- Food categorization
- Recipe management

#### **2.3.3 Record Service**
- Create/update/delete food consumption records
- Sync records to database
- Export data to CSV/PDF
- Batch import from other apps

#### **2.3.4 Analytics Service**
- Daily/weekly/monthly nutrition statistics
- Macro distribution analysis
- Trend analysis
- Health recommendations
- Report generation

---

### 2.4 AI/ML Services
**Teknologi**: Azure Computer Vision API + Custom ML Model

#### **2.4.1 Food Detection Service**
- Image preprocessing
- Food identification using Computer Vision
- Portion size estimation
- Confidence scoring
- Multi-food detection in single image

#### **2.4.2 Nutrition Prediction Service**
- ML model untuk prediksi nutrisi berdasarkan visual
- Personalized recommendation engine
- Health alert system
- Pattern recognition untuk kebiasaan makan

---

### 2.5 Data Persistence Layer

#### **2.5.1 Azure SQL Database** (Relational Data)
- User accounts & authentication
- Food master data
- Consumption records
- Nutrition information
- System configuration

#### **2.5.2 Azure Cosmos DB** (NoSQL - High Performance)
- Activity logs & audit trails
- Real-time analytics cache
- Session data
- User preferences (JSON)
- Time-series data untuk performance

#### **2.5.3 Azure Blob Storage** (Files)
- User avatars & profile images
- Food photos (original & processed)
- Reports & exports (PDF, CSV)
- Model data & artifacts

---

### 2.6 Messaging & Background Processing
**Teknologi**: Azure Service Bus + Queue Storage

- Async notification system
- Email delivery queue
- Report generation background job
- Data sync from external APIs
- ML model retraining triggers

---

### 2.7 Monitoring & Logging
**Teknologi**: Azure Monitor, Application Insights

- Real-time performance monitoring
- Error tracking & alerting
- User behavior analytics
- Distributed tracing
- Custom metrics dashboard

---

## 3. Flow Diagam Sistem Utama

### 3.1 Food Detection Flow
```
┌─────────────────┐
│  User captures  │
│  food photo     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  PWA processes  │
│  image locally  │
│  (compression)  │
└────────┬────────┘
         │
         ▼
┌──────────────────────┐
│ Send to Food Service │
│ with auth token      │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Azure Computer Vision API    │
│ - Detect food items          │
│ - Extract attributes         │
│ - Confidence scoring         │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ ML Model Service             │
│ - Estimate portion size      │
│ - Calculate nutrition        │
│ - Provide alternatives       │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Save to SQL Database         │
│ - Consumption record         │
│ - Detection metadata         │
│ - User history              │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Return results to client     │
│ - Food info                  │
│ - Nutrition facts            │
│ - User confirmation prompt   │
└──────────────────────────────┘
```

### 3.2 User Authentication & Authorization Flow
```
┌──────────────────┐
│ User input login │
│ credentials      │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────┐
│ Client validates format      │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ POST /auth/login             │
│ - User Service (REST API)    │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Hash password & verify       │
│ Check against Azure SQL      │
└────────┬─────────────────────┘
         │
     ┌───┴────┐
     │         │
   ▼ (Valid) ▼ (Invalid)
┌─────────┐ ┌──────────────┐
│ Generate│ │ Return error │
│ JWT     │ │ 401          │
└────┬────┘ └──────────────┘
     │
     ▼
┌──────────────────────────────┐
│ Return JWT + Refresh Token   │
│ Client stores locally        │
└──────────────────────────────┘
```

### 3.3 Analytics Dashboard Flow
```
┌────────────────────────────┐
│ User opens Dashboard       │
│ Requests nutrition stats   │
└────────┬───────────────────┘
         │
         ▼
┌────────────────────────────┐
│ API Gateway validates JWT  │
└────────┬───────────────────┘
         │
         ▼
┌────────────────────────────┐
│ Analytics Service triggered│
│ - Query Cosmos DB (cache)  │
└────────┬───────────────────┘
         │
     ┌───┴────────────────┐
     │                    │
   ▼ (Cache Hit)      ▼ (Cache Miss)
┌──────────────┐  ┌──────────────────┐
│ Return cached│  │ Query SQL Database│
│ results      │  │ - Aggregate data  │
└──────────────┘  │ - Calculate stats │
                  │ - Cache results   │
                  └─────────┬─────────┘
                            │
                            ▼
                  ┌──────────────────┐
                  │ Return results   │
                  │ Frontend renders │
                  │ charts/graphs    │
                  └──────────────────┘
```

---

## 4. Technology Stack

| Layer | Technology | Alasan |
|-------|-----------|--------|
| **Frontend** | React + TypeScript | Component reusable, type-safe, large ecosystem |
| **Backend** | Node.js (Express) | Fast, scalable, JavaScript ecosystem kaya |
| **Database (Primary)** | Azure SQL | ACID compliance, relational data, backup otomatis |
| **Database (Cache)** | Azure Cosmos DB | High performance, global distribution, real-time sync |
| **Storage** | Azure Blob | Reliable, scalable, cost-effective |
| **AI/ML** | Azure Computer Vision | Pre-trained models, akurat, managed service |
| **Message Queue** | Azure Service Bus | Enterprise messaging, FIFO guarantee |
| **API Gateway** | Azure API Management | Centralized management, security, analytics |
| **Container** | Docker + ACI | Consistency across environments, easy deployment |
| **Monitoring** | Application Insights | Comprehensive APM, distributed tracing |
| **IaC** | Bicep | Azure-native, cleaner syntax dari ARM |

---

## 5. Scalability & Performance Considerations

### 5.1 Horizontal Scaling
- Backend API dalam container dapat di-scale otomatis dengan Azure Container Instances
- Database read replicas untuk mengurangi beban query
- CDN untuk distribusi static content frontend

### 5.2 Performance Optimization
- Image compression at client-side sebelum upload
- Caching strategy di Service Worker
- Database indexing pada frequently queried fields
- API response caching di API Management
- Lazy loading untuk analytics dashboard

### 5.3 Security
- JWT dengan short expiration (15 min) + Refresh token (7 hari)
- HTTPS everywhere
- SQL injection prevention (parameterized queries)
- CORS strict configuration
- Rate limiting per user/IP
- Sensitive data encryption di database (passwords, sensitive health info)
- Azure Key Vault untuk secrets management

---

## 6. Deployment Strategy

### 6.1 Environment
- **Development**: Local, Azure Container Registry, Dev SQL
- **Staging**: Azure App Service (Free tier), Staging SQL
- **Production**: Azure App Service (Premium), Production SQL dengan HA

### 6.2 CI/CD Pipeline
- GitHub Actions untuk automated build & test
- Container image push ke Azure Container Registry
- Automated deployment ke staging untuk testing
- Manual approval untuk production deployment
- Zero-downtime deployment dengan blue-green strategy

---

## 7. Disaster Recovery & Backup

### 7.1 Database Backup
- Automated daily backups ke Azure Storage
- Point-in-time restore (35 hari retention)
- Geo-redundant replication

### 7.2 Failover
- Azure SQL dengan automatic failover untuk High Availability
- Application insights untuk health monitoring
- Auto-scaling policies untuk handle traffic spikes

---

## 8. Cost Optimization

- **Database**: Azure SQL Serverless untuk variable workload
- **Storage**: Hot tier untuk recent photos, Cool tier untuk archives
- **Compute**: Container Instances lebih murah dibanding App Service untuk low traffic
- **Monitoring**: Application Insights pay-as-you-go
- **CDN**: Hanya untuk production assets

---

## 9. Integration Points

### 9.1 External APIs
- Google Sign-In / Facebook Login (Authentication)
- Potentially: OpenAI APIs untuk smart recommendations
- USDA Food Database API untuk validasi nutrisi data

### 9.2 Third-party Services
- SendGrid untuk email notifications
- Twilio untuk SMS alerts (optional)
- Firebase untuk push notifications

---

**Dokumen ini akan di-update seiring dengan pengembangan proyek.**

Terakhir update: March 9, 2026
Version: 1.0
