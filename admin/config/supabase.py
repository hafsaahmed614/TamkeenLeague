import os
import streamlit as st
from supabase import create_client, Client

def get_supabase_client() -> Client:
    """
    Create and return a Supabase client instance.

    Tries Streamlit secrets first (for Streamlit Cloud deployment),
    then falls back to environment variables (for local development).
    """
    # Try Streamlit secrets first (Streamlit Cloud)
    try:
        url = st.secrets["SUPABASE_URL"]
        key = st.secrets["SUPABASE_KEY"]
        return create_client(url, key)
    except (KeyError, FileNotFoundError):
        pass

    # Fall back to environment variables (local development)
    from dotenv import load_dotenv
    load_dotenv()

    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY")

    if not url or not key:
        raise ValueError(
            "Missing Supabase credentials. "
            "Add them to Streamlit secrets (deployed) or .env file (local)."
        )
    return create_client(url, key)
