import asyncio
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

engine = create_engine("postgresql://realestate_user:realestate_pass@localhost:15432/realestate")
Session = sessionmaker(bind=engine)
db = Session()

import app.suburbs as s
try:
    s.get_suburb_profile("perth-wa-6842", db)
except Exception as e:
    import traceback
    traceback.print_exc()
