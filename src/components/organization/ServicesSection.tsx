
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";

interface ServicesSectionProps {
  services: string[];
  newService: string;
  setNewService: (value: string) => void;
  handleAddService: () => void;
  handleRemoveService: (service: string) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  services,
  newService,
  setNewService,
  handleAddService,
  handleRemoveService
}) => {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">Services</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {services.length === 0 ? (
          <div className="text-muted-foreground text-sm">No services added yet</div>
        ) : (
          services.map((service, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              {service}
              <button 
                onClick={() => handleRemoveService(service)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={14} />
              </button>
            </Badge>
          ))
        )}
      </div>
      <div className="flex gap-2">
        <Input 
          value={newService} 
          onChange={(e) => setNewService(e.target.value)}
          placeholder="Add a service" 
          className="h-10"
        />
        <Button onClick={handleAddService} size="default" type="button" className="h-10">
          <Plus size={16} className="mr-1" /> Add
        </Button>
      </div>
    </div>
  );
};
