# start.ps1

# Activate virtual environment
.\env\Scripts\activate

# Start FastAPI server
uvicorn main:app --reload --host 0.0.0.0 --port 8080
