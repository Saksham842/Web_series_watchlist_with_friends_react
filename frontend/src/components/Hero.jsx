import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Play, Plus, Info } from 'lucide-react';

const Hero = ({ series }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % series.length);
        }, 8000); // Slower rotation for better UX
        return () => clearInterval(interval);
    }, [series]);

    if (!series || series.length === 0) return null;

    const currentSeries = series[currentIndex];

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.3
            }
        },
        exit: {
            opacity: 0,
            transition: { duration: 0.5 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 50 }
        }
    };

    return (
        <div className="relative h-[85vh] w-full overflow-hidden bg-[#0f1014]">
            <AnimatePresence mode='wait'>
                <motion.div
                    key={currentSeries.series_id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                    className="absolute inset-0"
                >
                    {/* Background Image with optional slow zoom effect */}
                    <motion.div 
                        className="absolute inset-0 bg-cover bg-top"
                        style={{ backgroundImage: `url(${currentSeries.landscape_poster_url})` }}
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 10, ease: "linear" }}
                    >
                         {/* Enhanced Vignettes for better text readability */}
                        <div className="absolute inset-0 bg-gradient-to-r from-[#0f1014] via-[#0f1014]/40 to-transparent"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1014] via-[#0f1014]/20 to-transparent"></div>
                        <div className="absolute inset-0 bg-gradient-to-b from-[#0f1014]/60 via-transparent to-transparent h-32"></div>
                    </motion.div>
                </motion.div>
            </AnimatePresence>

            <div className="absolute inset-0 flex flex-col justify-end pb-20 px-8 md:px-16 z-20">
                <motion.div
                    key={`content-${currentSeries.series_id}`}
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="max-w-2xl"
                >
                    {/* Metadata Line */}
                    <motion.div variants={itemVariants} className="flex items-center gap-3 text-white/90 font-medium text-sm mb-4">
                         <span className="bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded border border-yellow-500/30 flex items-center gap-1">
                            <span>★</span> {currentSeries.series_rating}
                        </span>
                        <span>{currentSeries.release_year}</span>
                        <span className="text-white/40">•</span>
                        <span className="uppercase tracking-wider text-xs border border-white/30 px-2 py-0.5 rounded">HD</span>
                        <span className="text-white/40">•</span>
                        <span className="bg-blue-600/80 px-2 py-0.5 rounded text-white text-xs font-bold tracking-wide">PRIME</span>
                    </motion.div>

                    {/* Title */}
                    <motion.h1 
                        variants={itemVariants}
                        className="text-5xl md:text-7xl font-extrabold mb-4 text-white tracking-tight leading-none drop-shadow-lg"
                    >
                        {currentSeries.title}
                    </motion.h1>
                    
                    {/* Description */}
                    <motion.p 
                        variants={itemVariants}
                        className="text-lg text-gray-200 mb-8 line-clamp-3 font-normal max-w-xl leading-relaxed drop-shadow-md"
                    >
                        {currentSeries.description}
                    </motion.p>
                    
                    {/* Buttons */}
                    <motion.div variants={itemVariants} className="flex gap-4">
                        <Link to={`/series/${currentSeries.series_id}`}>
                            <motion.button 
                                whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 1)" }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-white text-black px-8 py-3 rounded-lg font-bold flex items-center gap-3 transition-colors"
                            >
                                <Play className="fill-black w-6 h-6" /> 
                                <span className="text-lg">Play</span>
                            </motion.button>
                        </Link>
                        
                        <motion.button 
                             whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.2)" }}
                             whileTap={{ scale: 0.95 }}
                             className="bg-white/10 text-white backdrop-blur-sm border border-white/20 px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
                        >
                            <Plus className="w-6 h-6" />
                            <span>My List</span>
                        </motion.button>

                         <motion.button 
                             whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.2)" }}
                             whileTap={{ scale: 0.95 }}
                             className="bg-white/10 text-white backdrop-blur-sm border border-white/20 px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors hidden md:flex"
                        >
                            <Info className="w-6 h-6" />
                            <span>More Info</span>
                        </motion.button>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default Hero;
