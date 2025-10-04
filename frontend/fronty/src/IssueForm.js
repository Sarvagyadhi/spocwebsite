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

    // Add these missing functions
    const handleNameKeyPress = (e) => {
        const charCode = e.charCode;
        // Allow only letters, spaces, and some special characters for names
        if (!((charCode >= 65 && charCode <= 90) || // A-Z
              (charCode >= 97 && charCode <= 122) || // a-z
              charCode === 32 || // space
              charCode === 39 || // apostrophe
              charCode === 45 || // hyphen
              charCode === 46)) { // period
            e.preventDefault();
        }
    };

    const handleNumericKeyPress = (e) => {
        const charCode = e.charCode;
        // Allow only numbers (0-9)
        if (charCode < 48 || charCode > 57) {
            e.preventDefault();
        }
    };

    // Enhanced handleInputChange function with validation
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        let filteredValue = value;
        
        // Apply filters based on field type
        if (name === 'villager_name') {
            // Remove any non-alphabet characters except spaces, apostrophes, hyphens, and periods
            filteredValue = value.replace(/[^a-zA-Z\s'.-]/g, '');
        } else if (name === 'mobile_number') {
            // Remove any non-numeric characters and limit to 10 digits
            filteredValue = value.replace(/\D/g, '').slice(0, 10);
        } else if (name === 'aadhar_number') {
            // Remove any non-numeric characters and limit to 12 digits
            filteredValue = value.replace(/\D/g, '').slice(0, 12);
        } else {
            filteredValue = value;
        }
        
        setFormData(prev => ({
            ...prev,
            [name]: filteredValue
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Enhanced validateStep1 function with better validation
    const validateStep1 = () => {
        const newErrors = {};
        
        // Enhanced name validation
        if (!formData.villager_name.trim()) {
            newErrors.villager_name = 'Villager name is required';
        } else if (!/^[a-zA-Z\s'.-]+$/.test(formData.villager_name)) {
            newErrors.villager_name = 'Name should contain only letters and spaces';
        } else if (formData.villager_name.trim().length < 2) {
            newErrors.villager_name = 'Name should be at least 2 characters long';
        }
        
        // Enhanced mobile number validation
        if (!formData.mobile_number) {
            newErrors.mobile_number = 'Mobile number is required';
        } else if (!/^\d{10}$/.test(formData.mobile_number)) {
            newErrors.mobile_number = 'Please enter a valid 10-digit mobile number';
        }
        
        // Enhanced Aadhar number validation
        if (!formData.aadhar_number) {
            newErrors.aadhar_number = 'Aadhar number is required';
        } else if (!/^\d{12}$/.test(formData.aadhar_number)) {
            newErrors.aadhar_number = 'Please enter a valid 12-digit Aadhar number';
        }
        
        // Gender validation
        if (!formData.sex) {
            newErrors.sex = 'Please select gender';
        }

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
        console.log('Submitting form data:', formData);
        
        const response = await apiService.createIssue(formData);
        console.log('Issue created successfully:', response);
        
        alert('Issue created successfully!');
        onSuccess();
        
        // Reset form
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
        
        // More specific error handling
        if (error.message.includes('405')) {
            alert('Server error: Method not allowed. Please check if the backend endpoint is configured correctly.');
        } else if (error.message.includes('401')) {
            alert('Authentication error. Please log in again.');
        } else if (error.message.includes('400')) {
            alert('Validation error. Please check your input data.');
        } else if (error.message.includes('500')) {
            alert('Server error. Please try again later.');
        } else {
            alert('Failed to create issue. Please try again.');
        }
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
                                onKeyPress={handleNameKeyPress}
                                placeholder="Enter full name (letters and spaces only)"
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
                                onKeyPress={handleNumericKeyPress}
                                maxLength="10"
                                placeholder="Enter 10-digit mobile number"
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
                                value={formData.aadhar_number}
                                onChange={handleInputChange}
                                onKeyPress={handleNumericKeyPress}
                                maxLength="12"
                                placeholder="Enter 12-digit Aadhar number"
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
                            <label className="form-label">Gender *</label>
                            <select
                                name="sex"
                                className="form-select"
                                value={formData.sex}
                                onChange={handleInputChange}
                                style={errors.sex ? { borderColor: '#f44336' } : {}}
                            >
                                <option value="">Select</option>
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