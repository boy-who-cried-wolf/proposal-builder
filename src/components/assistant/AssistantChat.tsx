import React, { useState, useEffect } from "react";
import { SendIcon } from "@/components/icons";
import { ProposalSection } from "@/utils/openaiProposal";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { usePlanSubscription } from "@/hooks/usePlanSubscription";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Message = {
  id: string;
  text: string;
  isUser: boolean;
};

interface AssistantChatProps {
  proposalSections: ProposalSection[];
  onUpdateProposal?: (sections: ProposalSection[]) => void;
}

export const AssistantChat: React.FC<AssistantChatProps> = ({ 
  proposalSections = [],
  onUpdateProposal 
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const { currentPlan, loading: planLoading } = usePlanSubscription(user?.id);
  
  useEffect(() => {
    if (user && !planLoading && currentPlan !== 'pro') {
      setShowPlanDialog(true);
    }
  }, [user, currentPlan, planLoading]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const processProposalRequest = async (userMessage: string) => {
    if (!user) {
      setShowAuthDialog(true);
      return {
        id: Date.now().toString(),
        text: "Please sign in to use the assistant features.",
        isUser: false,
      };
    }

    if (!proposalSections || proposalSections.length === 0) {
      return {
        id: Date.now().toString(),
        text: "Please generate a proposal first before trying to refine it.",
        isUser: false,
      };
    }

    try {
      const response = await fetch('/api/process-proposal-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          sections: proposalSections
        }),
      }).catch(() => {
        const updatedSections = processProposalSimulated(userMessage, proposalSections);
        
        if (onUpdateProposal) {
          onUpdateProposal(updatedSections);
        }
        
        return new Response(JSON.stringify({ 
          success: true, 
          message: `I've updated the proposal based on your request: "${userMessage}"`,
          sections: updatedSections
        }));
      });

      const data = await response.json();
      
      if (data.sections && onUpdateProposal) {
        onUpdateProposal(data.sections);
      }

      return {
        id: Date.now().toString(),
        text: data.message || `I've updated the proposal based on your request.`,
        isUser: false,
      };
    } catch (error) {
      console.error("Error processing proposal request:", error);
      return {
        id: Date.now().toString(),
        text: "Sorry, I couldn't process your request. Please try again.",
        isUser: false,
      };
    }
  };

  const processProposalSimulated = (message: string, sections: ProposalSection[]): ProposalSection[] => {
    const lowerMessage = message.toLowerCase();
    const updatedSections = JSON.parse(JSON.stringify(sections)) as ProposalSection[];
    
    if (lowerMessage.includes("add") && lowerMessage.includes("hours")) {
      const hourMatch = lowerMessage.match(/add\s+(\d+)\s+(?:more\s+)?hours\s+to\s+(.+?)(?:\s|$)/i);
      if (hourMatch) {
        const hoursToAdd = parseInt(hourMatch[1]);
        const targetTask = hourMatch[2].toLowerCase();
        
        updatedSections.forEach(section => {
          section.items.forEach(item => {
            if (item.item.toLowerCase().includes(targetTask)) {
              const currentHours = parseFloat(item.hours.toString());
              const newHours = currentHours + hoursToAdd;
              item.hours = newHours.toString();
              
              const price = parseFloat(item.price.toString().replace(/[^0-9.-]+/g, ''));
              const hourlyRate = price / currentHours;
              item.price = `$${Math.round(newHours * hourlyRate)}`;
            }
          });
        });
        
        recalculateSubtotals(updatedSections);
      }
    }
    
    if (lowerMessage.includes("remove")) {
      const removePattern = /remove\s+(.+?)(?:\s|$)/i;
      const removeMatch = lowerMessage.match(removePattern);
      
      if (removeMatch) {
        const itemToRemove = removeMatch[1].toLowerCase();
        
        updatedSections.forEach(section => {
          section.items = section.items.filter(item => 
            !item.item.toLowerCase().includes(itemToRemove)
          );
        });
        
        recalculateSubtotals(updatedSections);
      }
    }
    
    if (lowerMessage.includes("add") && (lowerMessage.includes("$") || lowerMessage.includes("dollars"))) {
      const addPattern = /add\s+(.+?)\s+at\s+(\$|\$?(\d+[\d,.]*)\s*dollars)/i;
      const addMatch = lowerMessage.match(addPattern);
      
      if (addMatch) {
        const newItem = addMatch[1];
        const priceText = addMatch[2];
        let price = 0;
        
        if (priceText.includes("$")) {
          price = parseFloat(priceText.replace(/[^0-9.-]+/g, ''));
        } else {
          const dollarsMatch = priceText.match(/(\d+[\d,.]*)\s*dollars/i);
          if (dollarsMatch) {
            price = parseFloat(dollarsMatch[1].replace(/[^0-9.-]+/g, ''));
          }
        }
        
        if (price > 0 && updatedSections.length > 0) {
          const section = updatedSections[0];
          
          let avgHourlyRate = 100;
          if (section.items.length > 0) {
            let totalPrice = 0;
            let totalHours = 0;
            section.items.forEach(item => {
              totalPrice += parseFloat(item.price.toString().replace(/[^0-9.-]+/g, ''));
              totalHours += parseFloat(item.hours.toString());
            });
            if (totalHours > 0) {
              avgHourlyRate = totalPrice / totalHours;
            }
          }
          
          const hours = Math.round((price / avgHourlyRate) * 10) / 10;
          
          section.items.push({
            item: newItem,
            description: `Added based on user request`,
            hours: hours.toString(),
            price: `$${price}`
          });
          
          recalculateSubtotals(updatedSections);
        }
      }
    }
    
    return updatedSections;
  };

  const recalculateSubtotals = (sections: ProposalSection[]): void => {
    sections.forEach(section => {
      let subtotal = 0;
      section.items.forEach(item => {
        const price = parseFloat(item.price.toString().replace(/[^0-9.-]+/g, ''));
        if (!isNaN(price)) {
          subtotal += price;
        }
      });
      section.subtotal = `$${Math.round(subtotal).toLocaleString()}`;
    });
  };

  const handleSendClick = async () => {
    if (!user) {
      setShowAuthDialog(true);
      return;
    }
    
    if (currentPlan !== 'pro') {
      setShowPlanDialog(true);
      return;
    }

    if (inputValue.trim()) {
      const userMessage: Message = {
        id: Date.now().toString(),
        text: inputValue,
        isUser: true,
      };
      
      setMessages((prev) => [...prev, userMessage]);
      setInputValue("");
      
      const aiResponse = await processProposalRequest(userMessage.text);
      setMessages((prev) => [...prev, aiResponse]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      handleSendClick();
    }
  };

  const handleGoToAuth = () => {
    navigate('/auth');
  };

  const handleGoToPlan = () => {
    navigate('/account-settings/plan');
  };

  if (planLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading subscription information...</p>
      </div>
    );
  }

  if (!user || (user && currentPlan !== 'pro')) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <div className="bg-amber-50 border border-amber-200 rounded-md p-6 max-w-md text-center">
          <h3 className="font-bold text-amber-800 text-lg mb-2">Pro Plan Required</h3>
          <p className="text-amber-700 mb-4">
            The AI Assistant feature is available exclusively to Pro plan subscribers.
          </p>
          <Button onClick={handleGoToPlan} className="bg-black text-white hover:bg-black/80">
            Upgrade to Pro
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3 overflow-y-auto max-h-full pb-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`${
              message.isUser
                ? "bg-[#E1E1DC] ml-auto"
                : "bg-[#F7F6F2] mr-auto"
            } p-[17px] rounded-[9px] max-w-[90%] text-black text-[11px] font-semibold tracking-[1.715px]`}
          >
            {message.text}
          </div>
        ))}
        
        {proposalSections.length === 0 && messages.length === 0 && (
          <div className="text-center p-4 text-gray-500">
            Please generate a proposal in the Setup tab first before refining it here.
          </div>
        )}
      </div>

      <div className="flex gap-3.5 p-[17px]">
        <div className="grow">
          <input
            type="text"
            placeholder="Refine your proposal..."
            className="w-full h-[39px] rounded border text-black text-[9px] font-semibold tracking-[1.389px] uppercase bg-[#F7F6F2] p-[11px] border-solid border-[#E1E1DC]"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />
        </div>
        <button
          className="w-[39px] h-[39px] rounded flex items-center justify-center bg-black text-white"
          onClick={handleSendClick}
          aria-label="Send message"
        >
          <SendIcon />
        </button>
      </div>

      {/* Authentication Dialog */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Authentication Required</DialogTitle>
            <DialogDescription>
              You need to sign in or create an account to use this feature.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col space-y-3 mt-4">
            <p className="text-sm text-gray-500">
              This feature requires authentication. Please sign in or create an account to continue.
            </p>
            <button
              onClick={handleGoToAuth}
              className="bg-black text-white px-4 py-2 rounded"
            >
              Sign In or Create Account
            </button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Plan Upgrade Dialog */}
      <Dialog open={showPlanDialog} onOpenChange={setShowPlanDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pro Plan Required</DialogTitle>
            <DialogDescription>
              This feature is available exclusively with our Pro plan.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col space-y-3 mt-4">
            <p className="text-sm text-gray-500">
              The AI Assistant requires a Pro plan subscription. Please upgrade to access this feature.
            </p>
            <button
              onClick={handleGoToPlan}
              className="bg-black text-white px-4 py-2 rounded"
            >
              View Plans & Pricing
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
