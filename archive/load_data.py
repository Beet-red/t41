import pandas as pd
import psycopg2
from psycopg2 import Error
from io import StringIO
import sys

# -------------------------------------------------------------------
# TODO: UPDATE YOUR DATABASE CREDENTIALS
# -------------------------------------------------------------------
DB_PARAMS = {
    'dbname': 'ecommerce_db',
    'user': 'ecommerce_user',
    'password': 'admin', # <-- UPDATE THIS
    'host': 'localhost',
    'port': '5432'
}

# -------------------------------------------------------------------
# Configuration
# -------------------------------------------------------------------

# Maps table names to their corresponding CSV files
CSV_FILE_MAP = {
    'distribution_centers': 'distribution_centers.csv',
    'users': 'users.csv',
    'products': 'products.csv',
    'inventory_items': 'inventory_items.csv',
    'orders': 'orders.csv',
    'order_items': 'order_items.csv'
}

# The order to load tables to respect foreign key constraints
TABLE_LOAD_ORDER = [
    'distribution_centers',
    'users',
    'products',
    'inventory_items',
    'orders',
    'order_items'
]

def load_table(conn, table_name, file_path):
    """
    Loads data from a CSV file into a specified table
    using the efficient `copy_from` method.
    """
    print(f"Loading data into {table_name} from {file_path}...")
    cursor = None
    try:
        # Read CSV into a pandas DataFrame
        df = pd.read_csv(file_path)
        
        # Create an in-memory buffer
        buffer = StringIO()
        
        # Write dataframe to buffer as CSV, without index or header
        # na_rep='' ensures that (Pandas) NaN values become (SQL) NULL
        df.to_csv(buffer, index=False, header=False, na_rep='')
        buffer.seek(0) # Rewind buffer to the beginning
        
        cursor = conn.cursor()
        
        # Use copy_from to bulk-load the data
        # null='' tells PostgreSQL to treat the empty strings as NULL
        cursor.copy_from(buffer, table_name, sep=',', null='')
        
        conn.commit()
        print(f"✅ Successfully loaded {table_name}.")
        
    except (Exception, Error) as e:
        print(f"❌ Error loading {table_name}: {e}", file=sys.stderr)
        if conn:
            conn.rollback() # Roll back transaction on error
        return False
    finally:
        if cursor:
            cursor.close()
    return True

def main():
    """
    Main function to connect, truncate tables, and load data.
    """
    conn = None
    try:
        # --- 1. Connect to the database ---
        print("Connecting to the PostgreSQL database...")
        conn = psycopg2.connect(**DB_PARAMS)
        print("Connection successful.")
        
        # --- 2. Truncate tables (in reverse order of dependencies) ---
        # This makes the script re-runnable
        print("Clearing existing data from tables...")
        cursor = conn.cursor()
        
        # We use RESTART IDENTITY CASCADE to reset any auto-incrementing keys
        # and automatically clear dependent tables.
        all_tables = ", ".join(TABLE_LOAD_ORDER)
        cursor.execute(f"TRUNCATE TABLE {all_tables} RESTART IDENTITY CASCADE;")
        
        print("All tables truncated.")
        conn.commit()
        cursor.close()

        # --- 3. Load tables in the correct order ---
        for table_name in TABLE_LOAD_ORDER:
            file_path = CSV_FILE_MAP[table_name]
            if not load_table(conn, table_name, file_path):
                # If loading fails for one table, stop the script
                print("Stopping script due to loading error.")
                break
        
        print("\nData loading process finished.")

    except (Exception, Error) as e:
        print(f"❌ Database error: {e}", file=sys.stderr)
    finally:
        if conn:
            conn.close()
            print("Database connection closed.")

if __name__ == "__main__":
    main()