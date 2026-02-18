import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import Row from '../components/Row';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Plus, Check, Star } from 'lucide-react';
import TrailerModal from '../components/TrailerModal';

const SeriesDetail = () => {
    const { id } = useParams();
    const [series, setSeries] = useState(null);
    const [recommended, setRecommended] = useState([]);
    const [loading, setLoading] = useState(true);
    const [inWatchlist, setInWatchlist] = useState(false);
    const [selectedSeason, setSelectedSeason] = useState(null);
    const [showTrailer, setShowTrailer] = useState(false);

    useEffect(() => {
        const fetchSeries = async () => {
            try {
                const response = await api.get(`/series/${id}`);
                setSeries(response.data.series);
                setRecommended(response.data.recommended);
                if (response.data.series.seasons.length > 0) {
                    setSelectedSeason(response.data.series.seasons[0]);
                }
                
                // Check watchlist status (simplified for now, ideally backend returns this)
                const watchlistRes = await api.get('/watchlist');
                const isAdded = watchlistRes.data.some(item => item.series_id === parseInt(id));
                setInWatchlist(isAdded);

            } catch (error) {
                console.error("Error fetching series details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSeries();
        window.scrollTo(0,0);
    }, [id]);

    const handleWatchlist = async () => {
        console.log("SERIES_DETAIL: handleWatchlist clicked. inWatchlist:", inWatchlist);
        try {
            if (inWatchlist) {
                console.log("SERIES_DETAIL: Removing from watchlist...");
                const response = await api.delete(`/watchlist/delete/${id}`);
                console.log("SERIES_DETAIL: Remove response:", response.data);
                setInWatchlist(false);
            } else {
                console.log("SERIES_DETAIL: Adding to watchlist...");
                const response = await api.post('/watchlist/add', { series_id: id });
                console.log("SERIES_DETAIL: Add response:", response.data);
                setInWatchlist(true);
            }
        } catch (error) {
            console.error("SERIES_DETAIL: Error updating watchlist:", error);
            if (error.response) {
                console.error("SERIES_DETAIL: Error response data:", error.response.data);
            }
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center bg-[#141414] text-white">Loading...</div>;
    if (!series) return <div className="h-screen flex items-center justify-center bg-[#141414] text-white">Series not found</div>;

    return (
        <div className="bg-[#0b0c10] min-h-screen text-white relative">
             {/* Background with Cinematic Overlay */}
             <div className="fixed inset-0 z-0">
                <div 
                    className="absolute inset-0 bg-cover bg-center transition-all duration-1000 scale-105"
                    style={{ backgroundImage: `url(${series.landscape_poster_url || series.poster_url})` }}
                />
                {/* Specific Cyan/Blue tint and Deep Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#0b0c10] via-[#0b0c10]/80 to-transparent"></div>
                <div className="absolute inset-0 bg-[#0b0c10]/40 backdrop-blur-[2px]"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c10] via-transparent to-transparent"></div>
             </div>

             <div className="relative z-10 pt-32 pb-20 px-8 md:px-20 min-h-screen flex flex-col">
                <div className="flex flex-col lg:flex-row gap-12 items-center lg:items-start max-w-7xl mx-auto w-full mb-16">
                    {/* Left: Floating Portrait Poster */}
                    <motion.div 
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="w-[280px] md:w-[350px] aspect-[2/3] flex-none rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-white/10"
                    >
                        <img 
                            src={series.poster_url} 
                            alt={series.title} 
                            className="w-full h-full object-cover"
                        />
                    </motion.div>

                    {/* Right: Metadata & Actions */}
                    <div className="flex-1 text-center lg:text-left">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-4 leading-tight">
                                {series.title}
                            </h1>

                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-6 font-bold">
                                <span className="text-yellow-500">{series.genre_name} •</span>
                                <div className="flex text-yellow-500">
                                    {[...Array(5)].map((_, i) => (
                                        <span key={i} className={i < Math.floor(series.series_rating/2) ? "fill-yellow-500" : "opacity-30"}>★</span>
                                    ))}
                                </div>
                                <span className="text-gray-300 ml-2">{series.series_rating} / 10</span>
                                <span className="ml-4 bg-yellow-500 text-black px-2 py-0.5 rounded-sm text-sm font-black ring-2 ring-yellow-500/20">16+</span>
                            </div>

                            <p className="text-lg md:text-xl text-gray-300 leading-relaxed mb-10 max-w-3xl mx-auto lg:mx-0 font-medium opacity-90">
                                {series.summary}
                            </p>

                            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                                <button 
                                    onClick={() => setShowTrailer(true)}
                                    className="bg-red-600 text-white px-10 py-4 rounded-md font-black flex items-center gap-3 hover:bg-red-700 transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(220,38,38,0.3)] uppercase tracking-wider text-sm"
                                >
                                    <Play className="fill-white w-5 h-5" /> Watch Trailer
                                </button>
                                <button 
                                    onClick={handleWatchlist}
                                    className={`px-10 py-4 rounded-md font-black flex items-center gap-3 transition-all hover:scale-105 active:scale-95 backdrop-blur-md uppercase tracking-wider text-sm border ${
                                        inWatchlist 
                                        ? 'bg-red-600/20 border-red-600 text-red-500 shadow-[0_0_20px_rgba(220,38,38,0.2)]' 
                                        : 'bg-white/5 border-white/20 text-white hover:bg-white/10'
                                    }`}
                                >
                                    {inWatchlist ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                                    {inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Seasons Section (Refined) */}
                <div className="max-w-7xl mx-auto w-full border-t border-white/10 pt-16">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                        <h2 className="text-3xl font-black uppercase tracking-tight border-l-4 border-red-600 pl-4">Episodes</h2>
                        {series.seasons.length > 0 && (
                            <div className="relative group">
                                <select 
                                    className="bg-white/5 border border-white/10 text-white py-3 px-6 rounded-md backdrop-blur-md appearance-none pr-12 font-bold focus:outline-none focus:ring-2 focus:ring-red-600/50 cursor-pointer"
                                    onChange={(e) => setSelectedSeason(series.seasons.find(s => s.season_id === parseInt(e.target.value)))}
                                    value={selectedSeason?.season_id}
                                >
                                    {series.seasons.map(season => (
                                        <option key={season.season_id} value={season.season_id} className="bg-[#0b0c10]">
                                            {season.title || `Season ${season.number}`}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">▼</div>
                            </div>
                        )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {selectedSeason?.episodes.map((ep, idx) => (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                key={ep.episode_id} 
                                className="flex gap-4 p-4 hover:bg-white/5 bg-white/[0.02] rounded-lg transition-all group cursor-pointer border border-white/5 hover:border-white/10"
                            >
                                <div className="text-3xl text-white/20 font-black self-center w-10 italic">
                                    {(idx + 1).toString().padStart(2, '0')}
                                </div>
                                <div className="relative min-w-[140px] h-[80px] bg-white/5 rounded-md overflow-hidden">
                                    {series.landscape_poster_url && (
                                         <img src={series.landscape_poster_url} className="w-full h-full object-cover opacity-40 group-hover:opacity-80 transition-opacity" />
                                    )}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                                        <Play className="text-white w-8 h-8 fill-white" />
                                    </div>
                                </div>
                                <div className="flex-1 py-1">
                                    <h3 className="font-bold text-base mb-1 group-hover:text-red-500 transition-colors uppercase tracking-tight">{ep.title}</h3>
                                    <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed">{ep.overview}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Recommendations */}
                <div className="mt-24 max-w-[100vw]">
                    <Row title="More Like This" data={recommended} />
                </div>
             </div>

             {/* Trailer Modal */}
             <TrailerModal 
                isOpen={showTrailer} 
                onClose={() => setShowTrailer(false)} 
                trailerUrl={series.trailer_url}
                title={series.title}
             />
        </div>
    );
};

export default SeriesDetail;
