from sqlalchemy import create_engine
import pandas as pd
engine = create_engine("postgresql://realestate_user:realestate_pass@localhost:15432/realestate")
df = pd.read_sql("SELECT * FROM suburbs_ui_v3 LIMIT 1", engine)
print(df.columns.tolist())
