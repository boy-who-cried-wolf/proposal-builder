
import React from "react";
import { Link } from "react-router-dom";
import { Users } from "lucide-react";
import { LogoutIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

interface SidebarFooterProps {
  isExpanded: boolean;
  user: any;
  onLogout: () => void;
}

export const SidebarFooter: React.FC<SidebarFooterProps> = ({
  isExpanded,
  user,
  onLogout,
}) => {
  return (
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
              onClick={onLogout}
              role="button"
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
              onClick={onLogout}
              role="button"
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
  );
};
