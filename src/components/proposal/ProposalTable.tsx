import { ProposalSection } from "@/types/proposal";
import { Pencil, Plus, Settings } from "lucide-react";
import React from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";

interface ProposalTableProps {
  sections: ProposalSection[];
  onEditItem: (sectionIndex: number, itemIndex: number) => void;
  onOpenSectionSettings: (sectionIndex: number) => void;
  onAddItem?: (sectionIndex: number) => void;
  onReorderItems?: (sectionIndex: number, startIndex: number, endIndex: number) => void;
  onReorderSections?: (startIndex: number, endIndex: number) => void;
}

export const ProposalTable: React.FC<ProposalTableProps> = ({ 
  sections, 
  onEditItem,
  onOpenSectionSettings,
  onAddItem,
  onReorderItems,
  onReorderSections
}) => {
  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) {
      return;
    }

    if (onReorderItems) {
      const sectionIndex = parseInt(source.droppableId, 10);
      onReorderItems(sectionIndex, source.index, destination.index);
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="space-y-6">
        {sections.map((section, sectionIndex) => (
          <div 
            key={sectionIndex} 
            className="section_wrapper mb-[34px]"
          >
            <div className="text-black text-lg font-bold bg-[#E1E1DC] px-[17px] py-[11px] rounded-[4px_4px_0_0] flex justify-between items-center">
              <div className="flex items-center">
                <span>{section.title}</span>
              </div>
              <button
                onClick={() => onOpenSectionSettings(sectionIndex)}
                className="p-1 rounded bg-gray-200 hover:bg-gray-300"
                aria-label="Section settings"
              >
                <Settings size={16} />
              </button>
            </div>
            
            <div className="section_table_header grid grid-cols-[2fr_4fr_1fr_1fr_0.5fr_0.5fr] text-black text-[9px] font-semibold tracking-[1px] uppercase px-[29px] py-[11px] border-b-black border-b border-solid max-sm:grid-cols-[1fr] max-sm:gap-2.5 max-sm:p-[15px]">
              <div className="section_table_cell">Item</div>
              <div className="section_table_cell px-4">Description</div>
              <div className="section_table_cell">Hours</div>
              <div className="section_table_cell">Price</div>
              <div className="section_table_cell">Sort</div>
              <div className="section_table_cell">Edit</div>
            </div>

            <Droppable droppableId={sectionIndex.toString()}>
              {(provided) => (
                <div 
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {section.items.map((item, itemIndex) => (
                    <Draggable 
                      key={itemIndex} 
                      draggableId={`item-${sectionIndex}-${itemIndex}`} 
                      index={itemIndex}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`section_table_row grid grid-cols-[2fr_4fr_1fr_1fr_0.5fr_0.5fr] px-[29px] py-[11px] border-b-black border-b border-solid max-sm:grid-cols-[1fr] max-sm:gap-2.5 max-sm:p-[15px] ${
                            snapshot.isDragging ? "bg-gray-100" : "bg-white"
                          }`}
                        >
                          <div className="section_table_cell">{item.item}</div>
                          <div className="section_table_cell px-4 truncate overflow-hidden text-ellipsis whitespace-nowrap">
                            {item.description}
                          </div>
                          <div className="section_table_cell">{item.hours}</div>
                          <div className="section_table_cell">{item.price}</div>
                          <div className="section_table_cell">
                            <div className="cursor-move">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="3" y1="12" x2="21" y2="12"></line>
                                <line x1="3" y1="6" x2="21" y2="6"></line>
                                <line x1="3" y1="18" x2="21" y2="18"></line>
                              </svg>
                            </div>
                          </div>
                          <div className="section_table_cell">
                            <button 
                              onClick={() => onEditItem(sectionIndex, itemIndex)} 
                              className="p-1 rounded bg-gray-100 hover:bg-gray-200"
                              aria-label="Edit item"
                            >
                              <Pencil size={14} />
                            </button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>

            <div className="section_table_footer grid grid-cols-[2fr_4fr_1fr_1fr_0.5fr_0.5fr] px-[29px] py-[11px] border-b-black border-b border-solid max-sm:grid-cols-[1fr] max-sm:gap-2.5 max-sm:p-[15px]">
              <div className="section_table_cell">Subtotal</div>
              <div className="section_table_cell">{section.subtotal}</div>
              <div className="section_table_cell"></div>
              <div className="section_table_cell"></div>
              <div className="section_table_cell"></div>
              <div className="section_table_cell">
                {onAddItem && (
                  <button 
                    onClick={() => onAddItem(sectionIndex)} 
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
    </DragDropContext>
  );
};
