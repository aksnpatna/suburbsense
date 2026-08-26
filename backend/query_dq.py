from sqlalchemy import create_engine
import pandas as pd
engine = create_engine("postgresql://realestate_user:realestate_pass@localhost:15432/realestate")
df = pd.read_sql("SELECT state, COUNT(*) FROM suburbs_ui_v3 WHERE (dq_score >= 90 OR dq_score IS NULL) AND coordinates IS NOT NULL GROUP BY state", engine)
print("With DQ filter:")
print(df)
df2 = pd.read_sql("SELECT state, COUNT(*) FROM suburbs_ui_v3 WHERE LOWER(name) LIKE 'point%' GROUP BY state", engine)
print("Point search:")
print(df2)
