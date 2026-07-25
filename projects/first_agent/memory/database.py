import sqlite3

connection = sqlite3.connect("company.db")

cursor = connection.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS conversations (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    agent TEXT,

    role TEXT,

    message TEXT
)
""")

connection.commit()
# connection.close()


def save_conversation(agent_name, role, message):
    cursor.execute("INSERT INTO conversations (agent, role, message) VALUES (?, ?, ?)", (agent_name, role, message))
    connection.commit()


def get_conversation():
    cursor.execute("SELECT * FROM conversations")
    return cursor.fetchall()


def clear_conversation():
    cursor.execute("DELETE FROM conversations")
    connection.commit()