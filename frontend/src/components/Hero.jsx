import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Play, Plus, Info, Check, ChevronLeft, ChevronRight, Volume2, VolumeX } from 'lucide-react';
import api from '../api/axios';

const Hero = ({ series }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [inWatchlist, setInWatchlist] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isVideoActive, setIsVideoActive] = useState(false);
    const hoverTimeoutRef = useRef(null);

    // Smooth motion values for parallax
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Spring configuration
    const springConfig = { damping: 25, stiffness: 150 };
    const bgX = useSpring(useTransform(mouseX, [-0.5, 0.5], [15, -15]), springConfig);
    const bgY = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), springConfig);

    // Helper to extract YouTube ID
    const getYouTubeId = (url) => {
        if (!url) return null;
        const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[7].length === 11) ? match[7] : null;
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            const x = (e.clientX / window.innerWidth) - 0.5;
            const y = (e.clientY / window.innerHeight) - 0.5;
            mouseX.set(x);
            mouseY.set(y);
        };

        window.addEventListener('mousemove', handleMouseMove);
        
        // Auto-cycle logic
        let interval;
        if (!isVideoActive && series && series.length > 0) {
            interval = setInterval(() => {
                nextSlide();
            }, 10000);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            if (interval) clearInterval(interval);
        };
    }, [series, mouseX, mouseY, isVideoActive]);

    const handleMouseEnter = () => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        setIsHovered(true);
        
        if (!series[currentIndex]?.trailer_url) return;

        hoverTimeoutRef.current = setTimeout(() => {
            setIsVideoActive(true);
        }, 1500); // 1.5s delay
    };

    const handleMouseLeave = () => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        setIsHovered(false);
        setIsVideoActive(false);
    };

    const nextSlide = () => {
        if (!series || series.length === 0) return;
        setIsVideoActive(false);
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        setCurrentIndex((prev) => (prev + 1) % series.length);
    };

    const prevSlide = () => {
        if (!series || series.length === 0) return;
        setIsVideoActive(false);
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        setCurrentIndex((prev) => (prev - 1 + series.length) % series.length);
    };

    useEffect(() => {
        const checkWatchlist = async () => {
            try {
                if (!series || !series[currentIndex]) return;
                const currentSeriesId = series[currentIndex].series_id;
                const response = await api.get('/watchlist');
                const isAdded = response.data.some(item => item.series_id === currentSeriesId);
                setInWatchlist(isAdded);
            } catch (error) {
                console.error("Error checking watchlist:", error);
            }
        };
        
        if (series && series.length > 0) {
            checkWatchlist();
            setIsVideoActive(false);
        }
    }, [currentIndex, series]);

    const handleWatchlist = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("HERO: handleWatchlist clicked. inWatchlist:", inWatchlist);
        try {
            if (!series || !series[currentIndex]) {
                console.error("HERO: No current series found");
                return;
            }
            const currentSeriesId = series[currentIndex].series_id;
            console.log("HERO: currentSeriesId:", currentSeriesId);

            if (inWatchlist) {
                console.log("HERO: Removing from watchlist...");
                const response = await api.delete(`/watchlist/delete/${currentSeriesId}`);
                console.log("HERO: Remove response:", response.data);
                setInWatchlist(false);
            } else {
                console.log("HERO: Adding to watchlist...");
                const response = await api.post('/watchlist/add', { series_id: currentSeriesId });
                console.log("HERO: Add response:", response.data);
                setInWatchlist(true);
            }
        } catch (error) {
            console.error("HERO: Error updating watchlist:", error);
            if (error.response) {
                console.error("HERO: Error response data:", error.response.data);
                console.error("HERO: Error response status:", error.response.status);
            }
        }
    };

    if (!series || series.length === 0) return null;

    const currentSeries = series[currentIndex];

    // Generic metadata - ideally this would come from the mapped object
    const genres = ["Action", "Drama", "Thriller"]; 
    const languages = ["Tamil", "Telugu", "Hindi", "Malayalam", "Kannada"];

    return (
        <section 
            className="relative h-[85vh] md:h-screen w-full overflow-hidden bg-[#0f1014] text-white group/hero"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <AnimatePresence mode='wait'>
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0"
                >
                    {/* Visual Layer */}
                    <div className="absolute inset-0">
                        <motion.div 
                            className="absolute inset-0 bg-cover bg-center md:bg-top"
                            animate={{ scale: isHovered && !isVideoActive ? 1.05 : 1 }}
                            transition={{ duration: 10, ease: "linear" }}
                            style={{ 
                                backgroundImage: `url(${currentSeries.landscape_poster_url || currentSeries.poster_url})`,
                                x: bgX,
                                y: bgY
                            }}
                        >
                            {/* Trailer Video */}
                            <AnimatePresence>
                                {isVideoActive && getYouTubeId(currentSeries.trailer_url) && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 1 }}
                                        className="absolute inset-0 z-10 overflow-hidden"
                                    >
                                        <iframe
                                            className="w-full h-full scale-[1.5] pointer-events-none"
                                            src={`https://www.youtube.com/embed/${getYouTubeId(currentSeries.trailer_url)}?autoplay=1&mute=1&controls=0&loop=1&playlist=${getYouTubeId(currentSeries.trailer_url)}&modestbranding=1&iv_load_policy=3&rel=0&showinfo=0`}
                                            allow="autoplay"
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Prime Video style robust gradients */}
                            {/* Left mask for content readability - very strong */}
                            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent w-[60%] z-20"></div>
                            {/* Soft right fade to avoid hard edges */}
                            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black/40 to-transparent z-20"></div>
                            {/* Bottom fade for transition to content rows */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0f1014] via-transparent to-transparent z-20"></div>
                            {/* Top subtle fade */}
                            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent h-40 z-20"></div>
                        </motion.div>
                    </div>

                    {/* Content Layer (Left Aligned) */}
                    <div className="absolute inset-0 z-30 flex flex-col justify-center px-6 md:px-24 pointer-events-none">
                        <motion.div
                            initial={{ x: -30, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="max-w-xl pointer-events-auto"
                        >
                            {/* Prime Branding */}
                            <div className="flex items-center gap-2 mb-6">
                                <span className="text-blue-400 font-black italic text-xl tracking-tighter">prime</span>
                            </div>

                            {/* Title Title Logo Style */}
                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-4 uppercase leading-[0.9] tracking-tighter drop-shadow-2xl italic">
                                {currentSeries.title}
                            </h1>

                            {/* Metadata row */}
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-gray-200 font-bold mb-4 text-sm md:text-base">
                                <span className="text-white/90">{languages.join(' | ')}</span>
                            </div>

                            {/* Ranking & Rating */}
                            <div className="flex items-center gap-4 mb-8">
                                <div className="text-[#00bb3c] font-black text-sm uppercase tracking-widest flex items-center gap-1.5">
                                    <span className="text-lg">#1</span> in India Today
                                </div>
                                <div className="bg-white/10 border border-white/20 rounded-sm px-1.5 py-0.5 text-[10px] font-black text-white/80">
                                    U/A 16+
                                </div>
                            </div>

                            {/* Prime Buttons */}
                            <div className="flex items-center gap-3 mb-8">
                                <Link to={`/series/${currentSeries.series_id}`}>
                                    <button className="bg-[#1a1c22] hover:bg-gray-800 text-white font-black px-8 py-3.5 rounded-sm transition-all flex items-center gap-3 text-lg border border-white/5 shadow-2xl">
                                        <div className="bg-white rounded-full p-0.5">
                                            <Play className="w-4 h-4 fill-black text-black ml-0.5" />
                                        </div>
                                        <span>Join Prime Watch now</span>
                                    </button>
                                </Link>

                                <button 
                                    onClick={handleWatchlist}
                                    title={inWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
                                    className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-all"
                                >
                                    {inWatchlist ? <Check className="w-5 h-5 text-green-400" /> : <Plus className="w-5 h-5" />}
                                </button>

                                <Link to={`/series/${currentSeries.series_id}`}>
                                    <button 
                                        title="View Details"
                                        className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-all"
                                    >
                                        <Info className="w-5 h-5" />
                                    </button>
                                </Link>
                            </div>

                            {/* Description (Amazon Style: Subdued/Small) */}
                            <p className="text-gray-400 text-sm md:text-base max-w-lg line-clamp-2 leading-relaxed font-medium mb-4">
                                {currentSeries.description || currentSeries.summary}
                            </p>

                            <div className="flex items-center gap-2 text-gray-500 text-[10px] font-black uppercase tracking-widest">
                                <span className="text-yellow-500">★</span>
                                <span>Watch with a Prime membership</span>
                            </div>
                        </motion.div>
                    </div>

                    {/* Navigation Controls (Only visible on slider hover) */}
                    <div className="absolute inset-y-0 left-0 w-20 flex items-center justify-center z-40">
                         <button 
                            onClick={prevSlide}
                            className="p-2 text-white/0 group-hero/hero:text-white/60 hover:text-white transition-all cursor-pointer"
                        >
                            <ChevronLeft className="w-10 h-10" />
                        </button>
                    </div>
                    <div className="absolute inset-y-0 right-0 w-20 flex items-center justify-center z-40">
                         <button 
                            onClick={nextSlide}
                            className="p-2 text-white/0 group-hero/hero:text-white/60 hover:text-white transition-all cursor-pointer"
                        >
                            <ChevronRight className="w-10 h-10" />
                        </button>
                    </div>

                    {/* Mute toggle placeholder (Top Right) */}
                    {isVideoActive && (
                        <div className="absolute top-24 right-10 z-50 bg-black/60 p-2.5 rounded-full border border-white/10 opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
                            <VolumeX className="w-5 h-5" />
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Dot Pagination (Center Bottom) */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 flex gap-2">
                {series.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => {
                            setIsVideoActive(false);
                            setCurrentIndex(idx);
                        }}
                        className={`transition-all duration-500 rounded-full h-1.5 ${
                            currentIndex === idx ? 'w-6 bg-white' : 'w-1.5 bg-white/30 hover:bg-white/60'
                        }`}
                    />
                ))}
            </div>

            {/* Maturity Rating (Fixed Bottom Right) */}
            <div className="absolute bottom-10 right-10 z-40 bg-black/60 border border-white/10 px-2.5 py-1 text-[10px] font-bold text-gray-300">
                U/A 16+
            </div>
        </section>
    );
};

export default Hero;
