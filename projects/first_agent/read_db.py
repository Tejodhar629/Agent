import sqlite3

conn = sqlite3.connect("company.db")
cursor = conn.cursor()
try:
    cursor.execute("SELECT * FROM conversations")
    rows = cursor.fetchall()
    with open("db_logs.txt", "w", encoding="utf-8") as f:
        for row in rows:
            f.write(f"ID: {row[0]}, Agent: {row[1]}, Role: {row[2]}, Message: {row[3][:200]}...\n")
except Exception as e:
    with open("db_logs.txt", "w", encoding="utf-8") as f:
        f.write(f"Error: {e}\n")
conn.close()
