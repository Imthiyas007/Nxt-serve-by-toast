// Validation functions
export const validateEmail = (email, t) => {
  if (!email.trim()) return t("emailRequired");
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return t("invalidEmail");
  return "";
};

export const validatePassword = (password, t) => {
  if (!password) return t("passwordRequired");
  if (password.length < 8) return t("passwordTooShort");
  if (!/(?=.*[a-z])/.test(password))
    return t("passwordNeedsLowercase");
  if (!/(?=.*[A-Z])/.test(password))
    return t("passwordNeedsUppercase");
  if (!/(?=.*\d)/.test(password))
    return t("passwordNeedsNumber");
  return "";
};

export const validateAvatar = (file, t) => {
  if (!file) return ""; // Avatar is optional

  const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
  if (!allowedTypes.includes(file.type)) {
    return t("avatarMustBeImage");
  }

  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return t("avatarTooLarge");
  }

  return "";
};

export const getInitials = (name) => {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
};