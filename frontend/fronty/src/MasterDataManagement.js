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
    const [selectedParents, setSelectedParents] = useState({});
    const [parentOptions, setParentOptions] = useState({});
    
    const [config, setConfig] = useState(null);
    const [entities, setEntities] = useState([]);
    const [entityConfig, setEntityConfig] = useState({});

    // Debug state
    const [debugInfo, setDebugInfo] = useState('');

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/master-data/config', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const result = await response.json();
                setConfig(result);
                setEntities(result.entities);
                setEntityConfig(result.entityConfig);
                setDebugInfo('Config loaded successfully');
            } else {
                setDebugInfo('Failed to load config');
            }
        } catch (error) {
            console.error('Error fetching config:', error);
            setDebugInfo(`Config error: ${error.message}`);
        }
    };

    useEffect(() => {
        if (config && entities.length > 0) {
            console.log(`🔍 Fetching data for: ${activeEntity}`);
            console.log(`🔍 Selected Parents:`, selectedParents);
            fetchData();
            
            // Fetch parent options if needed
            if (entityConfig[activeEntity]?.parent) {
                fetchParentOptions();
            }
        }
    }, [activeEntity, selectedParents, config]);

    // Pre-populate form with selected parent when creating new entity
    useEffect(() => {
        if (showForm && !editingId) {
            const parentEntity = entityConfig[activeEntity]?.parent;
            const parentId = parentEntity ? selectedParents[parentEntity] : null;
            
            if (parentId) {
                console.log(`🏛️ Pre-populating ${activeEntity} form with ${parentEntity}:`, parentId);
                setFormData(prev => ({
                    ...prev,
                    // Use exact database field names
                    ...(activeEntity === 'districts' && { state_id: parentId }),
                    ...(activeEntity === 'blocks' && { district_id: parentId }),
                    ...(activeEntity === 'gram-panchayats' && { block_id: parentId }),
                    ...(activeEntity === 'villages' && { gramPanchayat_id: parentId })
                }));
            }
        }
    }, [showForm, activeEntity, editingId, selectedParents, entityConfig]);

   const fetchData = async () => {
    if (!config || !entityConfig[activeEntity]) return;
    
    setLoading(true);
    try {
        const token = localStorage.getItem('token');
        let url = `/api/master-data/${activeEntity}`;
        
        const parentEntity = entityConfig[activeEntity]?.parent;
        const parentId = parentEntity ? selectedParents[parentEntity] : null;
        
        console.log(`📡 Fetching ${activeEntity} with parent:`, { 
            parentEntity, 
            parentId,
            selectedParents 
        });
        
        // Build the correct query parameter based on parent entity - USE EXACT DATABASE FIELD NAMES
        if (parentEntity && parentId) {
            if (parentEntity === 'states') {
                url += `?state_id=${parentId}`;  // Exact database field: state_id
            } else if (parentEntity === 'districts') {
                url += `?district_id=${parentId}`;  // Exact database field: district_id
            } else if (parentEntity === 'blocks') {
                url += `?block_id=${parentId}`;  // Exact database field: block_id
            } else if (parentEntity === 'gram-panchayats') {
                url += `?gramPanchayat_id=${parentId}`;  // Exact database field: gramPanchayat_id
            }
        }

        console.log(`🌐 Final API URL: ${url}`);
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const result = await response.json();
            console.log(`✅ API Response for ${activeEntity}:`, result);
            
            const entityData = result[activeEntity] || result || [];
            console.log(`📊 Raw data from API (${entityData.length} items):`, entityData);
            
            // STRICT client-side filtering as backup
            let filteredData = entityData;
            if (parentEntity && parentId && Array.isArray(entityData)) {
                filteredData = entityData.filter(item => {
                    let itemParentId;
                    
                    // Use exact database field names for filtering
                    if (parentEntity === 'states') {
                        itemParentId = item.state_id;
                    } else if (parentEntity === 'districts') {
                        itemParentId = item.district_id;
                    } else if (parentEntity === 'blocks') {
                        itemParentId = item.block_id;
                    } else if (parentEntity === 'gram-panchayats') {
                        itemParentId = item.gramPanchayat_id;
                    }
                    
                    console.log(`🔍 Client-side filtering: item.${parentEntity}_id = ${itemParentId}, expected ${parentId}`);
                    return itemParentId == parentId;
                });
                console.log(`🔍 After client-side filtering: ${filteredData.length} items`, filteredData);
            }
            
            setData(filteredData);
            
            setDebugInfo(`Loaded ${filteredData.length} ${activeEntity} for ${parentEntity} ID: ${parentId}`);
        } else {
            console.error('❌ API Error:', response.status);
            const errorText = await response.text();
            console.error('Error details:', errorText);
            setData([]);
            setDebugInfo(`API Error: ${response.status} - ${errorText}`);
        }
    } catch (error) {
        console.error('❌ Network error:', error);
        setData([]);
        setDebugInfo(`Network error: ${error.message}`);
    } finally {
        setLoading(false);
    }
};

    const fetchParentOptions = async () => {
        const parentEntity = entityConfig[activeEntity]?.parent;
        if (!parentEntity) return;

        try {
            const token = localStorage.getItem('token');
            const url = `/api/master-data/${parentEntity}`;
            
            console.log(`📡 Fetching parent options for: ${parentEntity}`);
            
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const result = await response.json();
                const options = result[parentEntity] || result || [];
                console.log(`✅ Parent options for ${parentEntity}:`, options);
                
                setParentOptions(prev => ({
                    ...prev,
                    [parentEntity]: options
                }));
            }
        } catch (error) {
            console.error('Error fetching parent options:', error);
        }
    };

    const handleSelectAndContinue = (item) => {
        console.log('🎯 Select & Continue clicked:', {
            item,
            activeEntity,
            itemId: item.id,
            itemName: item.stateName || item.districtName || item.blockName || item.gramPancName
        });
        
        // Set the selected parent for the current entity
        const newSelectedParents = {
            ...selectedParents,
            [activeEntity]: item.id
        };
        
        console.log('🔄 New selected parents:', newSelectedParents);
        setSelectedParents(newSelectedParents);
        
        // Move to next entity
        const currentIndex = entities.indexOf(activeEntity);
        if (currentIndex < entities.length - 1) {
            const nextEntity = entities[currentIndex + 1];
            console.log(`➡️ Moving from ${activeEntity} to ${nextEntity}`);
            setActiveEntity(nextEntity);
        } else {
            console.log('🏁 Reached the last entity');
        }
    };

    const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const token = localStorage.getItem('token');
        const url = editingId 
            ? `/api/master-data/${activeEntity}/${editingId}`
            : `/api/master-data/${activeEntity}`;

        const method = editingId ? 'PUT' : 'POST';

        const submitData = { ...formData };
        
        const parentEntity = entityConfig[activeEntity]?.parent;
        
        // For all entities, automatically use the selected parent
        if (parentEntity && selectedParents[parentEntity] && !editingId) {
            // Use exact database field names
            if (parentEntity === 'states') {
                submitData['state_id'] = selectedParents[parentEntity];
                console.log('🏛️ Auto-setting state_id for district:', selectedParents[parentEntity]);
            } else if (parentEntity === 'districts') {
                submitData['district_id'] = selectedParents[parentEntity];
                console.log('🗺️ Auto-setting district_id for block:', selectedParents[parentEntity]);
            } else if (parentEntity === 'blocks') {
                submitData['block_id'] = selectedParents[parentEntity];
                console.log('🏘️ Auto-setting block_id for gram panchayat:', selectedParents[parentEntity]);
            } else if (parentEntity === 'gram-panchayats') {
                submitData['gramPanchayat_id'] = selectedParents[parentEntity];
                console.log('🏡 Auto-setting gramPanchayat_id for village:', selectedParents[parentEntity]);
            }
        }

        console.log('📤 Submitting data:', submitData);

        const response = await fetch(url, {
            method: method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(submitData)
        });

        if (response.ok) {
            const result = await response.json();
            console.log('✅ Submit success:', result);
            
            setShowForm(false);
            setFormData({});
            setEditingId(null);
            
            // If creating a state, automatically select it and move to districts
            if (activeEntity === 'states' && !editingId && result.record) {
                console.log('🔄 Auto-selecting new state and moving to districts');
                setSelectedParents(prev => ({
                    ...prev,
                    states: result.record.id
                }));
                setActiveEntity('districts');
            } else {
                fetchData();
            }
            
            alert(result.message || 'Operation successful!');
        } else {
            const errorText = await response.text();
            console.error('❌ Submit error:', errorText);
            alert('Error saving data');
        }
    } catch (error) {
        console.error('❌ Network error:', error);
        alert('Error saving data');
    }
};

    const getCurrentParentInfo = () => {
        const parentEntity = entityConfig[activeEntity]?.parent;
        if (!parentEntity || !selectedParents[parentEntity]) return null;
        
        const parents = parentOptions[parentEntity] || [];
        const selectedParent = parents.find(p => p.id === selectedParents[parentEntity]);
        
        return selectedParent ? {
            name: selectedParent.stateName || selectedParent.districtName || selectedParent.blockName || selectedParent.gramPancName,
            entity: parentEntity,
            id: selectedParent.id
        } : null;
    };

    const getParentFieldInfo = () => {
        const parentEntity = entityConfig[activeEntity]?.parent;
        if (!parentEntity || !selectedParents[parentEntity]) return null;
        
        const parents = parentOptions[parentEntity] || [];
        const selectedParent = parents.find(p => p.id === selectedParents[parentEntity]);
        
        return {
            entity: parentEntity,
            id: selectedParents[parentEntity],
            name: selectedParent ? 
                selectedParent.stateName || selectedParent.districtName || selectedParent.blockName || selectedParent.gramPancName 
                : 'Loading...',
            fieldName: 
                parentEntity === 'states' ? 'state_id' :
                parentEntity === 'districts' ? 'district_id' :
                parentEntity === 'blocks' ? 'block_id' :
                parentEntity === 'gram-panchayats' ? 'gramPanchayat_id' : ''
        };
    };

    const renderFormFields = () => {
        if (!entityConfig[activeEntity]) return null;
        
        const parentInfo = getParentFieldInfo();
        
        return entityConfig[activeEntity].fields.map(field => {
            // Special handling for parent selection - show as read-only when creating new entity
            if (parentInfo && field.name === parentInfo.fieldName && !editingId) {
                const parentDisplayName = 
                    parentInfo.entity === 'states' ? 'State' :
                    parentInfo.entity === 'districts' ? 'District' :
                    parentInfo.entity === 'blocks' ? 'Block' :
                    parentInfo.entity === 'gram-panchayats' ? 'Gram Panchayat' : 'Parent';
                
                return (
                    <div key={field.name} className="form-group">
                        <label>
                            {field.label} {field.required && '*'}
                        </label>
                        <div className="readonly-field">
                            <input
                                type="text"
                                value={parentInfo.name}
                                readOnly
                                className="form-input readonly"
                            />
                            <div className="field-note">
                                <i className="fas fa-info-circle"></i>
                                {parentDisplayName} is pre-selected from your previous choice
                            </div>
                        </div>
                        {/* Hidden input to maintain the parent_id in form data */}
                        <input
                            type="hidden"
                            name={field.name}
                            value={parentInfo.id}
                        />
                    </div>
                );
            }
            
            if (field.type === 'select' && field.name.endsWith('_id')) {
                const parentEntity = field.name.replace('_id', '');
                const options = parentOptions[parentEntity] || [];
                
                return (
                    <div key={field.name} className="form-group">
                        <label>
                            {field.label} {field.required && '*'}
                        </label>
                        <select
                            value={formData[field.name] || ''}
                            onChange={(e) => setFormData({
                                ...formData,
                                [field.name]: e.target.value
                            })}
                            required={field.required}
                            className="form-select"
                        >
                            <option value="">Select {field.label}</option>
                            {options.map(option => (
                                <option key={option.id} value={option.id}>
                                    {option.stateName || option.districtName || option.blockName || option.gramPancName || option.villageName}
                                </option>
                            ))}
                        </select>
                    </div>
                );
            }
            
            return (
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
                                (e.target.value === '' ? '' : parseFloat(e.target.value)) : 
                                e.target.value
                        })}
                        required={field.required}
                        step={field.step || (field.type === 'number' ? '1' : undefined)}
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                        className="form-input"
                    />
                </div>
            );
        });
    };

    const renderDataCards = () => {
        if (loading) return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading {entityConfig[activeEntity]?.name}s...</p>
            </div>
        );

        const parentInfo = getCurrentParentInfo();

        if (data.length === 0) {
            return (
                <div className="no-data-state">
                    <div className="no-data-icon">
                        <i className="fas fa-inbox"></i>
                    </div>
                    <h3>No {entityConfig[activeEntity]?.name}s Found</h3>
                    <p>
                        {parentInfo 
                            ? `No ${entityConfig[activeEntity]?.name.toLowerCase()}s found for ${parentInfo.name} (ID: ${parentInfo.id}).`
                            : `No ${entityConfig[activeEntity]?.name.toLowerCase()}s available. Create the first one to get started.`
                        }
                    </p>
                    <button 
                        onClick={() => {
                            setShowForm(true);
                            setFormData({});
                            setEditingId(null);
                        }}
                        className="btn-create-first"
                    >
                        <i className="fas fa-plus"></i>
                        Create New {entityConfig[activeEntity]?.name}
                    </button>
                </div>
            );
        }

        return (
            <div className="data-cards-grid">
                {data.map((item) => (
                    <div key={item.id} className="data-card">
                        <div className="card-header">
                            <div className="card-title-section">
                                <h4>{item.stateName || item.districtName || item.blockName || item.gramPancName || item.villageName}</h4>
                                <span className={`status-badge ${item.status || 'active'}`}>
                                    {item.status || 'active'}
                                </span>
                            </div>
                        </div>

                        <div className="card-content">
                            {parentInfo && (
                                <div className="parent-info">
                                    <i className="fas fa-level-up-alt"></i>
                                    <span>State: {parentInfo.name}</span>
                                </div>
                            )}
                            
                            {/* Show parent relationship info */}
                            {activeEntity === 'districts' && item.state_name && (
                                <div className="parent-detail">
                                    <i className="fas fa-map-marker-alt"></i>
                                    <span>State: {item.state_name}</span>
                                </div>
                            )}
                            
                            {activeEntity === 'villages' && (
                                <div className="village-stats">
                                    <div className="stat-item">
                                        <i className="fas fa-female"></i>
                                        <span>Female: {item.populationFemale || 0}</span>
                                    </div>
                                    <div className="stat-item">
                                        <i className="fas fa-male"></i>
                                        <span>Male: {item.populationMale || 0}</span>
                                    </div>
                                    <div className="stat-item">
                                        <i className="fas fa-ruler-combined"></i>
                                        <span>Area: {item.area || 0} km²</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="card-actions">
                            {activeEntity !== 'villages' && (
                                <button 
                                    onClick={() => handleSelectAndContinue(item)}
                                    className="btn-select-continue"
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
                                    E
                                </button>
                                <button 
                                    onClick={() => {
                                        if (window.confirm(`Are you sure you want to ${item.status === 'active' ? 'deactivate' : 'activate'} this record?`)) {
                                            handleStatusChange(item.id, item.status === 'active' ? 'inactive' : 'active');
                                        }
                                    }}
                                    className={`btn-status ${item.status === 'active' ? 'btn-inactive' : 'btn-active'}`}
                                >
                                    <i className={`fas ${item.status === 'active' ? 'fa-times' : 'fa-check'}`}></i>
                                    {item.status === 'active' ? 'D' : 'A'}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/master-data/${activeEntity}/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                fetchData();
                alert('Status updated successfully!');
            } else {
                alert('Error updating status');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Error updating status');
        }
    };

    // Debug component
    const DebugPanel = () => (
        <div style={{ 
            // background: '#f5f5f5', 
            // padding: '10px', 
            // margin: '10px 0', 
            // border: '1px solid #ccc',
            // fontSize: '12px',
            // maxHeight: '200px',
            // overflow: 'auto'
        }}>
            {/* <strong>Debug Info:</strong><br />
            Active Entity: {activeEntity}<br />
            Selected Parents: {JSON.stringify(selectedParents)}<br />
            Data Count: {data.length}<br />
            Parent Options: {Object.keys(parentOptions).join(', ')}<br />
            Current Parent: {getCurrentParentInfo() ? `${getCurrentParentInfo()?.name} (ID: ${getCurrentParentInfo()?.id})` : 'None'}<br />
            Debug: {debugInfo}<br /> */}
            {/* <button onClick={() => {
                console.log('Full State:', {
                    activeEntity,
                    selectedParents,
                    data,
                    parentOptions,
                    entityConfig
                });
            }}>Log Full State</button> */}
        </div>
    );

    if (!config) return <div>Loading configuration...</div>;

    const parentInfo = getCurrentParentInfo();

    return (
        <div className="master-data-management">
            {/* Enable debug panel in development */}
            {process.env.NODE_ENV === 'development' && <DebugPanel />}

            <div className="header-section">
                <div className="header-content">
                    <h1>
                        <i className="fas fa-database"></i>
                        Master Data Management
                    </h1>
                </div>
                <button 
                    className="btn-primary"
                    onClick={() => {
                        setShowForm(true);
                        setFormData({});
                        setEditingId(null);
                    }}
                >
                    <i className="fas fa-plus"></i>
                    Add {entityConfig[activeEntity]?.name}
                </button>
            </div>

            <div className="progress-steps">
                {entities.map((entity, index) => (
                    <div key={entity} className="step-container">
                        <div className={`step ${activeEntity === entity ? 'active' : ''}`}>
                            {/* <div className="step-icon">
                                <i className={`fas ${entityConfig[entity]?.icon}`}></i>
                            </div> */}
                            <span>{entityConfig[entity]?.name}s</span>
                        </div>
                        {index < entities.length - 1 && <div className="step-connector"></div>}
                    </div>
                ))}
            </div>

            <div className="main-content">
                <div className="content-header">
                    <div className="entity-info">
                        <div className="entity-icon">
                            <i className={`fas ${entityConfig[activeEntity]?.icon}`}></i>
                        </div>
                        <div className="entity-details">
                            <h2>{entityConfig[activeEntity]?.name}s Management</h2>
                            <p>
                                {parentInfo
                                    ? `Showing ${entityConfig[activeEntity]?.name.toLowerCase()}s for ${parentInfo.name} (ID: ${parentInfo.id})`
                                    : `Manage all ${entityConfig[activeEntity]?.name.toLowerCase()}s`
                                }
                            </p>
                        </div>
                    </div>
                </div>

                {renderDataCards()}

                <div className="navigation-buttons">
                    <button 
                        onClick={() => {
                            const index = entities.indexOf(activeEntity);
                            if (index > 0) setActiveEntity(entities[index - 1]);
                        }}
                        disabled={activeEntity === 'states'}
                        className="btn-secondary"
                    >
                        <i className="fas fa-arrow-left"></i>
                        Back
                    </button>
                </div>
            </div>

            {showForm && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>
                                {editingId ? 'Edit' : 'Add New'} {entityConfig[activeEntity]?.name}
                            </h3>
                            <button className="close-btn" onClick={() => setShowForm(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-form">
                            {renderFormFields()}
                            <div className="form-actions">
                                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    {editingId ? 'Update' : 'Create'} {entityConfig[activeEntity]?.name}
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