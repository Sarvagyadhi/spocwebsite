# database_setup.py - Updated with admin role only
from app import app, db, UserMaster, RoleMaster, DocumentMaster, ComplaintType, VillagerRegistration
from app import MasterTableState, MasterTableDistrict, MasterTableBlocks, MasterTableGramPanchayat, MasterTableVillage
from werkzeug.security import generate_password_hash
from datetime import datetime

def reset_database():
    """Reset database and create all tables with CASCADE"""
    print("Dropping all tables...")
    
    # Drop all tables with CASCADE to handle foreign key constraints
    try:
        # First, drop the new tables that might have dependencies
        db.session.execute('DROP TABLE IF EXISTS user_documents CASCADE')
        db.session.execute('DROP TABLE IF EXISTS user_mapping CASCADE')
        db.session.execute('DROP TABLE IF EXISTS complaint_registration CASCADE')
        db.session.execute('DROP TABLE IF EXISTS villager_registration CASCADE')
        db.session.execute('DROP TABLE IF EXISTS user_master CASCADE')
        db.session.execute('DROP TABLE IF EXISTS role_master CASCADE')
        db.session.execute('DROP TABLE IF EXISTS document_master CASCADE')
        db.session.execute('DROP TABLE IF EXISTS complaint_type CASCADE')
        
        # Drop old tables that might still exist
        db.session.execute('DROP TABLE IF EXISTS users CASCADE')
        db.session.execute('DROP TABLE IF EXISTS villager_issues CASCADE')
        
        # Drop geographical tables in reverse order of dependencies
        db.session.execute('DROP TABLE IF EXISTS master_table_village CASCADE')
        db.session.execute('DROP TABLE IF EXISTS master_table_gram_panchayat CASCADE')
        db.session.execute('DROP TABLE IF EXISTS master_table_blocks CASCADE')
        db.session.execute('DROP TABLE IF EXISTS master_table_district CASCADE')
        db.session.execute('DROP TABLE IF EXISTS master_table_state CASCADE')
        
        db.session.commit()
        print("✅ All tables dropped successfully!")
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error dropping tables: {e}")
        # Try alternative approach
        try:
            db.reflect()
            db.drop_all()
            print("✅ Tables dropped using drop_all()")
        except Exception as e2:
            print(f"❌ Alternative approach also failed: {e2}")
            return False
    
    print("Creating all tables...")
    db.create_all()
    print("✅ Tables created successfully!")
    return True

