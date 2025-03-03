
import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Info, Copy, Check } from "lucide-react";

interface KnowledgeBaseSectionProps {
  knowledgeBase: string;
  setKnowledgeBase: (value: string) => void;
}

export const KnowledgeBaseSection: React.FC<KnowledgeBaseSectionProps> = ({
  knowledgeBase,
  setKnowledgeBase
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (knowledgeBase) {
      navigator.clipboard.writeText(knowledgeBase)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(error => {
          console.error("Error copying to clipboard:", error);
        });
    }
  };

  const placeholderText = 
    "Enter information about your business, expertise, preferred working style, etc. This helps the AI create better proposals tailored to your business needs.\n\nConsider including:\n• Your company's core services\n• Your expertise and specialties\n• Your workflow and collaboration style\n• Client communication preferences\n• Project management approach";

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium">Knowledge Base</label>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleCopy}
          disabled={!knowledgeBase}
          className="h-8 px-2"
        >
          {copied ? (
            <><Check className="h-4 w-4 mr-1" /> Copied</>
          ) : (
            <><Copy className="h-4 w-4 mr-1" /> Copy</>
          )}
        </Button>
      </div>
      
      <div className="bg-muted/50 rounded-md p-3 flex items-start space-x-2 text-sm">
        <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
        <p className="text-muted-foreground">
          This information will be used to help the AI create better proposals for your business. The more details you provide, the more accurately the AI can capture your voice and expertise.
        </p>
      </div>
      
      <Textarea 
        value={knowledgeBase} 
        onChange={(e) => setKnowledgeBase(e.target.value)}
        placeholder={placeholderText}
        rows={8}
        className="min-h-[200px] resize-y"
      />
      
      <div className="text-xs text-muted-foreground">
        {knowledgeBase?.length || 0} characters
      </div>
    </div>
  );
};
