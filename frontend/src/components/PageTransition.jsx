import { motion } from 'framer-motion';

const PageTransition = ({ children }) => {
    const rows = 5;
    const cols = 10;
    const totalBlocks = rows * cols;

    // Checkerboard animation variants
    const blockVariants = {
        initial: { scaleY: 1 },
        animate: (i) => ({
            scaleY: 0,
            transition: {
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1],
                delay: (i % cols) * 0.04 + Math.floor(i / cols) * 0.04,
            }
        }),
        exit: (i) => ({
            scaleY: 1,
            transition: {
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1],
                delay: (i % cols) * 0.03 + Math.floor(i / cols) * 0.02,
            }
        })
    };

    return (
        <div className="relative min-h-screen">
            {/* Checkerboard Overlay */}
            <div className="fixed inset-0 pointer-events-none z-[9999] flex flex-wrap">
                {[...Array(totalBlocks)].map((_, i) => (
                    <motion.div
                        key={i}
                        custom={i}
                        variants={blockVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="bg-[#0f1014] origin-top"
                        style={{
                            width: `${100 / cols}%`,
                            height: `${100 / rows}%`,
                        }}
                    />
                ))}
            </div>

            {/* Content Transition */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, delay: 0.6 }}
            >
                {children}
            </motion.div>
        </div>
    );
};

export default PageTransition;
