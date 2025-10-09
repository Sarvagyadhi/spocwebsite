# debug_users.py - Check what users exist in the database
from app import app, db, UserMaster, RoleMaster

def check_users():
    with app.app_context():
        print("=== CHECKING DATABASE USERS ===")
        
        # Check roles
        roles = RoleMaster.query.all()
        print("\n📋 ROLES IN DATABASE:")
        for role in roles:
            print(f"ID: {role.id}, Name: {role.role_name}, Desc: {role.role_description}")
        
        # Check users
        users = UserMaster.query.all()
        print("\n👥 USERS IN DATABASE:")
        for user in users:
            role_name = user.role.role_name if user.role else 'No Role'
            print(f"ID: {user.id}, Username: {user.username}, Role: {role_name}, Email: {user.email}")
            
        # Check specific demo users
        print("\n🔍 CHECKING DEMO USERS:")
        demo_users = ['admin', 'spoc_doiwala', 'stakeholder1']
        for username in demo_users:
            user = UserMaster.query.filter_by(username=username).first()
            if user:
                print(f"✅ {username}: FOUND - Role: {user.role.role_name if user.role else 'No Role'}")
            else:
                print(f"❌ {username}: NOT FOUND")

if __name__ == '__main__':
    check_users()