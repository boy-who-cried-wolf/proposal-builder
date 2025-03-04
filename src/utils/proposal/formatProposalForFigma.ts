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

  // Define column widths and padding
  const columnWidths = [20, 40, 10, 10]; // Adjust widths as needed
  const columnPadding = 2; // Number of spaces between columns

  // Helper function to wrap text within a specified width
  const wrapText = (text: string, width: number): string[] => {
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = "";

    words.forEach((word) => {
      if ((currentLine + word).length <= width) {
        currentLine += (currentLine ? " " : "") + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    });

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  };

  // Helper function to format a row with wrapped text and padding
  const formatRow = (columns: string[]): string => {
    const wrappedColumns = columns.map((col, index) =>
      wrapText(col, columnWidths[index])
    );

    const maxLines = Math.max(...wrappedColumns.map((col) => col.length));
    let rowText = "";

    for (let i = 0; i < maxLines; i++) {
      wrappedColumns.forEach((col, index) => {
        const line = col[i] || ""; // Use empty string if no more lines
        rowText += line.padEnd(columnWidths[index] + columnPadding);
      });
      rowText += "\n";
    }

    return rowText;
  };

  // Format table headers
  formattedText += formatRow(["Item", "Description", "Hours", "Price"]);
  formattedText += formatRow(["----", "-----------", "-----", "-----"]);

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

      formattedText += formatRow([
        item.item,
        item.description,
        item.hours.toString(),
        `$${item.price}`,
      ]);
    });

    formattedText += formatRow([
      `${section.title} Subtotal`,
      "",
      "",
      `$${section.subtotal}`,
    ]);
  });

  // Add totals at the end
  formattedText += `\nSUMMARY\n`;
  formattedText += `Total Hours: ${totalHours.toFixed(1)}\n`;
  formattedText += `Hours Per Day: ${(totalHours / 5).toFixed(1)}\n`;
  formattedText += `Total Value: $${totalValue.toLocaleString()}\n`;

  return formattedText;
}