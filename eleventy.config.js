import yaml from "js-yaml";
import { HtmlBasePlugin } from "@11ty/eleventy";

// Bilingual fields are written as { en: "...", de: "..." }; plain strings are shared.
function pick(value, locale) {
  if (value && typeof value === "object" && !Array.isArray(value) && locale in value) {
    return value[locale];
  }
  return value;
}

export default function (eleventyConfig) {
  // Content lives in YAML files under src/_data (site.yaml, cv.yaml, i18n/*.yaml).
  eleventyConfig.addDataExtension("yaml,yml", (contents) => yaml.load(contents));

  // Rewrites root-relative links when the site is served from a sub-path
  // (e.g. user.github.io/repo/ before the custom domain is active).
  eleventyConfig.addPlugin(HtmlBasePlugin);

  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/assets/img/favicon.ico": "favicon.ico" });

  eleventyConfig.addFilter("pick", pick);

  // "2024-11" -> "Nov 2024" / "Nov. 2024"
  eleventyConfig.addFilter("monthYear", (ym, locale) => {
    const [year, month] = String(ym).split("-").map(Number);
    if (!month) return String(year);
    return new Intl.DateTimeFormat(locale, { month: "short", year: "numeric", timeZone: "UTC" }).format(
      new Date(Date.UTC(year, month - 1, 1))
    );
  });

  eleventyConfig.addFilter("year", (ym) => String(ym).split("-")[0]);

  // "2026-11" -> "November 2026" (privacy policy date)
  eleventyConfig.addFilter("monthYearLong", (ym, locale) => {
    const [year, month] = String(ym).split("-").map(Number);
    return new Intl.DateTimeFormat(locale, { month: "long", year: "numeric", timeZone: "UTC" }).format(
      new Date(Date.UTC(year, (month || 1) - 1, 1))
    );
  });

  // URL of the same page in another language (pages share a `pageKey`).
  eleventyConfig.addFilter("alternateUrl", (collection, pageKey, locale) => {
    const match = collection.find((item) => item.data.pageKey === pageKey && item.data.locale === locale);
    return match ? match.url : locale === "en" ? "/" : `/${locale}/`;
  });

  eleventyConfig.addFilter("selected", (items) => items.filter((item) => item.selected));

  // Compact homepage timeline: one row per job ("2017–2019", "2026", "2024–today");
  // consecutive jobs with the same title and years share a row.
  eleventyConfig.addFilter("timeline", (experience, locale, present) => {
    const rows = [];
    for (const job of experience) {
      const current = job.roles[0];
      const earliest = job.roles[job.roles.length - 1];
      const from = String(earliest.start).slice(0, 4);
      const to = current.end ? String(current.end).slice(0, 4) : present;
      const when = current.period ? pick(current.period, locale) : from === to ? from : `${from}–${to}`;
      const title = pick(current.title, locale);
      const previous = rows[rows.length - 1];
      if (previous && previous.when === when && previous.title === title) {
        previous.orgs.push(job.org);
      } else {
        rows.push({ when, title, orgs: [job.org] });
      }
    }
    return rows;
  });

  return {
    dir: { input: "src", includes: "_includes", data: "_data", output: "_site" },
    templateFormats: ["njk", "md"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
