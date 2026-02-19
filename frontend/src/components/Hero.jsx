import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Play, Plus, Check, ChevronLeft, ChevronRight, Star, Clock, VolumeX, Volume2, Zap } from 'lucide-react';
import api from '../api/axios';

const Hero = ({ series }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [inWatchlist, setInWatchlist] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isVideoActive, setIsVideoActive] = useState(false);
    const [isMuted, setIsMuted] = useState(false);

    // Smooth parallax motion values
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const springConfig = { damping: 30, stiffness: 120 };
    const bgX = useSpring(useTransform(mouseX, [-0.5, 0.5], [12, -12]), springConfig);
    const bgY = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), springConfig);

    const getYouTubeId = (url) => {
        if (!url) return null;
        const match = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([\w-]{11})/);
        return match ? match[1] : null;
    };

    // Auto-cycle
    useEffect(() => {
        if (isVideoActive || !series?.length) return;
        const interval = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % series.length);
        }, 8000);
        return () => clearInterval(interval);
    }, [series, isVideoActive]);

    // Parallax mouse
    useEffect(() => {
        const handleMouseMove = (e) => {
            mouseX.set((e.clientX / window.innerWidth) - 0.5);
            mouseY.set((e.clientY / window.innerHeight) - 0.5);
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [mouseX, mouseY]);

    // Watchlist check
    useEffect(() => {
        const checkWatchlist = async () => {
            try {
                if (!series?.[currentIndex]) return;
                const res = await api.get('/watchlist');
                setInWatchlist(res.data.some(item => item.series_id === series[currentIndex].series_id));
            } catch {}
        };
        if (series?.length) {
            checkWatchlist();
            setIsVideoActive(false);
        }
    }, [currentIndex, series]);

    // Hover-Gated Trailer Logic
    useEffect(() => {
        if (!series?.length || !series[currentIndex]?.trailer_url || !isHovered) {
            setIsVideoActive(false);
            return;
        }

        // Start trailer after 2s if still hovered
        const timer = setTimeout(() => {
            if (isHovered) setIsVideoActive(true);
        }, 2000);

        return () => {
            clearTimeout(timer);
            // If we leave the hover state, ensure video stops
            if (!isHovered) setIsVideoActive(false);
        };
    }, [currentIndex, series, isHovered]);

    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
    };

    const goTo = (idx) => {
        setIsVideoActive(false);
        setCurrentIndex(idx);
    };

    const handleWatchlist = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            const id = series[currentIndex].series_id;
            if (inWatchlist) {
                await api.delete(`/watchlist/delete/${id}`);
                setInWatchlist(false);
            } else {
                await api.post('/watchlist/add', { series_id: id });
                setInWatchlist(true);
            }
        } catch {}
    };

    if (!series?.length) return null;

    const s = series[currentIndex];
    const ytId = getYouTubeId(s.trailer_url);

    return (
        <section
            className="relative w-full overflow-hidden text-white"
            style={{ height: '78vh', minHeight: '520px', background: '#0b0d14' }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* ── SLIDE TRANSITIONS ── */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.85, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="absolute inset-0"
                >
                    {/* ── BACKGROUND IMAGE with parallax ── */}
                    <motion.div
                        className="absolute inset-y-0 right-0 left-[10%] md:left-[20%] lg:left-[25%] bg-cover bg-top"
                        style={{
                            backgroundImage: `url(${s.landscape_poster_url || s.poster_url})`,
                            x: bgX,
                            y: bgY,
                            scale: 1.05,
                            opacity: isVideoActive ? 0 : 1,
                        }}
                    />

                    {/* ── VIDEO PLAYER ── */}
                    <AnimatePresence>
                        {isVideoActive && ytId && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 1.5 }}
                                className="absolute inset-x-0 inset-y-0 z-10 overflow-hidden pointer-events-none"
                            >
                                <iframe
                                    src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=0&controls=0&loop=1&playlist=${ytId}&rel=0&showinfo=0&iv_load_policy=3&modestbranding=1&start=10`}
                                    className="absolute top-1/2 left-1/2 w-[115%] h-[115%] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                                    allow="autoplay; encrypted-media"
                                    title="Series Trailer"
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>


                    {/* ── GRADIENT LAYERS ── */}
                    <div style={{ opacity: isVideoActive ? 0 : 1 }}>
                        {/* Extra dark vignette around edges */}
                        <div className="absolute inset-0 z-20"
                            style={{ background: 'radial-gradient(ellipse at center, transparent 30%, rgba(11,13,20,0.7) 100%)' }}
                        />
                        {/* Very strong left-side content mask */}
                        <div className="absolute inset-y-0 left-0 w-[50%] md:w-[65%] lg:w-[70%] z-20"
                            style={{ 
                                background: 'linear-gradient(to right, #0b0d14 0%, #0b0d14 45%, rgba(11,13,20,0.95) 60%, rgba(11,13,20,0.3) 85%, transparent 100%)' 
                            }}
                        />
                        {/* Balanced right-side mask */}
                        <div className="absolute inset-y-0 right-0 w-[40%] z-20"
                            style={{ background: 'linear-gradient(to left, rgba(11,13,20,0.85) 0%, rgba(11,13,20,0.4) 40%, transparent 100%)' }}
                        />
                        {/* Heavy bottom fade into content rows */}
                        <div className="absolute inset-0 z-20"
                            style={{ background: 'linear-gradient(to top, #0b0d14 0%, rgba(11,13,20,0.92) 12%, rgba(11,13,20,0.5) 28%, transparent 55%)' }}
                        />
                        {/* Strong top fade */}
                        <div className="absolute top-0 left-0 right-0 h-40 z-20"
                            style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)' }}
                        />
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* ── CONTENT ── */}
            <div className="absolute inset-0 z-30 flex flex-col justify-end pb-28 md:pb-32 px-6 md:px-16 lg:px-24">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -16 }}
                        transition={{ duration: 0.55, ease: 'easeOut' }}
                        className="max-w-2xl"
                    >
                        {/* Genre pill */}
                        {s.genre_name && (
                            <div className="mb-4">
                                <span
                                    className="inline-block text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border"
                                    style={{
                                        color: '#e879f9',
                                        borderColor: 'rgba(232,121,249,0.35)',
                                        background: 'rgba(232,121,249,0.08)',
                                        letterSpacing: '0.18em',
                                    }}
                                >
                                    {s.genre_name}
                                </span>
                            </div>
                        )}

                        {/* Title */}
                        <h1
                            className="font-black uppercase leading-[0.85] mb-4 drop-shadow-2xl"
                            style={{
                                fontSize: 'clamp(1.2rem, 3.5vw, 2.4rem)',
                                letterSpacing: '-0.04em',
                                background: 'linear-gradient(135deg, #ffffff 60%, rgba(255,255,255,0.7) 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                fontFamily: '"Outfit", "Inter", sans-serif',
                            }}
                        >
                            {s.title}
                        </h1>

                        {/* Meta row */}
                        <div className="flex flex-wrap items-center gap-2.5 mb-5">
                            {s.series_rating && (
                                <span className="flex items-center gap-1 text-yellow-400 font-black text-xs">
                                    <Star className="w-3 h-3 fill-yellow-400" />
                                    {parseFloat(s.series_rating).toFixed(1)}
                                </span>
                            )}
                            <span className="w-px h-3.5 bg-white/20" />
                            <span className="text-gray-400 text-[11px] font-semibold uppercase tracking-wider">
                                {s.release_year || 'New'}
                            </span>
                            {s.total_seasons && (
                                <>
                                    <span className="w-px h-3.5 bg-white/20" />
                                    <span className="flex items-center gap-1 text-gray-400 text-[11px] font-semibold">
                                        <Clock className="w-2.5 h-2.5" />
                                        {s.total_seasons} Season{s.total_seasons !== 1 ? 's' : ''}
                                    </span>
                                </>
                            )}
                            <span className="text-[8px] font-black border border-white/20 text-gray-400 px-1 py-0.5 rounded">
                                U/A 16+
                            </span>
                        </div>

                        {/* Description */}
                        <p className="text-gray-400 text-[13px] md:text-sm leading-relaxed mb-6 line-clamp-2 max-w-md font-medium">
                            {s.description || s.summary}
                        </p>

                        {/* Action buttons */}
                        <div className="flex items-center gap-3">
                            {/* Watch Now */}
                            <Link to={`/series/${s.series_id}`}>
                                <button
                                    className="group flex items-center gap-2.5 text-[10px] px-6 py-3 rounded-xl transition-all duration-300 shadow-2xl active:scale-95 cursor-pointer overflow-hidden relative"
                                    style={{
                                        background: 'linear-gradient(135deg, #b91c1c 0%, #dc2626 50%, #ef4444 100%)',
                                        backgroundSize: '200% 200%',
                                        boxShadow: '0 8px 32px rgba(220,38,38,0.3)',
                                        fontWeight: 900,
                                        letterSpacing: '0.12em',
                                        fontFamily: '"Outfit", "Inter", sans-serif',
                                        textTransform: 'uppercase',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1) saturate(1.1)'}
                                    onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1) saturate(1)'}
                                >
                                    <span className="relative z-10 flex items-center gap-1.5">
                                        <Zap className="w-3 h-3 fill-white text-white italic" />
                                        <span>Watch Now</span>
                                    </span>
                                </button>
                            </Link>

                            {/* Watchlist */}
                            <button
                                onClick={handleWatchlist}
                                title={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                                className="flex items-center gap-2 text-[11px] px-4 py-3 rounded-xl border transition-all duration-300 active:scale-95 cursor-pointer"
                                style={{
                                    fontWeight: 700,
                                    letterSpacing: '0.04em',
                                    fontFamily: '"Inter", system-ui, sans-serif',
                                    background: 'rgba(255,255,255,0.07)',
                                    borderColor: 'rgba(255,255,255,0.15)',
                                    backdropFilter: 'blur(8px)',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.13)';
                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                                }}
                            >
                                {inWatchlist
                                    ? <><Check className="w-3.5 h-3.5 text-green-400" /><span className="text-green-400">Added</span></>
                                    : <><Plus className="w-3.5 h-3.5 text-white" /><span className="text-white">My List</span></>
                                }
                            </button>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* ── SLIDE NAVIGATION ARROWS (Classic Style) ── */}
            <button
                onClick={() => goTo((currentIndex - 1 + series.length) % series.length)}
                className="absolute left-6 top-1/2 -translate-y-1/2 z-40 p-3.5 rounded-full transition-all duration-300 cursor-pointer group/arrow border border-white/5 active:scale-90"
                style={{ 
                    background: 'rgba(11, 13, 20, 0.4)', 
                    backdropFilter: 'blur(12px)',
                }}
                onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(11, 13, 20, 0.8)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(11, 13, 20, 0.4)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                }}
            >
                <ChevronLeft className="w-7 h-7 text-white/70 group-hover/arrow:text-white transition-colors" />
            </button>
            <button
                onClick={() => goTo((currentIndex + 1) % series.length)}
                className="absolute right-6 top-1/2 -translate-y-1/2 z-40 p-3.5 rounded-full transition-all duration-300 cursor-pointer group/arrow border border-white/5 active:scale-90"
                style={{ 
                    background: 'rgba(11, 13, 20, 0.4)', 
                    backdropFilter: 'blur(12px)',
                }}
                onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(11, 13, 20, 0.8)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(11, 13, 20, 0.4)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                }}
            >
                <ChevronRight className="w-7 h-7 text-white/70 group-hover/arrow:text-white transition-colors" />
            </button>

            {/* ── MUTE TOGGLE (when trailer active) ── */}
            <AnimatePresence>
                {isVideoActive && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        onClick={() => setIsMuted(!isMuted)}
                        className="absolute bottom-32 right-8 z-40 p-2.5 rounded-full transition-all"
                        style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.15)' }}
                    >
                        {isMuted
                            ? <VolumeX className="w-4 h-4 text-white/70" />
                            : <Volume2 className="w-4 h-4 text-white" />
                        }
                    </motion.button>
                )}
            </AnimatePresence>

            {/* ── DOT INDICATORS ── */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5">
                {series.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => goTo(idx)}
                        className="transition-all duration-500 rounded-full cursor-pointer"
                        style={{
                            height: '3px',
                            width: currentIndex === idx ? '28px' : '6px',
                            background: currentIndex === idx ? '#dc2626' : 'rgba(255,255,255,0.25)',
                        }}
                    />
                ))}
            </div>

            {/* ── MATURITY BADGE ── */}
            <div
                className="absolute bottom-10 right-8 z-40 text-[9px] font-bold text-gray-400 px-2 py-0.5 border border-white/10"
                style={{ background: 'rgba(0,0,0,0.5)' }}
            >
                U/A 16+
            </div>
        </section>
    );
};

export default Hero;
