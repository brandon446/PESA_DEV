# main.py

from fastapi import FastAPI
from pesapal.auth import router as auth_router      # Auth routes
# from pesapal.orders import router as orders_router  # Orders (Submit payment)
# from pesapal.ipn import router as ipn_router        # IPN notifications (optional)

# Initialize the FastAPI app
app = FastAPI(
    title="Pesapal Integration API",
    description="API to interact with Pesapal Payment Gateway",
    version="1.0.0"
)

# Basic root route just to confirm API is running
@app.get("/")
def read_root():
    return {"message": "Welcome to Pesapal Integration API"}

# Include all routers
app.include_router(auth_router, prefix="/pesapal", tags=["Auth"])
# app.include_router(orders_router, prefix="/pesapal", tags=["Orders"])
# app.include_router(ipn_router, prefix="/pesapal", tags=["IPN"])
