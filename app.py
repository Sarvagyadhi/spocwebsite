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


# Add this at the end of your app.py, before if __name__ == '__main__'
@app.route('/api/debug/routes')
def debug_routes():
    routes = []
    for rule in app.url_map.iter_rules():
        routes.append({
            'endpoint': rule.endpoint,
            'methods': list(rule.methods),
            'path': str(rule)
        })
    return jsonify({'routes': routes})
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




# Master Data Creation Routes
@app.route('/api/states', methods=['POST'])
@jwt_required()
@role_required(['superadmin'])
def create_state():
    data = request.get_json()
    
    state = MasterTableState(
        stateName=data['stateName'],
        createdBy=get_jwt_identity()
    )
    
    db.session.add(state)
    db.session.commit()
    
    return jsonify({
        'message': 'State created successfully', 
        'state_id': state.id,
        'stateName': state.stateName
    }), 201

@app.route('/api/districts', methods=['POST'])
@jwt_required()
@role_required(['superadmin', 'admin'])
def create_district():
    data = request.get_json()
    
    district = MasterTableDistrict(
        state_id=data['state_id'],
        districtName=data['districtName'],
        createdBy=get_jwt_identity()
    )
    
    db.session.add(district)
    db.session.commit()
    
    return jsonify({
        'message': 'District created successfully', 
        'district_id': district.id,
        'districtName': district.districtName
    }), 201

@app.route('/api/blocks', methods=['POST'])
@jwt_required()
@role_required(['superadmin', 'admin'])
def create_block():
    data = request.get_json()
    
    block = MasterTableBlocks(
        district_id=data['district_id'],
        blockName=data['blockName'],
        createdBy=get_jwt_identity()
    )
    
    db.session.add(block)
    db.session.commit()
    
    return jsonify({
        'message': 'Block created successfully', 
        'block_id': block.id,
        'blockName': block.blockName
    }), 201

@app.route('/api/gram-panchayats', methods=['POST'])
@jwt_required()
@role_required(['superadmin', 'admin'])
def create_gram_panchayat():
    data = request.get_json()
    
    gp = MasterTableGramPanchayat(
        block_id=data['block_id'],
        gramPancName=data['gramPancName'],
        createdBy=get_jwt_identity()
    )
    
    db.session.add(gp)
    db.session.commit()
    
    return jsonify({
        'message': 'Gram Panchayat created successfully', 
        'gram_panchayat_id': gp.id,
        'gramPancName': gp.gramPancName
    }), 201

@app.route('/api/villages/create', methods=['POST'])
@jwt_required()
@role_required(['superadmin', 'admin'])
def create_village():
    data = request.get_json()
    
    village = MasterTableVillage(
        gramPanchayat_id=data['gramPanchayat_id'],
        villageName=data['villageName'],
        populationFemale=data.get('populationFemale', 0),
        populationMale=data.get('populationMale', 0),
        area=data.get('area', 0),
        total_hospital=data.get('total_hospital', 0),
        total_schools=data.get('total_schools', 0),
        createdBy=get_jwt_identity()
    )
    
    db.session.add(village)
    db.session.commit()
    
    return jsonify({
        'message': 'Village created successfully', 
        'village_id': village.id,
        'villageName': village.villageName
    }), 201

# Get routes for master data
@app.route('/api/states', methods=['GET'])
@jwt_required()
def get_states():
    states = MasterTableState.query.filter_by(status='active').all()
    states_data = [{
        'id': s.id, 
        'stateName': s.stateName,
        'createdOn': s.createdOn.isoformat() if s.createdOn else None
    } for s in states]
    return jsonify({'states': states_data})

@app.route('/api/districts', methods=['GET'])
@jwt_required()
def get_districts():
    districts = MasterTableDistrict.query.filter_by(status='active').all()
    districts_data = [{
        'id': d.id, 
        'districtName': d.districtName,
        'state_id': d.state_id,
        'state_name': d.state.stateName if d.state else ''
    } for d in districts]
    return jsonify({'districts': districts_data})

@app.route('/api/blocks', methods=['GET'])
@jwt_required()
def get_blocks():
    blocks = MasterTableBlocks.query.filter_by(status='active').all()
    blocks_data = [{
        'id': b.id, 
        'blockName': b.blockName,
        'district_id': b.district_id,
        'district_name': b.district.districtName if b.district else ''
    } for b in blocks]
    return jsonify({'blocks': blocks_data})

@app.route('/api/gram-panchayats', methods=['GET'])
@jwt_required()
def get_gram_panchayats():
    gps = MasterTableGramPanchayat.query.filter_by(status='active').all()
    gps_data = [{
        'id': gp.id, 
        'gramPancName': gp.gramPancName,
        'block_id': gp.block_id,
        'block_name': gp.block.blockName if gp.block else ''
    } for gp in gps]
    return jsonify({'gram_panchayats': gps_data})




   # Master Data Routes - Add these to your backend
@app.route('/api/master-data/states', methods=['GET'])
@jwt_required()
@role_required(['superadmin', 'admin'])
def get_all_states():
    try:
        states = MasterTableState.query.all()
        states_data = [{
            'id': s.id,
            'stateName': s.stateName,
            'status': s.status,
            'createdOn': s.createdOn.isoformat() if s.createdOn else None,
            'districts_count': len(s.districts)
        } for s in states]
        return jsonify({'states': states_data})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/master-data/districts', methods=['GET'])
