# Backend Directory

This directory contains the backend infrastructure for Library of Echoes.

## Structure

```
backend/
├── supabase/
│   ├── schema.sql          # Database schema and initial data
│   └── functions/          # Supabase Edge Functions (API endpoints)
└── utils/
    ├── layerManager.ts     # Layer logic and message distribution
    └── epochManager.ts     # Epoch lifecycle and Babel Moment
```

## Database Schema

The database consists of 4 main tables:

- **epochs**: Stores epoch/age information
- **layers**: Defines layer structure (9 layers per epoch)
- **rooms**: Distributes messages within layers
- **messages**: Stores all user messages (anonymous)

## Setup Instructions

### 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Create a new project
3. Note down:
   - Project URL
   - Anon/Public API Key
   - Service Role Key (for admin operations)

### 2. Run Database Schema

1. In Supabase Dashboard, go to SQL Editor
2. Copy contents of `schema.sql`
3. Run the SQL script
4. Verify tables are created:
   - epochs
   - layers
   - rooms
   - messages

### 3. Verify Initial Data

The schema automatically creates:
- First epoch: "Age 1"
- 9 layers with proper ranges
- 10 rooms for layer 1

You can verify with:
```sql
SELECT * FROM epochs;
SELECT * FROM layers WHERE epoch_id = 1;
SELECT * FROM rooms WHERE epoch_id = 1;
```

## Environment Variables

The following environment variables are needed in both web and mobile apps:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## API Endpoints (To Be Implemented)

- `POST /api/messages` - Submit a new message
- `GET /api/state` - Get current epoch state
- `GET /api/epoch-summary` - Get epoch statistics (for Babel Moment)

## Layer Configuration

| Layer | Range | Theme | Description |
|-------|-------|-------|-------------|
| I | 0-100 | Void | Dark void, minimal |
| II | 100-500 | Whisper | Soft purple tones |
| III | 500-1K | Glitch | Glitch effects |
| IV | 1K-2K | Wave | Wave effects |
| V | 2K-4K | Neon | Neon purple |
| VI | 4K-8K | Ambient | Ambient glow |
| VII | 8K-50K | Chaos | Chaotic textures |
| VIII | 50K-100K | Burst | Visual burst |
| IX | 100K+ | Babel | Babel Moment trigger |

## Utility Functions

### layerManager.ts

- `getCurrentLayer()` - Determines layer based on message count
- `getRoomIndex()` - Distributes messages to rooms
- `normalizeMessage()` - Normalizes text for duplicate detection
- `validateMessage()` - Validates message input
- `shouldTriggerBabelMoment()` - Checks if threshold reached

### epochManager.ts

- `closeEpoch()` - Closes current epoch and generates stats
- `createNewEpoch()` - Creates new epoch
- `generateEpochStats()` - Generates comprehensive statistics
- `extractTopWords()` - Finds most common words
- `analyzeEmotions()` - Simple emotion analysis
- `generateManifesto()` - Creates epoch manifesto

## Next Steps

1. ✅ Database schema created
2. ✅ Utility functions implemented
3. ⏳ Create Supabase Edge Functions for API endpoints
4. ⏳ Test API endpoints
5. ⏳ Connect to frontend applications
