import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { ArrowDown, Loader2, Plus, X } from "lucide-react";
import React from "react";
import { Badge } from "./badge";

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

interface ServicesSelectProps {
  services: Array<string>;
  setServices: (v: Array<string>) => void;
  loadingServices?: boolean
  servicesOptions?: Array<string>
}

export const ServicesSelect: React.FC<ServicesSelectProps> = ({
  services,
  setServices,
  loadingServices = false,
  servicesOptions = [],
}) => {

  const unSelectedOptions = servicesOptions.filter(i => !services.some(t => t === i));

  const handleRemoveService = (v: string) => {
    const filtered = services.filter(t => !(t === v));
    setServices(filtered);
  }

  const handleAddService = (v: string) => {
    const filtered = services.filter(t => !(t === v));
    setServices([...filtered, v]);
  }

  return (
    <div>
      <label className="text-black text-[11px] font-semibold tracking-[1px] uppercase block mb-2">
        Services
      </label>
      <div className="flex flex-wrap gap-2 mb-2">
        {loadingServices ? (
          <div className="flex items-center text-sm">
            <span>Loading</span>
            <span className="ml-1 animate-pulse">...</span>
          </div>
        ) : services.length === 0 ? (
          <div className="text-muted-foreground text-sm">No services added yet</div>
        ) : (
          <>
            {services.map((service, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {service}
                <button
                  onClick={() => handleRemoveService(service)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {loadingServices ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                    </>
                  ) : <X size={14} />
                  }
                </button>
              </Badge>
            ))}

            {unSelectedOptions.length > 0 ? <DropdownMenu >
              <DropdownMenuTrigger>
                <Badge variant="default" className="flex items-center gap-1">
                  Add <Plus size={14} />
                </Badge>
              </DropdownMenuTrigger>
              <DropdownMenuContent >
                <div className="p-1 flex flex-col items-stretch gap-1 bg-popover rounded-md text-center">
                  {unSelectedOptions
                    .map((item, itemIndex) =>
                      <DropdownMenuItem key={itemIndex} onClick={() => handleAddService(item)} >
                        <Badge variant="secondary" className="flex items-center gap-1 cursor-pointer">{item}
                        </Badge></DropdownMenuItem>
                    )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu > : null}

          </>
        )}
      </div>
      {/* <div className="flex gap-2">
        <select
          // value={projectType}
          // onChange={(e) => setProjectType(e.target.value)}
          className="w-full h-[39px] rounded border text-black text-[9px] font-semibold tracking-[1px] uppercase bg-[#F7F6F2] p-[11px] border-solid border-[#E1E1DC]"
        >
          {projectTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div> */}
    </div>
  );
};