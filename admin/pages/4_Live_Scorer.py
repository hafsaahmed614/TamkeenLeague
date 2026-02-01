import streamlit as st
from datetime import datetime
import sys
sys.path.append("..")

from config.supabase import get_supabase_client

st.set_page_config(page_title="Live Scorer - Tamkeen Admin", page_icon="🏀", layout="wide")

st.title("Live Scorer")
st.divider()

# Initialize Supabase client
try:
    supabase = get_supabase_client()
    connected = True
except ValueError as e:
    st.error(str(e))
    connected = False

if connected:
    @st.cache_data(ttl=30)
    def fetch_live_games():
        response = supabase.table("games").select(
            "*, home_team:home_team_id(id, name), away_team:away_team_id(id, name)"
        ).eq("status", "live").execute()
        return response.data

    @st.cache_data(ttl=30)
    def fetch_scheduled_games():
        response = supabase.table("games").select(
            "*, home_team:home_team_id(id, name), away_team:away_team_id(id, name)"
        ).eq("status", "scheduled").order("start_time").execute()
        return response.data

    def fetch_players_for_team(team_id):
        response = supabase.table("players").select("*").eq("team_id", team_id).order("jersey_number").execute()
        return response.data

    def fetch_game_score(game_id, team_id):
        response = supabase.table("score_logs").select("points").eq("game_id", game_id).eq("team_id", team_id).execute()
        return sum(log['points'] for log in response.data) if response.data else 0

    def fetch_recent_scores(game_id, limit=10):
        response = supabase.table("score_logs").select(
            "*, players(name, jersey_number), teams(name)"
        ).eq("game_id", game_id).order("created_at", desc=True).limit(limit).execute()
        return response.data

    live_games = fetch_live_games()
    scheduled_games = fetch_scheduled_games()

    # Start a game section
    if scheduled_games:
        st.subheader("Start a Game")
        game_options = {}
        for game in scheduled_games:
            home = game['home_team']['name']
            away = game['away_team']['name']
            start_time = datetime.fromisoformat(game['start_time'].replace('Z', '+00:00'))
            label = f"{home} vs {away} - {start_time.strftime('%b %d, %I:%M %p')}"
            game_options[label] = game['id']

        selected_game = st.selectbox("Select game to start", options=list(game_options.keys()))

        if st.button("Start Game", use_container_width=True):
            try:
                supabase.table("games").update({"status": "live"}).eq("id", game_options[selected_game]).execute()
                st.success("Game started!")
                st.cache_data.clear()
                st.rerun()
            except Exception as e:
                st.error(f"Error starting game: {e}")

        st.divider()

    # Live scoring section
    if live_games:
        st.subheader("Active Games")

        # Game selector if multiple live games
        if len(live_games) > 1:
            game_labels = {}
            for game in live_games:
                label = f"{game['home_team']['name']} vs {game['away_team']['name']}"
                game_labels[label] = game
            selected_label = st.selectbox("Select active game", options=list(game_labels.keys()))
            current_game = game_labels[selected_label]
        else:
            current_game = live_games[0]

        home_team = current_game['home_team']
        away_team = current_game['away_team']
        game_id = current_game['id']

        # Fetch current scores
        home_score = fetch_game_score(game_id, home_team['id'])
        away_score = fetch_game_score(game_id, away_team['id'])

        # Scoreboard display
        st.markdown("### Scoreboard")
        score_col1, score_col2, score_col3 = st.columns([2, 1, 2])

        with score_col1:
            st.markdown(f"<h2 style='text-align: center;'>{home_team['name']}</h2>", unsafe_allow_html=True)
            st.markdown(f"<h1 style='text-align: center; color: #8B0000;'>{home_score}</h1>", unsafe_allow_html=True)

        with score_col2:
            st.markdown("<h2 style='text-align: center;'>VS</h2>", unsafe_allow_html=True)

        with score_col3:
            st.markdown(f"<h2 style='text-align: center;'>{away_team['name']}</h2>", unsafe_allow_html=True)
            st.markdown(f"<h1 style='text-align: center; color: #8B0000;'>{away_score}</h1>", unsafe_allow_html=True)

        st.divider()

        # Scoring buttons for each team
        st.markdown("### Log Score")

        tab1, tab2 = st.tabs([f"🏠 {home_team['name']}", f"✈️ {away_team['name']}"])

        for tab, team in [(tab1, home_team), (tab2, away_team)]:
            with tab:
                players = fetch_players_for_team(team['id'])

                if players:
                    # Create a grid of player buttons
                    st.write("Select player and point value:")

                    for player in players:
                        col1, col2, col3, col4 = st.columns([2, 1, 1, 1])

                        with col1:
                            st.write(f"**#{player['jersey_number']}** {player['name']}")

                        for col, points in [(col2, 1), (col3, 2), (col4, 3)]:
                            with col:
                                if st.button(
                                    f"+{points}",
                                    key=f"score_{team['id']}_{player['id']}_{points}",
                                    use_container_width=True
                                ):
                                    try:
                                        supabase.table("score_logs").insert({
                                            "game_id": game_id,
                                            "player_id": player['id'],
                                            "team_id": team['id'],
                                            "points": points
                                        }).execute()
                                        st.success(f"+{points} for {player['name']}!")
                                        st.cache_data.clear()
                                        st.rerun()
                                    except Exception as e:
                                        st.error(f"Error logging score: {e}")
                else:
                    st.warning(f"No players found for {team['name']}. Add players first.")

        st.divider()

        # Recent scores and undo
        st.markdown("### Recent Scores")
        recent_scores = fetch_recent_scores(game_id)

        if recent_scores:
            for score in recent_scores:
                col1, col2, col3 = st.columns([3, 1, 1])

                player = score.get('players', {})
                team = score.get('teams', {})
                player_name = player.get('name', 'Unknown') if player else 'Unknown'
                jersey = player.get('jersey_number', '?') if player else '?'
                team_name = team.get('name', 'Unknown') if team else 'Unknown'
                timestamp = datetime.fromisoformat(score['created_at'].replace('Z', '+00:00'))

                with col1:
                    st.write(f"**#{jersey} {player_name}** ({team_name}) - +{score['points']} pts")
                with col2:
                    st.write(timestamp.strftime("%I:%M:%S %p"))
                with col3:
                    if st.button("Undo", key=f"undo_{score['id']}"):
                        try:
                            supabase.table("score_logs").delete().eq("id", score['id']).execute()
                            st.success("Score removed!")
                            st.cache_data.clear()
                            st.rerun()
                        except Exception as e:
                            st.error(f"Error removing score: {e}")
        else:
            st.info("No scores logged yet for this game.")

        st.divider()

        # End game button
        st.markdown("### Game Controls")
        col1, col2 = st.columns(2)

        with col1:
            if st.button("End Game (Mark as Final)", use_container_width=True, type="primary"):
                try:
                    # Update game status
                    supabase.table("games").update({"status": "final"}).eq("id", game_id).execute()

                    # Update team records
                    if home_score > away_score:
                        supabase.rpc("increment_wins", {"team_id": home_team['id']}).execute()
                        supabase.rpc("increment_losses", {"team_id": away_team['id']}).execute()
                    elif away_score > home_score:
                        supabase.rpc("increment_wins", {"team_id": away_team['id']}).execute()
                        supabase.rpc("increment_losses", {"team_id": home_team['id']}).execute()
                    # Tie: no record changes

                    st.success("Game ended!")
                    st.cache_data.clear()
                    st.rerun()
                except Exception as e:
                    # If RPC fails, try direct update
                    try:
                        if home_score > away_score:
                            home_wins = supabase.table("teams").select("wins").eq("id", home_team['id']).execute().data[0]['wins']
                            away_losses = supabase.table("teams").select("losses").eq("id", away_team['id']).execute().data[0]['losses']
                            supabase.table("teams").update({"wins": home_wins + 1}).eq("id", home_team['id']).execute()
                            supabase.table("teams").update({"losses": away_losses + 1}).eq("id", away_team['id']).execute()
                        elif away_score > home_score:
                            away_wins = supabase.table("teams").select("wins").eq("id", away_team['id']).execute().data[0]['wins']
                            home_losses = supabase.table("teams").select("losses").eq("id", home_team['id']).execute().data[0]['losses']
                            supabase.table("teams").update({"wins": away_wins + 1}).eq("id", away_team['id']).execute()
                            supabase.table("teams").update({"losses": home_losses + 1}).eq("id", home_team['id']).execute()

                        st.success("Game ended!")
                        st.cache_data.clear()
                        st.rerun()
                    except Exception as e2:
                        st.error(f"Error ending game: {e2}")

        with col2:
            if st.button("Refresh Scores", use_container_width=True):
                st.cache_data.clear()
                st.rerun()

    elif not scheduled_games:
        st.info("No games available. Create games in the Schedule page first.")
    else:
        st.info("No live games at the moment. Start a game from the options above.")
else:
    st.warning("Please configure your Supabase credentials to use the live scorer.")
