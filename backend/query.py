from sqlalchemy import create_engine
import pandas as pd
engine = create_engine("postgresql://realestate_user:realestate_pass@localhost:15432/realestate")
df = pd.read_sql("SELECT state, COUNT(*) FROM suburbs_ui_v3 GROUP BY state", engine)
print(df)
