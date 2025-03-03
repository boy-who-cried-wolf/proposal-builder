
import React from "react";
import { ProjectCardProps } from "./types/projectTypes";
import { ProjectCardGrid } from "./ProjectCardGrid";
import { ProjectCardList } from "./ProjectCardList";

export const ProjectCard: React.FC<ProjectCardProps> = ({ 
  project, 
  viewMode = "grid",
  onDragStart,
  onDragOver,
  onDrop,
  onView
}) => {
  // Delegate to the appropriate view component
  if (viewMode === "list") {
    return (
      <ProjectCardList
        project={project}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onView={onView}
      />
    );
  }

  return (
    <ProjectCardGrid
      project={project}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onView={onView}
    />
  );
};
