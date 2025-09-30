import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import backgroundImage from './6422443.jpg'; // Adjust path if needed

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        const success = await login(username, password);
        if (!success) {
            setError('Invalid credentials');
        }
        setLoading(false);
    };

    return (
        <div 
            className="login-container"
            style={{
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <div 
                className="login-card"
                style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.85)', // Semi-transparent white
                    backdropFilter: 'blur(10px)', // Adds glass effect
                    borderRadius: '12px',
                    padding: '2rem',
                    width: '100%',
                    maxWidth: '400px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
            >
                <div className="login-title">
                    <i className="fas fa-mountain"></i>
                    Dehradun Connect
                </div>
                <p className="login-subtitle">Village Issue Management System</p>
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                border: '1px solid rgba(0, 0, 0, 0.1)'
                            }}
                        />
                    </div>
                    
                    <div className="form-group">
                        <input
                            type="password"
                            className="form-input"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                border: '1px solid rgba(0, 0, 0, 0.1)'
                            }}
                        />
                    </div>
                    
                    {error && (
                        <div className="error-message">{error}</div>
                    )}
                    
                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={loading}
                        style={{
                            backgroundColor: 'rgba(59, 130, 246, 0.9)',
                            border: 'none'
                        }}
                    >
                        {loading ? (
                            <>
                                <i className="fas fa-spinner fa-spin"></i>
                                Signing in...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-sign-in-alt"></i>
                                Sign In
                            </>
                        )}
                    </button>
                </form>
                
                <div style={{ 
                    marginTop: '20px', 
                    fontSize: '12px', 
                    color: '#666', 
                    textAlign: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    padding: '10px',
                    borderRadius: '6px'
                }}>
                    <strong>Demo Credentials:</strong><br/>
                    SPOC: spoc_doiwala / spoc123<br/>
                    Stakeholder: stakeholder1 / stake123
                </div>
            </div>
        </div>
    );
};

export default Login;