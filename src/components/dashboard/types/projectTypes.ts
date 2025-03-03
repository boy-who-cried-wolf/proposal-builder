
export interface Project {
  id: string;
  title: string;
  client: string;
  date: string;
  value: number;
  hours: number;
  status: string;
}

export interface ProjectCardProps {
  project: Project;
  viewMode?: "grid" | "list";
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  onView?: () => void;
}
