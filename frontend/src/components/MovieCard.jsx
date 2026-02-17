import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Plus, ThumbsUp, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const MovieCard = ({ item }) => {
    const [isHovered, setIsHovered] = useState(false);
    const timeoutRef = useRef(null);

    const handleMouseEnter = () => {
        timeoutRef.current = setTimeout(() => {
            setIsHovered(true);
        }, 400); // Delay before expanding to prevent accidental triggers
    };

    const handleMouseLeave = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setIsHovered(false);
    };

    return (
        <div 
            className="relative w-[220px] h-[130px] md:h-[150px] flex-none z-10"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Placeholder to keep layout stable while hover card is popped out */}
            <img
                src={item.landscape_poster_url || item.poster_url} 
                alt={item.title}
                className="rounded-md w-full h-full object-cover"
            />

            {/* Hover Card */}
            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        className="absolute top-0 left-0 w-[350px] bg-[#141414] rounded-lg shadow-2xl overflow-hidden z-50 origin-center"
                        initial={{ scale: 1, opacity: 0, y: 0 }}
                        animate={{ 
                            scale: 1.15, 
                            opacity: 1,
                            y: -60,
                            x: -65, // Center the expansion roughly
                            transition: { duration: 0.3, ease: "easeInOut" } 
                        }}
                        exit={{ scale: 1, opacity: 0, transition: { duration: 0.2 } }}
                    >
                        {/* Image Area */}
                        <div className="relative h-[180px] w-full">
                            <img 
                                src={item.landscape_poster_url || item.poster_url} 
                                alt={item.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#141414] to-transparent"></div>
                            <div className="absolute bottom-4 left-4">
                               <h3 className="text-white font-bold text-lg drop-shadow-md">{item.title}</h3>
                            </div>
                        </div>

                        {/* Content Area */}
                        <motion.div 
                            className="p-4 flex flex-col gap-3"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1, transition: { delay: 0.2 } }}
                        >
                            {/* Action Buttons */}
                            <div className="flex justify-between items-center">
                                <div className="flex gap-2">
                                    <Link to={`/series/${item.series_id || item.id}`}>
                                        <button className="bg-white rounded-full p-2 hover:bg-gray-200 transition-colors">
                                            <Play className="w-5 h-5 fill-black text-black" />
                                        </button>
                                    </Link>
                                    <button className="border-2 border-gray-400 rounded-full p-2 hover:border-white text-gray-300 hover:text-white hover:bg-[#2a2a2a] transition-colors">
                                        <Plus className="w-5 h-5" />
                                    </button>
                                    <button className="border-2 border-gray-400 rounded-full p-2 hover:border-white text-gray-300 hover:text-white hover:bg-[#2a2a2a] transition-colors">
                                        <ThumbsUp className="w-5 h-5" />
                                    </button>
                                </div>
                                <button className="border-2 border-gray-400 rounded-full p-2 hover:border-white text-gray-300 hover:text-white hover:bg-[#2a2a2a] transition-colors ml-auto">
                                    <ChevronDown className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Metadata */}
                            <div className="flex items-center gap-2 text-sm font-semibold text-gray-400">
                                <span className="text-green-400 font-bold">{item.series_rating} Match</span>
                                <span className="border border-gray-500 px-1 text-[11px] rounded-sm text-gray-300">HD</span>
                                <span>{item.release_year || '2023'}</span>
                            </div>

                            {/* Genres/Tags */}
                            <div className="flex flex-wrap gap-1.5 text-xs text-white">
                                <span className="text-white/70">Exciting</span>
                                <span className="text-gray-500">•</span>
                                <span className="text-white/70">Suspenseful</span>
                                <span className="text-gray-500">•</span>
                                <span className="text-white/70">Drama</span>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MovieCard;
