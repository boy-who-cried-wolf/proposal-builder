import React, { useState, useEffect } from "react";
import { NavTab } from "@/components/ui/NavItem";
import { SendIcon, UnfoldHorizontalIcon } from "@/components/icons";
import { ProposalForm } from "@/components/ui/ProposalForm";
import { ProposalSection } from "@/utils/openaiProposal";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

type Message = {
  id: string;
  text: string;
  isUser: boolean;
};

interface MiddleSectionProps {
  onProposalGenerated?: (sections: ProposalSection[], description: string, type: string, rate: number, freelancerRate: number) => void;
  proposalSections?: ProposalSection[];
  onUpdateProposal?: (sections: ProposalSection[]) => void;
}

export const MiddleSection: React.FC<MiddleSectionProps> = ({ 
  onProposalGenerated, 
  proposalSections = [],
  onUpdateProposal 
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const handleTabClick = (index: number) => {
    setActiveTab(index);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const processProposalRequest = async (userMessage: string) => {
    // Check authentication before processing
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

  const handleProposalGenerated = (sections: ProposalSection[], description: string, type: string, rate: number, freelancerRate: number) => {
    const proposalMessage: Message = {
      id: Date.now().toString(),
      text: `Generated proposal for ${type} project: ${description}`,
      isUser: false,
    };
    
    setMessages((prev) => [...prev, proposalMessage]);
    
    setActiveTab(1);
    
    if (onProposalGenerated) {
      onProposalGenerated(sections, description, type, rate, freelancerRate);
    }
  };

  const handleGoToAuth = () => {
    navigate('/auth');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <div className="flex flex-col gap-3 overflow-y-auto max-h-full pb-4">
            <div className="mt-4">
              <ProposalForm onProposalGenerated={handleProposalGenerated} />
            </div>
          </div>
        );
      case 1:
        return (
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
        );
      default:
        return null;
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <section className={`flex flex-col border-r-black border-r border-solid max-md:w-full max-md:h-auto ${isExpanded ? 'w-[345px]' : 'w-[200px]'} min-w-[200px] transition-all duration-300`}>
      <div className="text-[rgba(0,0,0,0.5)] text-[11px] font-semibold tracking-[1.715px] uppercase h-[69px] px-[19px] py-[25px] border-b-black border-b border-solid">
        Client Project Title &gt; Poposal...
      </div>

      <div className="flex gap-[34px] px-[23px] py-[15px]">
        <NavTab active={activeTab === 0} onClick={() => handleTabClick(0)}>
          Setup
        </NavTab>

        <NavTab active={activeTab === 1} onClick={() => handleTabClick(1)}>
          Assistant
        </NavTab>
      </div>

      <div className="grow p-[11px] overflow-y-auto">
        {renderTabContent()}
      </div>

      <div className="flex gap-3.5 p-[17px]">
        <div className="grow">
          <input
            type="text"
            placeholder={activeTab === 1 ? "Refine your proposal..." : "Refine your Proposal..."}
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
      
      <div 
        className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 bg-gray-200 p-2 rounded-full cursor-pointer hover:bg-gray-300 z-10"
        onClick={toggleExpand}
        aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
      >
        <UnfoldHorizontalIcon className="w-4 h-4" />
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
    </section>
  );
};
