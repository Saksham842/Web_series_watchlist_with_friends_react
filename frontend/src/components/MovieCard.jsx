import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Play, Plus, ThumbsUp, ChevronDown, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const MovieCard = ({ item }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [inWatchlist, setInWatchlist] = useState(false);
    const seriesId = item.series_id || item.id;
    const timeoutRef = useRef(null);
    const cardRef = useRef(null);

    // Mouse position for 3D tilt
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Spring configuration for smooth tilt
    const springConfig = { damping: 20, stiffness: 300 };
    const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [10, -10]), springConfig);
    const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-10, 10]), springConfig);

    // Shine effect follows cursor
    const shineX = useSpring(useTransform(x, [-0.5, 0.5], ["0%", "100%"]), springConfig);
    const shineY = useSpring(useTransform(y, [-0.5, 0.5], ["0%", "100%"]), springConfig);

    const handleMouseMove = (e) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        x.set((mouseX / width) - 0.5);
        y.set((mouseY / height) - 0.5);
    };

    const handleMouseEnter = () => {
        timeoutRef.current = setTimeout(() => {
            setIsHovered(true);
        }, 400); 
    };

    const handleMouseLeave = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setIsHovered(false);
        x.set(0);
        y.set(0);
    };

    const checkWatchlist = async () => {
        if (inWatchlist) return; // Don't check if we already know it's there (optimization?) - actually we need to know if it's NOT there too.
        // Better:
        try {
            console.log("Checking watchlist for:", seriesId);
            const response = await api.get('/watchlist');
            const isAdded = response.data.some(w => w.series_id === seriesId);
            setInWatchlist(isAdded);
        } catch (error) {
            console.error("Error checking watchlist:", error);
        }
    };

    const handleWatchlist = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            if (inWatchlist) {
                await api.delete(`/watchlist/delete/${seriesId}`);
                setInWatchlist(false);
            } else {
                await api.post('/watchlist/add', { series_id: seriesId });
                setInWatchlist(true);
            }
        } catch (error) {
            console.error("Error updating watchlist:", error);
        }
    };

    useEffect(() => {
        if (isHovered) {
            checkWatchlist();
        }
    }, [isHovered]);

    return (
        <Link 
            to={`/series/${seriesId}`}
            ref={cardRef}
            className="relative w-[180px] h-[270px] md:w-[210px] md:h-[315px] flex-none z-10 cursor-pointer group block"
            onMouseEnter={handleMouseEnter}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {/* Main Card with 3D Tilt */}
            <motion.div
                className="w-full h-full rounded-sm overflow-hidden bg-[#1a1c22] relative border border-white/5 shadow-2xl"
                style={{
                    rotateX,
                    rotateY,
                    transformStyle: "preserve-3d",
                }}
            >
                <img
                    src={item.poster_url || item.landscape_poster_url} 
                    alt={item.title}
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-[0.4]"
                />
                
                {/* Refined Shine Effect */}
                <motion.div 
                    className="absolute inset-0 z-10 pointer-events-none opacity-0 group-hover:opacity-20"
                    style={{
                        background: `radial-gradient(circle at ${shineX} ${shineY}, rgba(255,255,255,0.5) 0%, transparent 70%)`
                    }}
                />

                {/* Bottom Overlay Info (Netflix/Disney+ Hotstar style) */}
                <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col items-center justify-end p-4 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500 text-center">
                    <div className="bg-gradient-to-t from-black via-black/60 to-transparent absolute inset-0 -z-10 h-[150%]"></div>
                    
                    <h3 className="text-white font-extrabold text-base md:text-lg mb-1 line-clamp-2 leading-tight drop-shadow-2xl max-w-[90%] mx-auto">
                        {item.title}
                    </h3>

                    <div className="flex items-center justify-center gap-2 text-[10px] md:text-xs font-black mb-4">
                        <span className="flex items-center gap-0.5 text-yellow-500">
                            ★ <span className="text-white">{item.series_rating}</span>
                        </span>
                        <span className="text-yellow-500 px-1.5 py-0.5 rounded-sm border border-yellow-500/30 backdrop-blur-md bg-yellow-500/10">HD</span>
                        <span className="text-yellow-500 px-1.5 py-0.5 rounded-sm border border-yellow-500/30 backdrop-blur-md bg-yellow-500/10">16+</span>
                    </div>

                    <button 
                        onClick={handleWatchlist}
                        className={`w-full py-2.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 group/btn ${
                            inWatchlist 
                            ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)]' 
                            : 'bg-white/10 text-white border border-white/20 backdrop-blur-md hover:bg-white hover:text-black'
                        }`}
                    >
                        {inWatchlist ? (
                            <>
                                <Check className="w-3.5 h-3.5" />
                                <span>In Watchlist</span>
                            </>
                        ) : (
                            <>
                                <Plus className="w-3.5 h-3.5 group-hover/btn:rotate-90 transition-transform duration-300" />
                                <span>Add to List</span>
                            </>
                        )}
                    </button>
                </div>
            </motion.div>
        </Link>
    );
};

export default MovieCard;
