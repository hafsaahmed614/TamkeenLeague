import streamlit as st
import sys
sys.path.append("..")

from config.supabase import get_supabase_client

st.set_page_config(page_title="Teams - Tamkeen Admin", page_icon="🏀", layout="wide")

st.title("Team Management")
st.divider()

# Initialize Supabase client
try:
    supabase = get_supabase_client()
    connected = True
except ValueError as e:
    st.error(str(e))
    connected = False

if connected:
    # Fetch existing teams
    @st.cache_data(ttl=60)
    def fetch_teams():
        response = supabase.table("teams").select("*").order("name").execute()
        return response.data

    # Add new team section
    st.subheader("Add New Team")
    with st.form("add_team_form"):
        new_team_name = st.text_input("Team Name")
        submitted = st.form_submit_button("Add Team", use_container_width=True)

        if submitted and new_team_name:
            try:
                supabase.table("teams").insert({"name": new_team_name}).execute()
                st.success(f"Team '{new_team_name}' added successfully!")
                st.cache_data.clear()
                st.rerun()
            except Exception as e:
                st.error(f"Error adding team: {e}")

    st.divider()

    # Display existing teams
    st.subheader("Existing Teams")

    teams = fetch_teams()

    if teams:
        for team in teams:
            with st.container():
                col1, col2, col3, col4, col5 = st.columns([3, 1, 1, 1, 1])

                with col1:
                    st.markdown(f"**{team['name']}**")
                with col2:
                    st.metric("Wins", team['wins'])
                with col3:
                    st.metric("Losses", team['losses'])
                with col4:
                    # Edit button
                    if st.button("Edit", key=f"edit_{team['id']}"):
                        st.session_state[f"editing_{team['id']}"] = True
                with col5:
                    # Delete button
                    if st.button("Delete", key=f"delete_{team['id']}"):
                        try:
                            supabase.table("teams").delete().eq("id", team['id']).execute()
                            st.success(f"Team '{team['name']}' deleted!")
                            st.cache_data.clear()
                            st.rerun()
                        except Exception as e:
                            st.error(f"Error deleting team: {e}")

                # Edit form (shown when edit button is clicked)
                if st.session_state.get(f"editing_{team['id']}", False):
                    with st.form(f"edit_form_{team['id']}"):
                        new_name = st.text_input("New Team Name", value=team['name'])
                        col_save, col_cancel = st.columns(2)
                        with col_save:
                            if st.form_submit_button("Save", use_container_width=True):
                                try:
                                    supabase.table("teams").update({"name": new_name}).eq("id", team['id']).execute()
                                    st.success("Team updated!")
                                    st.session_state[f"editing_{team['id']}"] = False
                                    st.cache_data.clear()
                                    st.rerun()
                                except Exception as e:
                                    st.error(f"Error updating team: {e}")
                        with col_cancel:
                            if st.form_submit_button("Cancel", use_container_width=True):
                                st.session_state[f"editing_{team['id']}"] = False
                                st.rerun()

                st.divider()
    else:
        st.info("No teams found. Add your first team above!")
else:
    st.warning("Please configure your Supabase credentials to manage teams.")
