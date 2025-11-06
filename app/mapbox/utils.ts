// Helper to check if a code is valid (not empty or \N)
export const isValidCode = (code: string | undefined): boolean => {
  return !!(code && code !== "\\N" && code.trim() !== "");
};

