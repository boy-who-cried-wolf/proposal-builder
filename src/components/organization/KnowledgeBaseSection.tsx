
import React from "react";
import { Textarea } from "@/components/ui/textarea";

interface KnowledgeBaseSectionProps {
  knowledgeBase: string;
  setKnowledgeBase: (value: string) => void;
}

export const KnowledgeBaseSection: React.FC<KnowledgeBaseSectionProps> = ({
  knowledgeBase,
  setKnowledgeBase
}) => {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">Knowledge Base</label>
      <p className="text-sm text-muted-foreground mb-2">
        This information will be used to help the AI create better proposals for your business.
      </p>
      <Textarea 
        value={knowledgeBase} 
        onChange={(e) => setKnowledgeBase(e.target.value)}
        placeholder="Enter information about your business, expertise, preferred working style, etc."
        rows={6}
      />
    </div>
  );
};
