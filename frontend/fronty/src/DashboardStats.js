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
            const response = await fetch('/api/stats', {
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

            <style jsx>{`
                .dashboard-stats {
                    max-width: 1200px;
                }

                h2 {
                    color: #1e293b;
                    margin-bottom: 2rem;
                    font-size: 1.75rem;
                    font-weight: 700;
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                    gap: 1.5rem;
                    margin-top: 1rem;
                }

                .stat-card {
                    background: white;
                    border-radius: 12px;
                    padding: 1.5rem;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                    border: 1px solid #e2e8f0;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .stat-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                }

                .stat-icon {
                    width: 60px;
                    height: 60px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                    color: white;
                }

                .stat-icon.users {
                    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                }

                .stat-icon.issues {
                    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                }

                .stat-icon.pending {
                    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                }

                .stat-icon.resolved {
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                }

                .stat-icon.villages {
                    background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
                }

                .stat-info h3 {
                    font-size: 2rem;
                    font-weight: 700;
                    color: #1e293b;
                    margin: 0;
                    line-height: 1;
                }

                .stat-info p {
                    color: #64748b;
                    margin: 0.5rem 0 0 0;
                    font-weight: 500;
                }
            `}</style>
        </div>
    );
};

export default DashboardStats;