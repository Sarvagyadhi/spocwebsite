# database_setup.py - Database initialization script
from app import app, db, User, MasterTableState, MasterTableDistrict, MasterTableBlocks, MasterTableGramPanchayat, MasterTableVillage
from werkzeug.security import generate_password_hash
from datetime import datetime

def create_sample_data():
    """Create sample data for testing"""
    
    # Create superadmin user
    superadmin = User(
        username='superadmin',
        email='superadmin@dehradunconnect.com',
        password_hash=generate_password_hash('admin123'),
        role='superadmin',
        status='active',
        createdBy=1,
        createdOn=datetime.utcnow()
    )
    db.session.add(superadmin)
    
    # Create state
    uttarakhand = MasterTableState(
        stateName='Uttarakhand',
        status='active',
        createdBy=1,
        createdOn=datetime.utcnow()
    )
    db.session.add(uttarakhand)
    db.session.commit()
    
    # Create district
    dehradun = MasterTableDistrict(
        state_id=uttarakhand.id,
        districtName='Dehradun',
        status='active',
        createdBy=1,
        createdOn=datetime.utcnow()
    )
    db.session.add(dehradun)
    db.session.commit()
    
    # Create blocks
    blocks_data = ['Doiwala', 'Raipur', 'Sahaspur', 'Vikasnagar']
    blocks = []
    for block_name in blocks_data:
        block = MasterTableBlocks(
            district_id=dehradun.id,
            blockName=block_name,
            status='active',
            createdBy=1,
            createdOn=datetime.utcnow()
        )
        db.session.add(block)
        blocks.append(block)
    
    db.session.commit()
    
    # Create gram panchayats and villages
    gram_panchayats_data = [
        {'name': 'Doiwala GP', 'block_idx': 0, 'villages': ['Doiwala', 'Harrawala', 'Kandoli']},
        {'name': 'Raipur GP', 'block_idx': 1, 'villages': ['Raipur', 'Mothrowala', 'Dhanaulti']},
        {'name': 'Sahaspur GP', 'block_idx': 2, 'villages': ['Sahaspur', 'Herbertpur', 'Selaqui']},
        {'name': 'Vikasnagar GP', 'block_idx': 3, 'villages': ['Vikasnagar', 'Dakpathar', 'Kalsi']}
    ]
    
    villages = []
    for gp_data in gram_panchayats_data:
        # Create gram panchayat
        gp = MasterTableGramPanchayat(
            block_id=blocks[gp_data['block_idx']].id,
            gramPancName=gp_data['name'],
            status='active',
            createdBy=1,
            createdOn=datetime.utcnow()
        )
        db.session.add(gp)
        db.session.commit()
        
        # Create villages
        for village_name in gp_data['villages']:
            village = MasterTableVillage(
                gramPanchayat_id=gp.id,
                villageName=village_name,
                populationFemale=500,  # Sample data
                populationMale=550,    # Sample data
                area=10.5,            # Sample data
                total_hospital=1,
                total_schools=2,
                status='active',
                createdBy=1,
                createdOn=datetime.utcnow()
            )
            db.session.add(village)
            villages.append(village)
    
    db.session.commit()
    
    # Create sample users for different roles
    sample_users = [
        {
            'username': 'admin1',
            'email': 'admin1@dehradunconnect.com',
            'password': 'admin123',
            'role': 'admin',
            'village_id': None
        },
        {
            'username': 'spoc_doiwala',
            'email': 'spoc1@dehradunconnect.com',
            'password': 'spoc123',
            'role': 'spoc',
            'village_id': villages[0].id  # Doiwala village
        },
        {
            'username': 'spoc_raipur',
            'email': 'spoc2@dehradunconnect.com',
            'password': 'spoc123',
            'role': 'spoc',
            'village_id': villages[3].id  # Raipur village
        },
        {
            'username': 'stakeholder1',
            'email': 'stakeholder1@dehradunconnect.com',
            'password': 'stake123',
            'role': 'stakeholder',
            'village_id': None
        },
        {
            'username': 'stakeholder2',
            'email': 'stakeholder2@dehradunconnect.com',
            'password': 'stake123',
            'role': 'stakeholder',
            'village_id': None
        }
    ]
    
    for user_data in sample_users:
        user = User(
            username=user_data['username'],
            email=user_data['email'],
            password_hash=generate_password_hash(user_data['password']),
            role=user_data['role'],
            village_id=user_data['village_id'],
            status='active',
            createdBy=1,
            createdOn=datetime.utcnow()
        )
        db.session.add(user)
    
    db.session.commit()
    print("Sample data created successfully!")
    print("\nDefault Login Credentials:")
    print("Superadmin: superadmin / admin123")
    print("Admin: admin1 / admin123")
    print("SPOC (Doiwala): spoc_doiwala / spoc123")
    print("SPOC (Raipur): spoc_raipur / spoc123")
    print("Stakeholder: stakeholder1 / stake123")

def reset_database():
    """Reset database and create all tables"""
    print("Dropping all tables...")
    db.drop_all()
    print("Creating all tables...")
    db.create_all()
    print("Tables created successfully!")

if __name__ == '__main__':
    with app.app_context():
        choice = input("Do you want to reset the database? (y/N): ").lower()
        if choice == 'y':
            reset_database()
        
        choice = input("Do you want to create sample data? (y/N): ").lower()
        if choice == 'y':
            create_sample_data()
        else:
            print("Database setup completed without sample data.")