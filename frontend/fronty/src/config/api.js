const API_BASE_URL = 'http://localhost:5000/api';

export const API_ENDPOINTS = {
    // Authentication
    LOGIN: `${API_BASE_URL}/login`,
    REGISTER: `${API_BASE_URL}/register`,
    
    // Master Data - GET
    GET_STATES: `${API_BASE_URL}/master-data/states`,
    GET_DISTRICTS: `${API_BASE_URL}/master-data/districts`,
    GET_BLOCKS: `${API_BASE_URL}/master-data/blocks`,
    GET_GRAM_PANCHAYATS: `${API_BASE_URL}/master-data/gram-panchayats`,
    GET_VILLAGES: `${API_BASE_URL}/master-data/villages`,
    
    // Master Data - CREATE
    CREATE_STATE: `${API_BASE_URL}/states`,
    CREATE_DISTRICT: `${API_BASE_URL}/districts`,
    CREATE_BLOCK: `${API_BASE_URL}/blocks`,
    CREATE_GRAM_PANCHAYAT: `${API_BASE_URL}/gram-panchayats`,
    CREATE_VILLAGE: `${API_BASE_URL}/villages/create`,
    
    // Master Data - OPTIONS
    GET_ACTIVE_STATES: `${API_BASE_URL}/master-data/states/active`,
    GET_ACTIVE_DISTRICTS: `${API_BASE_URL}/master-data/districts/active`,
    GET_ACTIVE_BLOCKS: `${API_BASE_URL}/master-data/blocks/active`,
    GET_ACTIVE_GRAM_PANCHAYATS: `${API_BASE_URL}/master-data/gram-panchayats/active`,
    
    // Master Data - UPDATE
    UPDATE_MASTER_DATA: (entity, id) => `${API_BASE_URL}/master-data/${entity}/${id}`,
    UPDATE_STATUS: (entity, id) => `${API_BASE_URL}/master-data/${entity}/${id}/status`,
    
    // Other endpoints
    DASHBOARD_STATS: `${API_BASE_URL}/dashboard/stats`,
    ISSUES: `${API_BASE_URL}/issues`,
    USERS: `${API_BASE_URL}/users`,
    ISSUE_TYPES: `${API_BASE_URL}/issue-types`,
};

export default API_BASE_URL;