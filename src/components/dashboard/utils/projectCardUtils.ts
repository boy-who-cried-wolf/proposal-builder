
import { cn } from "@/lib/utils";

// Format currency
export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};

// Format date
export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: '2-digit', 
    day: '2-digit', 
    year: '2-digit' 
  });
};

// Calculate days remaining
export const getDaysRemaining = (dateString: string) => {
  const dueDate = new Date(dateString);
  const today = new Date();
  
  // Reset time portion for accurate day calculation
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);
  
  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

// Get due date color
export const getDueDateColor = (dateString: string) => {
  const daysRemaining = getDaysRemaining(dateString);
  
  if (daysRemaining < 0) return "text-red-600"; // Past due
  if (daysRemaining <= 7) return "text-orange-500"; // Approaching (within 7 days)
  return "text-green-600"; // Plenty of time
};

// Get days remaining color
export const getDaysRemainingColor = (dateString: string) => {
  const daysRemaining = getDaysRemaining(dateString);
  
  if (daysRemaining < 0) return "text-red-600"; // Past due
  if (daysRemaining <= 3) return "text-red-500"; // Very close
  if (daysRemaining <= 7) return "text-orange-500"; // Approaching
  return "text-green-600"; // Plenty of time
};

// Get badge variant based on status
export const getBadgeVariant = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800 hover:bg-green-200';
    case 'completed':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
    case 'draft':
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
    default:
      return '';
  }
};

// Get service tag color
export const getServiceTagColor = (service: string) => {
  switch (service.trim().toLowerCase()) {
    case 'web design':
      return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
    case 'services':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
    case 'development':
      return 'bg-green-100 text-green-800 hover:bg-green-200';
    case 'marketing':
      return 'bg-pink-100 text-pink-800 hover:bg-pink-200';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
  }
};
