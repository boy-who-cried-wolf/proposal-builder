
/**
 * Formats proposal sections into a Figma-friendly text format
 * with proper spacing and organization for pasting into design tools.
 */
import { ProposalSection } from "@/types/proposal";

export function formatProposalForFigma(
  sections: ProposalSection[],
  title: string,
  projectType: string,
  hourlyRate: number
): string {
  if (!sections || sections.length === 0) {
    return "No proposal data available";
  }

  // Start with the proposal title and basic information
  let formattedText = `${title}\n\n`;
  formattedText += `Project Type: ${projectType}\n`;
  formattedText += `Hourly Rate: $${hourlyRate}\n\n`;

  // Calculate total hours and value for summary at the end
  let totalHours = 0;
  let totalValue = 0;

  // Format table headers
  formattedText += `Item\tDescription\tHours\tPrice\n`;
  formattedText += `----\t-----------\t-----\t-----\n`;

  // Format each section
  sections.forEach((section) => {
    formattedText += `\n${section.title.toUpperCase()}\n`;
    
    // Add each item
    section.items.forEach((item) => {
      const hours = parseFloat(item.hours.toString());
      const price = parseFloat(item.price.toString().replace(/[^0-9.-]+/g, ""));
      
      if (!isNaN(hours)) {
        totalHours += hours;
      }
      
      if (!isNaN(price)) {
        totalValue += price;
      }

      formattedText += `${item.item}\t${item.description}\t${item.hours}\t${item.price}\n`;
    });

    formattedText += `${section.title} Subtotal\t\t\t${section.subtotal}\n`;
  });

  // Add totals at the end
  formattedText += `\nSUMMARY\n`;
  formattedText += `Total Hours: ${totalHours.toFixed(1)}\n`;
  formattedText += `Hours Per Day: ${(totalHours / 5).toFixed(1)}\n`;
  formattedText += `Total Value: $${totalValue.toLocaleString()}\n`;

  return formattedText;
}
