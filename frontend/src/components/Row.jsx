import { useRef, useEffect, useState } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import MovieCard from './MovieCard';

const Row = ({ title, data, isAutoScroll = false }) => {
    const rowRef = useRef(null);
    const containerRef = useRef(null);
    const [width, setWidth] = useState(0);
    const controls = useAnimation();
    const isInView = useInView(containerRef, { once: true, margin: "-100px" });

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
        const loopedData = [...data, ...data];
        return (
            <div ref={containerRef} className="mb-12 px-0 group/row relative overflow-hidden">
                {title === "Trending Now" ? (
                    <motion.h2 
                        initial={{ opacity: 0, x: -20 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="px-6 md:px-16 text-xl md:text-2xl font-black mb-4 text-white tracking-tight z-30 relative inline-block border-l-4 border-red-600 pl-4 uppercase"
                    >
                        {title} 
                    </motion.h2>
                ) : (
                    <Link to={`/genre/${title}`}>
                        <motion.h2 
                            initial={{ opacity: 0, x: -20 }}
                            animate={isInView ? { opacity: 1, x: 0 } : {}}
                            whileHover={{ color: "#c0392b", x: 10 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="px-6 md:px-16 text-xl md:text-2xl font-black mb-4 text-white hover:text-red-500 tracking-tight cursor-pointer z-30 relative inline-block group border-l-4 border-red-600 pl-4 uppercase"
                        >
                            {title} <span className="text-[10px] ml-2 opacity-0 group-hover:opacity-100 transition-opacity align-middle font-bold text-red-600">VIEW ALL</span>
                        </motion.h2>
                    </Link>
                )}
                
                <motion.div 
                    className="flex gap-0 py-10 -my-8"
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
                
                <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#0f1014] to-transparent pointer-events-none z-20"></div>
                <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#0f1014] to-transparent pointer-events-none z-20"></div>
            </div>
        );
    }

    // Standard Row with Staggered Revel
    return (
        <div ref={containerRef} className="mb-10 group/row relative">
            {title === "Trending Now" ? (
                <motion.h2 
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.8 }}
                    className="px-6 md:px-16 text-xl md:text-2xl font-black mb-4 text-white tracking-tight z-30 relative inline-block border-l-4 border-red-600 pl-4 uppercase"
                >
                    {title}
                </motion.h2>
            ) : (
                <Link to={`/genre/${title}`}>
                    <motion.h2 
                        initial={{ opacity: 0, x: -20 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        whileHover={{ color: "#c0392b", x: 10 }}
                        transition={{ duration: 0.8 }}
                        className="px-6 md:px-16 text-xl md:text-2xl font-black mb-4 text-white hover:text-red-500 tracking-tight cursor-pointer z-30 relative inline-block group border-l-4 border-red-600 pl-4 uppercase"
                    >
                        {title} <span className="text-[10px] ml-2 opacity-0 group-hover:opacity-100 transition-opacity align-middle font-bold text-red-600">VIEW ALL</span>
                    </motion.h2>
                </Link>
            )}
            
            <div className="relative px-6 md:px-16">
                <button 
                    onClick={() => scroll(-600)} 
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-40 bg-black/80 p-4 rounded-full hidden group-hover/row:flex hover:bg-white hover:text-black transition-all border border-white/10 h-16 w-16 items-center justify-center opacity-0 group-hover/row:opacity-100 duration-300 shadow-2xl backdrop-blur-md"
                >
                    <ChevronLeft className="w-10 h-10" />
                </button>
                <button 
                    onClick={() => scroll(600)} 
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-40 bg-black/80 p-4 rounded-full hidden group-hover/row:flex hover:bg-white hover:text-black transition-all border border-white/10 h-16 w-16 items-center justify-center opacity-0 group-hover/row:opacity-100 duration-300 shadow-2xl backdrop-blur-md"
                >
                    <ChevronRight className="w-10 h-10" />
                </button>

                <motion.div 
                    ref={rowRef}
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                    variants={{
                        visible: {
                            transition: { staggerChildren: 0.05 }
                        }
                    }}
                    className="flex gap-2 overflow-x-auto scrollbar-hide py-10 px-2 -my-8 scroll-smooth" 
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {data.map((item, index) => (
                       <motion.div
                            key={item.series_id || item.id}
                            variants={{
                                hidden: { opacity: 0, scale: 0.9, y: 10 },
                                visible: { opacity: 1, scale: 1, y: 0 }
                            }}
                            transition={{ duration: 0.5 }}
                       >
                            <MovieCard item={item} />
                       </motion.div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
};

export default Row;
