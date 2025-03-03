
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Eye, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { Project } from "./types/projectTypes";
import {
  formatCurrency,
  formatDate,
  getDaysRemaining,
  getDueDateColor,
  getDaysRemainingColor,
  getBadgeVariant,
  getServiceTagColor
} from "./utils/projectCardUtils";

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

  return (
    <Card 
      className="overflow-hidden hover:shadow-md transition-shadow"
      draggable={true}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <GripVertical size={16} className="mr-2 cursor-grab text-gray-400" />
            <CardTitle className="text-lg font-bold font-poppins">{project.title}</CardTitle>
          </div>
          <Badge className={getBadgeVariant(project.status)}>
            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{project.client}</p>
      </CardHeader>
      <CardContent>
        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div>
            <p className="font-semibold font-poppins">{formattedValue}</p>
            <p className="text-muted-foreground">Value</p>
          </div>
          <div>
            <p className={cn("font-semibold font-poppins", dueDateColorClass)}>{dueDate}</p>
            <p className="text-muted-foreground">Due Date</p>
          </div>
          <div>
            <p className="font-semibold font-poppins">{project.hours}</p>
            <p className="text-muted-foreground">Hours</p>
          </div>
          <div>
            <p className={cn("font-semibold font-poppins", daysRemainingColorClass)}>
              {daysRemaining < 0 ? `${Math.abs(daysRemaining)} days` : `${daysRemaining} days`}
            </p>
            <p className="text-muted-foreground">Remaining</p>
          </div>
        </div>
        
        <div className="mt-4 flex flex-wrap gap-1">
          {["WEB DESIGN"].map((service, index) => (
            <Badge 
              key={index} 
              className={cn("font-poppins text-xs", getServiceTagColor(service))}
            >
              {service}
            </Badge>
          ))}
        </div>
        
        <div className="mt-4 flex justify-between gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={onView}>
            <Eye size={16} className="mr-2" />
            View
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Edit size={16} className="mr-2" />
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
