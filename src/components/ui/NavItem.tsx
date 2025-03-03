
import React from "react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface NavItemProps {
  active?: boolean;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  isExpanded?: boolean;
}

export const NavItem: React.FC<NavItemProps> = ({
  active = false,
  children,
  icon,
  className,
  onClick,
  isExpanded = true,
}) => {
  const baseClasses = "flex rounded items-center cursor-pointer transition-all duration-300";
  const iconClasses = cn(
    "flex items-center justify-center rounded transition-all duration-300",
    !active && isExpanded ? "w-[39px] h-[39px] bg-[#F7F6F2]" : "w-[39px] h-[39px]",
    !isExpanded ? "w-[39px] h-[39px]" : ""
  );

  // If expanded, show the icon and text side by side
  if (isExpanded) {
    return (
      <div
        className={cn(
          baseClasses, 
          className,
          "p-[11px]",
          active ? "bg-muted" : ""
        )}
        onClick={onClick}
        role="button"
        tabIndex={0}
      >
        {icon && (
          <div className={iconClasses}>
            <div className="text-black">{icon}</div>
          </div>
        )}
        <div className="text-black text-[9px] font-semibold tracking-[1.389px] uppercase ml-2">
          {children}
        </div>
      </div>
    );
  }
  
  // If collapsed, show only the icon with a tooltip
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              baseClasses, 
              className,
              "p-[11px] justify-center",
              active ? "bg-muted" : ""
            )}
            onClick={onClick}
            role="button"
            tabIndex={0}
          >
            {icon && (
              <div className={iconClasses}>
                <div className="text-black">{icon}</div>
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent className="text-[9px] font-semibold tracking-[1.389px] uppercase bg-white border border-gray-200">
          {children}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
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
        "rounded-none gap-[11px] text-[9px] font-semibold tracking-[1.389px] uppercase px-0 py-1.5",
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
