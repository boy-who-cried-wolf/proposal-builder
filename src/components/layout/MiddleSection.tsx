
import React, { useState } from "react";
import { NavTab } from "@/components/ui/NavItem";
import { SendIcon } from "@/components/icons";
import { ProposalForm } from "@/components/ui/ProposalForm";
import { ProposalSection } from "@/utils/openaiProposal";

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
  const [activeTab, setActiveTab] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  const handleTabClick = (index: number) => {
    setActiveTab(index);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const processProposalRequest = async (userMessage: string) => {
    if (!proposalSections || proposalSections.length === 0) {
      return {
        id: Date.now().toString(),
        text: "Please generate a proposal first before trying to refine it.",
        isUser: false,
      };
    }

    try {
      // Here we'd call the edge function to process the request
      // For now, we'll simulate a response
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
        // If the API doesn't exist yet, simulate a response
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

  // Temporary function to simulate AI changes to the proposal
  const processProposalSimulated = (message: string, sections: ProposalSection[]): ProposalSection[] => {
    const lowerMessage = message.toLowerCase();
    const updatedSections = JSON.parse(JSON.stringify(sections)) as ProposalSection[];
    
    // Process common operations based on keywords
    
    // Example: Add hours to a specific task
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
              
              // Update price based on hours
              const price = parseFloat(item.price.toString().replace(/[^0-9.-]+/g, ''));
              const hourlyRate = price / currentHours;
              item.price = `$${Math.round(newHours * hourlyRate)}`;
            }
          });
        });
        
        // Recalculate subtotals
        recalculateSubtotals(updatedSections);
      }
    }
    
    // Example: Remove an item
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
        
        // Recalculate subtotals
        recalculateSubtotals(updatedSections);
      }
    }
    
    // Example: Add a new item with price
    if (lowerMessage.includes("add") && (lowerMessage.includes("$") || lowerMessage.includes("dollars"))) {
      const addPattern = /add\s+(.+?)\s+at\s+(\$|\$?(\d+[\d,.]*)\s*dollars)/i;
      const addMatch = lowerMessage.match(addPattern);
      
      if (addMatch) {
        const newItem = addMatch[1];
        const priceText = addMatch[2];
        let price = 0;
        
        // Extract the price
        if (priceText.includes("$")) {
          price = parseFloat(priceText.replace(/[^0-9.-]+/g, ''));
        } else {
          const dollarsMatch = priceText.match(/(\d+[\d,.]*)\s*dollars/i);
          if (dollarsMatch) {
            price = parseFloat(dollarsMatch[1].replace(/[^0-9.-]+/g, ''));
          }
        }
        
        if (price > 0 && updatedSections.length > 0) {
          // Add to the first section by default
          const section = updatedSections[0];
          
          // Calculate hours based on average hourly rate in section
          let avgHourlyRate = 100; // Default fallback
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
          
          // Recalculate subtotals
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
    if (inputValue.trim()) {
      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        text: inputValue,
        isUser: true,
      };
      
      setMessages((prev) => [...prev, userMessage]);
      setInputValue("");
      
      // Process the request and get AI response
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
    // Add message about proposal being generated
    const proposalMessage: Message = {
      id: Date.now().toString(),
      text: `Generated proposal for ${type} project: ${description}`,
      isUser: false,
    };
    
    setMessages((prev) => [...prev, proposalMessage]);
    
    // Pass data to parent component
    if (onProposalGenerated) {
      onProposalGenerated(sections, description, type, rate, freelancerRate);
    }
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

  return (
    <section className="w-[345px] flex flex-col border-r-black border-r border-solid max-md:w-full max-md:h-auto">
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
    </section>
  );
};
