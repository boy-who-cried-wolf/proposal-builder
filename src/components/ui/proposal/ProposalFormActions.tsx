
import React from "react";
import { Send } from "lucide-react";

interface ProposalFormActionsProps {
  isGenerating: boolean;
  streamProgress: number;
}

export const ProposalFormActions: React.FC<ProposalFormActionsProps> = ({
  isGenerating,
  streamProgress
}) => {
  return (
    <div className="w-full mt-auto">
      <button
        type="submit"
        disabled={isGenerating}
        className="w-full flex items-center justify-center gap-2 bg-black text-white px-4 py-3 rounded"
      >
        {isGenerating ? (
          <div className="flex items-center">
            <span>Generating</span>
            <span className="ml-1 animate-pulse">...</span>
            {streamProgress > 0 && (
              <span className="ml-2 text-xs">{streamProgress}%</span>
            )}
          </div>
        ) : (
          <>
            Generate Proposal <Send size={16} />
          </>
        )}
      </button>
    </div>
  );
};