def create_sample_data():
    """Create sample data for testing the new structure"""
    try:
        # Create roles
        roles = [
            RoleMaster(role_name='admin', role_description='System Administrator', createdBy=1),
            RoleMaster(role_name='spoc', role_description='Single Point of Contact', createdBy=1),
            RoleMaster(role_name='stakeholder', role_description='Stakeholder/Service Provider', createdBy=1),
            RoleMaster(role_name='operator', role_description='System Operator', createdBy=1),
        ]
        
        for role in roles:
            db.session.add(role)
        
        db.session.commit()
        print("✅ Roles created")
        
        # Create admin user
        admin = UserMaster(
            username='admin',
            email='admin@dehradunconnect.com',
            password_hash=generate_password_hash('admin123'),
            role_id=1,  # admin role
            createdBy=1
        )
        db.session.add(admin)
        
        # Create document types
        documents = [
            DocumentMaster(doc_name='Aadhar Card', doc_description='Aadhar Card Document', createdBy=1),
            DocumentMaster(doc_name='PAN Card', doc_description='Permanent Account Number Card', createdBy=1),
            DocumentMaster(doc_name='Voter ID Card', doc_description='Voter Identification Card', createdBy=1),
            DocumentMaster(doc_name='Driving License', doc_description='Driving License', createdBy=1),
            DocumentMaster(doc_name='Ration Card', doc_description='Ration Card', createdBy=1),
        ]
        
        for doc in documents:
            db.session.add(doc)
        
        # Create complaint types
        complaint_types = [
            ComplaintType(complaint_category='Healthcare', complaint_name='Hospital Infrastructure', priority='high', createdBy=1),
            ComplaintType(complaint_category='Healthcare', complaint_name='Medicine Shortage', priority='high', createdBy=1),
            ComplaintType(complaint_category='Infrastructure', complaint_name='Road Repair', priority='medium', createdBy=1),
            ComplaintType(complaint_category='Infrastructure', complaint_name='Water Supply', priority='high', createdBy=1),
            ComplaintType(complaint_category='Education', complaint_name='School Facilities', priority='medium', createdBy=1),
        ]
        
        for comp_type in complaint_types:
            db.session.add(comp_type)
        
        db.session.commit()
        print("✅ Documents and complaint types created")
        
        # Create geographical hierarchy
        uttarakhand = MasterTableState(
            stateName='Uttarakhand', 
            status='active',
            createdBy=1
        )
        db.session.add(uttarakhand)
        db.session.commit()
        print("✅ State created")
        
        dehradun = MasterTableDistrict(
            state_id=uttarakhand.id,
            districtName='Dehradun',
            status='active',
            createdBy=1
        )
        db.session.add(dehradun)
        db.session.commit()
        print("✅ District created")
        
        # Create blocks
        blocks_data = ['Doiwala', 'Raipur', 'Sahaspur', 'Vikasnagar']
        blocks = []
        for block_name in blocks_data:
            block = MasterTableBlocks(
                district_id=dehradun.id,
                blockName=block_name,
                status='active',
                createdBy=1
            )
            db.session.add(block)
            blocks.append(block)
        
        db.session.commit()
        print("✅ Blocks created")
        
        # Create gram panchayats
        gram_panchayats_data = [
            {'name': 'Doiwala GP', 'block_idx': 0},
            {'name': 'Raipur GP', 'block_idx': 1},
            {'name': 'Sahaspur GP', 'block_idx': 2},
            {'name': 'Vikasnagar GP', 'block_idx': 3}
        ]
        
        gram_panchayats = []
        for gp_data in gram_panchayats_data:
            gp = MasterTableGramPanchayat(
                block_id=blocks[gp_data['block_idx']].id,
                gramPancName=gp_data['name'],
                status='active',
                createdBy=1
            )
            db.session.add(gp)
            gram_panchayats.append(gp)
        
        db.session.commit()
        print("✅ Gram Panchayats created")
        
        # Create villages
        villages_data = [
            {'name': 'Doiwala Village', 'gp_idx': 0},
            {'name': 'Raipur Village', 'gp_idx': 1},
            {'name': 'Sahaspur Village', 'gp_idx': 2},
            {'name': 'Vikasnagar Village', 'gp_idx': 3}
        ]
        
        villages = []
        for village_data in villages_data:
            village = MasterTableVillage(
                gramPanchayat_id=gram_panchayats[village_data['gp_idx']].id,
                villageName=village_data['name'],
                populationFemale=500,
                populationMale=550,
                area=10.5,
                total_hospital=1,
                total_schools=2,
                status='active',
                createdBy=1
            )
            db.session.add(village)
            villages.append(village)
        
        db.session.commit()
        print("✅ Villages created")
        
        # Create sample villagers
        sample_villager = VillagerRegistration(
            villager_id='S1D1B1G1V1',
            first_name='Ramesh',
            last_name='Kumar',
            aadhar_number='123456789012',
            phone_number='9876543210',
            state_id=uttarakhand.id,
            district_id=dehradun.id,
            block_id=blocks[0].id,
            gram_panchayat_id=gram_panchayats[0].id,
            village_id=villages[0].id,
            password_hash=generate_password_hash('9876543210')
        )
        db.session.add(sample_villager)
        
        db.session.commit()
        print("✅ Sample villager created")
        
        print("✅ New database structure with sample data created successfully!")
        print("\nDefault Login Credentials:")
        print("Admin: admin / admin123")
        print("Sample Villager: 9876543210 / 9876543210 (or use villager_id: S1D1B1G1V1)")
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error creating sample data: {e}")

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