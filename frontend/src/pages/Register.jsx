import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../styles/auth.css';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(name, email, password);
            navigate(`/verify-otp?email=${encodeURIComponent(email)}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="auth-body">
             <div className="wrapper">
                <div className="nav-left">
                    <Link to="/" className="logo">
                        <i className='bx bx-movie-play bx-tada'></i>
                        BING<span className="logo-e">E</span>SYNC
                    </Link>
                </div>

                <h2 className="auth-h2">Sign Up</h2>
                {error && <div className="bg-red-500/20 text-red-500 p-3 rounded mb-4 text-sm">{error}</div>}
                
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="input-field">
                        <input 
                            type="text" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                        <label>Create your username</label>
                    </div>
                    <div className="input-field">
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <label>Enter your email</label>
                    </div>
                    <div className="input-field">
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <label>Create your password</label>
                    </div>
                    
                    <button type="submit" className="auth-btn">Register</button>
                    
                    <div className="register-link">
                        <p>Already have an account? <Link to="/login">Login</Link></p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
