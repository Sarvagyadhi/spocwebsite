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
CORS(app)

# Database Models
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

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # superadmin, admin, spoc, stakeholder
    village_id = db.Column(db.Integer, db.ForeignKey('master_table_village.id'))
    status = db.Column(db.String(20), default='active')
    createdBy = db.Column(db.Integer)
    createdOn = db.Column(db.DateTime, default=datetime.utcnow)
    updatedBy = db.Column(db.Integer)
    updatedOn = db.Column(db.DateTime)
    
    village = db.relationship('MasterTableVillage', backref='users')

class VillagerIssue(db.Model):
    __tablename__ = 'villager_issues'
    id = db.Column(db.Integer, primary_key=True)
    villager_name = db.Column(db.String(100), nullable=False)
    mobile_number = db.Column(db.String(15), nullable=False)
    aadhar_number = db.Column(db.String(12), nullable=False)
    caste = db.Column(db.String(50))
    sex = db.Column(db.String(10))
    issue_category = db.Column(db.String(50), nullable=False)
    issue_type = db.Column(db.String(100), nullable=False)
    issue_description = db.Column(db.Text)
    status = db.Column(db.String(20), default='pending')  # pending, financial_help, non_financial_help, resolved
    help_type = db.Column(db.String(20))  # financial, non_financial
    village_id = db.Column(db.Integer, db.ForeignKey('master_table_village.id'), nullable=False)
    spoc_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    stakeholder_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    createdOn = db.Column(db.DateTime, default=datetime.utcnow)
    updatedOn = db.Column(db.DateTime)
    
    village = db.relationship('MasterTableVillage')
    spoc = db.relationship('User', foreign_keys=[spoc_id])
    stakeholder = db.relationship('User', foreign_keys=[stakeholder_id])

# Issue Types Configuration
ISSUE_TYPES = {
    'healthcare': [
        'Hospital Infrastructure', 'Medical Staff Shortage', 'Medicine Availability',
        'Emergency Services', 'Vaccination Programs', 'Health Awareness'
    ],
    'community': [
        'Community Center', 'Cultural Programs', 'Social Conflicts',
        'Youth Development', 'Women Empowerment', 'Elder Care'
    ],
    'crop': [
        'Irrigation Issues', 'Seed Quality', 'Fertilizer Supply',
        'Pest Control', 'Market Access', 'Storage Facilities'
    ],
    'infrastructure': [
        'Road Connectivity', 'Electricity Supply', 'Water Supply',
        'Sanitation', 'Internet Connectivity', 'Public Transport'
    ]
}

# Helper Functions
def role_required(allowed_roles):
    def decorator(f):
        def decorated_function(*args, **kwargs):
            current_user_id = get_jwt_identity()
            user = User.query.get(current_user_id)
            if not user or user.role not in allowed_roles:
                return jsonify({'message': 'Access denied'}), 403
            return f(*args, **kwargs)
        decorated_function.__name__ = f.__name__
        return decorated_function
    return decorator

# Authentication Routes
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    user = User.query.filter_by(username=username).first()
    
    if user and check_password_hash(user.password_hash, password):
        access_token = create_access_token(
            identity=str(user.id),
            additional_claims={'role': user.role, 'village_id': user.village_id}
        )
        return jsonify({
            'access_token': access_token,
            'user': {
                'id': user.id,
                'username': user.username,
                'role': user.role,
                'village_id': user.village_id
            }
        })
    
    return jsonify({'message': 'Invalid credentials'}), 401

@app.route('/api/register', methods=['POST'])
@jwt_required()
@role_required(['superadmin', 'admin'])
def register():
    data = request.get_json()
    
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'message': 'Username already exists'}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'Email already exists'}), 400
    
    user = User(
    username=data['username'],
    email=data['email'],
    password_hash=generate_password_hash(data['password']),
    role=data['role'],
    village_id=data.get('village_id'),
    createdBy=int(get_jwt_identity())  # convert string ID back to int
)

    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({'message': 'User created successfully'}), 201

