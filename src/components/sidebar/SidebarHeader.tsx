
import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SidebarHeaderProps {
  isExpanded: boolean;
  toggleExpand: () => void;
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({
  isExpanded,
  toggleExpand
}) => {
  return <div className={cn("flex h-[69px] items-center border-b-black border-b border-solid", isExpanded ? "px-[27px] justify-between" : "px-[11px] justify-center")}>
      {isExpanded ? <>
          <div className="text-orange-500 text-[19px] font-bold">
            <img src="/lovable-uploads/044f32c4-fae7-492c-9ad5-18d2ac0a83f5.png" alt="Proposal Maker" className="h-8" />
          </div>
          <div className="cursor-pointer" onClick={toggleExpand} role="button">
            <ChevronLeft size={20} />
          </div>
        </> : 
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="cursor-pointer" onClick={toggleExpand} role="button">
                <img src="/lovable-uploads/8e073d5c-cebc-4046-a3c6-7861dda72ee8.png" alt="PM" className="h-8 mb-1" />
              </div>
            </TooltipTrigger>
            <TooltipContent className="text-[9px] font-semibold tracking-[1.389px] uppercase bg-white border border-gray-200">
              Expand Sidebar
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      }
    </div>;
};
