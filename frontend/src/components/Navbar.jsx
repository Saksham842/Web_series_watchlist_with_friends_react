import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Search, Bell, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const { auth, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const navLinks = [
        { name: 'Home', path: '/home' },
        { name: 'Watchlist', path: '/watchlist' },
        { name: 'Friends', path: '/friends' },
        { name: 'Requests', path: '/requests' },
        { name: 'Genres', path: '/genres' },
    ];

    return (
        <nav 
            className={`fixed top-0 w-full z-50 px-6 md:px-16 py-4 transition-all duration-500 ${
                isScrolled ? 'bg-[#0f1014]/95 backdrop-blur-md shadow-lg' : 'bg-gradient-to-b from-black/80 to-transparent'
            }`}
        >
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-12">
                    <Link to="/home" className="text-2xl font-extrabold text-red-600 tracking-tighter hover:scale-105 transition-transform">
                        BINGESYNC
                    </Link>

                    {/* Desktop Links */}
                    <div className="hidden md:flex items-center gap-6">
                        {navLinks.map((link) => (
                            <Link 
                                key={link.name} 
                                to={link.path}
                                className={`text-sm font-medium transition-colors ${
                                    location.pathname === link.path ? 'text-white font-bold' : 'text-gray-300 hover:text-white'
                                }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="hidden md:flex items-center bg-black/40 border border-white/20 rounded-full px-3 py-1.5 focus-within:border-white/60 transition-colors">
                         <Search className="w-4 h-4 text-gray-400" />
                         <input 
                            type="text" 
                            placeholder="Search series..." 
                            className="bg-transparent border-none focus:outline-none text-white text-sm ml-2 w-32 placeholder-gray-500"
                        />
                    </div>
                    
                    <button className="text-gray-300 hover:text-white transition-colors">
                        <Bell className="w-5 h-5" />
                    </button>

                    <Link to="/profile" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white font-bold group-hover:ring-2 ring-white transition-all">
                            {auth.user?.name?.charAt(0).toUpperCase() || <User className="w-5 h-5" />}
                        </div>
                    </Link>
                    
                    <button onClick={handleLogout} className="text-gray-300 hover:text-red-500 transition-colors" title="Logout">
                        <LogOut className="w-5 h-5" />
                    </button>

                    {/* Mobile Menu Toggle */}
                    <button 
                        className="md:hidden text-white"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="md:hidden bg-[#141414] overflow-hidden mt-4 rounded-b-xl border-t border-white/10"
                    >
                        <div className="flex flex-col p-4 gap-4">
                            {navLinks.map((link) => (
                                <Link 
                                    key={link.name} 
                                    to={link.path}
                                    className="text-gray-300 hover:text-white font-medium"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
