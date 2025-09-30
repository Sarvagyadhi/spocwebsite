import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { apiService, DEHRADUN_LOCATIONS } from './App';

const UsersList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newUser, setNewUser] = useState({
        username: '',
        email: '',
        password: '',
        role: '',
        village_id: ''
    });
    const { user } = useAuth();

    const fetchUsers = async () => {
        try {
            const data = await apiService.request('/users');
            setUsers(data.users);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleStatusUpdate = async (userId, newStatus) => {
        try {
            await apiService.request(`/users/${userId}/status`, {
                method: 'PUT',
                body: JSON.stringify({ status: newStatus }),
            });
            fetchUsers(); // Refresh the list
        } catch (error) {
            console.error('Failed to update user status:', error);
            alert('Failed to update user status. Please try again.');
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await apiService.request('/users/create', {
                method: 'POST',
                body: JSON.stringify(newUser),
            });
            setShowCreateForm(false);
            setNewUser({
                username: '',
                email: '',
                password: '',
                role: '',
                village_id: ''
            });
            fetchUsers(); // Refresh the list
            alert('User created successfully!');
        } catch (error) {
            console.error('Failed to create user:', error);
            alert('Failed to create user. Please try again.');
        }
    };

    const getRoleBadge = (role) => {
        const roleColors = {
            superadmin: 'purple',
            admin: 'blue',
            spoc: 'green',
            stakeholder: 'orange'
        };
        return (
            <span 
                className="role-badge" 
                style={{ 
                    backgroundColor: roleColors[role] || 'gray',
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                }}
            >
                {role}
            </span>
        );
    };

    const getStatusBadge = (status) => {
        return status === 'active' ? (
            <span className="status-badge status-active">Active</span>
        ) : (
            <span className="status-badge status-inactive">Inactive</span>
        );
    };

    if (loading) return <div className="loading">Loading users...</div>;

    return (
        <div className="animate-fadeIn">
            {/* Create User Button */}
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0 }}>User Management</h2>
                <button 
                    className="btn btn-success"
                    onClick={() => setShowCreateForm(true)}
                >
                    <i className="fas fa-plus"></i> Create New User
                </button>
            </div>

            {/* Create User Form */}
            {showCreateForm && (
                <div className="card" style={{ marginBottom: '20px' }}>
                    <div className="card-header">
                        <i className="fas fa-user-plus"></i>
                        Create New User
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleCreateUser}>
                            <div className="form-row">
                                <div>
                                    <label className="form-label">Username *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={newUser.username}
                                        onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Email *</label>
                                    <input
                                        type="email"
                                        className="form-input"
                                        value={newUser.email}
                                        onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div>
                                    <label className="form-label">Password *</label>
                                    <input
                                        type="password"
                                        className="form-input"
                                        value={newUser.password}
                                        onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Role *</label>
                                    <select
                                        className="form-select"
                                        value={newUser.role}
                                        onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                                        required
                                    >
                                        <option value="">Select Role</option>
                                        <option value="admin">Admin</option>
                                        <option value="spoc">SPOC</option>
                                        <option value="stakeholder">Stakeholder</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-row">
                                <div>
                                    <label className="form-label">Village</label>
                                    <select
                                        className="form-select"
                                        value={newUser.village_id}
                                        onChange={(e) => setNewUser({...newUser, village_id: e.target.value})}
                                    >
                                        <option value="">Select Village</option>
                                        {DEHRADUN_LOCATIONS.villages.map(village => (
                                            <option key={village.id} value={village.id}>
                                                {village.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                <button type="submit" className="btn btn-success">
                                    <i className="fas fa-save"></i> Create User
                                </button>
                                <button 
                                    type="button" 
                                    className="btn btn-secondary"
                                    onClick={() => setShowCreateForm(false)}
                                >
                                    <i className="fas fa-times"></i> Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Users Table */}
            <div className="card">
                <div className="card-header">
                    <i className="fas fa-users"></i>
                    All Users
                    <span className="badge" style={{marginLeft: '10px'}}>{users.length} users</span>
                </div>
                <div className="card-body" style={{ padding: 0 }}>
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>User Information</th>
                                    <th>Role & Village</th>
                                    <th>Status</th>
                                    <th>Created On</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((userItem, index) => (
                                    <tr key={userItem.id} className="animate-fadeIn" style={{ animationDelay: `${index * 0.05}s` }}>
                                        <td>
                                            <div style={{ fontWeight: '600', color: '#333', marginBottom: '4px' }}>
                                                <i className="fas fa-user"></i> {userItem.username}
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#666' }}>
                                                <i className="fas fa-envelope"></i> {userItem.email}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ marginBottom: '4px' }}>
                                                {getRoleBadge(userItem.role)}
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#666' }}>
                                                <i className="fas fa-map-marker-alt"></i> {userItem.village_name || 'Not assigned'}
                                            </div>
                                        </td>
                                        <td>
                                            {getStatusBadge(userItem.status)}
                                        </td>
                                        <td>
                                            <div style={{ fontSize: '12px', color: '#666' }}>
                                                {new Date(userItem.createdOn).toLocaleDateString()}
                                            </div>
                                            <div style={{ fontSize: '11px', color: '#999' }}>
                                                {new Date(userItem.createdOn).toLocaleTimeString()}
                                            </div>
                                        </td>
                                        <td>
                                            {userItem.role !== 'superadmin' && ( // Don't allow modifying superadmin
                                                <div className="action-buttons">
                                                    {userItem.status === 'active' ? (
                                                        <button 
                                                            className="btn btn-small btn-warning"
                                                            onClick={() => handleStatusUpdate(userItem.id, 'inactive')}
                                                        >
                                                            <i className="fas fa-pause"></i> Deactivate
                                                        </button>
                                                    ) : (
                                                        <button 
                                                            className="btn btn-small btn-success"
                                                            onClick={() => handleStatusUpdate(userItem.id, 'active')}
                                                        >
                                                            <i className="fas fa-play"></i> Activate
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UsersList;