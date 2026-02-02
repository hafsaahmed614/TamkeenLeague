import streamlit as st

# Page configuration
st.set_page_config(
    page_title="Tamkeen League Admin",
    page_icon="🏀",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for Tamkeen branding with mobile responsiveness
st.markdown("""
<style>
    .title-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        text-align: center;
    }
    .main-title {
        color: #8B0000;
        font-size: 48px;
        font-weight: bold;
        text-align: center;
        margin: 0;
        line-height: 1.2;
    }
    .sub-title {
        color: #888;
        text-align: center;
        font-size: 18px;
        margin-top: 8px;
    }
    .stButton > button {
        background-color: #8B0000;
        color: white;
    }
    .stButton > button:hover {
        background-color: #660000;
        color: white;
    }

    /* Desktop styles */
    @media (min-width: 768px) {
        .main-title {
            font-size: 72px;
        }
        .sub-title {
            font-size: 24px;
        }
    }
</style>
""", unsafe_allow_html=True)

# Main content
st.markdown('''
<div class="title-container">
    <h1 class="main-title">Tamkeen Sports League</h1>
    <p class="sub-title">Admin Dashboard</p>
</div>
''', unsafe_allow_html=True)

st.divider()

# Navigation cards
col1, col2 = st.columns(2)

with col1:
    st.markdown("### Teams")
    st.write("Create and manage league teams")
    if st.button("Manage Teams", key="nav_teams", use_container_width=True):
        st.switch_page("pages/1_Teams.py")

    st.markdown("### Schedule")
    st.write("Create game slots and manage the season calendar")
    if st.button("Manage Schedule", key="nav_schedule", use_container_width=True):
        st.switch_page("pages/3_Schedule.py")

with col2:
    st.markdown("### Players")
    st.write("Manage team rosters and player information")
    if st.button("Manage Players", key="nav_players", use_container_width=True):
        st.switch_page("pages/2_Players.py")

    st.markdown("### Live Scorer")
    st.write("Record points during live games")
    if st.button("Open Live Scorer", key="nav_scorer", use_container_width=True):
        st.switch_page("pages/4_Live_Scorer.py")

st.divider()

# Rankings section
st.markdown("### Rankings")
st.write("Preview team standings and player leaderboards")
if st.button("View Rankings", key="nav_rankings", use_container_width=True):
    st.switch_page("pages/5_Rankings.py")