@jwt_required()
@role_required(['superadmin', 'admin'])
def get_all_districts():
    try:
        districts = MasterTableDistrict.query.all()
        districts_data = [{
            'id': d.id,
            'districtName': d.districtName,
            'state_id': d.state_id,
            'state_name': d.state.stateName if d.state else '',
            'status': d.status,
            'createdOn': d.createdOn.isoformat() if d.createdOn else None,
            'blocks_count': len(d.blocks)
        } for d in districts]
        return jsonify({'districts': districts_data})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/master-data/blocks', methods=['GET'])
@jwt_required()
@role_required(['superadmin', 'admin'])
def get_all_blocks():
    try:
        blocks = MasterTableBlocks.query.all()
        blocks_data = [{
            'id': b.id,
            'blockName': b.blockName,
            'district_id': b.district_id,
            'district_name': b.district.districtName if b.district else '',
            'state_name': b.district.state.stateName if b.district and b.district.state else '',
            'status': b.status,
            'createdOn': b.createdOn.isoformat() if b.createdOn else None,
            'gram_panchayats_count': len(b.gram_panchayats)
        } for b in blocks]
        return jsonify({'blocks': blocks_data})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/master-data/gram-panchayats', methods=['GET'])
@jwt_required()
@role_required(['superadmin', 'admin'])
def get_all_gram_panchayats():
    try:
        gps = MasterTableGramPanchayat.query.all()
        gps_data = [{
            'id': gp.id,
            'gramPancName': gp.gramPancName,
            'block_id': gp.block_id,
            'block_name': gp.block.blockName if gp.block else '',
            'district_name': gp.block.district.districtName if gp.block and gp.block.district else '',
            'status': gp.status,
            'createdOn': gp.createdOn.isoformat() if gp.createdOn else None,
            'villages_count': len(gp.villages)
        } for gp in gps]
        return jsonify({'gram_panchayats': gps_data})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/master-data/villages', methods=['GET'])
@jwt_required()
@role_required(['superadmin', 'admin'])
def get_all_villages():
    try:
        villages = MasterTableVillage.query.all()
        villages_data = [{
            'id': v.id,
            'villageName': v.villageName,
            'gramPanchayat_id': v.gramPanchayat_id,
            'gram_panchayat_name': v.gram_panchayat.gramPancName if v.gram_panchayat else '',
            'block_name': v.gram_panchayat.block.blockName if v.gram_panchayat and v.gram_panchayat.block else '',
            'district_name': v.gram_panchayat.block.district.districtName if v.gram_panchayat and v.gram_panchayat.block and v.gram_panchayat.block.district else '',
            'populationFemale': v.populationFemale,
            'populationMale': v.populationMale,
            'area': v.area,
            'total_hospital': v.total_hospital,
            'total_schools': v.total_schools,
            'status': v.status,
            'createdOn': v.createdOn.isoformat() if v.createdOn else None
        } for v in villages]
        return jsonify({'villages': villages_data})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Status update routes
@app.route('/api/master-data/<entity>/<int:entity_id>/status', methods=['PUT'])
@jwt_required()
@role_required(['superadmin'])
def update_master_data_status(entity, entity_id):
    data = request.get_json()
    status = data.get('status')
    
    if status not in ['active', 'inactive']:
        return jsonify({'message': 'Invalid status'}), 400
    
    entity_map = {
        'states': MasterTableState,
        'districts': MasterTableDistrict,
        'blocks': MasterTableBlocks,
        'gram-panchayats': MasterTableGramPanchayat,
        'villages': MasterTableVillage
    }
    
    if entity not in entity_map:
        return jsonify({'message': 'Invalid entity type'}), 400
    
    model = entity_map[entity]
    record = model.query.get_or_404(entity_id)
    
    record.status = status
    record.updatedOn = datetime.utcnow()
    record.updatedBy = get_jwt_identity()
    
    db.session.commit()
    
    return jsonify({'message': f'{entity.title()} status updated successfully'})

# Edit master data
@app.route('/api/master-data/<entity>/<int:entity_id>', methods=['PUT'])
@jwt_required()
@role_required(['superadmin'])
def update_master_data(entity, entity_id):
    data = request.get_json()
    
    entity_map = {
        'states': (MasterTableState, ['stateName']),
        'districts': (MasterTableDistrict, ['districtName', 'state_id']),
        'blocks': (MasterTableBlocks, ['blockName', 'district_id']),
        'gram-panchayats': (MasterTableGramPanchayat, ['gramPancName', 'block_id']),
        'villages': (MasterTableVillage, ['villageName', 'gramPanchayat_id', 'populationFemale', 'populationMale', 'area', 'total_hospital', 'total_schools'])
    }
    
    if entity not in entity_map:
        return jsonify({'message': 'Invalid entity type'}), 400
    
    model, allowed_fields = entity_map[entity]
    record = model.query.get_or_404(entity_id)
    
    for field in allowed_fields:
        if field in data:
            setattr(record, field, data[field])
    
    record.updatedOn = datetime.utcnow()
    record.updatedBy = get_jwt_identity()
    
    db.session.commit()
    
    return jsonify({'message': f'{entity.title()} updated successfully'})
def get_active_gram_panchayats():
    gps = MasterTableGramPanchayat.query.filter_by(status='active').all()
    gps_data = [{
        'id': gp.id,
        'gramPancName': gp.gramPancName,
        'block_id': gp.block_id
    } for gp in gps]
    return jsonify({'gram_panchayats': gps_data})

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
