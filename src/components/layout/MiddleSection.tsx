
import React, { useState } from "react";
import { NavTab } from "@/components/ui/NavItem";
import { SendIcon } from "@/components/icons";
import { ProposalForm } from "@/components/ui/ProposalForm";

export const MiddleSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [inputValue, setInputValue] = useState("");

  const handleTabClick = (index: number) => {
    setActiveTab(index);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSendClick = () => {
    if (inputValue.trim()) {
      console.log("Sending:", inputValue);
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
          <div className="text-black text-[11px] font-semibold tracking-[1.715px] uppercase bg-[#E1E1DC] p-[17px] rounded-[9px]">
            Lorem ipsum odor amet, consectetuer adipiscing elit. Mus elementum
            diam aliquet justo montes vestibulum. Sagittis tortor ad mauris;
            accumsan maximus felis. Inceptos posuere fusce fames hendrerit purus a
            nullam. Duis gravida urna mattis taciti porta. Consectetur tellus
            nunc, donec id ligula netus ridiculus. Enim lectus fames dolor donec
            risus auctor. Diam primis diam himenaeos dis fermentum? Nec placerat
            eget montes scelerisque porttitor egestas habitant libero Curae.
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
