# app/models.py

# Hardcoded users for demo purposes (to replace with database later)
fake_users_db = {
    "admin": {
        "username": "admin",
        "password": "admin123",  # plaintext for demo (still not secure!)
        "role": "admin"
    },
    "finance": {
        "username": "finance",
        "password": "finance123",
        "role": "finance"
    }
}
