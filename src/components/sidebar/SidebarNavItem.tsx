
import React from "react";
import { NavItem } from "@/components/ui/NavItem";
import { AnimatePresence, motion } from "framer-motion";
import { LucideProps } from "lucide-react";

interface SidebarNavItemProps {
  title?: string;
  icon: React.ComponentType<{ className?: string }>;
  content?: React.ReactNode;
  isActive: boolean;
  isExpanded: boolean;
  onItemClick?: () => void;
  label?: string;
  path?: string;
  onClick?: () => void;
}

export const SidebarNavItem: React.FC<SidebarNavItemProps> = ({
  title,
  icon: Icon,
  content,
  isActive,
  isExpanded,
  onItemClick,
  label,
  path,
  onClick,
}) => {
  // Use the onClick prop or fall back to onItemClick for backward compatibility
  const handleClick = onClick || onItemClick;
  
  // Use label or title for displaying the text
  const displayText = label || title;
  
  return (
    <div>
      <NavItem
        active={isActive}
        icon={<Icon className="text-black" />}
        onClick={handleClick}
        isExpanded={isExpanded}
      >
        {displayText}
      </NavItem>
      
      {isExpanded && isActive && content && (
        <AnimatePresence>
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            {content}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};
