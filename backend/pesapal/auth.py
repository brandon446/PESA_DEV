from fastapi import APIRouter
import httpx
from .config import get_settings  

# router instance for auth-related routes
router = APIRouter()

@router.get("/token")
def get_pesapal_token():
    """
    Fetches an access token from Pesapal using credentials
    loaded from the environment via config.py.
    """
    settings = get_settings()  # Loading environment variables

    headers = {
        "Accept": "application/json",
        "Content-Type": "application/json"
    }

    payload = {
        "consumer_key": settings.CONSUMER_KEY,
        "consumer_secret": settings.CONSUMER_SECRET
    }

    try:
        # POST request to Pesapal to retrieve token
        response = httpx.post(settings.AUTH_URL, json=payload, headers=headers)
        response.raise_for_status()
        return response.json()
    except httpx.HTTPStatusError as e:
        return {
            "error": str(e),
            "message": "Failed to retrieve token from Pesapal"
        }
