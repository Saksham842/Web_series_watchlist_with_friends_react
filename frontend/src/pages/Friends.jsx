import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Users, UserPlus, Eye, UserMinus, User, Search, Loader2, Sparkles, Inbox } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const Friends = () => {
    const [friends, setFriends] = useState([]);
    const [availableUsers, setAvailableUsers] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('my-friends'); // 'my-friends', 'discover', 'pending'
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [friendsRes, usersRes, pendingRes] = await Promise.all([
                api.get('/friends/list'),
                api.get('/friends/users'),
                api.get('/friends/requests/pending')
            ]);
            setFriends(friendsRes.data);
            setAvailableUsers(usersRes.data);
            setPendingRequests(pendingRes.data);
        } catch (error) {
            console.error("Error fetching friends data:", error);
            const status = error.response?.status;
            const message = error.response?.data?.message || error.message;
            toast.error(`Sync Failed: ${message} (${status || 'Network Error'})`);
        } finally {
            setLoading(false);
        }
    };

    const handleSendRequest = async (userId) => {
        const loadingToast = toast.loading("Sending request...");
        try {
            await api.post('/friends/request', { receiver_id: userId });
            setAvailableUsers(prev => prev.filter(u => u.id !== userId));
            toast.success("Friend request sent!", { id: loadingToast });
        } catch (error) {
            console.error("Error sending request:", error);
            toast.error(error.response?.data?.message || "Failed to send request", { id: loadingToast });
        }
    };

    const handleAcceptRequest = async (senderId) => {
        const loadingToast = toast.loading("Accepting...");
        try {
            await api.post('/friends/accept', { sender_id: senderId });
            setPendingRequests(prev => prev.filter(r => r.id !== senderId));
            toast.success("Friend request accepted!", { id: loadingToast });
            fetchData(); // Refresh all lists
        } catch (error) {
            console.error("Error accepting request:", error);
            toast.error("Failed to accept request", { id: loadingToast });
        }
    };

    const handleRejectRequest = async (senderId) => {
        try {
            await api.post('/friends/reject', { sender_id: senderId });
            setPendingRequests(prev => prev.filter(r => r.id !== senderId));
            toast.success("Request declined");
        } catch (error) {
            console.error("Error rejecting request:", error);
            toast.error("Failed to decline request");
        }
    };

    const handleRemoveFriend = async (friendId) => {
        if (!window.confirm("Are you sure you want to remove this friend?")) return;
        try {
            await api.post('/friends/remove', { friendId });
            setFriends(prev => prev.filter(f => f.id !== friendId));
            fetchData();
        } catch (error) {
            console.error("Error removing friend:", error);
            toast.error("Failed to remove friend");
        }
    };

    const filteredUsers = availableUsers.filter(user => 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="min-h-screen bg-[#0f1014] text-white pt-28 px-6 md:px-16 pb-20">
            <div className="max-w-6xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Users className="text-red-600 w-6 h-6" />
                            <span className="text-red-600 font-black uppercase tracking-[0.2em] text-xs">Community</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic">
                            Friends <span className="text-red-600">&</span> Sync
                        </h1>
                        <p className="text-gray-400 mt-2 font-medium">Connect with fellow bingers and explore their watchlists.</p>
                    </div>

                    {/* Tab Switcher */}
                    <div className="flex p-1.5 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 w-fit">
                        <button 
                            onClick={() => setActiveTab('my-friends')}
                            className={`px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 ${activeTab === 'my-friends' ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)]' : 'text-gray-400 hover:text-white'}`}
                        >
                            <Users className="w-4 h-4" />
                            My Friends ({friends.length})
                        </button>
                        <button 
                            onClick={() => setActiveTab('pending')}
                            className={`px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 relative ${activeTab === 'pending' ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)]' : 'text-gray-400 hover:text-white'}`}
                        >
                            <Inbox className="w-4 h-4" />
                            Pending
                            {pendingRequests.length > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-red-600 rounded-full flex items-center justify-center text-[10px] font-black shadow-lg">
                                    {pendingRequests.length}
                                </span>
                            )}
                        </button>
                        <button 
                            onClick={() => setActiveTab('discover')}
                            className={`px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 ${activeTab === 'discover' ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)]' : 'text-gray-400 hover:text-white'}`}
                        >
                            <Sparkles className="w-4 h-4" />
                            Discover
                        </button>
                    </div>
                </div>

                {activeTab === 'discover' && (
                    <div className="relative mb-8 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-red-500 transition-colors" />
                        <input 
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-red-600/50 focus:bg-white/10 transition-all"
                        />
                    </div>
                )}

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 text-red-600 animate-spin mb-4" />
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-sm italic">Syncing circle...</p>
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        {activeTab === 'my-friends' ? (
                            <motion.div 
                                key="friends-list"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                exit={{ opacity: 0 }}
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                            >
                                {friends.length > 0 ? (
                                    friends.map(friend => (
                                        <motion.div 
                                            key={friend.id}
                                            variants={itemVariants}
                                            className="group bg-white/5 hover:bg-white/10 border border-white/5 hover:border-red-600/30 rounded-3xl p-6 transition-all duration-300 relative overflow-hidden"
                                        >
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-red-600/10 transition-all"></div>
                                            
                                            <div className="flex items-center gap-4 mb-6 relative z-10">
                                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center text-2xl font-black text-white shadow-xl group-hover:scale-110 transition-transform">
                                                    {friend.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-black tracking-tight">{friend.name}</h3>
                                                    <p className="text-gray-500 text-sm font-medium">{friend.email}</p>
                                                </div>
                                            </div>

                                            <div className="flex gap-3 relative z-10">
                                                <div className="flex flex-col gap-2 flex-1">
                                                    <Link 
                                                        to={`/friends/watchlist/${friend.id}`}
                                                        className="w-full bg-white text-black hover:bg-red-600 hover:text-white py-2.5 rounded-xl font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-2 transition-all shadow-lg"
                                                    >
                                                        <Eye className="w-3 h-3" />
                                                        Watchlist
                                                    </Link>
                                                    <Link 
                                                        to={`/profile/${friend.id}`}
                                                        className="w-full bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 py-2.5 rounded-xl font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-2 transition-all border border-white/5"
                                                    >
                                                        <User className="w-3 h-3" />
                                                        View Profile
                                                    </Link>
                                                </div>
                                                <button 
                                                    onClick={() => handleRemoveFriend(friend.id)}
                                                    className="p-3 bg-white/5 hover:bg-red-600/20 text-gray-400 hover:text-red-500 rounded-xl transition-all border border-white/5 hover:border-red-600/30 self-stretch"
                                                    title="Remove Friend"
                                                >
                                                    <UserMinus className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="col-span-full py-20 text-center bg-white/5 rounded-3xl border border-dashed border-white/10">
                                        <div className="text-5xl mb-4">🏜️</div>
                                        <h2 className="text-2xl font-black uppercase tracking-tight">Your circle is empty</h2>
                                        <p className="text-gray-500 mt-2">Time to find some friends and sync up!</p>
                                        <button 
                                            onClick={() => setActiveTab('discover')}
                                            className="mt-6 text-red-600 hover:text-white font-black uppercase tracking-widest text-xs transition-colors"
                                        >
                                            Go to Discover →
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        ) : activeTab === 'pending' ? (
                            <motion.div 
                                key="pending-list"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                exit={{ opacity: 0 }}
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                            >
                                {pendingRequests.length > 0 ? (
                                    pendingRequests.map(request => (
                                        <motion.div 
                                            key={request.id}
                                            variants={itemVariants}
                                            className="group bg-white/5 border border-white/5 rounded-3xl p-6 transition-all duration-300"
                                        >
                                            <div className="flex items-center gap-4 mb-6">
                                                <div className="w-14 h-14 rounded-2xl bg-red-600/20 flex items-center justify-center text-xl font-black text-red-500">
                                                    {request.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold tracking-tight">{request.name}</h3>
                                                    <p className="text-gray-500 text-xs">{request.email}</p>
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => handleAcceptRequest(request.id)}
                                                    className="flex-1 bg-white text-black hover:bg-red-600 hover:text-white py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all"
                                                >
                                                    Accept
                                                </button>
                                                <button 
                                                    onClick={() => handleRejectRequest(request.id)}
                                                    className="flex-1 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] border border-white/5 transition-all"
                                                >
                                                    Decline
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="col-span-full py-20 text-center bg-white/5 rounded-3xl border border-dashed border-white/10">
                                        <div className="text-5xl mb-4">📥</div>
                                        <h2 className="text-2xl font-black uppercase tracking-tight">No pending requests</h2>
                                        <p className="text-gray-500 mt-2">When someone wants to sync with you, they'll show up here.</p>
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="discover-list"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                exit={{ opacity: 0 }}
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                            >
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map(user => (
                                        <motion.div 
                                            key={user.id}
                                            variants={itemVariants}
                                            className="group bg-[#1a1c23]/50 hover:bg-[#1a1c23] border border-white/5 rounded-3xl p-6 transition-all duration-300"
                                        >
                                            <div className="flex items-center gap-4 mb-6">
                                                <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center text-xl font-black text-gray-400 group-hover:bg-red-600 group-hover:text-white transition-all shadow-inner">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold tracking-tight">{user.name}</h3>
                                                    <p className="text-gray-500 text-xs truncate max-w-[150px]">{user.email}</p>
                                                </div>
                                            </div>

                                            <button 
                                                onClick={() => handleSendRequest(user.id)}
                                                className="w-full bg-white/5 hover:bg-white text-gray-300 hover:text-black py-3 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all border border-white/5 hover:border-transparent"
                                            >
                                                <UserPlus className="w-4 h-4" />
                                                Add Friend
                                            </button>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="col-span-full py-20 text-center">
                                        <h2 className="text-xl font-bold text-gray-500 italic">No new explorers found matching "{searchQuery}"</h2>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
};

export default Friends;
