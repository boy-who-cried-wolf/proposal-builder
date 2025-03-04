
import React from "react";
import { Textarea } from "@/components/ui/textarea";

interface ProjectDescriptionTextareaProps {
  projectDescription: string;
  setProjectDescription: (description: string) => void;
}

export const ProjectDescriptionTextarea: React.FC<ProjectDescriptionTextareaProps> = ({
  projectDescription,
  setProjectDescription,
}) => {
  return (
    <div className="flex flex-col h-full">
      <label htmlFor="project-description" className="text-black text-[11px] font-semibold tracking-[1px] uppercase block mb-2">
        Project Description
      </label>
      <Textarea
        id="project-description"
        value={projectDescription}
        onChange={(e) => setProjectDescription(e.target.value)}
        placeholder="Describe your project in detail..."
        className="h-full min-h-[200px] resize-none flex-grow"
      />
    </div>
  );
};
