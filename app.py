
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity, get_jwt
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import os

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'fallback-secret-key')
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://dehradun_user:sarvagya@localhost:5432/dehradun_connect'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)

db = SQLAlchemy(app)
jwt = JWTManager(app)
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000", "http://127.0.0.1:3000"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Database Models - Existing Master Tables (unchanged)
class MasterTableState(db.Model):
    __tablename__ = 'master_table_state'
    id = db.Column(db.Integer, primary_key=True)
    stateName = db.Column(db.String(100), nullable=False)
    status = db.Column(db.String(20), default='active')
    createdBy = db.Column(db.Integer, nullable=False)
    createdOn = db.Column(db.DateTime, default=datetime.utcnow)
    updatedBy = db.Column(db.Integer)
    updatedOn = db.Column(db.DateTime)
    
    districts = db.relationship('MasterTableDistrict', backref='state', lazy=True)

class MasterTableDistrict(db.Model):
    __tablename__ = 'master_table_district'
    id = db.Column(db.Integer, primary_key=True)
    state_id = db.Column(db.Integer, db.ForeignKey('master_table_state.id'), nullable=False)
    districtName = db.Column(db.String(100), nullable=False)
    status = db.Column(db.String(20), default='active')
    createdBy = db.Column(db.Integer, nullable=False)
    createdOn = db.Column(db.DateTime, default=datetime.utcnow)
    updatedBy = db.Column(db.Integer)
    updatedOn = db.Column(db.DateTime)
    
    blocks = db.relationship('MasterTableBlocks', backref='district', lazy=True)

class MasterTableBlocks(db.Model):
    __tablename__ = 'master_table_blocks'
    id = db.Column(db.Integer, primary_key=True)
    district_id = db.Column(db.Integer, db.ForeignKey('master_table_district.id'), nullable=False)
    blockName = db.Column(db.String(100), nullable=False)
    status = db.Column(db.String(20), default='active')
    createdBy = db.Column(db.Integer, nullable=False)
    createdOn = db.Column(db.DateTime, default=datetime.utcnow)
    updatedBy = db.Column(db.Integer)
    updatedOn = db.Column(db.DateTime)
    
    gram_panchayats = db.relationship('MasterTableGramPanchayat', backref='block', lazy=True)

class MasterTableGramPanchayat(db.Model):
    __tablename__ = 'master_table_gram_panchayat'
    id = db.Column(db.Integer, primary_key=True)
    block_id = db.Column(db.Integer, db.ForeignKey('master_table_blocks.id'), nullable=False)
    gramPancName = db.Column(db.String(100), nullable=False)
    status = db.Column(db.String(20), default='active')
    createdBy = db.Column(db.Integer, nullable=False)
    createdOn = db.Column(db.DateTime, default=datetime.utcnow)
    updatedBy = db.Column(db.Integer)
    updatedOn = db.Column(db.DateTime)
    
    villages = db.relationship('MasterTableVillage', backref='gram_panchayat', lazy=True)

class MasterTableVillage(db.Model):
    __tablename__ = 'master_table_village'
    id = db.Column(db.Integer, primary_key=True)
    gramPanchayat_id = db.Column(db.Integer, db.ForeignKey('master_table_gram_panchayat.id'), nullable=False)
    villageName = db.Column(db.String(100), nullable=False)
    populationFemale = db.Column(db.Integer)
    populationMale = db.Column(db.Integer)
    area = db.Column(db.Float)
    total_hospital = db.Column(db.Integer, default=0)
    total_schools = db.Column(db.Integer, default=0)
    status = db.Column(db.String(20), default='active')
    createdBy = db.Column(db.Integer, nullable=False)
    createdOn = db.Column(db.DateTime, default=datetime.utcnow)
    updatedBy = db.Column(db.Integer)
    updatedOn = db.Column(db.DateTime)

# NEW TABLES - With FIXED relationships

# 1. Role Master
class RoleMaster(db.Model):
    __tablename__ = 'role_master'
    id = db.Column(db.Integer, primary_key=True)
    role_name = db.Column(db.String(50), unique=True, nullable=False)
    role_description = db.Column(db.String(200))
    status = db.Column(db.String(20), default='active')
    createdBy = db.Column(db.Integer, nullable=False)
    createdOn = db.Column(db.DateTime, default=datetime.utcnow)
    updatedBy = db.Column(db.Integer)
    updatedOn = db.Column(db.DateTime)

