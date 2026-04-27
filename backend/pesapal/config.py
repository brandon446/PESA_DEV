from dotenv import load_dotenv
import os
from pydantic_settings import BaseSettings
from functools import lru_cache

# Load .env file variables into environment
load_dotenv()

class Settings(BaseSettings):
    CONSUMER_KEY: str
    CONSUMER_SECRET: str
    AUTH_URL: str = "https://cybqa.pesapal.com/pesapalv3/api/Auth/RequestToken"

    class Config:
        env_file = ".env"


# function to use settings in other modules
def get_settings():
    return Settings()
