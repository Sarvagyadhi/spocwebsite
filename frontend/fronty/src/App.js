import React, { useState } from 'react';
import { AuthProvider, useAuth } from './AuthProvider';
import Login from './Login';
import Dashboard from './Dashboard';
import './styles.css';

// Constants
export const DEHRADUN_LOCATIONS = {
    state: {
        id: 1,
        name: 'Uttarakhand'
    },
    districts: [
        {
            id: 1,
            name: 'Dehradun',
            state_id: 1
        }
    ],
    blocks: [
        { id: 1, name: 'Doiwala', district_id: 1 },
        { id: 2, name: 'Raipur', district_id: 1 },
        { id: 3, name: 'Sahaspur', district_id: 1 },
        { id: 4, name: 'Vikasnagar', district_id: 1 },
        { id: 5, name: 'Chakrata', district_id: 1 },
        { id: 6, name: 'Kalsi', district_id: 1 }
    ],
    gramPanchayats: [
        { id: 1, name: 'Doiwala', block_id: 1 },
        { id: 2, name: 'Harrawala', block_id: 1 },
        { id: 3, name: 'Kandoli', block_id: 1 },
        { id: 4, name: 'Banjarawala', block_id: 1 },
        { id: 5, name: 'Raipur', block_id: 2 },
        { id: 6, name: 'Mothrowala', block_id: 2 },
        { id: 7, name: 'Dhanaulti', block_id: 2 },
        { id: 8, name: 'Suakholi', block_id: 2 },
        { id: 9, name: 'Sahaspur', block_id: 3 },
        { id: 10, name: 'Herbertpur', block_id: 3 },
        { id: 11, name: 'Selaqui', block_id: 3 },
        { id: 12, name: 'Bhogpur', block_id: 3 },
        { id: 13, name: 'Vikasnagar', block_id: 4 },
        { id: 14, name: 'Dakpathar', block_id: 4 },
        { id: 15, name: 'Yamkeshwar', block_id: 4 },
        { id: 16, name: 'Tyuni', block_id: 4 },
        { id: 17, name: 'Chakrata', block_id: 5 },
        { id: 18, name: 'Lokhandi', block_id: 5 },
        { id: 19, name: 'Kharadi', block_id: 5 },
        { id: 20, name: 'Kalsi', block_id: 6 },
        { id: 21, name: 'Lakhamandal', block_id: 6 },
        { id: 22, name: 'Tuni', block_id: 6 }
    ],
    villages: [
        { id: 1, name: 'Doiwala', gramPanchayat_id: 1, populationMale: 1200, populationFemale: 1100 },
        { id: 2, name: 'Arkediagrant', gramPanchayat_id: 1, populationMale: 800, populationFemale: 750 },
        { id: 3, name: 'Badripur', gramPanchayat_id: 1, populationMale: 600, populationFemale: 580 },
        { id: 4, name: 'Harrawala', gramPanchayat_id: 2, populationMale: 1500, populationFemale: 1400 },
        { id: 5, name: 'Bhaniawala', gramPanchayat_id: 2, populationMale: 900, populationFemale: 850 },
        { id: 6, name: 'Manduwala', gramPanchayat_id: 2, populationMale: 700, populationFemale: 680 },
        { id: 7, name: 'Kandoli', gramPanchayat_id: 3, populationMale: 1100, populationFemale: 1050 },
        { id: 8, name: 'Gujrada', gramPanchayat_id: 3, populationMale: 650, populationFemale: 620 },
        { id: 9, name: 'Raipur', gramPanchayat_id: 5, populationMale: 2000, populationFemale: 1900 },
        { id: 10, name: 'Maldevta', gramPanchayat_id: 5, populationMale: 800, populationFemale: 750 },
        { id: 11, name: 'Thalisain', gramPanchayat_id: 5, populationMale: 950, populationFemale: 900 },
        { id: 12, name: 'Mothrowala', gramPanchayat_id: 6, populationMale: 1300, populationFemale: 1250 },
        { id: 13, name: 'Rajpur', gramPanchayat_id: 6, populationMale: 1800, populationFemale: 1700 },
        { id: 14, name: 'Sahaspur', gramPanchayat_id: 9, populationMale: 2200, populationFemale: 2100 },
        { id: 15, name: 'Panditwari', gramPanchayat_id: 9, populationMale: 1000, populationFemale: 950 },
        { id: 16, name: 'Herbertpur', gramPanchayat_id: 10, populationMale: 1600, populationFemale: 1550 },
        { id: 17, name: 'Kaulagarh', gramPanchayat_id: 10, populationMale: 1200, populationFemale: 1150 },
        { id: 18, name: 'Selaqui', gramPanchayat_id: 11, populationMale: 2500, populationFemale: 2400 },
        { id: 19, name: 'Chandpur', gramPanchayat_id: 11, populationMale: 800, populationFemale: 780 },
        { id: 20, name: 'Vikasnagar', gramPanchayat_id: 13, populationMale: 3000, populationFemale: 2900 },
        { id: 21, name: 'Pachhwa Dun', gramPanchayat_id: 13, populationMale: 1100, populationFemale: 1050 },
        { id: 22, name: 'Chakrata', gramPanchayat_id: 17, populationMale: 1800, populationFemale: 1700 },
        { id: 23, name: 'Budha Kedar', gramPanchayat_id: 17, populationMale: 600, populationFemale: 580 },
        { id: 24, name: 'Kalsi', gramPanchayat_id: 20, populationMale: 1400, populationFemale: 1350 },
        { id: 25, name: 'Molta', gramPanchayat_id: 20, populationMale: 750, populationFemale: 720 }
    ]
};

export const ISSUE_TYPES = {
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
};

export const API_BASE_URL = 'http://localhost:5000/api';

export const apiService = {
    async request(endpoint, options = {}) {
        const token = localStorage.getItem('token');
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
            },
            ...options,
        };

        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    },
     async getUsers() {
        return this.request('/users');
    },

    async updateUserStatus(userId, status) {
        return this.request(`/users/${userId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
        });
    },

    async getIssues() {
        return this.request('/issues');
    },

    async createIssue(issueData) {
        return this.request('/issues', {
            method: 'POST',
            body: JSON.stringify(issueData),
        });
    },

    async provideHelp(issueId, helpType) {
        return this.request(`/issues/${issueId}/help`, {
            method: 'PUT',
            body: JSON.stringify({ help_type: helpType }),
        });
    },

    async getDashboardStats() {
        return this.request('/dashboard/stats');
    },
};

const AppContent = () => {
    const { user } = useAuth();

    if (!user) {
        return <Login />;
    }

    return <Dashboard />;
};

const App = () => {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
};

export default App;