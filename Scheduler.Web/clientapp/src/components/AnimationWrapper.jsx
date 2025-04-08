import { motion } from "framer-motion";

export default function AnimationWrapper({ children, keyName }) {
    return (
        <motion.div
            key={keyName}
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
        >
            {children}
        </motion.div>
    );
}