
import React from "react";

const projectTypes = [
  "Website",
  "Branding",
  "Mobile App",
  "E-commerce",
  "Marketing",
  "Content Writing",
  "UI/UX Design",
  "Graphic Design",
  "SEO",
  "Social Media",
  "Video Production",
  "Other"
];

interface ProjectTypeSelectProps {
  projectType: string;
  setProjectType: (type: string) => void;
}

export const ProjectTypeSelect: React.FC<ProjectTypeSelectProps> = ({
  projectType,
  setProjectType,
}) => {
  return (
    <div>
      <label className="text-black text-[11px] font-semibold tracking-[1px] uppercase block mb-2">
        Project Type
      </label>
      <select
        value={projectType}
        onChange={(e) => setProjectType(e.target.value)}
        className="w-full h-[39px] rounded border text-black text-[9px] font-semibold tracking-[1px] uppercase bg-[#F7F6F2] p-[11px] border-solid border-[#E1E1DC]"
      >
        {projectTypes.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>
    </div>
  );
};
