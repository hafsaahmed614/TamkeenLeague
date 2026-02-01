# Tamkeen Sports League Hub

A centralized, privacy-focused stats, schedule, and live-scoring web application for the Tamkeen women's basketball league.

## Project Overview

| Component | Technology | Status |
|-----------|------------|--------|
| Admin Dashboard | Python + Streamlit | Complete |
| Public Web App | React + TypeScript + Tailwind | Phase 2 |
| Database | Supabase (PostgreSQL) | Complete |
| Deployment | Streamlit Cloud + Vercel | Pending |

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        SUPABASE                             │
│              (PostgreSQL + Auth + Realtime)                 │
└─────────────────────────┬───────────────────────────────────┘
                          │
          ┌───────────────┴───────────────┐
          │                               │
┌─────────▼─────────┐         ┌──────────▼──────────┐
│  Admin Dashboard  │         │   Public Web App    │
│    (Streamlit)    │         │      (React)        │
│   Write + Read    │         │     Read Only       │
│  service_role key │         │      anon key       │
└───────────────────┘         └─────────────────────┘
```

---

## Phase 1: Admin Dashboard (Complete)

### Features

| Page | Functionality |
|------|---------------|
| **Admin Dashboard** | Navigation hub with links to all management pages |
| **Teams** | Create, edit, delete teams |
| **Players** | Add players to teams, manage jersey numbers, filter by team |
| **Schedule** | Create games with date/time/location, change game status |
| **Live Scorer** | Start games, log points per player (+1/+2/+3), undo mistakes, end games |
| **Rankings** | Preview team standings and player leaderboards |

### Database Schema

The database uses a **name-based schema** for easier readability in Supabase:

#### `teams`
| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL | Primary Key |
| name | TEXT | Team name (unique) |
| wins | INTEGER | Default 0 |
| losses | INTEGER | Default 0 |

#### `players`
| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL | Primary Key |
| team_name | TEXT | Team name |
| name | TEXT | Player name |
| jersey_number | INTEGER | Jersey number |

#### `games`
| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL | Primary Key |
| home_team_name | TEXT | Home team name |
| away_team_name | TEXT | Away team name |
| start_time | TIMESTAMPTZ | Game date/time |
| location | TEXT | Game location |
| status | TEXT | 'scheduled', 'live', or 'final' |

#### `score_logs`
| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL | Primary Key |
| game_id | BIGINT | Foreign key to games |
| player_name | TEXT | Player who scored |
| team_name | TEXT | Team that scored |
| points | INTEGER | 1, 2, or 3 |
| created_at | TIMESTAMPTZ | Timestamp |

### Live Scoring System

The app uses a **ledger-based scoring system**:
- Every point is recorded as an entry in `score_logs`
- Scores are calculated by summing points from the ledger
- Undo functionality deletes the most recent entry
- This provides a full audit trail of all scoring

### Local Development

```bash
cd admin
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Create .env file with Supabase credentials
cp .env.example .env
# Edit .env with your SUPABASE_URL and SUPABASE_KEY (service_role)

streamlit run Admin_Dashboard.py
```

### Deployment (Streamlit Cloud)

1. Go to [share.streamlit.io](https://share.streamlit.io)
2. Connect GitHub repo
3. Set main file: `admin/Admin_Dashboard.py`
4. Add secrets:
   ```toml
   SUPABASE_URL = "https://your-project.supabase.co"
   SUPABASE_KEY = "your-service-role-key"
   ```

---

## Phase 2: Public Web App (Planned)

### Technology Stack

- **Framework:** React with Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS (Tamkeen brand colors: Deep Red/Maroon, Black, White)
- **Deployment:** Vercel
- **Data:** Supabase (anon key - read only)

### Planned Pages

| Page | Description |
|------|-------------|
| **Home** | Landing page with navigation cards |
| **Standings** | Team rankings with Record, PF, PA, Diff |
| **Schedule** | Upcoming, Live, and Past games |
| **Leaderboard** | Top scorers with PTS, GP, PPG |
| **Box Score** | Individual game stats (accessible from Schedule) |

### Key Features

- **Real-time Updates:** Supabase Realtime for live game scores
- **Mobile Responsive:** Mobile-first design for players and fans
- **Read-Only Access:** Public users cannot modify data

### Project Structure (Planned)

```
TamkeenLeague/
├── admin/              # Phase 1 - Streamlit (complete)
├── web/                # Phase 2 - React app
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── lib/
│   │   │   └── supabase.ts
│   │   └── App.tsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── database/
│   └── schema.sql
└── README.md
```

### Supabase Configuration for React

The React app will use the **anon (public) key** which only has read access:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY  // Read-only access
)
```

---

## Future: Admin Migration to React

After Phase 2 is stable, the plan is to:
1. Add protected admin routes to the React app
2. Rebuild admin functionality as React components
3. Retire the Streamlit app

This consolidates both apps into a single codebase with unified deployment.

---

## Brand Guidelines

| Element | Value |
|---------|-------|
| Primary Color | Deep Red/Maroon (#8B0000) |
| Secondary Color | Black (#000000) |
| Accent Color | White (#FFFFFF) |
| Style | Clean, professional, modest |

---

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Streamlit Documentation](https://docs.streamlit.io)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Vercel](https://vercel.com)
