
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

  let formattedText = `${title}\n\n`;
  formattedText += `Project Type: ${projectType}\n`;
  formattedText += `Hourly Rate: $${hourlyRate}\n\n`;

  // Calculate total hours and value
  let totalHours = 0;
  let totalValue = 0;

  // Format each section
  sections.forEach((section) => {
    formattedText += `${section.title.toUpperCase()}\n`;
    formattedText += "Item\tDescription\tHours\tPrice\n";
    formattedText += "----\t-----------\t-----\t-----\n";

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

    formattedText += `Subtotal: ${section.subtotal}\n\n`;
  });

  // Add totals at the end
  formattedText += `TOTALS\n`;
  formattedText += `Total Hours: ${totalHours}\n`;
  formattedText += `Hours Per Day: ${(totalHours / 5).toFixed(1)}\n`;
  formattedText += `Total Value: $${totalValue.toLocaleString()}\n`;

  return formattedText;
}
