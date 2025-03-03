
import React, { useState } from "react";
import { NavTab } from "@/components/ui/NavItem";
import { SendIcon } from "@/components/icons";
import { ProposalForm } from "@/components/ui/ProposalForm";

type Message = {
  id: string;
  text: string;
  isUser: boolean;
};

export const MiddleSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: "Welcome! Type a prompt to get started with your proposal.",
      isUser: false,
    },
  ]);

  const handleTabClick = (index: number) => {
    setActiveTab(index);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSendClick = () => {
    if (inputValue.trim()) {
      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        text: inputValue,
        isUser: true,
      };
      
      setMessages((prev) => [...prev, userMessage]);
      
      // Simulate AI response
      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: `Processed your request: "${inputValue}"`,
          isUser: false,
        };
        setMessages((prev) => [...prev, aiResponse]);
      }, 1000);
      
      setInputValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      handleSendClick();
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <div className="flex flex-col gap-3 overflow-y-auto max-h-full">
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
          </div>
        );
      case 1:
        return <ProposalForm />;
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
          Project Settings
        </NavTab>
      </div>

      <div className="grow p-[11px] overflow-y-auto">
        {renderTabContent()}
      </div>

      <div className="flex gap-3.5 p-[17px]">
        <div className="grow">
          <input
            type="text"
            placeholder="Refine your Proposal..."
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
