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
    const [showAllData, setShowAllData] = useState(false);

    const entities = ['states', 'districts', 'blocks', 'gram-panchayats', 'villages'];
    const canMoveNext = () => {
    // If no data, cannot move next
    if (data.length === 0) return false;

    // If parent entity required but not selected, cannot move next
    const parentEntity = entityConfig[activeEntity].parent;
    if (parentEntity && !selectedParents[parentEntity] && !showAllData) {
        return false;
    }

    return true;
};


    const entityConfig = {
        states: { 
            name: 'State', 
            fields: [{ name: 'stateName', label: 'State Name', type: 'text', required: true }],
            parent: null,
            icon: 'fa-globe-asia',
            color: 'from-blue-500 to-cyan-500'
        },
        districts: { 
            name: 'District', 
            fields: [
                { name: 'districtName', label: 'District Name', type: 'text', required: true },
                { name: 'state_id', label: 'State', type: 'select', required: true }
            ],
            parent: 'states',
            icon: 'fa-map-marked-alt',
            color: 'from-green-500 to-emerald-500'
        },
        blocks: { 
            name: 'Block', 
            fields: [
                { name: 'blockName', label: 'Block Name', type: 'text', required: true },
                { name: 'district_id', label: 'District', type: 'select', required: true }
            ],
            parent: 'districts',
            icon: 'fa-th-large',
            color: 'from-purple-500 to-pink-500'
        },
        'gram-panchayats': { 
            name: 'Gram Panchayat', 
            fields: [
                { name: 'gramPancName', label: 'Gram Panchayat Name', type: 'text', required: true },
                { name: 'block_id', label: 'Block', type: 'select', required: true }
            ],
            parent: 'blocks',
            icon: 'fa-home-heart',
            color: 'from-orange-500 to-red-500'
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
            parent: 'gram-panchayats',
            icon: 'fa-house-chimney',
            color: 'from-teal-500 to-blue-500'
        }
    };

    // Fetch data when entity changes
    useEffect(() => {
        fetchData();
        if (entityConfig[activeEntity].parent) {
            fetchParentOptions();
        }
        setShowAllData(false);
    }, [activeEntity, selectedParents]);

    // Debug useEffect
    useEffect(() => {
        console.log('=== SELECTION DEBUG ===');
        console.log('Active Entity:', activeEntity);
        console.log('Selected Parents:', selectedParents);
        const parentEntity = entityConfig[activeEntity].parent;
        console.log('Parent Entity:', parentEntity);
        console.log('Selected Parent ID:', selectedParents[parentEntity]);
    }, [activeEntity, selectedParents]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            let url = `/api/master-data/${activeEntity}`;
            
            // Always filter by selected parent if available
            const parentEntity = entityConfig[activeEntity].parent;
            if (parentEntity && selectedParents[parentEntity]) {
                url += `?${parentEntity}_id=${selectedParents[parentEntity]}`;
            }

            console.log('Fetching from URL:', url);
            console.log('Selected Parent ID:', selectedParents[parentEntity]);

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const result = await response.json();
                const dataKey = getDataKey(activeEntity);
                let filteredData = result[dataKey] || result || [];
                
                // Double-check client-side filtering to ensure only correct parent data is shown
                if (parentEntity && selectedParents[parentEntity] && Array.isArray(filteredData)) {
                    const parentId = selectedParents[parentEntity];
                    filteredData = filteredData.filter(item => {
                        // Check both possible field names for parent ID
                        const itemParentId = item[`${parentEntity}_id`] || item.state_id || item.district_id || item.block_id;
                        console.log(`Item: ${item.districtName || item.blockName}, Parent ID: ${itemParentId}, Expected: ${parentId}`);
                        return itemParentId == parentId; // Use == for loose comparison
                    });
                }
                
                console.log('Filtered Data:', filteredData);
                setData(filteredData);
            } else {
                setData(getMockData());
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setData(getMockData());
        } finally {
            setLoading(false);
        }
    };

    const fetchBasicData = async () => {
        try {
            const token = localStorage.getItem('token');
            let endpoint;

            switch(activeEntity) {
                case 'states': endpoint = '/api/states'; break;
                case 'districts': endpoint = '/api/districts'; break;
                case 'blocks': endpoint = '/api/blocks'; break;
                case 'gram-panchayats': endpoint = '/api/gram-panchayats'; break;
                case 'villages': endpoint = '/api/villages'; break;
                default: return;
            }

            const response = await fetch(endpoint, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const result = await response.json();
                const dataKey = getDataKey(activeEntity);
                setData(result[dataKey] || result || []);
            }
        } catch (error) {
            console.error('Error in fallback fetch:', error);
            setData(getMockData());
        }
    };

    const getMockData = () => {
        const parentEntity = entityConfig[activeEntity].parent;
        const parentId = parentEntity ? selectedParents[parentEntity] : null;

        console.log('Mock Data - Active Entity:', activeEntity, 'Parent ID:', parentId);

        switch(activeEntity) {
            case 'states':
                return [
                    { id: 1, stateName: 'Uttarakhand', status: 'active', createdOn: new Date().toISOString() },
                    { id: 2, stateName: 'Uttar Pradesh', status: 'active', createdOn: new Date().toISOString() },
                    { id: 3, stateName: 'Nagaland', status: 'active', createdOn: new Date().toISOString() }
                ];
            case 'districts':
                // STRICT FILTERING: Only show districts for the selected state
                if (parentId === 1) { // Uttarakhand
                    return [
                        { id: 1, districtName: 'Dehradun', state_id: 1, state_name: 'Uttarakhand', status: 'active', createdOn: new Date().toISOString() },
                        { id: 2, districtName: 'Haridwar', state_id: 1, state_name: 'Uttarakhand', status: 'active', createdOn: new Date().toISOString() }
                    ];
                }
                if (parentId === 2) { // Uttar Pradesh
                    return [
                        { id: 3, districtName: 'Lucknow', state_id: 2, state_name: 'Uttar Pradesh', status: 'active', createdOn: new Date().toISOString() },
                        { id: 4, districtName: 'Kanpur', state_id: 2, state_name: 'Uttar Pradesh', status: 'active', createdOn: new Date().toISOString() }
                    ];
                }
                if (parentId === 3) { // Nagaland
                    return [
                        { id: 5, districtName: 'Kohima', state_id: 3, state_name: 'Nagaland', status: 'active', createdOn: new Date().toISOString() },
                        { id: 6, districtName: 'Dimapur', state_id: 3, state_name: 'Nagaland', status: 'active', createdOn: new Date().toISOString() }
                    ];
                }
                return []; // Return empty if no state selected
            case 'blocks':
                if (parentId === 1) { // Dehradun district
                    return [
                        { id: 1, blockName: 'Dehradun Block', district_id: 1, district_name: 'Dehradun', status: 'active', createdOn: new Date().toISOString() }
                    ];
                }
                if (parentId === 5) { // Kohima district
                    return [
                        { id: 2, blockName: 'Kohima Block', district_id: 5, district_name: 'Kohima', status: 'active', createdOn: new Date().toISOString() }
                    ];
                }
                return [];
            case 'gram-panchayats':
                if (showAllData) {
                    return [
                        { id: 1, gramPancName: 'Gram Panchayat 1', block_id: 1, block_name: 'Dehradun Block', status: 'active', createdOn: new Date().toISOString() },
                        { id: 2, gramPancName: 'Gram Panchayat 2', block_id: 2, block_name: 'Haridwar Block', status: 'active', createdOn: new Date().toISOString() }
                    ];
                }
                if (selectedParents.blocks === 1) {
                    return [
                        { id: 1, gramPancName: 'Gram Panchayat 1', block_id: 1, block_name: 'Dehradun Block', status: 'active', createdOn: new Date().toISOString() }
                    ];
                }
                return [];
            case 'villages':
                if (showAllData) {
                    return [
                        { id: 1, villageName: 'Village 1', gramPanchayat_id: 1, gram_panchayat_name: 'Gram Panchayat 1', status: 'active', createdOn: new Date().toISOString() },
                        { id: 2, villageName: 'Village 2', gramPanchayat_id: 2, gram_panchayat_name: 'Gram Panchayat 2', status: 'active', createdOn: new Date().toISOString() }
                    ];
                }
                if (selectedParents['gram-panchayats'] === 1) {
                    return [
                        { id: 1, villageName: 'Village 1', gramPanchayat_id: 1, gram_panchayat_name: 'Gram Panchayat 1', status: 'active', createdOn: new Date().toISOString() }
                    ];
                }
                return [];
            default:
                return [];
        }
    };

    const getDataKey = (entity) => {
        const keyMap = {
            'states': 'states',
            'districts': 'districts', 
            'blocks': 'blocks',
            'gram-panchayats': 'gram_panchayats',
            'villages': 'villages'
        };
        return keyMap[entity] || entity;
    };

    const fetchParentOptions = async () => {
        const parentEntity = entityConfig[activeEntity].parent;
        if (!parentEntity) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/master-data/${parentEntity}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const result = await response.json();
                const dataKey = getDataKey(parentEntity);
                setParentOptions(prev => ({
                    ...prev,
                    [parentEntity]: result[dataKey] || result || []
                }));
            }
        } catch (error) {
            console.error('Error fetching parent options:', error);
            setParentOptions(prev => ({
                ...prev,
                [parentEntity]: getMockParentData(parentEntity)
            }));
        }
    };

    const getMockParentData = (parentEntity) => {
        switch(parentEntity) {
            case 'states':
                return [
                    { id: 1, stateName: 'Uttarakhand' },
                    { id: 2, stateName: 'Uttar Pradesh' },
                    { id: 3, stateName: 'Nagaland' }
                ];
            case 'districts':
                return [
                    { id: 1, districtName: 'Dehradun' },
                    { id: 2, districtName: 'Haridwar' },
                    { id: 3, districtName: 'Lucknow' }
                ];
            case 'blocks':
                return [
                    { id: 1, blockName: 'Dehradun Block' },
                    { id: 2, blockName: 'Haridwar Block' }
                ];
            case 'gram-panchayats':
                return [
                    { id: 1, gramPancName: 'Gram Panchayat 1' },
                    { id: 2, gramPancName: 'Gram Panchayat 2' }
                ];
            default:
                return [];
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
            
            const parentEntity = entityConfig[activeEntity].parent;
            if (parentEntity && selectedParents[parentEntity] && !editingId) {
                submitData[`${parentEntity}_id`] = selectedParents[parentEntity];
            }

            console.log('Submitting data:', submitData);

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
                setShowForm(false);
                setFormData({});
                setEditingId(null);
                
                if (activeEntity === 'states' && !editingId && result.id) {
                    setSelectedParents(prev => ({
                        ...prev,
                        states: result.id
                    }));
                    setActiveEntity('districts');
                } else {
                    fetchData();
                }
                
                alert(`${entityConfig[activeEntity].name} ${editingId ? 'updated' : 'created'} successfully!`);
            } else {
                const errorText = await response.text();
                console.error('Server error:', errorText);
                alert('Error saving data. Please try again.');
            }
        } catch (error) {
            console.error('Error saving data:', error);
            alert('Error saving data. Please check your connection.');
        }
    };

    const handleSelectAndContinue = (item) => {
        console.log('Selecting:', item);
        
        setSelectedParents(prev => ({
            ...prev,
            [activeEntity]: item.id
        }));
        
        setShowAllData(false);
        
        const currentIndex = entities.indexOf(activeEntity);
        if (currentIndex < entities.length - 1) {
            const nextEntity = entities[currentIndex + 1];
            console.log(`Moving from ${activeEntity} to ${nextEntity}`);
            setActiveEntity(nextEntity);
        }
    };

    const getCurrentParentName = () => {
        const parentEntity = entityConfig[activeEntity].parent;
        if (!parentEntity || !selectedParents[parentEntity]) return null;
        
        const parents = parentOptions[parentEntity] || [];
        const selectedParent = parents.find(p => p.id === selectedParents[parentEntity]);
        
        if (!selectedParent) {
            const allData = data.concat(Object.values(parentOptions).flat());
            const foundParent = allData.find(item => item.id === selectedParents[parentEntity]);
            return foundParent ? (foundParent.stateName || foundParent.districtName || foundParent.blockName || foundParent.gramPancName) : 'Selected';
        }
        
        return selectedParent.stateName || selectedParent.districtName || selectedParent.blockName || selectedParent.gramPancName || 'Selected';
    };

    const clearParentFilter = () => {
        const parentEntity = entityConfig[activeEntity].parent;
        if (parentEntity) {
            setSelectedParents(prev => {
                const updated = { ...prev };
                delete updated[parentEntity];
                return updated;
            });
        }
        setShowAllData(false);
    };

    const toggleShowAllData = () => {
        setShowAllData(prev => !prev);
    };

    const getParentName = (item) => {
        const parentEntity = entityConfig[activeEntity].parent;
        if (!parentEntity) return '';
        
        if (selectedParents[parentEntity]) {
            const parents = parentOptions[parentEntity] || [];
            const selectedParent = parents.find(p => p.id === selectedParents[parentEntity]);
            return selectedParent ? (selectedParent.stateName || selectedParent.districtName || selectedParent.blockName || selectedParent.gramPancName) : 'N/A';
        }
        
        const parentNameField = `${parentEntity}_name`;
        const parentNameFieldAlt = parentEntity === 'states' ? 'stateName' : 
                                 parentEntity === 'districts' ? 'districtName' :
                                 parentEntity === 'blocks' ? 'blockName' : 'gramPancName';
        
        return item[parentNameField] || item[parentNameFieldAlt] || item.stateName || item.districtName || item.blockName || 'N/A';
    };

    const renderFormFields = () => {
        return entityConfig[activeEntity].fields.map(field => {
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
                                    {option.stateName || option.districtName || option.blockName || option.gramPancName}
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
                                (e.target.value === '' ? 0 : parseFloat(e.target.value)) : 
                                e.target.value
                        })}
                        required={field.required}
                        step={field.type === 'number' ? (field.name === 'area' ? '0.01' : '1') : undefined}
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                    />
                </div>
            );
        });
    };

    const renderDataCards = () => {
        if (loading) return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading {entityConfig[activeEntity].name}s...</p>
            </div>
        );

        if (data.length === 0) {
            const parentName = getCurrentParentName();
            return (
                <div className="no-data-state">
                    <div className="no-data-icon">
                        <i className="fas fa-inbox"></i>
                    </div>
                    <h3>No {entityConfig[activeEntity].name}s Found</h3>
                    <p>
                        {parentName && !showAllData
                            ? `No ${entityConfig[activeEntity].name.toLowerCase()}s found for ${parentName}.`
                            : `No ${entityConfig[activeEntity].name.toLowerCase()}s available. Create the first one to get started.`}
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
                        Create New {entityConfig[activeEntity].name}
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
                            {activeEntity !== 'states' && (
                                <div className="parent-info">
                                    <i className="fas fa-level-up-alt"></i>
                                    <span><strong>Parent:</strong> {getParentName(item)}</span>
                                </div>
                            )}
                            
                            {activeEntity === 'villages' && (
                                <div className="village-stats">
                                    <div className="stat-item">
                                        <i className="fas fa-female"></i>
                                        <span>{item.populationFemale || 0}</span>
                                    </div>
                                    <div className="stat-item">
                                        <i className="fas fa-male"></i>
                                        <span>{item.populationMale || 0}</span>
                                    </div>
                                    <div className="stat-item">
                                        <i className="fas fa-ruler-combined"></i>
                                        <span>{item.area || 0} km²</span>
                                    </div>
                                </div>
                            )}
                            
                            
                            <div className="card-footer">
                                <span className="created-date">
                                    <i className="fas fa-calendar"></i>
                                    Created: {item.createdOn ? new Date(item.createdOn).toLocaleDateString() : 'N/A'}
                                </span>
                            </div>
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
        title="Edit"
        style={{
            backgroundColor: '#4f46e5', // example color, adjust as needed
            color: 'white',
            fontWeight: 'bold',
            borderRadius: '4px',
            width: '30px',
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}
    >
        E
    </button>

                               <button 
    onClick={() => handleStatusChange(item.id, item.status === 'active' ? 'inactive' : 'active')}
    className={`btn-status ${item.status === 'active' ? 'btn-inactive' : 'btn-active'}`}
    title={item.status === 'active' ? 'Deactivate' : 'Activate'}
    style={{
        width: '30px',
        height: '30px',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        color: 'white',
        backgroundColor: item.status === 'active' ? '#dc2626' : '#16a34a' // red for deactivate, green for activate
    }}
>
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
        if (!window.confirm(`Are you sure you want to ${newStatus === 'active' ? 'activate' : 'deactivate'} this record?`)) {
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
                body: JSON.stringify({ status: newStatus })
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

    const currentParentName = getCurrentParentName();
    const hasParentSelected = currentParentName && !showAllData;

    return (
        <div className="master-data-management">
            <div className="header-section">
                <div className="header-content">
                    <h1>
                        <i className="fas fa-database"></i>
                        Master Data Management
                    </h1>
                    <div className="breadcrumb">
                        {/* <span>Dashboard</span>
                        <i className="fas fa-chevron-right"></i> */}
                        {/* <span className="active">{entityConfig[activeEntity].name}s</span> */}
                    </div>
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
                    Add {entityConfig[activeEntity].name}
                </button>
            </div>

            <div className="progress-steps">
                {entities.map((entity, index) => (
                    <div key={entity} className="step-container">
                        <div className={`step ${activeEntity === entity ? 'active' : ''}`}>
                            <div className="step-icon">
                                <i className={`fas ${entityConfig[entity].icon}`}></i>
                            </div>
                            <span>{entityConfig[entity].name}s</span>
                        </div>
                        {index < entities.length - 1 && <div className="step-connector"></div>}
                    </div>
                ))}
            </div>

            <div className="main-content">
                <div className="content-header">
                    <div className="entity-info">
                        <div className="entity-icon">
                            <i className={`fas ${entityConfig[activeEntity].icon}`}></i>
                        </div>
                        <div className="entity-details">
                            <h2>{entityConfig[activeEntity].name}s Management</h2>
                            <p>
                                {hasParentSelected
                                    ? `Showing ${entityConfig[activeEntity].name.toLowerCase()}s for ${currentParentName}`
                                    : showAllData
                                    ? `Showing all ${entityConfig[activeEntity].name.toLowerCase()}s`
                                    : `Manage all ${entityConfig[activeEntity].name.toLowerCase()}s`}
                            </p>
                        </div>
                        {/* <div className="filter-buttons">
                            {hasParentSelected && (
                                <button 
                                    onClick={toggleShowAllData}
                                    className="btn-show-all"
                                >
                                    <i className="fas fa-eye"></i>
                                    {showAllData ? 'Show Filtered' : 'Show All'}
                                </button>
                            )}
                            {hasParentSelected && (
                                <button 
                                    onClick={clearParentFilter}
                                    className="btn-clear-filter"
                                >
                                    <i className="fas fa-times"></i>
                                    Clear Filter
                                </button>
                            )}
                        </div> */}
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

    {data.length > 0 && activeEntity !== 'villages' && (
        <button 
            onClick={() => {
                const index = entities.indexOf(activeEntity);
                if (index < entities.length - 1) setActiveEntity(entities[index + 1]);
            }}
            className="btn-primary"
        >
            Next
            <i className="fas fa-arrow-right"></i>
        </button>
    )}
</div>

            </div>

            {showForm && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>
                                {editingId ? 'Edit' : 'Add New'} {entityConfig[activeEntity].name}
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