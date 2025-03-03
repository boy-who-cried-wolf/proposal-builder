
import { ProposalSection } from "@/types/proposal";
import { Revision } from "@/components/proposal/RevisionsTab";

export const recalculateSubtotals = (sections: ProposalSection[]): void => {
  sections.forEach(section => {
    let subtotal = 0;
    section.items.forEach(item => {
      const price = parseFloat(item.price.toString().replace(/[^0-9.-]+/g, ''));
      if (!isNaN(price)) {
        subtotal += price;
      }
    });
    section.subtotal = `$${Math.round(subtotal).toLocaleString()}`;
  });
};

export const adjustSectionsToMatchBudget = (
  sections: ProposalSection[],
  budget: number,
  hourlyRate: number,
  isHoursPriceLocked: boolean
): void => {
  const currentTotal = calculateTotalFromSections(sections);
  if (currentTotal === 0) return;

  const ratio = budget / currentTotal;
  
  sections.forEach(section => {
    let sectionTotal = 0;
    
    section.items.forEach(item => {
      const originalPrice = parseFloat(item.price.toString().replace(/[^0-9.-]+/g, ''));
      if (!isNaN(originalPrice)) {
        const newPrice = Math.round(originalPrice * ratio);
        item.price = `$${newPrice}`;
        sectionTotal += newPrice;
        
        if (isHoursPriceLocked && hourlyRate > 0) {
          const newHours = Math.round((newPrice / hourlyRate) * 10) / 10;
          item.hours = newHours.toFixed(1);
        }
      }
    });
    
    section.subtotal = `$${Math.round(sectionTotal).toLocaleString()}`;
  });
};

export const calculateTotalFromSections = (sections: ProposalSection[]): number => {
  let total = 0;
  sections.forEach(section => {
    section.items.forEach(item => {
      const price = parseFloat(item.price.toString().replace(/[^0-9.-]+/g, ''));
      if (!isNaN(price)) {
        total += price;
      }
    });
  });
  return total;
};

export const createRevisionRecord = (
  sectionTitle: string,
  itemName: string,
  field: string,
  oldValue: string,
  newValue: string
): Revision => {
  return {
    id: Date.now().toString(),
    date: new Date(),
    sectionTitle,
    itemName,
    field,
    oldValue,
    newValue,
  };
};
