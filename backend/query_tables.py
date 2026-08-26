from sqlalchemy import create_engine
import pandas as pd
engine = create_engine("postgresql://realestate_user:realestate_pass@localhost:15432/realestate")
df = pd.read_sql("SELECT table_name FROM information_schema.tables WHERE table_schema='public'", engine)
print(df)
