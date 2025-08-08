import React, { useState, useRef } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { cn } from "../../lib/utils";
import { IconMenu2, IconX } from "@tabler/icons-react";
import { NavLink as RouterNavLink } from "react-router-dom";

// --- Komponen-komponen Utama ---
export const Navbar = ({ children, className }: { children: React.ReactNode; className?: string; }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setVisible(latest > 100);
  });

  return (
    <motion.div ref={ref} className={cn("sticky top-0 z-40 w-full", className)}>
      {React.Children.map(children, (child) =>
        React.isValidElement(child) ? React.cloneElement(child as React.ReactElement<{ visible?: boolean }>, { visible }) : child
      )}
    </motion.div>
  );
};

export const NavBody = ({ children, className, visible }: { children: React.ReactNode; className?: string; visible?: boolean; }) => {
  return (
    <motion.div
      animate={{
        backdropFilter: visible ? "blur(10px)" : "none",
        boxShadow: visible ? "0 0 24px rgba(34, 42, 53, 0.06), 0 1px 1px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(34, 42, 53, 0.04), 0 0 4px rgba(34, 42, 53, 0.08), 0 16px 68px rgba(47, 48, 55, 0.05), 0 1px 0 rgba(255, 255, 255, 0.1) inset" : "none",
        width: visible ? "40%" : "100%",
        y: visible ? 20 : 0,
        borderRadius: visible ? "9999px" : "0px",
      }}
      transition={{ type: "spring", stiffness: 200, damping: 50 }}
      className={cn("relative z-[60] mx-auto hidden w-full max-w-7xl flex-row items-center justify-between self-start px-4 py-2 lg:flex",
        visible && "bg-white/80 dark:bg-neutral-950/80", className
      )}
    >
      {children}
    </motion.div>
  );
};

export const NavItems = ({ items, onItemClick }: { items: { name: string; link: string }[], onItemClick?: () => void; }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div
      onMouseLeave={() => setHoveredIndex(null)}
      className="absolute inset-0 hidden flex-1 flex-row items-center justify-center space-x-2 text-sm font-medium lg:flex"
    >
      {items.map((item, idx) => (
        <RouterNavLink
          key={`link-${idx}`}
          to={item.link}
          onMouseEnter={() => setHoveredIndex(idx)}
          onClick={onItemClick}
          className={({ isActive }) =>
            cn(
              "relative px-4 py-2 transition-colors",
              isActive ? "text-rose-500 dark:text-dark-accent" : "text-neutral-600 dark:text-neutral-300"
            )
          }
        >
          <AnimatePresence>
            {hoveredIndex === idx && (
              <motion.span
                className="absolute inset-0 h-full w-full bg-rose-100/80 dark:bg-dark-card block rounded-full"
                layoutId="hoverBackground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.15 } }}
                exit={{ opacity: 0, transition: { duration: 0.15, delay: 0.2 } }}
              />
            )}
          </AnimatePresence>
          <span className="relative z-20">{item.name}</span>
        </RouterNavLink>
      ))}
    </div>
  );
};

// ... (Sisa komponen lainnya seperti MobileNav, NavbarLogo, dll. tetap sama)
export const MobileNav = ({ children, className, visible }: { children: React.ReactNode; className?: string; visible?: boolean; }) => {
  return (
    <motion.div
      animate={{
        backdropFilter: visible ? "blur(10px)" : "none",
        boxShadow: visible ? "0 0 24px rgba(34, 42, 53, 0.06), 0 1px 1px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(34, 42, 53, 0.04), 0 0 4px rgba(34, 42, 53, 0.08), 0 16px 68px rgba(47, 48, 55, 0.05), 0 1px 0 rgba(255, 255, 255, 0.1) inset" : "none",
        y: visible ? 20 : 0,
      }}
      transition={{ type: "spring", stiffness: 200, damping: 50 }}
      className={cn("relative z-50 mx-auto flex w-full max-w-[calc(100vw-2rem)] flex-col items-center justify-between rounded-full bg-white/80 dark:bg-dark-bg/80 px-4 py-2 lg:hidden", className)}
    >
      {children}
    </motion.div>
  );
};
export const MobileNavHeader = ({ children }: { children: React.ReactNode; }) => {
  return <div className="flex w-full flex-row items-center justify-between">{children}</div>;
};
export const MobileNavMenu = ({ children, isOpen }: { children: React.ReactNode; isOpen: boolean; }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -20, height: 0 }}
          className="absolute inset-x-0 top-16 z-50 w-full flex-col items-start justify-start gap-4 rounded-2xl bg-white dark:bg-dark-bg p-4 shadow-lg"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
export const MobileNavToggle = ({ isOpen, onClick }: { isOpen: boolean; onClick: () => void; }) => {
  return isOpen ? <IconX className="text-black dark:text-white" onClick={onClick} /> : <IconMenu2 className="text-black dark:text-white" onClick={onClick} />;
};
export const NavbarLogo = () => {
  return (
    <RouterNavLink to="/" className="relative z-20 mr-4 flex items-center space-x-2 text-sm font-normal text-black">
      <span className="text-xl font-bold font-serif text-rose-800 dark:text-rose-200">A</span>
    </RouterNavLink>
  );
};
export const NavbarButton = ({ as: Tag = "button", children, className, variant = "primary", ...props }: { as?: React.ElementType; children: React.ReactNode; className?: string; variant?: "primary" | "secondary"; } & React.ComponentPropsWithoutRef<"button">) => {
  const baseStyles = "px-4 py-2 rounded-full text-sm font-medium relative cursor-pointer transition duration-200 inline-block text-center";
  const variantStyles = {
    primary: "bg-rose-500 text-white hover:bg-rose-600",
    secondary: "bg-slate-200 dark:bg-dark-card text-slate-800 dark:text-dark-text hover:bg-slate-300",
  };
  return <Tag className={cn(baseStyles, variantStyles[variant], className)} {...props}>{children}</Tag>;
};