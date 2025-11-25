const { VITE_APP_BASE_API_URL, VITE_APP_ADMIN_MOBILE, VITE_APP_ADMIN_EMAIL, VITE_ADMIN_SECRET } = import.meta.env;

export default {
  apiUrl: VITE_APP_BASE_API_URL,
  adminMobileNumber: VITE_APP_ADMIN_MOBILE,
  adminEmailAddress: VITE_APP_ADMIN_EMAIL,
  adminSecret: VITE_ADMIN_SECRET
};
