
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface Project {
  id: string;
  title: string;
  client: string;
  date: string;
  value: number;
  hours: number;
  status: string;
}

interface ProjectCardProps {
  project: Project;
  viewMode?: "grid" | "list";
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ 
  project, 
  viewMode = "grid" 
}) => {
  // Format currency
  const formattedValue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(project.value);
  
  // Get badge color based on status
  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      default:
        return '';
    }
  };

  if (viewMode === "list") {
    return (
      <div className="border-b border-gray-200 py-4">
        <div className="grid grid-cols-6 gap-4 items-center text-sm">
          <div>
            <p className="uppercase text-xs text-gray-500">PROPOSAL AMOUNT</p>
            <p className="font-bold text-lg uppercase">{formattedValue}</p>
          </div>
          <div>
            <p className="uppercase text-xs text-gray-500">CLIENT NAME</p>
            <p className="font-bold text-lg uppercase">{project.client}</p>
          </div>
          <div>
            <p className="uppercase text-xs text-gray-500">HOURS</p>
            <p className="font-bold text-lg uppercase">{project.hours}</p>
          </div>
          <div>
            <p className="uppercase text-xs text-gray-500">DUE DATE</p>
            <p className="font-bold text-lg uppercase">{project.date}</p>
          </div>
          <div>
            <p className="uppercase text-xs text-gray-500">DAYS REMAINING</p>
            <p className="font-bold text-lg uppercase">--</p>
          </div>
          <div>
            <p className="uppercase text-xs text-gray-500">SERVICES</p>
            <p className="text-sm">WEB DESIGN, SERVICES</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-bold">{project.title}</CardTitle>
          <Badge className={getBadgeVariant(project.status)}>
            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{project.client}</p>
      </CardHeader>
      <CardContent>
        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div>
            <p className="text-muted-foreground">Value</p>
            <p className="font-semibold">{formattedValue}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Date</p>
            <p className="font-semibold">{project.date}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Hours</p>
            <p className="font-semibold">{project.hours}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Rate</p>
            <p className="font-semibold">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
              }).format(project.value / project.hours)}/hr
            </p>
          </div>
        </div>
        
        <div className="mt-4 flex justify-between gap-2">
          <Button variant="outline" size="sm" className="flex-1">
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
