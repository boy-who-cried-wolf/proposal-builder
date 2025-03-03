import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, Clock, Grid, List, ArrowDown, ArrowUp, GripVertical, Eye } from "lucide-react";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { DashboardFooter } from "@/components/dashboard/DashboardFooter";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Edit } from "lucide-react";

const sampleProjects = [
  {
    id: "1",
    title: "Website Redesign",
    client: "Acme Corp",
    date: "June 15, 2023",
    value: 12500,
    hours: 125,
    status: "active"
  },
  {
    id: "2",
    title: "Mobile App Development",
    client: "TechStart Inc",
    date: "July 3, 2023",
    value: 24000,
    hours: 240,
    status: "active"
  },
  {
    id: "3",
    title: "E-commerce Platform",
    client: "RetailGiant",
    date: "May 22, 2023",
    value: 18000,
    hours: 180,
    status: "completed"
  },
  {
    id: "4",
    title: "Brand Identity",
    client: "NewVenture LLC",
    date: "August 10, 2023",
    value: 8500,
    hours: 85,
    status: "draft"
  },
  {
    id: "5",
    title: "Marketing Campaign",
    client: "GrowFast Co",
    date: "September 5, 2023",
    value: 15000,
    hours: 150,
    status: "pending"
  }
];

const Dashboard = () => {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [sortField, setSortField] = useState<"value" | "date" | "hours">("value");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [projects, setProjects] = useState(sampleProjects);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  
  const filteredProjects = statusFilter === "all" 
    ? projects 
    : projects.filter(project => project.status === statusFilter);
  
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (sortField === "date") {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
    } else {
      return sortDirection === "asc" 
        ? a[sortField] - b[sortField] 
        : b[sortField] - a[sortField];
    }
  });
  
  const totalValue = filteredProjects.reduce((sum, project) => sum + project.value, 0);
  const totalHours = filteredProjects.reduce((sum, project) => sum + project.hours, 0);
  const avgHourlyRate = totalHours > 0 ? totalValue / totalHours : 0;
  
  const handleSortToggle = (field: "value" | "date" | "hours") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };
  
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData("text/plain");
    
    if (draggedId === targetId) return;
    
    const draggedIndex = projects.findIndex(p => p.id === draggedId);
    const targetIndex = projects.findIndex(p => p.id === targetId);
    
    const newProjects = [...projects];
    const [draggedProject] = newProjects.splice(draggedIndex, 1);
    newProjects.splice(targetIndex, 0, draggedProject);
    
    setProjects(newProjects);
  };
  
  const handleViewProject = (project: any) => {
    setSelectedProject(project);
    setIsViewDialogOpen(true);
  };
  
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-col flex-grow">
        <div className="grow p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Welcome back, {user?.email || 'User'}
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className={viewMode === "grid" ? "bg-muted" : ""}
                onClick={() => setViewMode("grid")}
              >
                <Grid size={16} className="mr-2" />
                Grid
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className={viewMode === "list" ? "bg-muted" : ""}
                onClick={() => setViewMode("list")}
              >
                <List size={16} className="mr-2" />
                List
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="all" className="mb-6" onValueChange={setStatusFilter}>
            <TabsList className="rounded-none border-b border-solid border-[#F6F6F7] bg-transparent text-[#8E9196] w-full justify-start gap-[34px] p-0">
              <TabsTrigger value="all" className="rounded-none px-0 py-1.5 data-[state=active]:border-b-black data-[state=active]:border-b data-[state=active]:border-solid data-[state=active]:bg-transparent data-[state=active]:text-black font-semibold text-[9px] tracking-[1.389px]">ALL PROPOSALS</TabsTrigger>
              <TabsTrigger value="draft" className="rounded-none px-0 py-1.5 data-[state=active]:border-b-black data-[state=active]:border-b data-[state=active]:border-solid data-[state=active]:bg-transparent data-[state=active]:text-black font-semibold text-[9px] tracking-[1.389px]">DRAFTS</TabsTrigger>
              <TabsTrigger value="completed" className="rounded-none px-0 py-1.5 data-[state=active]:border-b-black data-[state=active]:border-b data-[state=active]:border-solid data-[state=active]:bg-transparent data-[state=active]:text-black font-semibold text-[9px] tracking-[1.389px]">COMPLETED</TabsTrigger>
              <TabsTrigger value="pending" className="rounded-none px-0 py-1.5 data-[state=active]:border-b-black data-[state=active]:border-b data-[state=active]:border-solid data-[state=active]:bg-transparent data-[state=active]:text-black font-semibold text-[9px] tracking-[1.389px]">PENDING</TabsTrigger>
            </TabsList>
            
            <div className="bg-[#F1F1F1] px-4 py-3 mt-4 mb-2 flex justify-between items-center">
              <h2 className="text-[#403E43] text-lg font-medium">proposals & contracts</h2>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    {sortField === "value" ? <DollarSign size={16} className="mr-1" /> : 
                     sortField === "date" ? <Clock size={16} className="mr-1" /> : 
                     <Clock size={16} className="mr-1" />}
                    Sort by {sortField}
                    {sortDirection === "asc" ? <ArrowUp size={16} className="ml-1" /> : <ArrowDown size={16} className="ml-1" />}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleSortToggle("value")}>
                    <DollarSign size={16} className="mr-2" />
                    Sort by amount
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSortToggle("date")}>
                    <Clock size={16} className="mr-2" />
                    Sort by due date
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSortToggle("hours")}>
                    <Clock size={16} className="mr-2" />
                    Sort by hours
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <TabsContent value="all" className="mt-0">
              <div className={viewMode === "grid" 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" 
                : "flex flex-col"
              }>
                {sortedProjects.map(project => (
                  <ProjectCard 
                    key={project.id} 
                    project={project} 
                    viewMode={viewMode} 
                    onDragStart={(e) => handleDragStart(e, project.id)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, project.id)}
                    onView={() => handleViewProject(project)}
                  />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="active" className="mt-0">
              <div className={viewMode === "grid" 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" 
                : "flex flex-col"
              }>
                {sortedProjects.map(project => (
                  <ProjectCard 
                    key={project.id} 
                    project={project} 
                    viewMode={viewMode} 
                    onDragStart={(e) => handleDragStart(e, project.id)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, project.id)}
                    onView={() => handleViewProject(project)}
                  />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="completed" className="mt-0">
              <div className={viewMode === "grid" 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" 
                : "flex flex-col"
              }>
                {sortedProjects.map(project => (
                  <ProjectCard 
                    key={project.id} 
                    project={project} 
                    viewMode={viewMode} 
                    onDragStart={(e) => handleDragStart(e, project.id)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, project.id)}
                    onView={() => handleViewProject(project)}
                  />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="draft" className="mt-0">
              <div className={viewMode === "grid" 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" 
                : "flex flex-col"
              }>
                {sortedProjects.map(project => (
                  <ProjectCard 
                    key={project.id} 
                    project={project} 
                    viewMode={viewMode} 
                    onDragStart={(e) => handleDragStart(e, project.id)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, project.id)}
                    onView={() => handleViewProject(project)}
                  />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="pending" className="mt-0">
              <div className={viewMode === "grid" 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" 
                : "flex flex-col"
              }>
                {sortedProjects.map(project => (
                  <ProjectCard 
                    key={project.id} 
                    project={project} 
                    viewMode={viewMode} 
                    onDragStart={(e) => handleDragStart(e, project.id)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, project.id)}
                    onView={() => handleViewProject(project)}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DashboardFooter 
          totalValue={totalValue} 
          totalHours={totalHours} 
          avgHourlyRate={avgHourlyRate}
          projectCount={filteredProjects.length}
        />
      </div>
      
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedProject?.title}</DialogTitle>
            <DialogDescription>
              Client: {selectedProject?.client}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div>
              <h3 className="font-medium mb-1">Project Details</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Status:</p>
                  <p className="capitalize">{selectedProject?.status}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Due Date:</p>
                  <p>{selectedProject?.date}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Value:</p>
                  <p>{selectedProject && new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(selectedProject.value)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Hours:</p>
                  <p>{selectedProject?.hours} hours</p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-1">Services</h3>
              <div className="flex gap-1 flex-wrap">
                <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">
                  WEB DESIGN
                </Badge>
              </div>
              <div className="mt-4">
                <Button size="sm" variant="outline" className="mr-2">
                  <Eye size={16} className="mr-2" />
                  View Full Project
                </Button>
                <Button size="sm">
                  <Edit size={16} className="mr-2" />
                  Edit Project
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
