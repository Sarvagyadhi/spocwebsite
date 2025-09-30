import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { apiService } from './App';

const DashboardStats = () => {
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await apiService.getDashboardStats();
                setStats(data.stats);
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <div className="loading"></div>;

    const getStatsCards = () => {
        switch (user.role) {
            case 'superadmin':
                return [
                    { title: 'Total Users', value: stats.total_users || 0, icon: 'fas fa-users', color: 'blue' },
                    { title: 'Total Issues', value: stats.total_issues || 0, icon: 'fas fa-exclamation-circle', color: 'green' },
                    { title: 'Pending Issues', value: stats.pending_issues || 0, icon: 'fas fa-clock', color: 'orange' },
                    { title: 'Resolved Issues', value: stats.resolved_issues || 0, icon: 'fas fa-check-circle', color: 'purple' },
                ];
            case 'admin':
                return [
                    { title: 'Total Issues', value: stats.total_issues || 0, icon: 'fas fa-exclamation-circle', color: 'green' },
                    { title: 'Pending Issues', value: stats.pending_issues || 0, icon: 'fas fa-clock', color: 'orange' },
                    { title: 'Resolved Issues', value: stats.resolved_issues || 0, icon: 'fas fa-check-circle', color: 'purple' },
                    { title: 'Total Villages', value: stats.total_villages || 0, icon: 'fas fa-home', color: 'blue' },
                ];
            case 'spoc':
                return [
                    { title: 'My Issues', value: stats.my_issues || 0, icon: 'fas fa-file-alt', color: 'green' },
                    { title: 'Pending', value: stats.pending_issues || 0, icon: 'fas fa-clock', color: 'orange' },
                    { title: 'Resolved', value: stats.resolved_issues || 0, icon: 'fas fa-check-circle', color: 'purple' },
                ];
            case 'stakeholder':
                return [
                    { title: 'Available Issues', value: stats.available_issues || 0, icon: 'fas fa-hand-holding-heart', color: 'blue' },
                    { title: 'Issues I Helped', value: stats.helped_issues || 0, icon: 'fas fa-heart', color: 'green' },
                ];
            default:
                return [];
        }
    };

    return (
        <div className="stats-grid">
            {getStatsCards().map((stat, index) => (
                <div key={index} className="stat-card animate-fadeIn" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="stat-header">
                        <div className={`stat-icon ${stat.color}`}>
                            <i className={stat.icon}></i>
                        </div>
                        <div className="stat-content">
                            <h3 className="animate-pulse">{stat.value}</h3>
                            <p>{stat.title}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default DashboardStats;