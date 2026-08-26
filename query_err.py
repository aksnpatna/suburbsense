import re
with open('/home/aksai/.pm2/logs/suburbsense-backend-error.log', 'r') as f:
    lines = f.readlines()
    for i, line in enumerate(lines[-500:]):
        if "NoneType" in line and "int" in line:
            start = max(0, i-20)
            end = min(len(lines), i+20)
            for j in range(start, end):
                print(lines[-500:][j].strip())
            break
