
import React from "react";

interface ProjectDescriptionTextareaProps {
  projectDescription: string;
  setProjectDescription: (description: string) => void;
}

export const ProjectDescriptionTextarea: React.FC<ProjectDescriptionTextareaProps> = ({
  projectDescription,
  setProjectDescription,
}) => {
  return (
    <div>
      <label className="text-black text-[11px] font-semibold tracking-[1.389px] uppercase block mb-2">
        Project Description
      </label>
      <textarea
        value={projectDescription}
        onChange={(e) => setProjectDescription(e.target.value)}
        rows={5}
        placeholder="Describe your project in detail..."
        className="w-full rounded border text-black text-[9px] font-semibold tracking-[1.389px] bg-[#F7F6F2] p-[11px] border-solid border-[#E1E1DC]"
      />
    </div>
  );
};
