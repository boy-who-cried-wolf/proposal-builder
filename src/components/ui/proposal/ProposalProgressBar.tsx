
import React from "react";

interface ProposalProgressBarProps {
  streamProgress: number;
}

export const ProposalProgressBar: React.FC<ProposalProgressBarProps> = ({ streamProgress }) => {
  return (
    <div className="mt-2">
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className="bg-black h-2.5 rounded-full transition-all duration-300 ease-in-out" 
          style={{ width: `${streamProgress}%` }}
        ></div>
      </div>
    </div>
  );
};
