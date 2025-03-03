
import React from "react";

interface MetricsTabProps {
  // Add props as needed
}

export const MetricsTab: React.FC<MetricsTabProps> = () => {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Metrics</h2>
      <p>View detailed metrics about your proposal performance.</p>
    </div>
  );
};
