import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import '../styles/auth.css';

const LandingPage = () => {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    
    // Smooth motion values for parallax
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    
    // Spring configuration for smooth tracking
    const springConfig = { damping: 25, stiffness: 150 };
    const smoothX = useSpring(mouseX, springConfig);
    const smoothY = useSpring(mouseY, springConfig);

    useEffect(() => {
        const handleMouseMove = (e) => {
            const { clientX, clientY } = e;
            const { innerWidth, innerHeight } = window;
            
            // Percentage based coordinates (-1 to 1)
            const x = (clientX / innerWidth) * 2 - 1;
            const y = (clientY / innerHeight) * 2 - 1;
            
            mouseX.set(x);
            mouseY.set(y);
            setMousePos({ x: clientX, y: clientY });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [mouseX, mouseY]);

    return (
        <div className="min-h-screen bg-black text-white overflow-hidden relative font-['Open_Sans',sans-serif]">
            {/* Interactive Spotlight Effect */}
            <div 
                className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300"
                style={{
                    background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(220, 38, 38, 0.15), transparent 80%)`
                }}
            ></div>

            {/* Dynamic Cinematic Background with Parallax */}
            <motion.div 
                className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2050&auto=format&fit=crop')] bg-cover bg-center opacity-40 scale-110"
                style={{
                    x: smoothX.get() * 20,
                    y: smoothY.get() * 20,
                }}
            />
            
            <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/40 to-black"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)]"></div>

            <nav className="relative z-40 flex justify-between items-center px-12 py-8">
                <div className="nav-left">
                    <Link to="/" className="logo scale-110 origin-left">
                        <i className='bx bx-movie-play bx-tada'></i>
                        BING<span className="logo-e">E</span>SYNC
                    </Link>
                </div>
                <Link to="/login">
                    <button className="group relative px-8 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full font-bold text-sm tracking-wide overflow-hidden transition-all hover:bg-red-600 hover:border-red-500 hover:scale-105 active:scale-95 shadow-[0_4px_15px_rgba(0,0,0,0.3)] cursor-pointer">
                        <span className="relative z-10 transition-colors group-hover:text-white">Sign In</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-rose-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>
                </Link>
            </nav>

            <main className="relative z-40 flex flex-col items-center justify-center h-[65vh] text-center px-6 -mt-10">
                <motion.div
                    style={{
                        x: smoothX,
                        y: smoothY,
                    }}
                >
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                        className="text-6xl md:text-8xl font-black mb-6 max-w-5xl tracking-tight leading-tight select-none"
                    >
                        Connect, Sync, and <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-rose-500 to-orange-400 drop-shadow-[0_10px_10px_rgba(220,38,38,0.3)]">
                            Binge Together.
                        </span>
                    </motion.h1>
                </motion.div>
                
                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.6 }}
                    className="text-xl md:text-2xl mb-12 font-medium text-gray-400 max-w-3xl leading-relaxed select-none"
                >
                    Discover the new way to watch with friends. Create shared watchlists, <br className="hidden md:block"/> 
                    get real-time synchronization, and never miss a scene again.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.4, delay: 0.9 }}
                >
                    <Link to="/register">
                        <button className="group relative px-12 py-6 bg-white text-black text-2xl rounded-full font-black flex items-center gap-4 transition-all shadow-[0_10px_50px_rgba(220,38,38,0.2)] hover:shadow-[0_20px_70px_rgba(220,38,38,0.4)] overflow-hidden cursor-pointer">
                            <span className="relative z-10">Get Started Now</span>
                            <i className='bx bx-play-circle text-3xl group-hover:rotate-12 transition-transform relative z-10'></i>
                            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-600/0 via-red-600/20 to-red-600/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        </button>
                    </Link>
                </motion.div>
            </main>

            {/* Bottom floating elements with independent parallax */}
            <motion.div 
                className="absolute bottom-[-15%] left-[-10%] w-[500px] h-[500px] bg-red-600/20 rounded-full blur-[150px] animate-pulse"
                style={{
                    x: smoothX.get() * -40,
                    y: smoothY.get() * -40,
                }}
            />
            <motion.div 
                className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-rose-500/15 rounded-full blur-[120px] animate-pulse"
                style={{
                    x: smoothX.get() * 30,
                    y: smoothY.get() * -30,
                }}
            />
        </div>
    );
};

export default LandingPage;
