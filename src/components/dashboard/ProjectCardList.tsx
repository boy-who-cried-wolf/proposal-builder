import React from "react";
import { GripVertical, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Project } from "./types/projectTypes";
import { formatCurrency, formatDate, getDaysRemaining, getDueDateColor, getDaysRemainingColor, getBadgeVariant } from "./utils/projectCardUtils";
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
  return <Card className="mb-[15px] overflow-hidden hover:bg-gray-50 transition-colors" draggable={true} onDragStart={onDragStart} onDragOver={onDragOver} onDrop={onDrop}>
      <CardContent className="p-0">
        <div className="grid grid-cols-7 gap-4 items-center text-sm border-b border-solid border-gray-100 max-sm:grid-cols-[1fr] max-sm:gap-2.5 max-sm:p-[15px] py-[10px] px-[10px] rounded-sm">
          <div className="flex items-center">
            
            <div className="ml-2">
              <p className="text-lg font-bold font-poppins">{project.title}</p>
              <p className="text-sm text-muted-foreground">{project.client}</p>
            </div>
          </div>
          <div className="flex justify-start">
            <Badge className={getBadgeVariant(project.status)}>
              {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
            </Badge>
          </div>
          <div className="section_table_cell">
            <p className="text-black text-xs font-semibold tracking-[1.389px] uppercase">{formattedValue}</p>
            <p className="text-black text-[9px] font-semibold tracking-[1.389px] uppercase text-gray-500">PROPOSAL AMOUNT</p>
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
          <div className="flex justify-end">
            <Button variant="ghost" size="sm" className="h-7 px-2" onClick={onView}>
              <Eye size={14} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>;
};