import React, { useState, useEffect } from 'react';

const DashboardStats = () => {
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/dashboard/stats', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const result = await response.json();
                setStats(result.stats || {});
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading">Loading dashboard...</div>;
    }

    return (
        <div className="dashboard-stats">
            <h2>Dashboard Overview</h2>
            <div className="stats-grid">
                {stats.total_users !== undefined && (
                    <div className="stat-card">
                        <div className="stat-icon users">
                            <i className="fas fa-users"></i>
                        </div>
                        <div className="stat-info">
                            <h3>{stats.total_users}</h3>
                            <p>Total Users</p>
                        </div>
                    </div>
                )}
                
                {stats.total_issues !== undefined && (
                    <div className="stat-card">
                        <div className="stat-icon issues">
                            <i className="fas fa-exclamation-circle"></i>
                        </div>
                        <div className="stat-info">
                            <h3>{stats.total_issues}</h3>
                            <p>Total Issues</p>
                        </div>
                    </div>
                )}
                
                {stats.pending_issues !== undefined && (
                    <div className="stat-card">
                        <div className="stat-icon pending">
                            <i className="fas fa-clock"></i>
                        </div>
                        <div className="stat-info">
                            <h3>{stats.pending_issues}</h3>
                            <p>Pending Issues</p>
                        </div>
                    </div>
                )}
                
                {stats.resolved_issues !== undefined && (
                    <div className="stat-card">
                        <div className="stat-icon resolved">
                            <i className="fas fa-check-circle"></i>
                        </div>
                        <div className="stat-info">
                            <h3>{stats.resolved_issues}</h3>
                            <p>Resolved Issues</p>
                        </div>
                    </div>
                )}
                
                {stats.total_villages !== undefined && (
                    <div className="stat-card">
                        <div className="stat-icon villages">
                            <i className="fas fa-village"></i>
                        </div>
                        <div className="stat-info">
                            <h3>{stats.total_villages}</h3>
                            <p>Total Villages</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardStats;