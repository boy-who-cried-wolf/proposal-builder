
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExpandableTabs } from "@/components/ui/expandable-tabs";
import { DollarSign, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { DashboardFooter } from "@/components/dashboard/DashboardFooter";

// Sample project data - in a real app, this would come from an API
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
  
  // Filter projects based on selected status
  const filteredProjects = statusFilter === "all" 
    ? sampleProjects 
    : sampleProjects.filter(project => project.status === statusFilter);
  
  // Calculate totals for the footer
  const totalValue = filteredProjects.reduce((sum, project) => sum + project.value, 0);
  const totalHours = filteredProjects.reduce((sum, project) => sum + project.hours, 0);
  const avgHourlyRate = totalHours > 0 ? totalValue / totalHours : 0;
  
  const expandableTabs = [
    {
      title: "All Projects",
      icon: DollarSign,
    },
    {
      title: "Active",
      icon: Clock,
    },
    {
      title: "Completed",
      icon: CheckCircle2,
    },
    {
      title: "Drafts",
      icon: AlertCircle,
    }
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="grow p-6 overflow-y-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.email || 'User'}
          </p>
        </div>
        
        <Tabs defaultValue="all" className="mb-6" onValueChange={setStatusFilter}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="draft">Drafts</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.map(project => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="active" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.map(project => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="completed" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.map(project => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="draft" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.map(project => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="pending" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.map(project => (
                <ProjectCard key={project.id} project={project} />
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
  );
};

export default Dashboard;
