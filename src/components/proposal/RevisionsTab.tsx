
import React from "react";

export type Revision = {
  id: string;
  date: Date;
  sectionTitle: string;
  itemName: string;
  field: string;
  oldValue: string;
  newValue: string;
};

interface RevisionsTabProps {
  revisions: Revision[];
}

export const RevisionsTab: React.FC<RevisionsTabProps> = ({ revisions }) => {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Revisions</h2>
      {revisions.length > 0 ? (
        <div className="space-y-4">
          {revisions.map(revision => (
            <div key={revision.id} className="bg-[#F7F6F2] p-4 rounded-md border border-gray-200">
              <div className="text-sm text-gray-500 mb-1">
                {revision.date.toLocaleString()}
              </div>
              <div className="font-medium">
                {revision.sectionTitle} - {revision.itemName}
              </div>
              <div className="text-sm">
                Changed {revision.field} from <span className="line-through">{revision.oldValue}</span> to <span className="font-semibold">{revision.newValue}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No revisions yet. Edit items in the proposal to track changes here.</p>
      )}
    </div>
  );
};
