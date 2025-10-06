import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { apiService, DEHRADUN_LOCATIONS } from './App';
import LoadingSpinner from './LoadingSpinner';
import IssueChart from './IssueChart';

const IssuesList = () => {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [chartData, setChartData] = useState(null);
    const { user } = useAuth();

    const fetchIssues = async () => {
        try {
            const data = await apiService.getIssues();
            setIssues(data.issues);
            
            // Prepare chart data
            const categoryCount = {};
            data.issues.forEach(issue => {
                const category = issue.issue_category.charAt(0).toUpperCase() + issue.issue_category.slice(1);
                categoryCount[category] = (categoryCount[category] || 0) + 1;
            });
            setChartData(categoryCount);
        } catch (error) {
            console.error('Failed to fetch issues:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIssues();
    }, []);

   const handleProvideHelp = async (issueId, helpType, event) => {
    try {
        await apiService.provideHelp(issueId, helpType);
        fetchIssues(); // Refresh the list
        // Show success animation
        const button = event.target;
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = 'scale(1)';
        }, 150);
    } catch (error) {
        console.error('Failed to provide help:', error);
        alert('Failed to provide help. Please try again.');
    }
};


    const getStatusBadge = (status, helpType) => {
        if (status === 'pending') {
            return <span className="status-badge status-pending">Pending</span>;
        } else if (status === 'financial_help') {
            return <span className="status-badge status-financial">Financial Help Provided</span>;
        } else if (status === 'non_financial_help') {
            return <span className="status-badge status-non-financial">Non-Financial Help Provided</span>;
        }
        return <span className="status-badge">{status}</span>;
    };

    const getVillageInfo = (issue) => {
        const village = DEHRADUN_LOCATIONS.villages.find(v => v.name === issue.village_name);
        if (village) {
            const gp = DEHRADUN_LOCATIONS.gramPanchayats.find(g => g.id === village.gramPanchayat_id);
            const block = gp ? DEHRADUN_LOCATIONS.blocks.find(b => b.id === gp.block_id) : null;
            return {
                village: village.name,
                gramPanchayat: gp?.name || '',
                block: block?.name || '',
                population: village.populationMale + village.populationFemale
            };
        }
        return { village: issue.village_name, gramPanchayat: '', block: '', population: 0 };
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="animate-fadeIn">
            {/* Chart Section */}
            {chartData && Object.keys(chartData).length > 0 && (
                <div style={{ marginBottom: '30px' }}>
                    <IssueChart data={chartData} />
                </div>
            )}

            {/* Issues Table */}
            <div className="card">
                <div className="card-header">
                    <i className="fas fa-list"></i>
                    {user.role === 'stakeholder' ? 'Available Issues to Help' : 
                     user.role === 'spoc' ? 'My Village-Issues' : 'All Issues'}
                </div>
                <div className="card-body" style={{ padding: 0 }}>
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Villager Details</th>
                                    <th>Location</th>
                                    <th>Issue Information</th>
                                    <th>Status</th>
                                    <th>Created</th>
                                    {user.role === 'stakeholder' && <th>Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {issues.map((issue, index) => {
                                    const villageInfo = getVillageInfo(issue);
                                    return (
                                        <tr key={issue.id} className="animate-fadeIn" style={{ animationDelay: `${index * 0.05}s` }}>
                                            <td>
                                                <div style={{ fontWeight: '600', color: '#333', marginBottom: '4px' }}>
                                                    <i className="fas fa-user"></i> {issue.villager_name}
                                                </div>
                                                <div style={{ fontSize: '12px', color: '#666', marginBottom: '2px' }}>
                                                    <i className="fas fa-phone"></i> {issue.mobile_number}
                                                </div>
                                                <div style={{ fontSize: '12px', color: '#666', marginBottom: '2px' }}>
                                                    <i className="fas fa-id-card"></i> {issue.aadhar_number}
                                                </div>
                                                <div style={{ fontSize: '12px', color: '#666' }}>
                                                    {issue.sex}, {issue.caste || 'Not specified'}
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: '600', color: '#333', marginBottom: '4px' }}>
                                                    <i className="fas fa-map-marker-alt"></i> {villageInfo.village}
                                                </div>
                                                <div style={{ fontSize: '12px', color: '#666', marginBottom: '2px' }}>
                                                    GP: {villageInfo.gramPanchayat}
                                                </div>
                                                <div style={{ fontSize: '12px', color: '#666', marginBottom: '2px' }}>
                                                    Block: {villageInfo.block}
                                                </div>
                                                <div style={{ fontSize: '12px', color: '#666' }}>
                                                    Population: {villageInfo.population.toLocaleString()}
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: '600', color: '#333', marginBottom: '4px' }}>
                                                    {issue.issue_category.charAt(0).toUpperCase() + issue.issue_category.slice(1)}
                                                </div>
                                                <div style={{ fontSize: '12px', color: '#666', marginBottom: '2px' }}>
                                                    Type: {issue.issue_type}
                                                </div>
                                                {issue.issue_description && (
                                                    <div style={{ fontSize: '12px', color: '#666', fontStyle: 'italic' }}>
                                                        "{issue.issue_description}"
                                                    </div>
                                                )}
                                            </td>
                                            <td>
                                                {getStatusBadge(issue.status, issue.help_type)}
                                            </td>
                                            <td>
                                                <div style={{ fontSize: '12px', color: '#666' }}>
                                                    {new Date(issue.created_at).toLocaleDateString()}
                                                </div>
                                                <div style={{ fontSize: '11px', color: '#999' }}>
                                                    {new Date(issue.created_at).toLocaleTimeString()}
                                                </div>
                                            </td>
                                            {user.role === 'stakeholder' && (
                                                <td>
                                                    {issue.status === 'pending' && (
                                                        <div className="action-buttons">
                                                            <button 
  className="btn btn-small btn-financial"
  onClick={(e) => handleProvideHelp(issue.id, 'financial', e)}
>
  <i className="fas fa-money-bill-wave"></i> Financial Help
</button>

                                                            <button 
                                                                className="btn btn-small btn-non-financial"
                                                                onClick={() => handleProvideHelp(issue.id, 'non_financial')}
                                                            >
                                                                <i className="fas fa-hands-helping"></i> Other Help
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IssuesList;