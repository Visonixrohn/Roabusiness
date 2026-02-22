const ADMIN_SESSION_KEY = "roa_admin_session";

export const setAdminSession = () => {
  localStorage.setItem(ADMIN_SESSION_KEY, "true");
};

export const clearAdminSession = () => {
  localStorage.removeItem(ADMIN_SESSION_KEY);
};

export const isAdminSessionActive = () => {
  return localStorage.getItem(ADMIN_SESSION_KEY) === "true";
};
