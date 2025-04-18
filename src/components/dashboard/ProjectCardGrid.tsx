
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Eye, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { Project } from "./types/projectTypes";
import { formatCurrency, formatDate, getDaysRemaining, getDueDateColor, getDaysRemainingColor, getBadgeVariant, getServiceTagColor } from "./utils/projectCardUtils";
interface ProjectCardGridProps {
  project: Project;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  onView?: () => void;
}
export const ProjectCardGrid: React.FC<ProjectCardGridProps> = ({
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
  return <Card className="overflow-hidden transition-all hover:bg-gray-50" draggable={true} onDragStart={onDragStart} onDragOver={onDragOver} onDrop={onDrop}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            
            <CardTitle className="text-lg font-bold font-poppins">{project.title}</CardTitle>
          </div>
          <Badge className={getBadgeVariant(project.status)}>
            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground ml-6 mx-px">{project.client}</p>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <p className="text-black text-[9px] font-semibold tracking-[1px] uppercase">{formattedValue}</p>
            <p className="text-black text-[9px] font-semibold tracking-[1px] uppercase text-gray-500">PROPOSAL AMOUNT</p>
          </div>
          <div className="flex flex-col">
            <p className={cn("text-black text-[9px] font-semibold tracking-[1px] uppercase", dueDateColorClass)}>{dueDate}</p>
            <p className="text-black text-[9px] font-semibold tracking-[1px] uppercase text-gray-500">DUE DATE</p>
          </div>
          <div className="flex flex-col">
            <p className="text-black text-[9px] font-semibold tracking-[1px] uppercase">{project.hours}</p>
            <p className="text-black text-[9px] font-semibold tracking-[1px] uppercase text-gray-500">HOURS</p>
          </div>
          <div className="flex flex-col">
            <p className={cn("text-black text-[9px] font-semibold tracking-[1px] uppercase", daysRemainingColorClass)}>
              {Math.abs(daysRemaining)}
            </p>
            <p className="text-black text-[9px] font-semibold tracking-[1px] uppercase text-gray-500">DAYS REMAINING</p>
          </div>
        </div>
        
        <div className="mt-4 flex flex-wrap gap-1">
          {["WEB DESIGN"].map((service, index) => <Badge key={index} className={cn("font-poppins text-xs", getServiceTagColor(service))}>
              {service}
            </Badge>)}
        </div>
        
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" size="sm" className="h-7 px-2" onClick={onView}>
            <Eye size={14} />
          </Button>
          <Button variant="ghost" size="sm" className="h-7 px-2">
            <Edit size={14} />
          </Button>
        </div>
      </CardContent>
    </Card>;
};
