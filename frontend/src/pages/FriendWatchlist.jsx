import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import MovieCard from '../components/MovieCard';
import { Eye, Loader2, ChevronLeft, Calendar, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const FriendWatchlist = () => {
    const { id } = useParams();
    const [watchlist, setWatchlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [friendName, setFriendName] = useState('');

    useEffect(() => {
        const fetchFriendWatchlist = async () => {
            setLoading(true);
            try {
                // Fetch watchlist
                const response = await api.get(`/friends/watchlist/${id}`);
                setWatchlist(response.data);
                
                // Fetch friend name if available (from local list for now or another API)
                const friendsRes = await api.get('/friends/list');
                const friend = friendsRes.data.find(f => f.id === parseInt(id));
                if (friend) setFriendName(friend.name);
            } catch (error) {
                console.error("Error fetching friend watchlist:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFriendWatchlist();
    }, [id]);

    return (
        <div className="min-h-screen bg-[#0f1014] text-white pt-28 px-6 md:px-16 pb-20">
            <div className="max-w-7xl mx-auto">
                {/* Navigation & Header */}
                <Link 
                    to="/friends" 
                    className="flex items-center gap-2 text-gray-500 hover:text-red-500 font-black uppercase tracking-widest text-[10px] mb-8 transition-colors group w-fit"
                >
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Friends
                </Link>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center text-3xl font-black shadow-2xl overflow-hidden relative group">
                            <span className="relative z-10">{friendName ? friendName.charAt(0).toUpperCase() : '?'}</span>
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Eye className="text-red-600 w-4 h-4" />
                                <span className="text-red-600 font-black uppercase tracking-[0.2em] text-[10px]">Watchlist Space</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic">
                                {friendName}'s <span className="text-red-600">Binge</span> List
                            </h1>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="bg-white/5 border border-white/5 rounded-2xl px-6 py-4 flex flex-col items-center justify-center">
                            <span className="text-2xl font-black text-red-600">{watchlist.length}</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Series</span>
                        </div>
                        <div className="bg-white/5 border border-white/5 rounded-2xl px-6 py-4 flex flex-col items-center justify-center">
                            <Calendar className="w-5 h-5 text-red-600 mb-1" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Updated</span>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 text-red-600 animate-spin mb-4" />
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-sm italic">Syncing list...</p>
                    </div>
                ) : watchlist.length > 0 ? (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-10"
                    >
                        {watchlist.map((item, index) => (
                            <motion.div
                                key={item.series_id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <MovieCard item={item} />
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <div className="text-center py-24 bg-white/5 rounded-[3rem] border border-white/5 backdrop-blur-sm relative overflow-hidden">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-red-600/5 blur-[100px] rounded-full"></div>
                        <div className="relative z-10">
                            <Info className="w-16 h-16 text-gray-700 mx-auto mb-6" />
                            <h2 className="text-3xl font-black uppercase tracking-tight mb-4">Nothing here yet...</h2>
                            <p className="text-gray-500 max-w-md mx-auto font-medium">
                                Looks like {friendName} hasn't added any series to their watchlist. Maybe you should recommend something?
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FriendWatchlist;