# Issue Management Routes
@app.route('/api/issues', methods=['POST'])
@jwt_required()
@role_required(['spoc'])
def create_issue():
    data = request.get_json()
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    issue = VillagerIssue(
        villager_name=data['villager_name'],
        mobile_number=data['mobile_number'],
        aadhar_number=data['aadhar_number'],
        caste=data['caste'],
        sex=data['sex'],
        issue_category=data['issue_category'],
        issue_type=data['issue_type'],
        issue_description=data.get('issue_description', ''),
        village_id=user.village_id,
        spoc_id=current_user_id
    )
    
    db.session.add(issue)
    db.session.commit()
    
    return jsonify({'message': 'Issue created successfully', 'issue_id': issue.id}), 201

@app.route('/api/issues', methods=['GET'])
@jwt_required()
def get_issues():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if user.role == 'superadmin':
        issues = VillagerIssue.query.all()
    elif user.role == 'admin':
        issues = VillagerIssue.query.all()
    elif user.role == 'spoc':
        issues = VillagerIssue.query.filter_by(spoc_id=current_user_id).all()
    elif user.role == 'stakeholder':
        issues = VillagerIssue.query.filter_by(status='pending').all()
    else:
        return jsonify({'message': 'Access denied'}), 403
    
    issues_data = []
    for issue in issues:
        issues_data.append({
            'id': issue.id,
            'villager_name': issue.villager_name,
            'mobile_number': issue.mobile_number,
            'aadhar_number': issue.aadhar_number,
            'caste': issue.caste,
            'sex': issue.sex,
            'issue_category': issue.issue_category,
            'issue_type': issue.issue_type,
            'issue_description': issue.issue_description,
            'status': issue.status,
            'help_type': issue.help_type,
            'village_name': issue.village.villageName if issue.village else '',
            'spoc_name': issue.spoc.username if issue.spoc else '',
            'stakeholder_name': issue.stakeholder.username if issue.stakeholder else '',
            'createdOn': issue.createdOn.isoformat() if issue.createdOn else None,
            'updatedOn': issue.updatedOn.isoformat() if issue.updatedOn else None
        })
    
    return jsonify({'issues': issues_data})

@app.route('/api/issues/<int:issue_id>/help', methods=['PUT'])
@jwt_required()
@role_required(['stakeholder'])
def provide_help(issue_id):
    data = request.get_json()
    help_type = data.get('help_type')  # 'financial' or 'non_financial'
    
    if help_type not in ['financial', 'non_financial']:
        return jsonify({'message': 'Invalid help type'}), 400
    
    issue = VillagerIssue.query.get_or_404(issue_id)
    issue.status = f"{help_type}_help"
    issue.help_type = help_type
    issue.stakeholder_id = get_jwt_identity()
    issue.updatedOn = datetime.utcnow()
    
    db.session.commit()
    
    return jsonify({'message': f'{help_type.title()} help provided successfully'})

# Master Data Routes
@app.route('/api/issue-types', methods=['GET'])
@jwt_required()
def get_issue_types():
    return jsonify({'issue_types': ISSUE_TYPES})

@app.route('/api/villages', methods=['GET'])
@jwt_required()
def get_villages():
    villages = MasterTableVillage.query.filter_by(status='active').all()
    villages_data = []
    for village in villages:
        villages_data.append({
            'id': village.id,
            'villageName': village.villageName,
            'gramPanchayat': village.gram_panchayat.gramPancName if village.gram_panchayat else '',
            'block': village.gram_panchayat.block.blockName if village.gram_panchayat and village.gram_panchayat.block else '',
            'district': village.gram_panchayat.block.district.districtName if village.gram_panchayat and village.gram_panchayat.block and village.gram_panchayat.block.district else ''
        })
    return jsonify({'villages': villages_data})

