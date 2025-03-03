
import React from "react";
import { GripVertical, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Project } from "./types/projectTypes";
import {
  formatCurrency,
  formatDate,
  getDaysRemaining,
  getDueDateColor,
  getDaysRemainingColor
} from "./utils/projectCardUtils";

interface ProjectCardListProps {
  project: Project;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  onView?: () => void;
}

export const ProjectCardList: React.FC<ProjectCardListProps> = ({
  project,
  onDragStart,
  onDragOver,
  onDrop,
  onView
}) => {
  const formattedValue = formatCurrency(project.value);
  const dueDate = formatDate(project.date);
  const daysRemaining = getDaysRemaining(project.date);
  const dueDateColorClass = getDueDateColor(project.date);
  const daysRemainingColorClass = getDaysRemainingColor(project.date);

  return (
    <div 
      className="section_wrapper mb-[34px]"
      draggable={true}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div className="section_table_row grid grid-cols-7 gap-4 items-center text-sm px-[29px] py-[11px] border-b-black border-b border-solid max-sm:grid-cols-[1fr] max-sm:gap-2.5 max-sm:p-[15px] hover:bg-gray-50 transition-colors">
        <div className="flex items-center">
          <GripVertical size={16} className="cursor-grab text-gray-400" />
        </div>
        <div className="section_table_cell">
          <p className="text-black text-[9px] font-semibold tracking-[1.389px] uppercase">{formattedValue}</p>
          <p className="text-black text-[9px] font-semibold tracking-[1.389px] uppercase text-gray-500">PROPOSAL AMOUNT</p>
        </div>
        <div className="section_table_cell">
          <p className="text-black text-[9px] font-semibold tracking-[1.389px] uppercase">{project.client}</p>
          <p className="text-black text-[9px] font-semibold tracking-[1.389px] uppercase text-gray-500">CLIENT NAME</p>
        </div>
        <div className="section_table_cell">
          <p className="text-black text-[9px] font-semibold tracking-[1.389px] uppercase">{project.hours}</p>
          <p className="text-black text-[9px] font-semibold tracking-[1.389px] uppercase text-gray-500">HOURS</p>
        </div>
        <div className="section_table_cell">
          <p className={cn("text-black text-[9px] font-semibold tracking-[1.389px] uppercase", dueDateColorClass)}>{dueDate}</p>
          <p className="text-black text-[9px] font-semibold tracking-[1.389px] uppercase text-gray-500">DUE DATE</p>
        </div>
        <div className="section_table_cell">
          <p className={cn("text-black text-[9px] font-semibold tracking-[1.389px] uppercase", daysRemainingColorClass)}>
            {Math.abs(daysRemaining)}
          </p>
          <p className="text-black text-[9px] font-semibold tracking-[1.389px] uppercase text-gray-500">DAYS REMAINING</p>
        </div>
        <div className="section_table_cell flex gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 px-2"
            onClick={onView}
          >
            <Eye size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
};
