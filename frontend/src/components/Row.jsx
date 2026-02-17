import { useRef, useEffect, useState } from 'react';
import { motion, useAnimation, useMotionValue } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard';

const Row = ({ title, data, isAutoScroll = false }) => {
    const rowRef = useRef(null);
    const [width, setWidth] = useState(0);
    const xTranslation = useMotionValue(0);
    const controls = useAnimation();

    useEffect(() => {
        if (rowRef.current) {
            setWidth(rowRef.current.scrollWidth - rowRef.current.offsetWidth);
        }
    }, [data]);

    useEffect(() => {
        if (isAutoScroll) {
            controls.start({
                x: "-50%",
                transition: {
                    duration: 40,
                    ease: "linear",
                    repeat: Infinity,
                }
            });
        }
    }, [isAutoScroll, controls]);

    const scroll = (offset) => {
        if (rowRef.current) {
            rowRef.current.scrollBy({ left: offset, behavior: 'smooth' });
        }
    };

    if (!data || data.length === 0) return null;

    if (isAutoScroll) {
        // Double the data for seamless looping
        const loopedData = [...data, ...data];
        return (
            <div className="mb-8 px-0 group relative overflow-hidden">
                <h2 className="px-8 md:px-16 text-xl md:text-2xl font-semibold mb-4 text-white/90 hover:text-white transition-colors cursor-pointer z-30 relative inline-block">
                    {title} <span className="text-xs text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity ml-2">Displaying All &gt;</span>
                </h2>
                
                <motion.div 
                    className="flex gap-4 py-10 -my-8"
                    animate={controls}
                    onHoverStart={() => controls.stop()}
                    onHoverEnd={() => controls.start({
                        x: "-50%", 
                        transition: { duration: 40, ease: "linear", repeat: Infinity } 
                    })}
                >
                    {loopedData.map((item, index) => (
                       <div key={`${item.series_id || item.id}-${index}`} className="flex-none">
                            <MovieCard item={item} />
                       </div>
                    ))}
                </motion.div>
                 {/* Gradient Fade for visual cleanliness on edges */}
                 <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#0f1014] to-transparent pointer-events-none z-20"></div>
                 <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#0f1014] to-transparent pointer-events-none z-20"></div>
            </div>
        );
    }

    // Standard Row
    return (
        <motion.div 
            className="mb-8 px-8 md:px-16 group relative"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
        >
            <h2 className="text-xl md:text-2xl font-semibold mb-4 text-white/90 hover:text-white transition-colors cursor-pointer z-30 relative inline-block">
                {title} <span className="text-xs text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity ml-2">Explore All &gt;</span>
            </h2>
            
            <button 
                onClick={() => scroll(-500)} 
                className="absolute left-4 top-1/2 -translate-y-1/2 z-40 bg-black/50 p-3 rounded-full hidden group-hover:block hover:bg-white hover:text-black transition-all border border-white/20 h-full w-12 flex items-center justify-center opacity-0 group-hover:opacity-100 duration-300"
            >
                <ChevronLeft className="w-8 h-8" />
            </button>
            <button 
                onClick={() => scroll(500)} 
                className="absolute right-4 top-1/2 -translate-y-1/2 z-40 bg-black/50 p-3 rounded-full hidden group-hover:block hover:bg-white hover:text-black transition-all border border-white/20 h-full w-12 flex items-center justify-center opacity-0 group-hover:opacity-100 duration-300"
            >
                <ChevronRight className="w-8 h-8" />
            </button>

            {/* Container has padding-y to prevent hover card clipping */}
            <div 
                ref={rowRef}
                className="flex gap-2 overflow-x-auto scrollbar-hide py-10 px-4 -my-8 scroll-smooth" 
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {data.map((item, index) => (
                   <MovieCard key={item.series_id || item.id} item={item} />
                ))}
            </div>
        </motion.div>
    );
};

export default Row;
