import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import backgroundImage from './6422443.jpg';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Login form submitted'); // Debug log
        
        // Basic validation
        if (!username.trim() || !password.trim()) {
            setError('Please enter both username and password');
            return;
        }

        setLoading(true);
        setError('');
        
        try {
            console.log('Attempting login with:', { username, password }); // Debug log
            const success = await login(username, password);
            console.log('Login result:', success); // Debug log
            
            if (!success) {
                setError('Invalid username or password');
            }
        } catch (err) {
            console.error('Login error:', err); // Debug log
            setError('Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Test the login function directly
    const testLogin = async () => {
        console.log('Testing login function...');
        try {
            const result = await login('spoc_doiwala', 'spoc123');
            console.log('Test login result:', result);
        } catch (err) {
            console.error('Test login error:', err);
        }
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
                justifyContent: 'center',
                padding: '20px',
                fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
            }}
        >
            <div 
                className="login-card"
                style={{
                    backgroundColor: 'transparent',
                    backdropFilter: 'blur(50px)',
                    borderRadius: '16px',
                    padding: '2rem',
                    width: '100%',
                    maxWidth: '400px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
            >
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ 
                        fontSize: '28px', 
                        fontWeight: 'bold', 
                        color: '#072479',
                        margin: '0 0 8px 0'
                    }}>
                        GRAM CONNECT
                    </h1>
                    <p style={{ 
                        color: '#072479', 
                        margin: 0,
                        fontWeight: '600',
                        fontSize: '14px'
                    }}>
                        VILLAGE MANAGEMENT
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Username Field */}
                    <div style={{ marginBottom: '1rem' }}>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => {
                                setUsername(e.target.value);
                                setError(''); // Clear error when user types
                            }}
                            required
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: '8px',
                                border: '2px solid #e1e5e9',
                                backgroundColor: 'white',
                                fontSize: '14px',
                                outline: 'none',
                                boxSizing: 'border-box'
                            }}
                            placeholder="Username"
                            disabled={loading}
                        />
                    </div>

                    {/* Password Field */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setError(''); // Clear error when user types
                            }}
                            required
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: '8px',
                                border: '2px solid #e1e5e9',
                                backgroundColor: 'white',
                                fontSize: '14px',
                                outline: 'none',
                                boxSizing: 'border-box'
                            }}
                            placeholder="Password"
                            disabled={loading}
                        />
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div style={{
                            backgroundColor: '#fee2e2',
                            border: '1px solid #fecaca',
                            color: '#dc2626',
                            padding: '12px',
                            borderRadius: '8px',
                            marginBottom: '1rem',
                            fontSize: '14px',
                            textAlign: 'center'
                        }}>
                            {error}
                        </div>
                    )}

                    {/* Login Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '12px 16px',
                            backgroundColor: loading ? '#9ca3af' : '#072479',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'background-color 0.2s'
                        }}
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                {/* Demo Credentials */}
                <div style={{ 
                    marginTop: '1.5rem', 
                    padding: '12px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                }}>
                    <p style={{ 
                        margin: '0 0 8px 0', 
                        fontSize: '12px', 
                        fontWeight: 'bold',
                        color: '#072479',
                        textAlign: 'center'
                    }}>
                        DEMO CREDENTIALS
                    </p>
                    <div style={{ fontSize: '11px', color: '#64748b', lineHeight: '1.4' }}>
                        <div><strong>SPOC:</strong> spoc_doiwala / spoc123</div>
                        <div><strong>Stakeholder:</strong> stakeholder1 / stake123</div>
                    </div>
                </div>

                {/* Debug button - remove in production */}
                <button 
                    onClick={testLogin}
                    style={{
                        marginTop: '10px',
                        padding: '8px',
                        fontSize: '10px',
                        backgroundColor: '#6b7280',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Test Login
                </button>
            </div>
        </div>
    );
};

export default Login;