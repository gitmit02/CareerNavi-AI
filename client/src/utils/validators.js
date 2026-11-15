export const isValidEmail = (email = "") => /^\S+@\S+\.\S+$/.test(email.trim());

export const isValidPassword = (password = "") => password.length >= 6;

// Splits a comma-separated string into a clean array of trimmed, non-empty strings
export const parseCommaList = (value = "") =>
  value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
