import streamlit as st

# Page configuration
st.set_page_config(
    page_title="Tamkeen League Admin",
    page_icon="🏀",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for Tamkeen branding
st.markdown("""
<style>
    .main-header {
        color: #8B0000;
        font-size: 2.5rem;
        font-weight: bold;
        text-align: center;
        margin-bottom: 1rem;
    }
    .sub-header {
        color: #333;
        text-align: center;
        margin-bottom: 2rem;
    }
    .stButton > button {
        background-color: #8B0000;
        color: white;
    }
    .stButton > button:hover {
        background-color: #660000;
        color: white;
    }
</style>
""", unsafe_allow_html=True)

# Main content
st.markdown('<p class="main-header">Tamkeen Sports League</p>', unsafe_allow_html=True)
st.markdown('<p class="sub-header">Admin Dashboard</p>', unsafe_allow_html=True)

st.divider()

# Navigation cards
col1, col2 = st.columns(2)

with col1:
    st.markdown("### Teams")
    st.write("Create and manage league teams")
    if st.button("Manage Teams", key="nav_teams", use_container_width=True):
        st.switch_page("pages/1_teams.py")

    st.markdown("### Schedule")
    st.write("Create game slots and manage the season calendar")
    if st.button("Manage Schedule", key="nav_schedule", use_container_width=True):
        st.switch_page("pages/3_schedule.py")

with col2:
    st.markdown("### Players")
    st.write("Manage team rosters and player information")
    if st.button("Manage Players", key="nav_players", use_container_width=True):
        st.switch_page("pages/2_players.py")

    st.markdown("### Live Scorer")
    st.write("Record points during live games")
    if st.button("Open Live Scorer", key="nav_scorer", use_container_width=True):
        st.switch_page("pages/4_live_scorer.py")

st.divider()

# Quick stats section
st.markdown("### Quick Stats")
st.info("Connect to Supabase to see league statistics. Set your credentials in the .env file.")
