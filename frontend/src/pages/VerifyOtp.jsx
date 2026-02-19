import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';

const VerifyOtp = () => {
    const [searchParams] = useSearchParams();
    const email = searchParams.get('email');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const { verifyOtp } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await verifyOtp(email, otp);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white">
             <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#141414] p-8 rounded-lg w-full max-w-sm border border-white/10"
            >
                <h2 className="text-2xl font-bold mb-6 text-center">Verify OTP</h2>
                <p className="text-gray-400 mb-6 text-center text-sm">Enter the code sent to {email}</p>
                
                {error && <div className="bg-red-500/20 text-red-500 p-3 rounded mb-4 text-sm text-center">{error}</div>}
                
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input 
                        type="text" 
                        placeholder="Enter 6-digit OTP" 
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="bg-[#333] text-white px-4 py-3 rounded text-center tracking-widest text-xl focus:outline-none focus:bg-[#444] transition-colors"
                        required
                        maxLength={6}
                    />
                    <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded mt-2 transition-colors">
                        Verify
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default VerifyOtp;
