// Build-time values. SITE_URL is set by the GitHub Actions workflow;
// locally it falls back to the production domain.
export default {
  siteUrl: (process.env.SITE_URL || "https://zamanian.de").replace(/\/+$/, ""),
  year: new Date().getFullYear(),
};
