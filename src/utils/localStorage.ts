
// Utility functions to save and retrieve form data from localStorage

export interface SavedProposalFormData {
  projectDescription: string;
  projectType: string;
  hourlyRate: number;
  freelancerRate: number;
  projectBudget: number;
  dateRange?: {
    from: string;
    to: string;
  };
}

export const saveProposalFormData = (data: SavedProposalFormData): void => {
  localStorage.setItem('savedProposalData', JSON.stringify(data));
};

export const getSavedProposalFormData = (): SavedProposalFormData | null => {
  const savedData = localStorage.getItem('savedProposalData');
  if (!savedData) return null;
  
  try {
    return JSON.parse(savedData);
  } catch (error) {
    console.error('Error parsing saved proposal data:', error);
    return null;
  }
};

export const clearSavedProposalFormData = (): void => {
  localStorage.removeItem('savedProposalData');
};
