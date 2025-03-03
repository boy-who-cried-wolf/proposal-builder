
import React, { useState } from "react";
import { NavItem } from "@/components/ui/NavItem";
import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowDownIcon,
  ViewIcon,
  DiamondIcon,
  DocumentIcon,
  LogoutIcon,
} from "@/components/icons";
import { Square, ChevronLeft, ChevronRight, Settings, Users, MessageSquare } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

export const Sidebar: React.FC = () => {
  const [activeNavItem, setActiveNavItem] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState(false); // Changed to false to start collapsed
  const { user, signOut } = useAuth();

  const handleNavItemClick = (index: number) => {
    if (!isExpanded) return;
    setActiveNavItem(activeNavItem === index ? null : index);
  };

  const handleLogout = () => {
    signOut();
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      setActiveNavItem(null);
    }
  };

  const navItems = [
    {
      title: "Dashboard",
      icon: ArrowDownIcon,
      content: (
        <div className="p-3 bg-muted/20 rounded-sm mt-1">
          <ul className="space-y-2 text-xs">
            <li className="cursor-pointer hover:text-primary">Overview</li>
            <li className="cursor-pointer hover:text-primary">Analytics</li>
            <li className="cursor-pointer hover:text-primary">Reports</li>
          </ul>
        </div>
      ),
    },
    {
      title: "Clients",
      icon: Users,
      content: (
        <div className="p-3 bg-muted/20 rounded-sm mt-1">
          <ul className="space-y-2 text-xs">
            <li className="cursor-pointer hover:text-primary">All Clients</li>
            <li className="cursor-pointer hover:text-primary">Add Client</li>
            <li className="cursor-pointer hover:text-primary">Client Groups</li>
          </ul>
        </div>
      ),
    },
    {
      title: "Assistant",
      icon: MessageSquare,
      content: (
        <div className="p-3 bg-muted/20 rounded-sm mt-1">
          <ul className="space-y-2 text-xs">
            <li className="cursor-pointer hover:text-primary">Chat</li>
            <li className="cursor-pointer hover:text-primary">Templates</li>
            <li className="cursor-pointer hover:text-primary">History</li>
          </ul>
        </div>
      ),
    },
    {
      title: "Settings",
      icon: Settings,
      content: (
        <div className="p-3 bg-muted/20 rounded-sm mt-1">
          <ul className="space-y-2 text-xs">
            <li className="cursor-pointer hover:text-primary">Account</li>
            <li className="cursor-pointer hover:text-primary">Preferences</li>
            <li className="cursor-pointer hover:text-primary">Team</li>
          </ul>
        </div>
      ),
    },
  ];

  return (
    <aside 
      className={cn(
        "flex flex-col bg-white border-r-black border-r border-solid transition-all duration-300", 
        isExpanded ? "w-[254px]" : "w-[70px]"
      )}
    >
      <div className={cn(
        "flex h-[69px] items-center border-b-black border-b border-solid",
        isExpanded ? "px-[27px] justify-between" : "px-[11px] justify-center"
      )}>
        {isExpanded ? (
          <>
            <div className="text-orange-500 text-[19px] font-bold">
              <img 
                src="/lovable-uploads/044f32c4-fae7-492c-9ad5-18d2ac0a83f5.png" 
                alt="Proposal Maker" 
                className="h-8" 
              />
            </div>
            <div 
              className="cursor-pointer" 
              onClick={toggleExpand}
              role="button"
              tabIndex={0}
            >
              <ChevronLeft size={20} />
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col items-center">
              <img 
                src="/lovable-uploads/8e073d5c-cebc-4046-a3c6-7861dda72ee8.png" 
                alt="PM" 
                className="h-8 mb-1" 
              />
              <div 
                className="cursor-pointer" 
                onClick={toggleExpand} 
                role="button"
                tabIndex={0}
              >
                <ChevronRight size={16} />
              </div>
            </div>
          </>
        )}
      </div>

      <nav className="grow flex flex-col gap-3 p-[11px] overflow-hidden">
        {navItems.map((item, index) => (
          <div key={index}>
            <NavItem
              active={activeNavItem === index}
              icon={<item.icon />}
              onClick={() => handleNavItemClick(index)}
              isExpanded={isExpanded}
            >
              {item.title}
            </NavItem>
            
            {isExpanded && activeNavItem === index && (
              <AnimatePresence>
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  {item.content}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        ))}
      </nav>

      <div className={cn(
        "h-[69px] border-t-black border-t border-solid",
        isExpanded ? "p-[17px]" : "p-[11px] flex justify-center items-center"
      )}>
        {isExpanded ? (
          <>
            <div className="text-black text-[10px] font-semibold tracking-[1.544px] uppercase mb-3">
              {user ? user.email : 'Guest User'}
            </div>
            {user ? (
              <div 
                className="flex items-center justify-between cursor-pointer" 
                onClick={handleLogout}
                role="button"
                tabIndex={0}
              >
                <div className="text-black text-[10px] font-semibold tracking-[1.544px] uppercase">
                  Logout
                </div>
                <div className="text-black">
                  <LogoutIcon />
                </div>
              </div>
            ) : (
              <Link 
                to="/auth" 
                className="flex items-center justify-between cursor-pointer"
              >
                <div className="text-black text-[10px] font-semibold tracking-[1.544px] uppercase">
                  Sign In
                </div>
              </Link>
            )}
          </>
        ) : (
          <div className="cursor-pointer">
            {user ? (
              <div 
                onClick={handleLogout}
                role="button"
                tabIndex={0}
              >
                <LogoutIcon />
              </div>
            ) : (
              <Link to="/auth">
                <Users size={18} />
              </Link>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