# 2. User Master
class UserMaster(db.Model):
    __tablename__ = 'user_master'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role_id = db.Column(db.Integer, db.ForeignKey('role_master.id'), nullable=False)
    status = db.Column(db.String(20), default='active')
    createdBy = db.Column(db.Integer)
    createdOn = db.Column(db.DateTime, default=datetime.utcnow)
    updatedBy = db.Column(db.Integer)
    updatedOn = db.Column(db.DateTime)
    
    # FIXED: Simple relationship without backref conflicts
    role = db.relationship('RoleMaster', backref='users')

# 3. Document Master
class DocumentMaster(db.Model):
    __tablename__ = 'document_master'
    id = db.Column(db.Integer, primary_key=True)
    doc_name = db.Column(db.String(100), nullable=False)
    doc_description = db.Column(db.String(200))
    status = db.Column(db.String(20), default='active')
    createdBy = db.Column(db.Integer, nullable=False)
    createdOn = db.Column(db.DateTime, default=datetime.utcnow)
    updatedBy = db.Column(db.Integer)
    updatedOn = db.Column(db.DateTime)

# 4. User Documents - FIXED: No relationships to avoid conflicts
class UserDocuments(db.Model):
    __tablename__ = 'user_documents'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user_master.id'), nullable=False)
    doc_id = db.Column(db.Integer, db.ForeignKey('document_master.id'), nullable=False)
    document_number = db.Column(db.String(100), nullable=False)
    document_path = db.Column(db.String(500))
    is_verified = db.Column(db.Boolean, default=False)
    verified_by = db.Column(db.Integer, db.ForeignKey('user_master.id'))
    verified_on = db.Column(db.DateTime)
    status = db.Column(db.String(20), default='active')
    createdOn = db.Column(db.DateTime, default=datetime.utcnow)
    updatedOn = db.Column(db.DateTime)

# 5. User Mapping
class UserMapping(db.Model):
    __tablename__ = 'user_mapping'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user_master.id'), nullable=False)
    state_id = db.Column(db.Integer, db.ForeignKey('master_table_state.id'))
    district_id = db.Column(db.Integer, db.ForeignKey('master_table_district.id'))
    block_id = db.Column(db.Integer, db.ForeignKey('master_table_blocks.id'))
    gram_panchayat_id = db.Column(db.Integer, db.ForeignKey('master_table_gram_panchayat.id'))
    village_id = db.Column(db.Integer, db.ForeignKey('master_table_village.id'))
    status = db.Column(db.String(20), default='active')
    createdBy = db.Column(db.Integer, nullable=False)
    createdOn = db.Column(db.DateTime, default=datetime.utcnow)
    updatedBy = db.Column(db.Integer)
    updatedOn = db.Column(db.DateTime)

# 6. Complaint Type
class ComplaintType(db.Model):
    __tablename__ = 'complaint_type'
    id = db.Column(db.Integer, primary_key=True)
    complaint_category = db.Column(db.String(50), nullable=False)
    complaint_name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(200))
    priority = db.Column(db.String(20), default='medium')
    status = db.Column(db.String(20), default='active')
    createdBy = db.Column(db.Integer, nullable=False)
    createdOn = db.Column(db.DateTime, default=datetime.utcnow)
    updatedBy = db.Column(db.Integer)
    updatedOn = db.Column(db.DateTime)

# 7. Villager Registration
class VillagerRegistration(db.Model):
    __tablename__ = 'villager_registration'
    id = db.Column(db.Integer, primary_key=True)
    villager_id = db.Column(db.String(50), unique=True, nullable=False)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    aadhar_number = db.Column(db.String(12), unique=True, nullable=False)
    phone_number = db.Column(db.String(15), nullable=False)
    email = db.Column(db.String(120))
    date_of_birth = db.Column(db.Date)
    gender = db.Column(db.String(10))
    caste = db.Column(db.String(50))
    address = db.Column(db.Text)
    state_id = db.Column(db.Integer, db.ForeignKey('master_table_state.id'), nullable=False)
    district_id = db.Column(db.Integer, db.ForeignKey('master_table_district.id'), nullable=False)
    block_id = db.Column(db.Integer, db.ForeignKey('master_table_blocks.id'), nullable=False)
    gram_panchayat_id = db.Column(db.Integer, db.ForeignKey('master_table_gram_panchayat.id'), nullable=False)
    village_id = db.Column(db.Integer, db.ForeignKey('master_table_village.id'), nullable=False)
    password_hash = db.Column(db.String(255))
    status = db.Column(db.String(20), default='active')
    createdOn = db.Column(db.DateTime, default=datetime.utcnow)
    updatedOn = db.Column(db.DateTime)

