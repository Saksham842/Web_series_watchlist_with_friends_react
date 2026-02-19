import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Bell, Menu, X, ChevronDown, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import toast from 'react-hot-toast';
import ProfileDrawer from './ProfileDrawer';
import { getAvatarGradient, getAvatarInitial } from '../utils/avatarUtils';

const Navbar = () => {
    const { auth, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
    const [genres, setGenres] = useState([]);
    
    // Notification State
    const [notifications, setNotifications] = useState([]);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    // Search State
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        const fetchGenres = async () => {
            console.log("NAVBAR: Fetching genres...");
            try {
                const response = await api.get('series/genres');
                console.log("NAVBAR: Genres received:", response.data);
                setGenres(response.data);
            } catch (error) {
                console.error("NAVBAR: Error fetching genres:", error);
            }
        };

        const fetchNotifications = async () => {
            try {
                const response = await api.get('/notifications');
                const newHistory = response.data;
                
                // Show toast for new items only if we had an existing state
                if (notifications.length > 0 && newHistory.length > notifications.length) {
                    const latest = newHistory[0]; // Logic assumes newest is first
                    if (!latest.is_read) {
                        toast(latest.message, { icon: '🔔' });
                    }
                }
                
                setNotifications(newHistory);
                setUnreadCount(newHistory.filter(n => !n.is_read).length);
            } catch (error) {
                console.error("Error fetching notifications:", error);
            }
        };

        window.addEventListener('scroll', handleScroll);
        fetchGenres();
        fetchNotifications();

        // Refresh notifications every 10 seconds for better real-time feel
        const interval = setInterval(fetchNotifications, 10000);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearInterval(interval);
        };
    }, []);

    // Search Debouncing
    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            if (searchQuery.length > 1) {
                try {
                    const response = await api.get(`/series/search?q=${searchQuery}`);
                    setSuggestions(response.data.slice(0, 5));
                    setShowSuggestions(true);
                } catch (error) {
                    console.error("Search error:", error);
                }
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    const handleSearchSubmit = (e) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setIsSearchExpanded(false);
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (id) => {
        navigate(`/series/${id}`);
        setSearchQuery('');
        setIsSearchExpanded(false);
        setShowSuggestions(false);
    };

    const handleAcceptRequest = async (senderId) => {
        try {
            await api.post('/friends/accept', { sender_id: senderId });
            setNotifications(prev => prev.filter(n => n.id !== senderId));
            setUnreadCount(prev => Math.max(0, prev - 1));
            toast.success("Friend request accepted!");
        } catch (error) {
            console.error("Error accepting request:", error);
            toast.error("Failed to accept request");
        }
    };

    const handleClearHistory = async () => {
        try {
            await api.post('/notifications/clear');
            setNotifications([]);
            setUnreadCount(0);
            toast.success("History cleared");
        } catch (error) {
            console.error("Error clearing notifications:", error);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const navLinks = [
        { name: 'Home', path: '/home' },
        { name: 'Watchlist', path: '/watchlist' },
        { name: 'Friends', path: '/friends' },
    ];

    return (
        <nav 
            className={`fixed top-0 w-full z-50 px-6 md:px-16 py-4 transition-all duration-300 ${
                isScrolled 
                ? 'bg-[#0f1014] border-b border-white/5 shadow-2xl' 
                : 'bg-gradient-to-b from-black/90 to-transparent'
            }`}
        >
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-12">
                    <Link to="/home" className="flex items-center text-2xl font-extrabold text-white tracking-tighter hover:scale-105 transition-transform group">
                        <i className={`bx bx-movie-play bx-tada text-[#c0392b] mr-2 text-3xl group-hover:text-red-500`}></i>
                        BING<span className="text-[#c0392b] group-hover:text-red-500">E</span>SYNC
                    </Link>

                    {/* Desktop Links */}
                    <div className="hidden md:flex items-center gap-8">
                        <div className="flex items-center gap-6">
                            {navLinks.map((link) => (
                                <Link 
                                    key={link.name} 
                                    to={link.path}
                                    className={`text-[13px] font-black uppercase tracking-widest transition-all duration-300 relative group/link ${
                                        location.pathname === link.path ? 'text-red-500' : 'text-gray-300 hover:text-white'
                                    }`}
                                >
                                    {link.name}
                                    <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-red-600 transition-all duration-300 group-hover/link:w-full ${location.pathname === link.path ? 'w-full' : ''}`}></span>
                                </Link>
                            ))}

                            {/* Explore Dropdown Trigger */}
                            <div 
                                className="relative group/explore"
                                onMouseEnter={() => setIsCategoriesOpen(true)}
                                onMouseLeave={() => setIsCategoriesOpen(false)}
                            >
                                <button className={`flex items-center gap-1 text-[13px] font-black uppercase tracking-widest transition-all duration-300 ${isCategoriesOpen ? 'text-white' : 'text-gray-300 hover:text-white'}`}>
                                    Explore <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isCategoriesOpen ? 'rotate-180 text-red-500' : ''}`} />
                                </button>

                                <AnimatePresence>
                                    {isCategoriesOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-[500px] bg-[#1a1c23] border border-white/5 rounded-2xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)] p-8 z-50 overflow-hidden"
                                        >
                                            <div className="relative z-10">
                                                <h3 className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-6 text-center border-b border-white/5 pb-4">Browse by Genre</h3>
                                                <div className="grid grid-cols-2 gap-x-6 gap-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                                                    {genres && genres.length > 0 ? (
                                                        genres.map(genre => (
                                                            <Link 
                                                                key={genre.genre_id || genre.genre_name}
                                                                to={`/genre/${genre.genre_name}`}
                                                                className="text-gray-300 hover:text-white hover:bg-white/5 text-sm font-bold transition-all capitalize py-2.5 px-4 rounded-xl flex items-center justify-between group/item"
                                                                onClick={() => setIsCategoriesOpen(false)}
                                                            >
                                                                <span>{genre.genre_name}</span>
                                                                <i className='bx bx-chevron-right text-red-600 opacity-0 group-hover/item:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0'></i>
                                                            </Link>
                                                        ))
                                                    ) : (
                                                        ["Action", "Comedy", "Thriller", "Drama", "Sci-Fi", "Horror", "Crime", "Mystery"].map(g => (
                                                            <Link 
                                                                key={g}
                                                                to={`/genre/${g.toLowerCase()}`}
                                                                className="text-gray-300 hover:text-white hover:bg-white/5 text-sm font-bold transition-all capitalize py-2.5 px-4 rounded-xl flex items-center justify-between group/item"
                                                                onClick={() => setIsCategoriesOpen(false)}
                                                            >
                                                                <span>{g}</span>
                                                                <i className='bx bx-chevron-right text-red-600 opacity-0 group-hover/item:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0'></i>
                                                            </Link>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    {/* Animated Search Bar */}
                    <div className="relative flex items-center">
                        <motion.div 
                            initial={false}
                            animate={{ 
                                width: isSearchExpanded ? '280px' : '40px',
                                backgroundColor: isSearchExpanded ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0)'
                            }}
                            className="flex items-center rounded-full overflow-hidden border border-white/10 group focus-within:border-red-600/50 transition-colors"
                        >
                            <button 
                                onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                                className="p-2.5 text-gray-400 hover:text-white transition-colors flex-shrink-0"
                            >
                                <Search className="w-5 h-5" />
                            </button>
                            <input 
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleSearchSubmit}
                                placeholder="Titles, genres, sync with friends..."
                                className={`bg-transparent border-none outline-none text-sm font-medium w-full pr-4 text-white placeholder:text-gray-500 transition-opacity duration-300 ${isSearchExpanded ? 'opacity-100 block' : 'opacity-0 hidden'}`}
                                autoFocus={isSearchExpanded}
                            />
                        </motion.div>

                        {/* Search Suggestions Dropdown */}
                        <AnimatePresence>
                            {showSuggestions && suggestions.length > 0 && isSearchExpanded && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute top-full right-0 mt-4 w-[320px] bg-[#1a1c23] border border-white/5 rounded-2xl shadow-2xl p-2 z-50 divide-y divide-white/5"
                                >
                                    {suggestions.map((item) => (
                                        <div 
                                            key={item.series_id}
                                            onClick={() => handleSuggestionClick(item.series_id)}
                                            className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl cursor-pointer transition-colors group/item"
                                        >
                                            <img 
                                                src={item.poster_url} 
                                                alt={item.title} 
                                                className="w-10 h-14 object-cover rounded-lg shadow-lg group-hover/item:scale-105 transition-transform"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-bold text-white truncate group-hover/item:text-red-500 transition-colors">
                                                    {item.title}
                                                </h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] font-black text-yellow-500 flex items-center gap-0.5">
                                                        ★ {item.series_rating}
                                                    </span>
                                                    <span className="text-gray-500 text-[10px] truncate">
                                                        {item.genre_name}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <div 
                                        onClick={() => {
                                            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
                                            setShowSuggestions(false);
                                            setIsSearchExpanded(false);
                                        }}
                                        className="p-3 text-center text-xs font-black uppercase tracking-widest text-red-600 hover:text-red-500 cursor-pointer transition-colors"
                                    >
                                        View all results
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Notifications */}
                    <div className="relative">
                        <button 
                            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                            className={`relative text-gray-300 hover:text-white transition-colors p-2 rounded-full hover:bg-white/5 ${isNotificationOpen ? 'text-white bg-white/5' : ''}`}
                        >
                            <Bell className="w-5 h-5" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-600 border-2 border-[#0f1014] rounded-full flex items-center justify-center text-[8px] font-black text-white">
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        <AnimatePresence>
                            {isNotificationOpen && (
                                <>
                                    <div 
                                        className="fixed inset-0 z-[-1]" 
                                        onClick={() => setIsNotificationOpen(false)}
                                    ></div>
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute top-full right-0 mt-4 w-[320px] bg-[#1a1c23] border border-white/5 rounded-2xl shadow-2xl p-4 z-50"
                                    >
                                        <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
                                            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500">History</h3>
                                            <div className="flex gap-3">
                                                {notifications.length > 0 && (
                                                    <button 
                                                        onClick={handleClearHistory}
                                                        className="text-[10px] font-black uppercase text-red-600 hover:text-red-400 transition-colors"
                                                    >
                                                        Clear All
                                                    </button>
                                                )}
                                                {unreadCount > 0 && (
                                                    <span className="text-[10px] font-black uppercase text-white bg-red-600 px-2 py-0.5 rounded-full ring-4 ring-red-600/10">
                                                        {unreadCount} New
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="max-h-[300px] overflow-y-auto custom-scrollbar flex flex-col gap-2">
                                            {notifications.length > 0 ? (
                                                notifications.map((notif) => (
                                                    <div 
                                                        key={notif.id} 
                                                        className={`border rounded-xl p-3 transition-all ${
                                                            notif.is_read ? 'bg-white/[0.02] border-white/5' : 'bg-white/[0.08] border-red-600/30'
                                                        }`}
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-600/20 to-red-900/20 flex items-center justify-center text-red-500 font-bold text-sm shrink-0">
                                                                {notif.actor_name?.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className={`text-[12px] leading-tight ${notif.is_read ? 'text-gray-400 font-medium' : 'text-white font-bold'}`}>
                                                                    {notif.message}
                                                                </p>
                                                                <p className="text-[10px] text-gray-500 mt-1">
                                                                    {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </p>
                                                                
                                                                {notif.type === 'request' && !notif.is_read && (
                                                                    <div className="flex gap-2 mt-3">
                                                                        <button 
                                                                            onClick={() => {
                                                                                navigate('/friends');
                                                                                setIsNotificationOpen(false);
                                                                            }}
                                                                            className="flex-1 bg-white text-black text-[9px] font-black uppercase py-2 rounded-lg hover:bg-red-600 hover:text-white transition-all"
                                                                        >
                                                                            Review In Hub
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-8">
                                                    <div className="text-3xl mb-3 opacity-20">🔔</div>
                                                    <p className="text-gray-500 text-xs font-medium">No notification history</p>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <Link 
                                            to="/friends" 
                                            onClick={() => setIsNotificationOpen(false)}
                                            className="block w-full mt-4 py-3 bg-white/5 hover:bg-white/10 text-center text-gray-400 hover:text-white text-[9px] font-black uppercase tracking-widest rounded-xl transition-all border border-white/5"
                                        >
                                            Community Hub
                                        </Link>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>

                    <div 
                        onClick={() => setIsProfileOpen(true)} 
                        className="flex items-center gap-2 group cursor-pointer"
                    >
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black group-hover:ring-2 ring-red-600 transition-all shadow-lg text-sm"
                            style={{ background: getAvatarGradient(auth.user?.name) }}
                        >
                            {getAvatarInitial(auth.user?.name)}
                        </div>
                    </div>
                    
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
                            <div className="h-px bg-white/10 my-2"></div>
                            <h3 className="text-gray-500 text-[10px] font-black uppercase tracking-widest px-1">Explore</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {genres && genres.length > 0 ? (
                                    genres.map(genre => (
                                        <Link 
                                            key={genre.genre_id || genre.genre_name}
                                            to={`/genre/${genre.genre_name}`}
                                            className="text-gray-300 text-sm capitalize"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            {genre.genre_name}
                                        </Link>
                                    ))
                                ) : (
                                    ["Action", "Comedy", "Thriller", "Drama", "Sci-Fi", "Horror", "Crime", "Mystery"].map(g => (
                                        <Link 
                                            key={g}
                                            to={`/genre/${g.toLowerCase()}`}
                                            className="text-gray-300 text-sm capitalize"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            {g}
                                        </Link>
                                    ))
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <ProfileDrawer 
                isOpen={isProfileOpen} 
                onClose={() => setIsProfileOpen(false)} 
                user={auth.user} 
                onLogout={handleLogout} 
            />
        </nav>
    );
};

export default Navbar;
