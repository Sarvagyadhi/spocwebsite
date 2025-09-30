import psycopg2

# PostgreSQL connection parameters
DB_NAME = "dehradun_connect"
DB_USER = "dehradun_user"
DB_PASSWORD = "sarvagya"
DB_HOST = "localhost"
DB_PORT = "5432"

try:
    # Connect to PostgreSQL
    conn = psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT
    )
    
    print("✅ Connection successful!")
    
    # Optional: create a cursor and execute a test query
    cur = conn.cursor()
    cur.execute("SELECT version();")
    version = cur.fetchone()
    print("PostgreSQL version:", version[0])
    
    cur.close()
    conn.close()

except Exception as e:
    print("❌ Connection failed:", e)
