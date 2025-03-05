
import React, { useState, useRef } from "react";
import { ProposalSection } from "@/services/openaiProposal";
import { Pencil, Settings, Plus, GripVertical } from "lucide-react";

interface ProposalTableProps {
  sections: ProposalSection[];
  onEditItem: (sectionIndex: number, itemIndex: number) => void;
  onOpenSectionSettings: (sectionIndex: number) => void;
  onAddItem?: (sectionIndex: number) => void;
  onReorderSections?: (startIndex: number, endIndex: number) => void;
  onReorderItems?: (sectionIndex: number, startIndex: number, endIndex: number) => void;
}

export const ProposalTable: React.FC<ProposalTableProps> = ({ 
  sections, 
  onEditItem,
  onOpenSectionSettings,
  onAddItem,
  onReorderSections,
  onReorderItems
}) => {
  const [draggingSection, setDraggingSection] = useState<number | null>(null);
  const [draggingItem, setDraggingItem] = useState<{sectionIndex: number, itemIndex: number} | null>(null);
  const dragStartPosRef = useRef<{ x: number, y: number }>({ x: 0, y: 0 });
  const dragThresholdPx = 5; // Minimum distance to start dragging
  const isDraggingRef = useRef(false);

  const handleSectionMouseDown = (e: React.MouseEvent, sectionIndex: number) => {
    e.preventDefault();
    dragStartPosRef.current = { x: e.clientX, y: e.clientY };
    
    const onMouseMove = (moveEvent: MouseEvent) => {
      const dx = Math.abs(moveEvent.clientX - dragStartPosRef.current.x);
      const dy = Math.abs(moveEvent.clientY - dragStartPosRef.current.y);
      
      // Check if we've moved beyond the threshold
      if (!isDraggingRef.current && (dx > dragThresholdPx || dy > dragThresholdPx)) {
        isDraggingRef.current = true;
        setDraggingSection(sectionIndex);
      }
    };
    
    const onMouseUp = (upEvent: MouseEvent) => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      
      if (isDraggingRef.current && draggingSection !== null && onReorderSections) {
        const targetElement = document.elementFromPoint(upEvent.clientX, upEvent.clientY);
        if (targetElement) {
          const targetSection = targetElement.closest('[data-section-index]');
          if (targetSection) {
            const targetIndex = parseInt(targetSection.getAttribute('data-section-index') || '0', 10);
            if (targetIndex !== sectionIndex) {
              onReorderSections(sectionIndex, targetIndex);
            }
          }
        }
      }
      
      setDraggingSection(null);
      isDraggingRef.current = false;
    };
    
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleItemMouseDown = (e: React.MouseEvent, sectionIndex: number, itemIndex: number) => {
    e.preventDefault();
    dragStartPosRef.current = { x: e.clientX, y: e.clientY };
    
    const onMouseMove = (moveEvent: MouseEvent) => {
      const dx = Math.abs(moveEvent.clientX - dragStartPosRef.current.x);
      const dy = Math.abs(moveEvent.clientY - dragStartPosRef.current.y);
      
      // Check if we've moved beyond the threshold
      if (!isDraggingRef.current && (dx > dragThresholdPx || dy > dragThresholdPx)) {
        isDraggingRef.current = true;
        setDraggingItem({ sectionIndex, itemIndex });
      }
    };
    
    const onMouseUp = (upEvent: MouseEvent) => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      
      if (isDraggingRef.current && draggingItem !== null && onReorderItems) {
        const targetElement = document.elementFromPoint(upEvent.clientX, upEvent.clientY);
        if (targetElement) {
          const targetItem = targetElement.closest('[data-item-index]');
          if (targetItem && targetItem.closest(`[data-section-index="${sectionIndex}"]`)) {
            const targetItemIndex = parseInt(targetItem.getAttribute('data-item-index') || '0', 10);
            if (targetItemIndex !== itemIndex) {
              onReorderItems(sectionIndex, itemIndex, targetItemIndex);
            }
          }
        }
      }
      
      setDraggingItem(null);
      isDraggingRef.current = false;
    };
    
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div className="space-y-6">
      {sections.map((section, index) => (
        <div 
          key={index} 
          className={`section_wrapper mb-[34px] transition-all duration-200 ${draggingSection === index ? 'opacity-50 scale-[1.01]' : ''}`}
          data-section-index={index}
        >
          <div className="text-black text-lg font-bold bg-[#E1E1DC] px-[17px] py-[11px] rounded-[4px_4px_0_0] flex justify-between items-center">
            <div className="flex items-center">
              <div 
                className="mr-3 cursor-move p-1 hover:bg-gray-300 rounded transition-all"
                onMouseDown={(e) => handleSectionMouseDown(e, index)}
              >
                <GripVertical size={16} className="text-gray-500" />
              </div>
              <span>{section.title}</span>
            </div>
            <button
              onClick={() => onOpenSectionSettings(index)}
              className="p-1 rounded bg-gray-200 hover:bg-gray-300"
              aria-label="Section settings"
            >
              <Settings size={16} />
            </button>
          </div>
          
          <div className="section_table_header grid grid-cols-[2fr_4fr_1fr_1fr_0.5fr_0.5fr] text-black text-[9px] font-semibold tracking-[1px] uppercase px-[29px] py-[11px] border-b-black border-b border-solid max-sm:grid-cols-[1fr] max-sm:gap-2.5 max-sm:p-[15px]">
            <div className="section_table_cell text-black text-[9px] font-semibold tracking-[1px] uppercase">
              Item
            </div>
            <div className="section_table_cell text-black text-[9px] font-semibold tracking-[1px] uppercase px-4">
              Description
            </div>
            <div className="section_table_cell text-black text-[9px] font-semibold tracking-[1px] uppercase">
              Hours
            </div>
            <div className="section_table_cell text-black text-[9px] font-semibold tracking-[1px] uppercase">
              Price
            </div>
            <div className="section_table_cell text-black text-[9px] font-semibold tracking-[1px] uppercase">
              Sort
            </div>
            <div className="section_table_cell text-black text-[9px] font-semibold tracking-[1px] uppercase">
              Edit
            </div>
          </div>

          {section.items.map((item, itemIndex) => (
            <div
              key={itemIndex}
              className={`section_table_row grid grid-cols-[2fr_4fr_1fr_1fr_0.5fr_0.5fr] px-[29px] py-[11px] border-b-black border-b border-solid max-sm:grid-cols-[1fr] max-sm:gap-2.5 max-sm:p-[15px] transition-all duration-200 ${
                draggingItem?.sectionIndex === index && draggingItem?.itemIndex === itemIndex ? 'opacity-50 bg-gray-100 scale-[1.005]' : ''
              }`}
              data-item-index={itemIndex}
            >
              <div className="section_table_cell text-black text-[9px] font-semibold tracking-[1px] uppercase">
                {item.item}
              </div>
              <div className="section_table_cell text-black text-[9px] font-semibold tracking-[1px] uppercase px-4 truncate overflow-hidden text-ellipsis whitespace-nowrap">
                {item.description}
              </div>
              <div className="section_table_cell text-black text-[9px] font-semibold tracking-[1px] uppercase">
                {item.hours}
              </div>
              <div className="section_table_cell text-black text-[9px] font-semibold tracking-[1px] uppercase">
                {item.price}
              </div>
              <div className="section_table_cell text-black text-[9px] font-semibold tracking-[1px] uppercase">
                <div 
                  className="cursor-move p-1 hover:bg-gray-200 rounded transition-colors"
                  onMouseDown={(e) => handleItemMouseDown(e, index, itemIndex)}
                >
                  <GripVertical size={14} className="text-gray-500" />
                </div>
              </div>
              <div className="section_table_cell text-black text-[9px] font-semibold tracking-[1px] uppercase">
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

          <div className="section_table_footer grid grid-cols-[2fr_4fr_1fr_1fr_0.5fr_0.5fr] px-[29px] py-[11px] border-b-black border-b border-solid max-sm:grid-cols-[1fr] max-sm:gap-2.5 max-sm:p-[15px]">
            <div className="section_table_cell text-black text-[9px] font-semibold tracking-[1px] uppercase">
              Subtotal
            </div>
            <div className="section_table_cell text-black text-[9px] font-semibold tracking-[1px] uppercase">
              {section.subtotal}
            </div>
            <div className="section_table_cell"></div>
            <div className="section_table_cell"></div>
            <div className="section_table_cell"></div>
            <div className="section_table_cell">
              {onAddItem && (
                <button 
                  onClick={() => onAddItem(index)} 
                  className="p-1 rounded bg-gray-100 hover:bg-gray-200"
                  aria-label="Add item"
                >
                  <Plus size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
