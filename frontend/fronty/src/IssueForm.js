import React, { useState } from 'react';
import { ISSUE_TYPES, apiService } from './App';

const IssueForm = ({ onSuccess }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        villager_name: '',
        mobile_number: '',
        aadhar_number: '',
        caste: '',
        sex: '',
        issue_category: '',
        issue_type: '',
        issue_description: ''
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
            ...(name === 'issue_category' && { issue_type: '' })
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateStep1 = () => {
        const newErrors = {};
        if (!formData.villager_name.trim()) newErrors.villager_name = 'Villager name is required';
        if (!formData.mobile_number.trim()) newErrors.mobile_number = 'Mobile number is required';
        if (!/^\d{10}$/.test(formData.mobile_number)) newErrors.mobile_number = 'Please enter a valid 10-digit mobile number';
        if (!formData.aadhar_number.trim()) newErrors.aadhar_number = 'Aadhar number is required';
        if (!/^\d{12}$/.test(formData.aadhar_number)) newErrors.aadhar_number = 'Please enter a valid 12-digit Aadhar number';
        if (!formData.sex) newErrors.sex = 'Please select sex';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        const newErrors = {};
        if (!formData.issue_category) newErrors.issue_category = 'Please select an issue category';
        if (!formData.issue_type) newErrors.issue_type = 'Please select an issue type';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const nextStep = () => {
        if (validateStep1()) {
            setCurrentStep(2);
        }
    };

    const prevStep = () => {
        setCurrentStep(1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateStep2()) return;

        setLoading(true);
        try {
            await apiService.createIssue(formData);
            onSuccess();
            setFormData({
                villager_name: '',
                mobile_number: '',
                aadhar_number: '',
                caste: '',
                sex: '',
                issue_category: '',
                issue_type: '',
                issue_description: ''
            });
            setCurrentStep(1);
            setErrors({});
        } catch (error) {
            console.error('Failed to create issue:', error);
            alert('Failed to create issue. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card animate-fadeIn">
            <div className="card-header">
                <i className="fas fa-plus-circle"></i>
                Create New Village Issue
            </div>
            <div className="card-body">
                <div className="step-indicator">
                    <div className={`step ${currentStep === 1 ? 'active' : 'inactive'}`}>1</div>
                    <div className={`step-line ${currentStep === 2 ? 'active' : ''}`}></div>
                    <div className={`step ${currentStep === 2 ? 'active' : 'inactive'}`}>2</div>
                </div>

                <form onSubmit={handleSubmit}>
                    {currentStep === 1 && (
                        <div className="animate-slideInRight">
                            <h4 style={{ marginBottom: '20px', color: '#333' }}>Step 1: Villager Information</h4>
                            
                            <div className="form-row">
                                <div>
                                    <label className="form-label">Villager Name *</label>
                                    <input
                                        type="text"
                                        name="villager_name"
                                        className="form-input"
                                        value={formData.villager_name}
                                        onChange={handleInputChange}
                                        style={errors.villager_name ? { borderColor: '#f44336' } : {}}
                                    />
                                    {errors.villager_name && <div style={{ color: '#f44336', fontSize: '12px', marginTop: '4px' }}>{errors.villager_name}</div>}
                                </div>
                                
                                <div>
                                    <label className="form-label">Mobile Number *</label>
                                    <input
                                        type="tel"
                                        name="mobile_number"
                                        className="form-input"
                                        value={formData.mobile_number}
                                        onChange={handleInputChange}
                                        style={errors.mobile_number ? { borderColor: '#f44336' } : {}}
                                    />
                                    {errors.mobile_number && <div style={{ color: '#f44336', fontSize: '12px', marginTop: '4px' }}>{errors.mobile_number}</div>}
                                </div>
                            </div>

                            <div className="form-row">
                                <div>
                                    <label className="form-label">Aadhar Number *</label>
                                    <input
                                        type="text"
                                        name="aadhar_number"
                                        className="form-input"
                                        maxLength="12"
                                        value={formData.aadhar_number}
                                        onChange={handleInputChange}
                                        style={errors.aadhar_number ? { borderColor: '#f44336' } : {}}
                                    />
                                    {errors.aadhar_number && <div style={{ color: '#f44336', fontSize: '12px', marginTop: '4px' }}>{errors.aadhar_number}</div>}
                                </div>
                                
                                <div>
                                    <label className="form-label">Caste</label>
                                    <select
                                        name="caste"
                                        className="form-select"
                                        value={formData.caste}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Select Caste</option>
                                        <option value="General">General</option>
                                        <option value="OBC">OBC</option>
                                        <option value="SC">SC</option>
                                        <option value="ST">ST</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div>
                                    <label className="form-label">Sex *</label>
                                    <select
                                        name="sex"
                                        className="form-select"
                                        value={formData.sex}
                                        onChange={handleInputChange}
                                        style={errors.sex ? { borderColor: '#f44336' } : {}}
                                    >
                                        <option value="">Select Sex</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    {errors.sex && <div style={{ color: '#f44336', fontSize: '12px', marginTop: '4px' }}>{errors.sex}</div>}
                                </div>
                            </div>

                            <div style={{ textAlign: 'right', marginTop: '30px' }}>
                                <button type="button" onClick={nextStep} className="btn btn-success">
                                    Next Step <i className="fas fa-arrow-right"></i>
                                </button>
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="animate-slideInLeft">
                            <h4 style={{ marginBottom: '20px', color: '#333' }}>Step 2: Issue Details</h4>
                            
                            <div className="form-row">
                                <div>
                                    <label className="form-label">Issue Category *</label>
                                    <select
                                        name="issue_category"
                                        className="form-select"
                                        value={formData.issue_category}
                                        onChange={handleInputChange}
                                        style={errors.issue_category ? { borderColor: '#f44336' } : {}}
                                    >
                                        <option value="">Select Category</option>
                                        {Object.keys(ISSUE_TYPES).map(category => (
                                            <option key={category} value={category}>
                                                {category.charAt(0).toUpperCase() + category.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.issue_category && <div style={{ color: '#f44336', fontSize: '12px', marginTop: '4px' }}>{errors.issue_category}</div>}
                                </div>
                                
                                <div>
                                    <label className="form-label">Issue Type *</label>
                                    <select
                                        name="issue_type"
                                        className="form-select"
                                        value={formData.issue_type}
                                        onChange={handleInputChange}
                                        disabled={!formData.issue_category}
                                        style={errors.issue_type ? { borderColor: '#f44336' } : {}}
                                    >
                                        <option value="">Select Issue Type</option>
                                        {formData.issue_category && ISSUE_TYPES[formData.issue_category] && 
                                            ISSUE_TYPES[formData.issue_category].map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                    </select>
                                    {errors.issue_type && <div style={{ color: '#f44336', fontSize: '12px', marginTop: '4px' }}>{errors.issue_type}</div>}
                                </div>
                            </div>

                            <div>
                                <label className="form-label">Issue Description (Optional)</label>
                                <textarea
                                    name="issue_description"
                                    className="form-textarea"
                                    rows="4"
                                    value={formData.issue_description}
                                    onChange={handleInputChange}
                                    placeholder="Provide additional details about the issue..."
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
                                <button type="button" onClick={prevStep} className="btn btn-secondary">
                                    <i className="fas fa-arrow-left"></i> Previous
                                </button>
                                
                                <button type="submit" disabled={loading} className="btn btn-success">
                                    {loading ? (
                                        <>
                                            <i className="fas fa-spinner fa-spin"></i> Creating...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-plus"></i> Create Issue
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default IssueForm;