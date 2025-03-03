
import React from "react";
import { NavItem } from "@/components/ui/NavItem";
import { AnimatePresence, motion } from "framer-motion";

interface SidebarNavItemProps {
  title: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  content: React.ReactNode;
  isActive: boolean;
  isExpanded: boolean;
  onItemClick: () => void;
}

export const SidebarNavItem: React.FC<SidebarNavItemProps> = ({
  title,
  icon: Icon,
  content,
  isActive,
  isExpanded,
  onItemClick,
}) => {
  return (
    <div>
      <NavItem
        active={isActive}
        icon={<Icon />}
        onClick={onItemClick}
        isExpanded={isExpanded}
      >
        {title}
      </NavItem>
      
      {isExpanded && isActive && (
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
