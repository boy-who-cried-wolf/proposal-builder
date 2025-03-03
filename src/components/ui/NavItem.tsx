import React from "react";
import { cn } from "@/lib/utils";

interface NavItemProps {
  active?: boolean;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const NavItem: React.FC<NavItemProps> = ({
  active = false,
  children,
  icon,
  className,
  onClick,
}) => {
  const baseClasses = "flex rounded items-center gap-[11px] p-[11px]";
  const textClasses =
    "text-black text-[9px] font-semibold tracking-[1.389px] uppercase";

  return (
    <div
      className={cn(baseClasses, className, active ? "bg-transparent" : "")}
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      {icon && (
        <div
          className={cn(
            "w-[39px] h-[39px] flex items-center justify-center rounded",
            !active && "bg-[#F7F6F2]",
          )}
        >
          <div className="text-black">{icon}</div>
        </div>
      )}
      <div className={cn(textClasses, active ? "text-black" : "text-black")}>
        {children}
      </div>
    </div>
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
