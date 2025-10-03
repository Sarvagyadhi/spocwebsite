import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';

const MasterDataManagement = () => {
    const { user } = useAuth();
    const [activeEntity, setActiveEntity] = useState('states');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({});
    const [editingId, setEditingId] = useState(null);

    const entityConfig = {
        states: { 
            name: 'State', 
            fields: [{ name: 'stateName', label: 'State Name', type: 'text', required: true }],
            parent: null
        },
        districts: { 
            name: 'District', 
            fields: [
                { name: 'districtName', label: 'District Name', type: 'text', required: true },
                { name: 'state_id', label: 'State', type: 'select', required: true }
            ],
            parent: 'states'
        },
        blocks: { 
            name: 'Block', 
            fields: [
                { name: 'blockName', label: 'Block Name', type: 'text', required: true },
                { name: 'district_id', label: 'District', type: 'select', required: true }
            ],
            parent: 'districts'
        },
        'gram-panchayats': { 
            name: 'Gram Panchayat', 
            fields: [
                { name: 'gramPancName', label: 'Gram Panchayat Name', type: 'text', required: true },
                { name: 'block_id', label: 'Block', type: 'select', required: true }
            ],
            parent: 'blocks'
        },
        villages: { 
            name: 'Village', 
            fields: [
                { name: 'villageName', label: 'Village Name', type: 'text', required: true },
                { name: 'gramPanchayat_id', label: 'Gram Panchayat', type: 'select', required: true },
                { name: 'populationFemale', label: 'Female Population', type: 'number' },
                { name: 'populationMale', label: 'Male Population', type: 'number' },
                { name: 'area', label: 'Area (sq km)', type: 'number', step: '0.01' },
                { name: 'total_hospital', label: 'Total Hospitals', type: 'number' },
                { name: 'total_schools', label: 'Total Schools', type: 'number' }
            ],
            parent: 'gram-panchayats'
        }
    };

    // Fetch data when entity changes
    useEffect(() => {
        fetchData();
    }, [activeEntity]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            console.log(`Fetching ${activeEntity} from API...`);
            
            const response = await fetch(`/api/master-data/${activeEntity}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('Response status:', response.status);
            
            if (response.ok) {
                const result = await response.json();
                console.log('API Response:', result);
                setData(result[activeEntity] || []);
            } else {
                console.error('Failed to fetch data');
                // Fallback to basic routes
                await fetchBasicData();
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            // Fallback to basic routes
            await fetchBasicData();
        } finally {
            setLoading(false);
        }
    };

    // Fallback function to use basic routes
    const fetchBasicData = async () => {
        try {
            const token = localStorage.getItem('token');
            let endpoint;
            
            switch(activeEntity) {
                case 'states':
                    endpoint = '/api/states';
                    break;
                case 'districts':
                    endpoint = '/api/districts';
                    break;
                case 'blocks':
                    endpoint = '/api/blocks';
                    break;
                case 'gram-panchayats':
                    endpoint = '/api/gram-panchayats';
                    break;
                case 'villages':
                    endpoint = '/api/villages';
                    break;
                default:
                    return;
            }
            
            const response = await fetch(endpoint, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const result = await response.json();
                const dataKey = activeEntity === 'gram-panchayats' ? 'gram_panchayats' : activeEntity;
                setData(result[dataKey] || []);
            }
        } catch (error) {
            console.error('Error in fallback fetch:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const url = editingId 
                ? `/api/master-data/${activeEntity}/${editingId}`
                : `/api/${activeEntity}`;
            
            const method = editingId ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setShowForm(false);
                setFormData({});
                setEditingId(null);
                fetchData();
                alert(`${entityConfig[activeEntity].name} ${editingId ? 'updated' : 'created'} successfully!`);
            }
        } catch (error) {
            console.error('Error saving data:', error);
            alert('Error saving data');
        }
    };

    const handleStatusChange = async (id, status) => {
        if (!window.confirm(`Are you sure you want to ${status === 'active' ? 'activate' : 'deactivate'} this record?`)) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/master-data/${activeEntity}/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status })
            });

            if (response.ok) {
                fetchData();
                alert('Status updated successfully!');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Error updating status');
        }
    };

    const getParentName = (item) => {
        switch (activeEntity) {
            case 'districts':
                return item.state_name || 'N/A';
            case 'blocks':
                return item.district_name || 'N/A';
            case 'gram-panchayats':
                return item.block_name || 'N/A';
            case 'villages':
                return item.gram_panchayat_name || 'N/A';
            default:
                return '';
        }
    };

    const renderDataCards = () => {
        if (loading) return <div className="loading">Loading...</div>;
        
        if (data.length === 0) {
            return (
                <div className="no-data">
                    <i className="fas fa-database"></i>
                    <h3>No {entityConfig[activeEntity].name}s Found</h3>
                    <p>Create the first {entityConfig[activeEntity].name.toLowerCase()} to get started</p>
                </div>
            );
        }

        return (
            <div className="data-cards">
                {data.map((item) => (
                    <div key={item.id} className="data-card">
                        <div className="card-header">
                            <h4>{item.stateName || item.districtName || item.blockName || item.gramPancName || item.villageName}</h4>
                            <span className={`status-badge ${item.status}`}>
                                {item.status}
                            </span>
                        </div>
                        
                        <div className="card-body">
                            {activeEntity !== 'states' && (
                                <p className="parent-info">
                                    <strong>Parent:</strong> {getParentName(item)}
                                </p>
                            )}
                            {activeEntity === 'villages' && (
                                <div className="village-stats">
                                    <div className="stat">
                                        <span>Population:</span>
                                        <span>{item.populationFemale || 0}F / {item.populationMale || 0}M</span>
                                    </div>
                                    <div className="stat">
                                        <span>Area:</span>
                                        <span>{item.area || 0} sq km</span>
                                    </div>
                                    <div className="stat">
                                        <span>Hospitals:</span>
                                        <span>{item.total_hospital || 0}</span>
                                    </div>
                                    <div className="stat">
                                        <span>Schools:</span>
                                        <span>{item.total_schools || 0}</span>
                                    </div>
                                </div>
                            )}
                            <p className="created-date">
                                Created: {item.createdOn ? new Date(item.createdOn).toLocaleDateString() : 'N/A'}
                            </p>
                        </div>

                        <div className="card-actions">
                            {activeEntity !== 'villages' && (
                                <button 
                                    onClick={() => {
                                        // Store selected parent and move to next entity
                                        const entities = Object.keys(entityConfig);
                                        const currentIndex = entities.indexOf(activeEntity);
                                        if (currentIndex < entities.length - 1) {
                                            setActiveEntity(entities[currentIndex + 1]);
                                        }
                                    }}
                                    className="btn-select"
                                >
                                    <i className="fas fa-arrow-right"></i>
                                    Select & Continue
                                </button>
                            )}
                            <div className="action-buttons">
                                <button 
                                    onClick={() => {
                                        setFormData(item);
                                        setEditingId(item.id);
                                        setShowForm(true);
                                    }}
                                    className="btn-edit"
                                >
                                    <i className="fas fa-edit"></i>
                                </button>
                                <button 
                                    onClick={() => handleStatusChange(
                                        item.id, 
                                        item.status === 'active' ? 'inactive' : 'active'
                                    )}
                                    className={`btn-status ${item.status === 'active' ? 'inactive' : 'active'}`}
                                >
                                    <i className={`fas ${item.status === 'active' ? 'fa-pause' : 'fa-play'}`}></i>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="master-data-management">
            <div className="section-header">
                <div className="header-content">
                    <h2>Master Data Management</h2>
                    <div className="breadcrumb">
                        <span className="breadcrumb-item active">
                            {entityConfig[activeEntity].name}s
                        </span>
                    </div>
                </div>
                <button 
                    onClick={() => {
                        setShowForm(true);
                        setFormData({});
                        setEditingId(null);
                    }}
                    className="btn-primary"
                >
                    <i className="fas fa-plus"></i>
                    Add New {entityConfig[activeEntity].name}
                </button>
            </div>

            <div className="content-area">
                <div className="entity-info">
                    <h3>
                        <i className={`fas ${
                            activeEntity === 'states' ? 'fa-map' :
                            activeEntity === 'districts' ? 'fa-map-marked' :
                            activeEntity === 'blocks' ? 'fa-layer-group' :
                            activeEntity === 'gram-panchayats' ? 'fa-home' :
                            'fa-village'
                        }`}></i>
                        {entityConfig[activeEntity].name}s
                        <span className="count-badge">{data.length}</span>
                    </h3>
                    <p>Select an existing {entityConfig[activeEntity].name.toLowerCase()} to continue or create a new one</p>
                </div>

                {renderDataCards()}
            </div>

            {showForm && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>
                                {editingId ? 'Edit' : 'Add New'} {entityConfig[activeEntity].name}
                            </h3>
                            <button onClick={() => setShowForm(false)} className="close-btn">×</button>
                        </div>
                        <form onSubmit={handleSubmit} className="form">
                            {entityConfig[activeEntity].fields.map(field => (
                                <div key={field.name} className="form-group">
                                    <label>
                                        {field.label} {field.required && '*'}
                                    </label>
                                    <input
                                        type={field.type}
                                        value={formData[field.name] || ''}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            [field.name]: field.type === 'number' ? 
                                                (e.target.value === '' ? 0 : parseFloat(e.target.value)) : 
                                                e.target.value
                                        })}
                                        required={field.required}
                                        step={field.type === 'number' ? (field.name === 'area' ? '0.01' : '1') : undefined}
                                    />
                                </div>
                            ))}
                            <div className="form-actions">
                                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    {editingId ? 'Update' : 'Create'} {entityConfig[activeEntity].name}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MasterDataManagement;