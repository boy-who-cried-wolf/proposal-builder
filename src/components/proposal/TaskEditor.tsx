
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Lock, Unlock } from "lucide-react";

interface TaskItem {
  item: string;
  description: string;
  hours: string;
  price: string;
}

interface TaskEditorProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem: {
    sectionIndex: number;
    itemIndex: number;
    item: TaskItem;
  } | null;
  isHoursPriceLocked: boolean;
  setIsHoursPriceLocked: (locked: boolean) => void;
  handleItemChange: (field: keyof TaskItem, value: string) => void;
  saveItemChanges: () => void;
  hourlyRate: number;
}

export const TaskEditor: React.FC<TaskEditorProps> = ({
  isOpen,
  onOpenChange,
  editingItem,
  isHoursPriceLocked,
  setIsHoursPriceLocked,
  handleItemChange,
  saveItemChanges,
  hourlyRate,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveItemChanges();
    }
  };

  if (!editingItem) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4" onKeyDown={handleKeyDown}>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="item" className="text-right">
              Task
            </Label>
            <Input
              id="item"
              value={editingItem.item.item}
              onChange={(e) => handleItemChange('item', e.target.value)}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Input
              id="description"
              value={editingItem.item.description}
              onChange={(e) => handleItemChange('description', e.target.value)}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="text-right flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsHoursPriceLocked(!isHoursPriceLocked)}
                className="p-1 rounded hover:bg-gray-100"
                aria-label={isHoursPriceLocked ? "Unlock hours and price" : "Lock hours and price"}
              >
                {isHoursPriceLocked ? <Lock size={14} /> : <Unlock size={14} />}
              </button>
              <Label htmlFor="hours" className="">
                Hours
              </Label>
            </div>
            <Input
              id="hours"
              type="number"
              value={editingItem.item.hours}
              onChange={(e) => handleItemChange('hours', e.target.value)}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">
              Price
            </Label>
            <Input
              id="price"
              value={editingItem.item.price}
              onChange={(e) => handleItemChange('price', e.target.value)}
              className="col-span-3"
              disabled={isHoursPriceLocked}
            />
          </div>
          
          {isHoursPriceLocked && (
            <div className="text-xs text-gray-500 italic">
              Price is calculated automatically based on hours at ${hourlyRate}/hour. Unlock to set custom price.
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={saveItemChanges} className="flex items-center gap-2">
            Save Changes <Check size={14} />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
