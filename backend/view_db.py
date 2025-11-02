#!/usr/bin/env python3
"""
Simple script to view database contents
Usage: python view_db.py
"""
import sqlite3
from datetime import datetime

def view_database():
    conn = sqlite3.connect("kartsique.db")
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    print("=" * 70)
    print("Kartsique Database Contents")
    print("=" * 70)
    
    # Count users
    cursor.execute("SELECT COUNT(*) as count FROM users")
    count = cursor.fetchone()["count"]
    print(f"\nTotal Users: {count}\n")
    
    if count > 0:
        # Get all users
        cursor.execute("SELECT id, email, name, created_at FROM users ORDER BY id")
        users = cursor.fetchall()
        
        print("Users Table:")
        print("-" * 70)
        print(f"{'ID':<5} {'Email':<30} {'Name':<20} {'Created At'}")
        print("-" * 70)
        
        for user in users:
            created_at = user["created_at"]
            # Format datetime if possible
            try:
                dt = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
                created_at = dt.strftime("%Y-%m-%d %H:%M:%S")
            except:
                pass
            
            print(f"{user['id']:<5} {user['email']:<30} {user['name']:<20} {created_at}")
        
        print("-" * 70)
        
        # Show a sample of password hashes (first 20 chars only for security)
        print("\nPassword Hashes (first 20 chars):")
        print("-" * 70)
        cursor.execute("SELECT email, SUBSTR(password_hash, 1, 20) || '...' as hash_preview FROM users")
        hashes = cursor.fetchall()
        for h in hashes:
            print(f"{h['email']:<30} {h['hash_preview']}")
    
    conn.close()
    print("\n" + "=" * 70)

if __name__ == "__main__":
    view_database()

