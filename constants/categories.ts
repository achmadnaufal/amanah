export const INCOME_CATEGORIES = [
  { id: 'salary', label: 'Salary', icon: '💼' },
  { id: 'freelance', label: 'Freelance', icon: '💻' },
  { id: 'business', label: 'Business', icon: '🏪' },
  { id: 'halal_investment', label: 'Halal Investment', icon: '📈' },
  { id: 'gift', label: 'Gift', icon: '🎁' },
  { id: 'other_in', label: 'Other', icon: '➕' },
];

export const EXPENSE_CATEGORIES = [
  { id: 'food', label: 'Food & Dining', icon: '🍽️' },
  { id: 'transport', label: 'Transport', icon: '🚗' },
  { id: 'utilities', label: 'Utilities', icon: '💡' },
  { id: 'health', label: 'Healthcare', icon: '🏥' },
  { id: 'education', label: 'Education', icon: '📚' },
  { id: 'clothing', label: 'Clothing', icon: '👕' },
  { id: 'zakat', label: 'Zakat', icon: '🌙' },
  { id: 'sadaqah', label: 'Sadaqah', icon: '🤲' },
  { id: 'savings', label: 'Savings', icon: '🏦' },
  { id: 'investment', label: 'Investment', icon: '💰' },
  { id: 'other_out', label: 'Other', icon: '➖' },
];

export const ALL_CATEGORIES = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];

export const getCategoryById = (id: string) =>
  ALL_CATEGORIES.find((c) => c.id === id);
