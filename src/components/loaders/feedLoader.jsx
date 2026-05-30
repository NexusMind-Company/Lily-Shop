import React from "react";
import { motion } from "framer-motion";

const FeedLoader = () => {
    return (
        <div className="h-full w-full flex flex-col items-center justify-center bg-[#050505] overflow-hidden relative">
            {/* Background Ambient Glow */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.1, 0.2, 0.1],
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="absolute w-[500px] h-[500px] bg-lily rounded-full blur-[120px] -z-10"
            />

            <div className="relative flex flex-col items-center">
                {/* Main Logo Container */}
                <div className="relative w-32 h-32 flex items-center justify-center">
                    {/* Outer Rotating Segmented Ring */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 border-t-2 border-r-2 border-lily/30 rounded-full"
                    />

                    {/* Middle Counter-Rotating Ring */}
                    <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-4 border-b-2 border-l-2 border-lily/20 rounded-full border-dashed"
                    />

                    {/* Orbital Particles */}
                    {[0, 120, 240].map((angle, i) => (
                        <motion.div
                            key={i}
                            animate={{
                                rotate: angle + 360,
                            }}
                            transition={{
                                duration: 3 + i,
                                repeat: Infinity,
                                ease: "linear",
                            }}
                            className="absolute w-full h-full"
                        >
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-lily rounded-full shadow-[0_0_10px_#4eb75e]" />
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Side Decorative Elements */}
            <div className="absolute bottom-10 left-10 flex flex-col gap-2 opacity-20">
                <div className="w-8 h-[1px] bg-white" />
                <div className="w-12 h-[1px] bg-white" />
                <div className="w-4 h-[1px] bg-white" />
            </div>
        </div>
    );
};

export default FeedLoader;
