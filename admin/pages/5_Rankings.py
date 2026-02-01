import streamlit as st
import sys
sys.path.append("..")

from config.supabase import get_supabase_client

st.set_page_config(page_title="Rankings - Tamkeen Admin", page_icon="🏀", layout="wide")

st.title("Rankings")
st.write("Preview of rankings as they will appear on the public React app")
st.divider()

# Initialize Supabase client
try:
    supabase = get_supabase_client()
    connected = True
except ValueError as e:
    st.error(str(e))
    connected = False

if connected:
    @st.cache_data(ttl=60)
    def fetch_teams():
        response = supabase.table("teams").select("*").execute()
        return response.data

    @st.cache_data(ttl=60)
    def fetch_score_logs():
        response = supabase.table("score_logs").select("*").execute()
        return response.data

    @st.cache_data(ttl=60)
    def fetch_games():
        response = supabase.table("games").select("*").eq("status", "final").execute()
        return response.data

    teams = fetch_teams()
    score_logs = fetch_score_logs()
    games = fetch_games()

    # ==========================================
    # TEAM STANDINGS
    # ==========================================
    st.subheader("Team Standings")

    if teams:
        # Calculate Points For (PF) and Points Against (PA) for each team
        team_stats = {}
        for team in teams:
            team_name = team['name']
            team_stats[team_name] = {
                'name': team_name,
                'wins': team['wins'],
                'losses': team['losses'],
                'pf': 0,  # Points For
                'pa': 0,  # Points Against
            }

        # Calculate PF from score_logs
        for log in score_logs:
            team_name = log['team_name']
            if team_name in team_stats:
                team_stats[team_name]['pf'] += log['points']

        # Calculate PA (points scored against each team in their games)
        for game in games:
            home_team = game['home_team_name']
            away_team = game['away_team_name']
            game_id = game['id']

            # Get scores for this game
            home_pts = sum(log['points'] for log in score_logs if log['game_id'] == game_id and log['team_name'] == home_team)
            away_pts = sum(log['points'] for log in score_logs if log['game_id'] == game_id and log['team_name'] == away_team)

            # Home team's PA is away team's score
            if home_team in team_stats:
                team_stats[home_team]['pa'] += away_pts
            # Away team's PA is home team's score
            if away_team in team_stats:
                team_stats[away_team]['pa'] += home_pts

        # Sort teams by wins (desc), then point differential (desc)
        sorted_teams = sorted(
            team_stats.values(),
            key=lambda x: (x['wins'], x['pf'] - x['pa']),
            reverse=True
        )

        # Display standings table
        st.markdown("| Rank | Team | W | L | PF | PA | Diff |")
        st.markdown("|------|------|---|---|----|----|------|")

        for rank, team in enumerate(sorted_teams, 1):
            diff = team['pf'] - team['pa']
            diff_str = f"+{diff}" if diff > 0 else str(diff)
            st.markdown(f"| {rank} | **{team['name']}** | {team['wins']} | {team['losses']} | {team['pf']} | {team['pa']} | {diff_str} |")

    else:
        st.info("No teams found. Add teams to see standings.")

    st.divider()

    # ==========================================
    # PLAYER LEADERBOARD
    # ==========================================
    st.subheader("Player Leaderboard")

    if score_logs:
        # Aggregate player stats
        player_stats = {}
        for log in score_logs:
            player_name = log['player_name']
            team_name = log['team_name']
            key = f"{player_name}|{team_name}"

            if key not in player_stats:
                player_stats[key] = {
                    'name': player_name,
                    'team': team_name,
                    'total_points': 0,
                    'games': set()
                }

            player_stats[key]['total_points'] += log['points']
            player_stats[key]['games'].add(log['game_id'])

        # Calculate PPG and sort by total points
        for key in player_stats:
            games_played = len(player_stats[key]['games'])
            player_stats[key]['games_played'] = games_played
            player_stats[key]['ppg'] = round(player_stats[key]['total_points'] / games_played, 1) if games_played > 0 else 0

        sorted_players = sorted(
            player_stats.values(),
            key=lambda x: x['total_points'],
            reverse=True
        )[:15]  # Top 15 scorers

        # Display leaderboard
        st.markdown("**Top Scorers**")
        st.markdown("| Rank | Player | Team | GP | PTS | PPG |")
        st.markdown("|------|--------|------|----|-----|-----|")

        for rank, player in enumerate(sorted_players, 1):
            st.markdown(f"| {rank} | **{player['name']}** | {player['team']} | {player['games_played']} | {player['total_points']} | {player['ppg']} |")

    else:
        st.info("No scoring data yet. Play some games to see the leaderboard.")

    st.divider()

    # Refresh button
    if st.button("Refresh Rankings", use_container_width=True):
        st.cache_data.clear()
        st.rerun()

else:
    st.warning("Please configure your Supabase credentials to view rankings.")
