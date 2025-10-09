import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import DashboardStats from './DashboardStats';
import IssueForm from './IssueForm';
import IssuesList from './IssuesList';
import UsersList from './UsersList';
import MasterDataManagement from './MasterDataManagement';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <DashboardStats />;
            case 'create-issue':
                return <IssueForm onSuccess={() => setActiveTab('issues')} />;
            case 'issues':
                return <IssuesList />;
            case 'users':
                return <UsersList />;
            case 'master-data':
                return <MasterDataManagement />;
            default:
                return <DashboardStats />;
        }
    };

    return (
        <div className="dashboard">
            <header className="header">
                <div className="container">
                    <div className="header-content">
                        <div className="logo">
                            <i className="fas fa-mountain"></i>
                            Dehradun Connect
                            <span className="role-badge">{user?.role}</span>
                        </div>
                        <div className="user-info">
                            <span>Welcome, {user?.username || user?.role}</span>
                            <button onClick={logout} className="logout-btn">
                                <i className="fas fa-sign-out-alt"></i> Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="main-layout">
                <nav className="sidebar">
    <div className="sidebar-nav">
        <button
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
        >
            <i className="fas fa-chart-bar"></i> Dashboard
        </button>

        {user?.role === 'superadmin' && (
            <button
                className={`nav-item ${activeTab === 'master-data' ? 'active' : ''}`}
                onClick={() => setActiveTab('master-data')}
            >
                <i className="fas fa-database"></i> Master Data
            </button>
        )}

        {(user?.role === 'superadmin' || user?.role === 'admin') && (
            <button
                className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
                onClick={() => setActiveTab('users')}
            >
                <i className="fas fa-users"></i> Users
            </button>
        )}

        {user?.role === 'spoc' && (
            <button
                className={`nav-item ${activeTab === 'create-issue' ? 'active' : ''}`}
                onClick={() => setActiveTab('create-issue')}
            >
                <i className="fas fa-plus-circle"></i> Create Issue
            </button>
        )}

        <button
            className={`nav-item ${activeTab === 'issues' ? 'active' : ''}`}
            onClick={() => setActiveTab('issues')}
        >
            <i className="fas fa-list"></i> Issues
        </button>
    </div>
</nav>

                <main className="content">
                    {renderContent()}
                </main>
            </div>

            <style jsx>{`
                .dashboard {
                    min-height: 100vh;
                    background: #f8fafc;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }

                .header {
                    background: linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%);
                    color: white;
                    padding: 1rem 0;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    border-bottom: 1px solid #e2e8f0;
                }

                .container {
                    max-width: 100%;
                    margin: 0 auto;
                    padding: 0 2rem;
                }

                .header-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .logo {
                    font-size: 1.5rem;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: white;
                }

                .logo i {
                    color: #60a5fa;
                    font-size: 1.8rem;
                }

                .role-badge {
                    background: rgba(96, 165, 250, 0.2);
                    border: 1px solid #60a5fa;
                    padding: 0.25rem 0.75rem;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    margin-left: 1rem;
                    text-transform: capitalize;
                    font-weight: 600;
                }

                .user-info {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    font-weight: 500;
                    color: white;
                }

                .logout-btn {
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    color: white;
                    padding: 0.5rem 1rem;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-weight: 500;
                }

                .logout-btn:hover {
                    background: rgba(255, 255, 255, 0.2);
                    transform: translateY(-1px);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                }

                .main-layout {
                    display: flex;
                    min-height: calc(100vh - 80px);
                }

                .sidebar {
                    width: 260px;
                    background: white;
                    border-right: 1px solid #e2e8f0;
                    box-shadow: 2px 0 10px rgba(0,0,0,0.05);
                }

                .sidebar-nav {
                    padding: 1.5rem 1rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .nav-item {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.875rem 1rem;
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    color: #64748b;
                    font-weight: 500;
                    text-align: left;
                    width: 100%;
                    font-size: 0.95rem;
                }

                .nav-item:hover {
                    background: #f1f5f9;
                    border-color: #cbd5e1;
                    color: #475569;
                    transform: translateX(4px);
                }

                .nav-item.active {
                    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                    color: white;
                    border-color: #3b82f6;
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
                }

                .nav-item.active:hover {
                    background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
                    transform: translateX(4px);
                }

                .nav-item i {
                    width: 20px;
                    text-align: center;
                    font-size: 1rem;
                }

                .content {
                    flex: 1;
                    padding: 2rem;
                    background: #f8fafc;
                    overflow-y: auto;
                }

                @media (max-width: 768px) {
                    .container {
                        padding: 0 1rem;
                    }
                    
                    .header-content {
                        flex-direction: column;
                        gap: 1rem;
                        text-align: center;
                    }
                    
                    .main-layout {
                        flex-direction: column;
                    }
                    
                    .sidebar {
                        width: 100%;
                        border-right: none;
                        border-bottom: 1px solid #e2e8f0;
                    }
                    
                    .sidebar-nav {
                        flex-direction: row;
                        overflow-x: auto;
                        padding: 1rem;
                    }
                    
                    .nav-item {
                        min-width: 140px;
                        justify-content: center;
                        text-align: center;
                    }
                    
                    .content {
                        padding: 1rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default Dashboard;