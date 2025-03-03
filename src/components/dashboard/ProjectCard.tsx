
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
  
  // Format date and calculate days remaining
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: '2-digit', 
      day: '2-digit', 
      year: '2-digit' 
    });
  };

  const getDaysRemaining = (dateString: string) => {
    const dueDate = new Date(dateString);
    const today = new Date();
    
    // Reset time portion for accurate day calculation
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const getDueDateColor = (dateString: string) => {
    const daysRemaining = getDaysRemaining(dateString);
    
    if (daysRemaining < 0) return "text-red-600"; // Past due
    if (daysRemaining <= 7) return "text-orange-500"; // Approaching (within 7 days)
    return "text-green-600"; // Plenty of time
  };

  const getDaysRemainingColor = (dateString: string) => {
    const daysRemaining = getDaysRemaining(dateString);
    
    if (daysRemaining < 0) return "text-red-600"; // Past due
    if (daysRemaining <= 3) return "text-red-500"; // Very close
    if (daysRemaining <= 7) return "text-orange-500"; // Approaching
    return "text-green-600"; // Plenty of time
  };

  const dueDate = formatDate(project.date);
  const daysRemaining = getDaysRemaining(project.date);
  const dueDateColorClass = getDueDateColor(project.date);
  const daysRemainingColorClass = getDaysRemainingColor(project.date);

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

  // Get service tag color
  const getServiceTagColor = (service: string) => {
    switch (service.trim().toLowerCase()) {
      case 'web design':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
      case 'services':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'development':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'marketing':
        return 'bg-pink-100 text-pink-800 hover:bg-pink-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  if (viewMode === "list") {
    return (
      <div className="border-b border-gray-200 py-4">
        <div className="grid grid-cols-6 gap-4 items-center text-sm">
          <div>
            <p className="font-bold text-lg uppercase font-poppins">{formattedValue}</p>
            <p className="uppercase text-xs text-gray-500">PROPOSAL AMOUNT</p>
          </div>
          <div>
            <p className="font-bold text-lg uppercase font-poppins">{project.client}</p>
            <p className="uppercase text-xs text-gray-500">CLIENT NAME</p>
          </div>
          <div>
            <p className="font-bold text-lg uppercase font-poppins">{project.hours}</p>
            <p className="uppercase text-xs text-gray-500">HOURS</p>
          </div>
          <div>
            <p className={cn("font-bold text-lg uppercase font-poppins", dueDateColorClass)}>{dueDate}</p>
            <p className="uppercase text-xs text-gray-500">DUE DATE</p>
          </div>
          <div>
            <p className={cn("font-bold text-lg uppercase font-poppins", daysRemainingColorClass)}>
              {daysRemaining < 0 ? `${Math.abs(daysRemaining)} days` : `${daysRemaining} days`}
            </p>
            <p className="uppercase text-xs text-gray-500">DAYS REMAINING</p>
          </div>
          <div>
            <div className="flex flex-wrap gap-1">
              {["WEB DESIGN"].map((service, index) => (
                <Badge 
                  key={index} 
                  className={cn("font-poppins text-xs", getServiceTagColor(service))}
                >
                  {service}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-bold font-poppins">{project.title}</CardTitle>
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
