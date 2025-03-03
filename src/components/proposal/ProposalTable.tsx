
import React from "react";
import { ProposalSection } from "@/utils/openaiProposal";
import { Pencil, Settings } from "lucide-react";

interface ProposalTableProps {
  sections: ProposalSection[];
  onEditItem: (sectionIndex: number, itemIndex: number) => void;
  onOpenSectionSettings: (sectionIndex: number) => void;
}

export const ProposalTable: React.FC<ProposalTableProps> = ({ 
  sections, 
  onEditItem,
  onOpenSectionSettings 
}) => {
  return (
    <div className="space-y-6">
      {sections.map((section, index) => (
        <div key={index} className="section_wrapper mb-[34px]">
          <div className="text-black text-lg font-bold bg-[#E1E1DC] px-[17px] py-[11px] rounded-[4px_4px_0_0] flex justify-between items-center">
            <span>{section.title}</span>
            <button
              onClick={() => onOpenSectionSettings(index)}
              className="p-1 rounded bg-gray-200 hover:bg-gray-300"
              aria-label="Section settings"
            >
              <Settings size={16} />
            </button>
          </div>
          
          <div className="section_table_header grid grid-cols-[2fr_4fr_1fr_1fr_0.5fr] text-black text-[9px] font-semibold tracking-[1.389px] uppercase px-[29px] py-[11px] border-b-black border-b border-solid max-sm:grid-cols-[1fr] max-sm:gap-2.5 max-sm:p-[15px]">
            <div className="section_table_cell text-black text-[9px] font-semibold tracking-[1.389px] uppercase">
              Item
            </div>
            <div className="section_table_cell text-black text-[9px] font-semibold tracking-[1.389px] uppercase">
              Description
            </div>
            <div className="section_table_cell text-black text-[9px] font-semibold tracking-[1.389px] uppercase">
              Hours
            </div>
            <div className="section_table_cell text-black text-[9px] font-semibold tracking-[1.389px] uppercase">
              Price
            </div>
            <div className="section_table_cell text-black text-[9px] font-semibold tracking-[1.389px] uppercase">
              Edit
            </div>
          </div>

          {section.items.map((item, itemIndex) => (
            <div
              key={itemIndex}
              className="section_table_row grid grid-cols-[2fr_4fr_1fr_1fr_0.5fr] px-[29px] py-[11px] border-b-black border-b border-solid max-sm:grid-cols-[1fr] max-sm:gap-2.5 max-sm:p-[15px]"
            >
              <div className="section_table_cell text-black text-[9px] font-semibold tracking-[1.389px] uppercase">
                {item.item}
              </div>
              <div className="section_table_cell text-black text-[9px] font-semibold tracking-[1.389px] uppercase">
                {item.description}
              </div>
              <div className="section_table_cell text-black text-[9px] font-semibold tracking-[1.389px] uppercase">
                {item.hours}
              </div>
              <div className="section_table_cell text-black text-[9px] font-semibold tracking-[1.389px] uppercase">
                {item.price}
              </div>
              <div className="section_table_cell text-black text-[9px] font-semibold tracking-[1.389px] uppercase">
                <button 
                  onClick={() => onEditItem(index, itemIndex)} 
                  className="p-1 rounded bg-gray-100 hover:bg-gray-200"
                  aria-label="Edit item"
                >
                  <Pencil size={14} />
                </button>
              </div>
            </div>
          ))}

          <div className="section_table_footer grid grid-cols-[2fr_4fr_1fr_1fr_0.5fr] px-[29px] py-[11px] border-b-black border-b border-solid max-sm:grid-cols-[1fr] max-sm:gap-2.5 max-sm:p-[15px]">
            <div className="section_table_cell text-black text-[9px] font-semibold tracking-[1.389px] uppercase">
              Subtotal
            </div>
            <div className="section_table_cell text-black text-[9px] font-semibold tracking-[1.389px] uppercase">
              {section.subtotal}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
