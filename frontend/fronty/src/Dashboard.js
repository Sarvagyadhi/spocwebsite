// import React, { useState } from 'react';
// import { useAuth } from './AuthProvider';
// import DashboardStats from './DashboardStats';
// import IssueForm from './IssueForm';
// import IssuesList from './IssuesList';

// const Dashboard = () => {
//     const { user, logout } = useAuth();
//     const [activeTab, setActiveTab] = useState('dashboard');

//     const renderContent = () => {
//         switch (activeTab) {
//             case 'dashboard':
//                 return <DashboardStats />;
//             case 'create-issue':
//                 return <IssueForm onSuccess={() => setActiveTab('issues')} />;
//             case 'issues':
//                 return <IssuesList />;
//             default:
//                 return <DashboardStats />;
//         }
//     };

//     return (
//         <div className="dashboard">
//             <header className="header">
//                 <div className="container">
//                     <div className="header-content">
//                         <div className="logo">
//                             <i className="fas fa-mountain"></i>
//                             Dehradun Connect
//                             <span className="role-badge">{user?.role}</span>
//                         </div>
//                         <div className="user-info">
//                             <span>Welcome, {user?.role}</span>
//                             <button onClick={logout} className="logout-btn">
//                                 <i className="fas fa-sign-out-alt"></i> Logout
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             </header>

//             <div className="main-layout">
//                 <nav className="sidebar">
//                     <div className="sidebar-nav">
//                         <button 
//                             className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
//                             onClick={() => setActiveTab('dashboard')}
//                         >
//                             <i className="fas fa-chart-bar"></i> Dashboard
//                         </button>
                        
//                         {user?.role === 'spoc' && (
//                             <button 
//                                 className={`nav-item ${activeTab === 'create-issue' ? 'active' : ''}`}
//                                 onClick={() => setActiveTab('create-issue')}
//                             >
//                                 <i className="fas fa-plus-circle"></i> Create Issue
//                             </button>
//                         )}
                        
//                         <button 
//                             className={`nav-item ${activeTab === 'issues' ? 'active' : ''}`}
//                             onClick={() => setActiveTab('issues')}
//                         >
//                             <i className="fas fa-list"></i> Issues
//                         </button>
//                     </div>
//                 </nav>

//                 <main className="content">
//                     {renderContent()}
//                 </main>
//             </div>
//         </div>
//     );
// };

// export default Dashboard;
import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import DashboardStats from './DashboardStats';
import IssueForm from './IssueForm';
import IssuesList from './IssuesList';
import UsersList from './UsersList'; // Add this import

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
            case 'users': // Add this case
                return <UsersList />;
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
                        
                        {/* Show Users tab only for superadmin and admin */}
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
        </div>
    );
};

export default Dashboard;