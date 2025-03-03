
import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarHeaderProps {
  isExpanded: boolean;
  toggleExpand: () => void;
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({
  isExpanded,
  toggleExpand,
}) => {
  return (
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
        <div className="cursor-pointer" onClick={toggleExpand} role="button" tabIndex={0}>
          <img 
            src="/lovable-uploads/8e073d5c-cebc-4046-a3c6-7861dda72ee8.png" 
            alt="PM" 
            className="h-8 mb-1" 
          />
          <ChevronRight size={16} />
        </div>
      )}
    </div>
  );
};
