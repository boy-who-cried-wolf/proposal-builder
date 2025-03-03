
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

interface NavItemProps {
  active?: boolean;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  isExpanded?: boolean;
}

const buttonVariants = {
  initial: {
    gap: 0,
  },
  animate: (isExpanded: boolean) => ({
    gap: isExpanded ? ".5rem" : 0,
  }),
};

export const NavItem: React.FC<NavItemProps> = ({
  active = false,
  children,
  icon,
  className,
  onClick,
  isExpanded = true,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const baseClasses = "flex rounded items-center cursor-pointer transition-all duration-300";
  const textClasses = "text-black text-[9px] font-semibold tracking-[1.389px] uppercase";
  const shouldShowText = isExpanded || isHovered;

  return (
    <motion.div
      variants={buttonVariants}
      initial="initial"
      animate="animate"
      custom={isExpanded}
      transition={{ duration: 0.3 }}
      className={cn(
        baseClasses, 
        className,
        isExpanded ? "p-[11px]" : "p-[11px] justify-center",
        active && isExpanded ? "bg-muted" : ""
      )}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      tabIndex={0}
    >
      {icon && (
        <div
          className={cn(
            "flex items-center justify-center rounded transition-all duration-300",
            !active && isExpanded ? "w-[39px] h-[39px] bg-[#F7F6F2]" : "w-[39px] h-[39px]",
            !isExpanded ? "w-[39px] h-[39px]" : ""
          )}
        >
          <div className="text-black">{icon}</div>
        </div>
      )}
      
      {shouldShowText && (
        <AnimatePresence>
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "auto", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={cn(textClasses, active ? "text-black" : "text-black")}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      )}
    </motion.div>
  );
};

export const NavTab: React.FC<Omit<NavItemProps, "icon">> = ({
  active = false,
  children,
  className,
  onClick,
}) => {
  return (
    <div
      className={cn(
        "rounded gap-[11px] text-[9px] font-semibold tracking-[1.389px] uppercase px-0 py-1.5",
        active
          ? "text-black border-b-black border-b border-solid"
          : "text-[rgba(0,0,0,0.5)]",
        className,
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      {children}
    </div>
  );
};
