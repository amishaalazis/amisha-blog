// import { cn } from "../../lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState, type ReactNode } from "react";
// import { cn } from "../../lib/utils";
// import { AnimatePresence, motion } from "framer-motion";
// import { Link } from "react-router-dom";
// import { useState, ReactNode } from "react";

export const HoverEffect = ({
  children,
  link,
}: {
  children: ReactNode;
  link: string;
}) => {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      to={link}
      className="relative group block p-2 h-full w-full"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
        <AnimatePresence>
        {hovered && (
          <motion.span
            className="absolute inset-0 h-full w-full bg-rose-200 block rounded-3xl"
            layoutId="hoverBackground"
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              transition: { duration: 0.15 },
            }}
            exit={{
              opacity: 0,
              transition: { duration: 0.15, delay: 0.2 },
            }}
          />
        )}
      </AnimatePresence>
      <div className="rounded-2xl h-full w-full overflow-hidden bg-white border border-transparent group-hover:border-slate-200 relative z-20">
        {children}
      </div>
    </Link>
  );
};