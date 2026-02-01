import streamlit as st
from datetime import datetime, time
import sys
sys.path.append("..")

from config.supabase import get_supabase_client

st.set_page_config(page_title="Schedule - Tamkeen Admin", page_icon="🏀", layout="wide")

st.title("Schedule Management")
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
        response = supabase.table("teams").select("id, name").order("name").execute()
        return response.data

    @st.cache_data(ttl=60)
    def fetch_games():
        response = supabase.table("games").select(
            "*, home_team:home_team_id(name), away_team:away_team_id(name)"
        ).order("start_time", desc=True).execute()
        return response.data

    teams = fetch_teams()

    if len(teams) < 2:
        st.warning("You need at least 2 teams to create a game. Please add more teams first.")
    else:
        team_options = {team['name']: team['id'] for team in teams}
        team_id_to_name = {team['id']: team['name'] for team in teams}

        # Add new game section
        st.subheader("Schedule New Game")
        with st.form("add_game_form"):
            col1, col2 = st.columns(2)

            with col1:
                home_team = st.selectbox("Home Team", options=list(team_options.keys()))
                game_date = st.date_input("Game Date", value=datetime.now())
                location = st.text_input("Location", placeholder="e.g., Main Gym, Court 1")

            with col2:
                away_options = [t for t in team_options.keys() if t != home_team]
                away_team = st.selectbox("Away Team", options=away_options if away_options else ["Select home team first"])
                game_time = st.time_input("Game Time", value=time(18, 0))

            submitted = st.form_submit_button("Create Game", use_container_width=True)

            if submitted and home_team and away_team and location:
                if home_team == away_team:
                    st.error("Home and away teams must be different!")
                else:
                    try:
                        # Combine date and time
                        start_datetime = datetime.combine(game_date, game_time)

                        supabase.table("games").insert({
                            "home_team_id": team_options[home_team],
                            "away_team_id": team_options[away_team],
                            "start_time": start_datetime.isoformat(),
                            "location": location,
                            "status": "scheduled"
                        }).execute()
                        st.success(f"Game scheduled: {home_team} vs {away_team}")
                        st.cache_data.clear()
                        st.rerun()
                    except Exception as e:
                        st.error(f"Error creating game: {e}")

        st.divider()

        # Display games
        st.subheader("All Games")

        # Filter by status
        status_filter = st.selectbox(
            "Filter by Status",
            options=["All", "Scheduled", "Live", "Final"],
            key="status_filter"
        )

        games = fetch_games()

        # Apply filter
        if status_filter != "All":
            games = [g for g in games if g['status'] == status_filter.lower()]

        if games:
            for game in games:
                home_name = game['home_team']['name'] if game['home_team'] else "Unknown"
                away_name = game['away_team']['name'] if game['away_team'] else "Unknown"

                # Parse start time
                start_time = datetime.fromisoformat(game['start_time'].replace('Z', '+00:00'))
                date_str = start_time.strftime("%b %d, %Y")
                time_str = start_time.strftime("%I:%M %p")

                # Status badge
                status = game['status']
                if status == 'live':
                    status_badge = "🔴 LIVE"
                elif status == 'final':
                    status_badge = "✅ Final"
                else:
                    status_badge = "📅 Scheduled"

                with st.container():
                    col1, col2, col3, col4, col5 = st.columns([2, 2, 2, 1, 1])

                    with col1:
                        st.markdown(f"**{home_name}** vs **{away_name}**")
                    with col2:
                        st.write(f"{date_str} at {time_str}")
                    with col3:
                        st.write(f"📍 {game['location']}")
                    with col4:
                        st.write(status_badge)
                    with col5:
                        # Status change dropdown
                        if st.button("Edit", key=f"edit_game_{game['id']}"):
                            st.session_state[f"editing_game_{game['id']}"] = True

                # Edit form
                if st.session_state.get(f"editing_game_{game['id']}", False):
                    with st.form(f"edit_game_form_{game['id']}"):
                        edit_col1, edit_col2, edit_col3 = st.columns(3)

                        with edit_col1:
                            new_status = st.selectbox(
                                "Status",
                                options=["scheduled", "live", "final"],
                                index=["scheduled", "live", "final"].index(game['status'])
                            )
                        with edit_col2:
                            new_location = st.text_input("Location", value=game['location'])
                        with edit_col3:
                            new_date = st.date_input("Date", value=start_time.date())
                            new_time = st.time_input("Time", value=start_time.time())

                        btn_col1, btn_col2, btn_col3 = st.columns(3)
                        with btn_col1:
                            if st.form_submit_button("Save", use_container_width=True):
                                try:
                                    new_datetime = datetime.combine(new_date, new_time)
                                    supabase.table("games").update({
                                        "status": new_status,
                                        "location": new_location,
                                        "start_time": new_datetime.isoformat()
                                    }).eq("id", game['id']).execute()
                                    st.success("Game updated!")
                                    st.session_state[f"editing_game_{game['id']}"] = False
                                    st.cache_data.clear()
                                    st.rerun()
                                except Exception as e:
                                    st.error(f"Error updating game: {e}")
                        with btn_col2:
                            if st.form_submit_button("Delete Game", use_container_width=True):
                                try:
                                    supabase.table("games").delete().eq("id", game['id']).execute()
                                    st.success("Game deleted!")
                                    st.session_state[f"editing_game_{game['id']}"] = False
                                    st.cache_data.clear()
                                    st.rerun()
                                except Exception as e:
                                    st.error(f"Error deleting game: {e}")
                        with btn_col3:
                            if st.form_submit_button("Cancel", use_container_width=True):
                                st.session_state[f"editing_game_{game['id']}"] = False
                                st.rerun()

                st.divider()
        else:
            st.info("No games found. Create your first game above!")
else:
    st.warning("Please configure your Supabase credentials to manage the schedule.")
