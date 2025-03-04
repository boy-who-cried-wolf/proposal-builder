
import React, { useState } from "react";
import { UnfoldHorizontalIcon } from "@/components/icons";

interface ResizablePanelProps {
  children: React.ReactNode;
  className?: string;
}

export const ResizablePanel: React.FC<ResizablePanelProps> = ({
  children,
  className = ""
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <section className={`relative flex flex-col border-r-black border-r border-solid max-md:w-full max-md:h-auto ${isExpanded ? 'w-[345px]' : 'w-[200px]'} min-w-[200px] transition-all duration-300 ${className} overflow-hidden`}>
      {children}
      <div
        className="fixed right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 bg-gray-200 p-2 rounded-full cursor-pointer hover:bg-gray-300 z-10"
        style={{ clipPath: 'inset(0 50% 0 0)' }} // Hide the left half
        onClick={toggleExpand}
        aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
      >
        <UnfoldHorizontalIcon className="w-4 h-4" />
      </div>
    </section>
  );
};