# User Management Routes
# Replace your existing /api/users route with this one
@app.route('/api/users', methods=['GET'])
@jwt_required()
@role_required(['superadmin', 'admin'])
def get_users_list():  # Renamed from get_users
    current_user = User.query.get(get_jwt_identity())
    
    if current_user.role == 'superadmin':
        users = User.query.all()
    elif current_user.role == 'admin':
        users = User.query.filter(User.role != 'superadmin').all()
    
    users_data = []
    for user in users:
        users_data.append({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role,
            'village_name': user.village.villageName if user.village else '',
            'status': user.status,
            'createdOn': user.createdOn.isoformat() if user.createdOn else None
        })
    
    return jsonify({'users': users_data})

# Add user status update endpoint
@app.route('/api/users/<int:user_id>/status', methods=['PUT'])
@jwt_required()
@role_required(['superadmin', 'admin'])
def update_user_status(user_id):
    data = request.get_json()
    status = data.get('status')
    
    if status not in ['active', 'inactive']:
        return jsonify({'message': 'Invalid status'}), 400
    
    user = User.query.get_or_404(user_id)
    
    # Prevent modifying superadmin users
    if user.role == 'superadmin':
        return jsonify({'message': 'Cannot modify superadmin user'}), 403
    
    user.status = status
    user.updatedOn = datetime.utcnow()
    user.updatedBy = get_jwt_identity()
    
    db.session.commit()
    
    return jsonify({'message': 'User status updated successfully'})

# Add user creation endpoint for superadmin/admin
@app.route('/api/users/create', methods=['POST'])
@jwt_required()
@role_required(['superadmin', 'admin'])
def create_user():
    data = request.get_json()
    
    # Check if username already exists
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'message': 'Username already exists'}), 400
    
    # Check if email already exists
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'Email already exists'}), 400
    
    # Validate role
    allowed_roles = ['admin', 'spoc', 'stakeholder']
    if data['role'] not in allowed_roles:
        return jsonify({'message': 'Invalid role'}), 400
    
    user = User(
        username=data['username'],
        email=data['email'],
        password_hash=generate_password_hash(data['password']),
        role=data['role'],
        village_id=data.get('village_id'),
        createdBy=int(get_jwt_identity())
    )
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({'message': 'User created successfully'}), 201

@app.route('/api/dashboard/stats', methods=['GET'])
@jwt_required()
def get_dashboard_stats():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    stats = {}
    
    if user.role == 'superadmin':
        stats = {
            'total_users': User.query.count(),
            'total_issues': VillagerIssue.query.count(),
            'pending_issues': VillagerIssue.query.filter_by(status='pending').count(),
            'resolved_issues': VillagerIssue.query.filter(VillagerIssue.status.in_(['financial_help', 'non_financial_help'])).count(),
            'total_villages': MasterTableVillage.query.count()
        }
    elif user.role == 'admin':
        stats = {
            'total_issues': VillagerIssue.query.count(),
            'pending_issues': VillagerIssue.query.filter_by(status='pending').count(),
            'resolved_issues': VillagerIssue.query.filter(VillagerIssue.status.in_(['financial_help', 'non_financial_help'])).count(),
            'total_villages': MasterTableVillage.query.count()
        }
    elif user.role == 'spoc':
        stats = {
            'my_issues': VillagerIssue.query.filter_by(spoc_id=current_user_id).count(),
            'pending_issues': VillagerIssue.query.filter_by(spoc_id=current_user_id, status='pending').count(),
            'resolved_issues': VillagerIssue.query.filter_by(spoc_id=current_user_id).filter(VillagerIssue.status.in_(['financial_help', 'non_financial_help'])).count()
        }
    elif user.role == 'stakeholder':
        stats = {
            'available_issues': VillagerIssue.query.filter_by(status='pending').count(),
            'helped_issues': VillagerIssue.query.filter_by(stakeholder_id=current_user_id).count()
        }
    
    return jsonify({'stats': stats})

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
