# Tamkeen Sports League Hub - Technical Specifications

## 1. Executive Summary
* **Project Name:** Tamkeen Sports League App
* **Goal:** A centralized, privacy-focused stats, schedule, and live-scoring web application for the Tamkeen women's basketball league.
* **Target Audience:**
    * **Internal:** League Organizers (Admins).
    * **External:** Players, families, and community members (Restricted to link-holders).
* **Visual Identity:** Strictly adheres to Tamkeen Sports branding (Deep Red/Maroon, Black, White). Clean, professional, and modest.

---

## 2. Development Strategy (Phased Approach)

To ensure rapid data validation before focusing on UI polish, development will be split into two distinct phases using different technologies.

### Phase 1: "Back-of-House" (Prototype & Admin)
* **Technology:** **Python + Streamlit**.
* **Purpose:**
    * Rapidly configure the Supabase database.
    * Input initial data (Teams, Rosters, Schedule).
    * Validate the "Live Scoring" logic and calculations.
    * Serve as the **Admin Dashboard** for the first season (or until a custom Admin UI is built).

### Phase 2: "Front-of-House" (Public Release)
* **Technology:** **React + TypeScript + Tailwind CSS** (Hosted on **Vercel**).
* **Purpose:**
    * The user-facing, mobile-responsive web application.
    * Reads data from the database populated in Phase 1.
    * Focuses on performance, branding (UI/UX), and real-time updates.

---

## 3. User Roles

### A. Super Admin (The Commissioner)
* **Interface:** Streamlit App (Secured via Supabase Auth).
* **Permissions:** Full Read/Write (CRUD).
* **Key Responsibilities:**
    * **League Configuration:** Create teams and manage player rosters.
    * **Scheduling:** Create game slots (Date, Time, Location).
    * **Live Game Management:** Use the "Live Scorer" interface to input points in real-time.
    * **Correction:** Ability to "Undo" scoring errors by deleting entries from the ledger.

### B. The Public / Player
* **Interface:** React Web App (Public URL).
* **Permissions:** Read-Only.
* **Key Capabilities:**
    * View League Standings (automatically calculated).
    * View Schedule (Upcoming & Past Results).
    * View Live Game Status (Real-time scores).
    * View Leaderboards (Top Scorers).

---

## 4. Feature Specifications (Public App - Phase 2)

### A. Home Screen
* **Header:** "Tamkeen Basketball League" (Logo).
* **Navigation:** Clean menu cards redirecting to:
    * `[📊 Standings]`
    * `[📅 Schedule]`
    * `[🏆 Leaderboard]`

### B. Standings Page
* **Data Source:** `teams` table.
* **Columns:** Rank | Team Name | Wins | Losses | PF (Points For) | PA (Points Against) | Streak.
* **Logic:** Sorted descending by Wins, then by Point Differential (PF - PA).

### C. Schedule Page
* **View 1 (Upcoming):** Cards showing `Date | Time | Location | Team A vs Team B`.
* **View 2 (Live):** Highlighted card showing `LIVE | Current Score`.
* **View 3 (Past):** Cards showing `Final Score`. Clicking a card opens the **Box Score**.

### D. Box Score View
* **Trigger:** Click on a "Past" or "Live" game card.
* **Content:**
    * Header: Scoreboard.
    * Body: Table of players in that game with their individual points.

### E. Leaderboard Page
* **Data Source:** Aggregation of `score_logs`.
* **Metrics:** Top Scorers (Total Points) and PPG (Points Per Game).

---

## 5. Technical Architecture

### Frontend (Public)
* **Framework:** **React** (Vite or Next.js).
* **Language:** **TypeScript** (Strict typing for database models).
* **Styling:** **Tailwind CSS** (Configured with Tamkeen brand colors).
* **Deployment:** **Vercel** (CI/CD connected to GitHub).

### Backend & Database
* **Platform:** **Supabase**.
* **Database:** PostgreSQL.
* **Auth:** Supabase Auth (Email/Password) for Admin access.
* **Realtime:** Supabase Realtime enabled on `score_logs` for live updates.

---

## 6. Database Schema

The system uses a **Ledger-based scoring system** (`score_logs`) rather than updating a static number. This ensures an audit trail and allows for easy error correction.

### Table 1: `teams`
*General team metadata.*
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `int8` | Primary Key (PK) |
| `name` | `text` | Team Name |
| `wins` | `int4` | Default 0 |
| `losses` | `int4` | Default 0 |

### Table 2: `players`
*Roster information.*
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `int8` | PK |
| `team_id` | `int8` | FK linking to `teams.id` |
| `name` | `text` | Player Name |
| `jersey_number` | `int4` | Jersey Number |

### Table 3: `games`
*Schedule and game metadata.*
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `int8` | PK |
| `home_team_id` | `int8` | FK linking to `teams.id` |
| `away_team_id` | `int8` | FK linking to `teams.id` |
| `start_time` | `timestamptz` | Date and Time (UTC) |
| `location` | `text` | e.g., "Court 1", "Main Gym" |
| `status` | `text` | Enum: `'scheduled'`, `'live'`, `'final'` |

### Table 4: `score_logs` (The Ledger)
*Every point scored is recorded here.*
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `int8` | PK |
| `game_id` | `int8` | FK linking to `games.id` |
| `player_id` | `int8` | FK linking to `players.id` |
| `team_id` | `int8` | FK linking to `teams.id` |
| `points` | `int4` | Value of shot (1, 2, or 3) |
| `created_at` | `timestamptz` | Timestamp of the score (Default `now`) |

---

## 7. Business Logic & Calculation

### Live Score Calculation
Instead of storing a "Score" column, the score is calculated on the fly:
* **Home Team Score:** `SUM(points)` from `score_logs` where `game_id` = X and `team_id` = HomeID.
* **Away Team Score:** `SUM(points)` from `score_logs` where `game_id` = X and `team_id` = AwayID.

### Undo Functionality (Admin)
* To undo a mistake, the Admin Dashboard finds the most recent entry in `score_logs` for that specific game and performs a `DELETE` operation. The score recalculates automatically.