# Complaint Registration - FIXED: Simple relationships
class ComplaintRegistration(db.Model):
    __tablename__ = 'complaint_registration'
    id = db.Column(db.Integer, primary_key=True)
    complaint_number = db.Column(db.String(50), unique=True, nullable=False)
    villager_id = db.Column(db.Integer, db.ForeignKey('villager_registration.id'), nullable=False)
    complaint_type_id = db.Column(db.Integer, db.ForeignKey('complaint_type.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    priority = db.Column(db.String(20), default='medium')
    status = db.Column(db.String(20), default='pending')
    registered_by = db.Column(db.Integer, db.ForeignKey('user_master.id'))
    assigned_to = db.Column(db.Integer, db.ForeignKey('user_master.id'))
    resolution_notes = db.Column(db.Text)
    registered_date = db.Column(db.DateTime, default=datetime.utcnow)
    assigned_date = db.Column(db.DateTime)
    resolved_date = db.Column(db.DateTime)
    createdOn = db.Column(db.DateTime, default=datetime.utcnow)
    updatedOn = db.Column(db.DateTime)

# Helper Functions
def role_required(allowed_roles):
    def decorator(f):
        def decorated_function(*args, **kwargs):
            current_user_id = get_jwt_identity()
            user = UserMaster.query.get(current_user_id)
            if not user or user.role.role_name not in allowed_roles:
                return jsonify({'message': 'Access denied'}), 403
            return f(*args, **kwargs)
        decorated_function.__name__ = f.__name__
        return decorated_function
    return decorator

def generate_villager_id(state_id, district_id, block_id, gram_panchayat_id, village_id):
    """Generate villager ID in S1D1B1G1V1 format"""
    return f"S{state_id}D{district_id}B{block_id}G{gram_panchayat_id}V{village_id}"

def generate_complaint_number():
    """Generate unique complaint number"""
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    return f"COMP{timestamp}"

# Authentication Routes
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    print(f"🔐 LOGIN ATTEMPT - Username: {username}")

    # Check in UserMaster first (admins, spocs, stakeholders)
    user = UserMaster.query.filter_by(username=username).first()
    
    if user:
        print(f"✅ USER FOUND - Username: {user.username}, Role ID: {user.role_id}")
        if check_password_hash(user.password_hash, password):
            # Get role name by querying RoleMaster
            role = RoleMaster.query.get(user.role_id)
            role_name = role.role_name if role else 'unknown'
            
            access_token = create_access_token(
                identity=str(user.id),
                additional_claims={
                    'role': role_name, 
                    'user_type': 'staff'
                }
            )
            print(f"✅ LOGIN SUCCESS - User ID: {user.id}, Role: {role_name}")
            return jsonify({
                'access_token': access_token,
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'role': role_name,
                    'user_type': 'staff',
                    'email': user.email
                }
            })
        else:
            print(f"❌ PASSWORD INCORRECT for user: {username}")
    else:
        print(f"❌ USER NOT FOUND in UserMaster: {username}")

    # If not found in UserMaster, check in VillagerRegistration
    villager = VillagerRegistration.query.filter(
        (VillagerRegistration.phone_number == username) | 
        (VillagerRegistration.villager_id == username)
    ).first()
    
    if villager:
        print(f"✅ VILLAGER FOUND - Name: {villager.first_name}, Phone: {villager.phone_number}")
        if check_password_hash(villager.password_hash, password):
            access_token = create_access_token(
                identity=str(villager.id),
                additional_claims={
                    'role': 'villager', 
                    'user_type': 'villager',
                    'villager_id': villager.villager_id
                }
            )
            print(f"✅ VILLAGER LOGIN SUCCESS - ID: {villager.id}")
            return jsonify({
                'access_token': access_token,
                'user': {
                    'id': villager.id,
                    'username': villager.phone_number,
                    'role': 'villager',
                    'user_type': 'villager',
                    'villager_id': villager.villager_id,
                    'name': f"{villager.first_name} {villager.last_name}"
                }
            })
        else:
            print(f"❌ VILLAGER PASSWORD INCORRECT")
    else:
        print(f"❌ VILLAGER NOT FOUND: {username}")
    
    return jsonify({'message': 'Invalid credentials'}), 401

# Initialize Master Data Routes
@app.route('/api/init/master-data', methods=['POST'])
@jwt_required()
@role_required(['admin'])
def initialize_master_data():
    """Initialize all master data (roles, documents, complaint types)"""
    try:
        current_user_id = get_jwt_identity()
        
        # Initialize Roles
        roles = [
            {'name': 'admin', 'description': 'System Administrator'},
            {'name': 'spoc', 'description': 'Single Point of Contact'},
            {'name': 'stakeholder', 'description': 'Stakeholder/Service Provider'},
            {'name': 'operator', 'description': 'System Operator'}
        ]
        
        for role_data in roles:
            if not RoleMaster.query.filter_by(role_name=role_data['name']).first():
                role = RoleMaster(
                    role_name=role_data['name'],
                    role_description=role_data['description'],
                    createdBy=current_user_id
                )
                db.session.add(role)
        
        # Initialize Document Types
        documents = [
            {'name': 'Aadhar Card', 'description': 'Aadhar Card Document'},
            {'name': 'PAN Card', 'description': 'Permanent Account Number Card'},
            {'name': 'Voter ID Card', 'description': 'Voter Identification Card'},
            {'name': 'Driving License', 'description': 'Driving License'},
            {'name': 'Ration Card', 'description': 'Ration Card'}
        ]
        
        for doc_data in documents:
            if not DocumentMaster.query.filter_by(doc_name=doc_data['name']).first():
                doc = DocumentMaster(
                    doc_name=doc_data['name'],
                    doc_description=doc_data['description'],
                    createdBy=current_user_id
                )
                db.session.add(doc)
        
        # Initialize Complaint Types
        complaint_types = [
            {'category': 'Healthcare', 'name': 'Hospital Infrastructure', 'priority': 'high'},
            {'category': 'Healthcare', 'name': 'Medicine Shortage', 'priority': 'high'},
            {'category': 'Infrastructure', 'name': 'Road Repair', 'priority': 'medium'},
            {'category': 'Infrastructure', 'name': 'Water Supply', 'priority': 'high'},
            {'category': 'Education', 'name': 'School Facilities', 'priority': 'medium'},
        ]
        
        for comp_data in complaint_types:
            if not ComplaintType.query.filter_by(complaint_name=comp_data['name']).first():
                comp_type = ComplaintType(
                    complaint_category=comp_data['category'],
                    complaint_name=comp_data['name'],
                    priority=comp_data['priority'],
                    createdBy=current_user_id
                )
                db.session.add(comp_type)
        
        db.session.commit()
        
        return jsonify({'message': 'Master data initialized successfully'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error initializing master data: {str(e)}'}), 500

# Get Master Data Routes
@app.route('/api/master/roles', methods=['GET'])
@jwt_required()
def get_roles():
    """Get all roles"""
    roles = RoleMaster.query.filter_by(status='active').all()
    roles_data = [{
        'id': r.id,
        'role_name': r.role_name,
        'role_description': r.role_description
    } for r in roles]
    return jsonify({'roles': roles_data})

@app.route('/api/master/documents', methods=['GET'])
@jwt_required()
def get_document_types():
    """Get all document types"""
    documents = DocumentMaster.query.filter_by(status='active').all()
    docs_data = [{
        'id': d.id,
        'doc_name': d.doc_name,
        'doc_description': d.doc_description
    } for d in documents]
    return jsonify({'documents': docs_data})

@app.route('/api/master/complaint-types', methods=['GET'])
def get_complaint_types():
    """Get all complaint types"""
    complaint_types = ComplaintType.query.filter_by(status='active').all()
    comp_types_data = [{
        'id': ct.id,
        'complaint_category': ct.complaint_category,
        'complaint_name': ct.complaint_name,
        'description': ct.description,
        'priority': ct.priority
    } for ct in complaint_types]
    return jsonify({'complaint_types': comp_types_data})

# User Management Routes (for staff users)


@app.route('/api/stats', methods=['GET'])
@jwt_required()
def get_stats():
    """Return some dashboard stats"""
    try:
        total_users = UserMaster.query.count()
        total_villagers = VillagerRegistration.query.count()
        total_complaints = ComplaintRegistration.query.count()
        resolved_complaints = ComplaintRegistration.query.filter_by(status='resolved').count()

        return jsonify({
            'total_users': total_users,
            'total_villagers': total_villagers,
            'total_complaints': total_complaints,
            'resolved_complaints': resolved_complaints
        })
    except Exception as e:
        return jsonify({'message': f'Error fetching stats: {str(e)}'}), 500

@app.route('/api/users/create', methods=['POST'])
@jwt_required()
@role_required(['admin'])
def create_user():
    """Create new staff user"""
    data = request.get_json()
    current_user_id = get_jwt_identity()
    
    # Check if username already exists
    if UserMaster.query.filter_by(username=data['username']).first():
        return jsonify({'message': 'Username already exists'}), 400
    
    # Check if email already exists
    if UserMaster.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'Email already exists'}), 400
    
    user = UserMaster(
        username=data['username'],
        email=data['email'],
        password_hash=generate_password_hash(data['password']),
        role_id=data['role_id'],
        createdBy=current_user_id
    )
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({
        'message': 'User created successfully',
        'user_id': user.id
    }), 201


# Villager Registration Route
@app.route('/api/villagers/create', methods=['POST'])
@jwt_required()
@role_required(['admin'])
def create_villager():
    try:
        data = request.get_json()
        current_user_id = get_jwt_identity()

        # Check for duplicate phone or aadhar
        existing_villager = VillagerRegistration.query.filter(
            (VillagerRegistration.phone_number == data.get('phone_number')) |
            (VillagerRegistration.aadhar_number == data.get('aadhar_number'))
        ).first()
        if existing_villager:
            return jsonify({'message': 'Villager already exists'}), 400

        # Generate a unique villager_id
        villager_id = generate_villager_id(
            data.get('state_id'),
            data.get('district_id'),
            data.get('block_id'),
            data.get('gram_panchayat_id'),
            data.get('village_id')
        )

        # Ensure villager_id is unique by appending timestamp if needed
        while VillagerRegistration.query.filter_by(villager_id=villager_id).first():
            timestamp = datetime.utcnow().strftime("%H%M%S")
            villager_id = f"{villager_id}_{timestamp}"

        # Optional: Convert DOB string to date
        dob = None
        if data.get('date_of_birth'):
            dob = datetime.strptime(data['date_of_birth'], "%Y-%m-%d").date()

        villager = VillagerRegistration(
            villager_id=villager_id,
            first_name=data.get('first_name'),
            last_name=data.get('last_name'),
            aadhar_number=data.get('aadhar_number'),
            phone_number=data.get('phone_number'),
            email=data.get('email'),
            date_of_birth=dob,
            gender=data.get('gender'),
            caste=data.get('caste'),
            address=data.get('address'),
            state_id=data.get('state_id'),
            district_id=data.get('district_id'),
            block_id=data.get('block_id'),
            gram_panchayat_id=data.get('gram_panchayat_id'),
            village_id=data.get('village_id'),
            password_hash=generate_password_hash(data.get('password')),
            status='active',
            createdOn=datetime.utcnow()
        )

        db.session.add(villager)
        db.session.commit()

        return jsonify({'message': 'Villager created successfully', 'villager_id': villager.villager_id}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error: {str(e)}'}), 500

@app.route('/api/complaints/create', methods=['POST'])
@jwt_required()
@role_required(['villager', 'admin', 'spoc'])  # Villagers and staff can register
def create_complaint():
    try:
        data = request.get_json()
        current_user_id = get_jwt_identity()

        # Check villager existence
        villager = VillagerRegistration.query.get(data.get('villager_id'))
        if not villager:
            return jsonify({'message': 'Villager not found'}), 404

        # Generate unique complaint number
        complaint_number = generate_complaint_number()

        complaint = ComplaintRegistration(
            complaint_number=complaint_number,
            villager_id=villager.id,
            complaint_type_id=data.get('complaint_type_id'),
            title=data.get('title'),
            description=data.get('description'),
            priority=data.get('priority', 'medium'),
            status='pending',
            registered_by=current_user_id,
            registered_date=datetime.utcnow(),
            createdOn=datetime.utcnow()
        )

        db.session.add(complaint)
        db.session.commit()

        return jsonify({
            'message': 'Complaint created successfully',
            'complaint_number': complaint.complaint_number
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error: {str(e)}'}), 500

# Simple health check
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'message': 'Server is running'})

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)