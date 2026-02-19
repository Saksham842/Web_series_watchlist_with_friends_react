import { useEffect, useState } from 'react';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Play, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import MovieCard from '../components/MovieCard';

const Watchlist = () => {
    const [watchlist, setWatchlist] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchWatchlist = async () => {
        try {
            const response = await api.get('/watchlist');
            setWatchlist(response.data);
        } catch (error) {
            console.error("Error fetching watchlist:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWatchlist();
        window.scrollTo(0, 0);
    }, []);

    const removeFromWatchlist = async (seriesId) => {
        try {
            await api.delete(`/watchlist/delete/${seriesId}`);
            setWatchlist(prev => prev.filter(item => item.series_id !== seriesId));
        } catch (error) {
            console.error("Error removing from watchlist:", error);
        }
    };

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-[#0f1014] text-white">
                <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f1014] text-white pt-24 pb-20 px-8 md:px-16">
            {/* Header Section */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12"
            >
                <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">
                    My <span className="text-red-600">Watchlist</span>
                </h1>
                <p className="text-gray-400 font-medium">
                    {watchlist.length} {watchlist.length === 1 ? 'series' : 'series'} saved for later
                </p>
            </motion.div>

            {watchlist.length === 0 ? (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-20 text-center"
                >
                    <div className="bg-white/5 p-8 rounded-full mb-6">
                        <Play className="w-12 h-12 text-gray-500 fill-gray-500" />
                    </div>
                    <h2 className="text-2xl font-bold mb-4">Your watchlist is empty</h2>
                    <p className="text-gray-400 mb-8 max-w-md">
                        Explore our collection and add your favorite series here to keep track of them.
                    </p>
                    <Link to="/home">
                        <button className="bg-red-600 text-white px-8 py-3 rounded-sm font-bold hover:bg-red-700 transition-colors">
                            BROWSE SERIES
                        </button>
                    </Link>
                </motion.div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                    <AnimatePresence>
                        {watchlist.map((item) => (
                            <motion.div 
                                key={item.series_id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                                className="relative group"
                            >
                                <MovieCard item={item} />
                                
                                <button 
                                    onClick={() => removeFromWatchlist(item.series_id)}
                                    className="absolute top-2 right-2 z-30 bg-black/60 p-2 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black hover:scale-110"
                                    title="Remove from Watchlist"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default Watchlist;
