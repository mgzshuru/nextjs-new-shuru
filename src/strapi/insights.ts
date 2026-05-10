import { unstable_cache } from "next/cache";
import { type Locale } from "@/lib/i18n";
import { getStrapiBaseUrl, getStrapiRequestHeaders, extractMediaUrl, toAbsoluteUrl } from "@/lib/strapi";
import type { StrapiMedia, StrapiSeo } from "@/lib/strapi";
import type { StrapiPageBlock } from "./page";

// 1. Articles
export type StrapiArticle = {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  publish_date: string;
  is_featured?: boolean;
  enable_cover_image?: boolean;
  cover_image?: StrapiMedia;
  seo?: StrapiSeo;
};
// 2. News
export type StrapiNewsItem = {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  news_date: string;
  description?: string;
  content?: string;
  is_featured?: boolean;
  cover_image?: StrapiMedia;
  seo?: StrapiSeo;
};
// 3. Magazine Issues
export type StrapiMagazineIssue = {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  publish_date: string;
  issue_number?: string;
  description?: string;
  is_featured?: boolean;
  cover_image?: StrapiMedia;
  seo?: StrapiSeo;
};
// 4. Majlis
export type StrapiMajlis = {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  majlis_date: string;
  description?: string;
  content?: string;
  is_featured?: boolean;
  cover_image?: StrapiMedia;
  seo?: StrapiSeo;
  guests?: Array<{
    id: number;
    name: string;
    title?: string;
  }>;
};
// 5. Podcast
export type StrapiPodcast = {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  podcast_date: string;
  duration?: string;
  description?: string;
  content?: string;
  is_featured?: boolean;
  cover_image?: StrapiMedia;
  video_file?: StrapiMedia;
  video_url?: string;
  audio_url?: string;
  seo?: StrapiSeo;
  guests?: Array<{
    id: number;
    name: string;
    title?: string;
  }>;
};

// Generic Fetcher
async function fetchInsightList<T>(
  endpoint: string,
  locale: Locale,
  tags: string[]
): Promise<T[]> {
  const params = new URLSearchParams();
  params.append("locale", locale);
  params.append("populate", "cover_image");
  params.append("sort[0]", "createdAt:desc"); // Ideally sort by date field, but createdAt is safer if names differ

  const response = await fetch(`${getStrapiBaseUrl()}${endpoint}?${params.toString()}`, {
    headers: getStrapiRequestHeaders(),
    next: { tags },
  });

  if (!response.ok) {
    if (response.status === 404) return [];
    throw new Error(`Failed to fetch ${endpoint} (${response.status})`);
  }

  const payload = await response.json();
  return (payload.data || []).map((item: any) => { if (item.cover_image) { item.cover_image.url = toAbsoluteUrl(extractMediaUrl(item.cover_image)); } return item; });
}

const ARTICLES_TAG = "articles";
export const getArticlesCached = unstable_cache(
  async (locale: Locale) => fetchInsightList<StrapiArticle>("/api/articles", locale, [ARTICLES_TAG]),
  [ARTICLES_TAG],
  { revalidate: 3600, tags: [ARTICLES_TAG] }
);

const NEWS_TAG = "news-items";
export const getNewsCached = unstable_cache(
  async (locale: Locale) => fetchInsightList<StrapiNewsItem>("/api/news-items", locale, [NEWS_TAG]),
  [NEWS_TAG],
  { revalidate: 3600, tags: [NEWS_TAG] }
);

const MAGAZINE_TAG = "magazine-issues";
export const getMagazineIssuesCached = unstable_cache(
  async (locale: Locale) => fetchInsightList<StrapiMagazineIssue>("/api/magazine-issues", locale, [MAGAZINE_TAG]),
  [MAGAZINE_TAG],
  { revalidate: 3600, tags: [MAGAZINE_TAG] }
);

const MAJLIS_TAG = "majlises";
export const getMajlisCached = unstable_cache(
  async (locale: Locale) => fetchInsightList<StrapiMajlis>("/api/majlises", locale, [MAJLIS_TAG]),
  [MAJLIS_TAG],
  { revalidate: 3600, tags: [MAJLIS_TAG] }
);

const PODCAST_TAG = "podcasts";
export const getPodcastsCached = unstable_cache(
  async (locale: Locale) => fetchInsightList<StrapiPodcast>("/api/podcasts", locale, [PODCAST_TAG]),
  [PODCAST_TAG],
  { revalidate: 3600, tags: [PODCAST_TAG] }
);

export type StrapiAuthor = {
  id: number;
  documentId: string;
  name: string;
  jobTitle?: string;
  organization?: string;
  linkedin_url?: string;
  avatar?: StrapiMedia;
};

export type StrapiArticleDetail = StrapiArticle & {
  blocks?: StrapiPageBlock[];
  author?: StrapiAuthor;
  enable_cover_image?: boolean;
};

async function fetchArticleBySlug(slug: string, locale: Locale): Promise<StrapiArticleDetail | null> {
  const params = new URLSearchParams();
  params.append("locale", locale);
  params.append("filters[slug][$eq]", slug);
  params.append("populate[cover_image]", "true");
  params.append("populate[seo][populate]", "*");
  params.append("populate[blocks][populate]", "*");
  params.append("populate[author][populate][avatar]", "true");

  const response = await fetch(`${getStrapiBaseUrl()}/api/articles?${params.toString()}`, {
    headers: getStrapiRequestHeaders(),
    next: { tags: [ARTICLES_TAG, slug] },
  });

  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error(`Failed to fetch article ${slug} (${response.status})`);
  }

  const payload = await response.json();
  const article = payload.data?.[0];
  if (!article) return null;

  if (article.cover_image) {
    article.cover_image.url = toAbsoluteUrl(extractMediaUrl(article.cover_image));
  }

  if (article.author?.avatar) {
    article.author.avatar.url = toAbsoluteUrl(extractMediaUrl(article.author.avatar));
  }

  // Also normalize media inside blocks if needed, matching `normalizePage` from page.ts
  // Though wait, does normalizePage from page.ts export its normalization function? Let's check!

  return article as StrapiArticleDetail;
}

export const getArticleBySlugCached = unstable_cache(
  async (slug: string, locale: Locale) => fetchArticleBySlug(slug, locale),
  [ARTICLES_TAG],
  { revalidate: 3600 }
);

export type StrapiMagazineIssueDetail = StrapiMagazineIssue & {
  seo?: StrapiSeo;
  pdf_attachment?: StrapiMedia;
  articles?: StrapiArticle[];
};

async function fetchMagazineIssueBySlug(slug: string, locale: Locale): Promise<StrapiMagazineIssueDetail | null> {
  const params = new URLSearchParams();
  params.append("locale", locale);
  params.append("filters[slug][$eq]", slug);
  params.append("populate[cover_image]", "true");
  params.append("populate[seo][populate]", "*");
  params.append("populate[pdf_attachment]", "true");
  params.append("populate[articles][populate][cover_image]", "true");

  const response = await fetch(`${getStrapiBaseUrl()}/api/magazine-issues?${params.toString()}`, {
    headers: getStrapiRequestHeaders(),
    next: { tags: [MAGAZINE_TAG, slug] },
  });

  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error(`Failed to fetch magazine issue ${slug} (${response.status})`);
  }

  const payload = await response.json();
  const issue = payload.data?.[0];
  if (!issue) return null;

  if (issue.cover_image) {
    issue.cover_image.url = toAbsoluteUrl(extractMediaUrl(issue.cover_image));
  }

  if (issue.pdf_attachment) {
    issue.pdf_attachment.url = toAbsoluteUrl(extractMediaUrl(issue.pdf_attachment));
  }

  if (issue.articles) {
    issue.articles = issue.articles.map((art: any) => {
      if (art.cover_image) {
        art.cover_image.url = toAbsoluteUrl(extractMediaUrl(art.cover_image));
      }
      return art;
    });
  }

  return issue as StrapiMagazineIssueDetail;
}

export const getMagazineIssueBySlugCached = unstable_cache(
  async (slug: string, locale: Locale) => fetchMagazineIssueBySlug(slug, locale),
  [MAGAZINE_TAG],
  { revalidate: 3600 }
);

async function fetchMajlisBySlug(slug: string, locale: Locale): Promise<StrapiMajlis | null> {
  const params = new URLSearchParams();
  params.append("locale", locale);
  params.append("filters[slug][$eq]", slug);
  params.append("populate[cover_image]", "true");
  params.append("populate[seo][populate]", "*");
  params.append("populate[guests]", "true");

  const response = await fetch(`${getStrapiBaseUrl()}/api/majlises?${params.toString()}`, {
    headers: getStrapiRequestHeaders(),
    next: { tags: [MAJLIS_TAG, slug] },
  });

  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error(`Failed to fetch majlis ${slug} (${response.status})`);
  }

  const payload = await response.json();
  const item = payload.data?.[0];
  if (!item) return null;

  if (item.cover_image) {
    item.cover_image.url = toAbsoluteUrl(extractMediaUrl(item.cover_image));
  }

  return item as StrapiMajlis;
}

export const getMajlisBySlugCached = unstable_cache(
  async (slug: string, locale: Locale) => fetchMajlisBySlug(slug, locale),
  [MAJLIS_TAG],
  { revalidate: 3600 }
);

async function fetchNewsItemBySlug(slug: string, locale: Locale): Promise<StrapiNewsItem | null> {
  const params = new URLSearchParams();
  params.append("locale", locale);
  params.append("filters[slug][$eq]", slug);
  params.append("populate[cover_image]", "true");
  params.append("populate[seo][populate]", "*");

  const response = await fetch(`${getStrapiBaseUrl()}/api/news-items?${params.toString()}`, {
    headers: getStrapiRequestHeaders(),
    next: { tags: [NEWS_TAG, slug] },
  });

  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error(`Failed to fetch news item ${slug} (${response.status})`);
  }

  const payload = await response.json();
  const item = payload.data?.[0];
  if (!item) return null;

  if (item.cover_image) {
    item.cover_image.url = toAbsoluteUrl(extractMediaUrl(item.cover_image));
  }

  return item as StrapiNewsItem;
}

export const getNewsItemBySlugCached = unstable_cache(
  async (slug: string, locale: Locale) => fetchNewsItemBySlug(slug, locale),
  [NEWS_TAG],
  { revalidate: 3600 }
);

async function fetchPodcastBySlug(slug: string, locale: Locale): Promise<StrapiPodcast | null> {
  const params = new URLSearchParams();
  params.append("locale", locale);
  params.append("filters[slug][$eq]", slug);
  params.append("populate[cover_image]", "true");
  params.append("populate[seo][populate]", "*");
  params.append("populate[video_file]", "true");
  params.append("populate[guests]", "true");

  const response = await fetch(`${getStrapiBaseUrl()}/api/podcasts?${params.toString()}`, {
    headers: getStrapiRequestHeaders(),
    next: { tags: [PODCAST_TAG, slug] },
  });

  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error(`Failed to fetch podcast ${slug} (${response.status})`);
  }

  const payload = await response.json();
  const item = payload.data?.[0];
  if (!item) return null;

  if (item.cover_image) {
    item.cover_image.url = toAbsoluteUrl(extractMediaUrl(item.cover_image));
  }
  if (item.video_file) {
    item.video_file.url = toAbsoluteUrl(extractMediaUrl(item.video_file));
  }

  return item as StrapiPodcast;
}

export const getPodcastBySlugCached = unstable_cache(
  async (slug: string, locale: Locale) => fetchPodcastBySlug(slug, locale),
  [PODCAST_TAG],
  { revalidate: 3600 }
);

export type StrapiCategory = {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  description?: string;
  articles?: StrapiArticle[];
  children_categories?: StrapiCategory[];
  parent_category?: StrapiCategory;
};

async function fetchCategoryBySlug(slug: string, locale: string): Promise<StrapiCategory | null> {
  const params = new URLSearchParams();
  params.append("locale", locale);
  params.append("filters[slug][$eq]", slug);
  params.append("populate[articles][populate][cover_image]", "true");
  params.append("populate[children_categories]", "true");
  params.append("populate[parent_category]", "true");

  const response = await fetch(`${getStrapiBaseUrl()}/api/categories?${params.toString()}`, {
    headers: getStrapiRequestHeaders(),
    next: { tags: ["categories", slug] },
  });

  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error(`Failed to fetch category ${slug} (${response.status})`);
  }

  const payload = await response.json();
  const item = payload.data?.[0];
  if (!item) return null;

  if (item.articles) {
    item.articles = item.articles.map((art: any) => {
      if (art.cover_image) {
        art.cover_image.url = toAbsoluteUrl(extractMediaUrl(art.cover_image));
      }
      return art;
    });
  }

  return item as StrapiCategory;
}

export const getCategoryBySlugCached = unstable_cache(
  async (slug: string, locale: Locale) => fetchCategoryBySlug(slug, locale),
  ["categories"],
  { revalidate: 3600 }
);

async function fetchCategoriesList(locale: string): Promise<StrapiCategory[]> {
  const params = new URLSearchParams();
  params.append("locale", locale);
  params.append("populate[children_categories]", "true");
  params.append("populate[parent_category]", "true");
  params.append("populate[articles][populate][cover_image]", "true");
  params.append("sort[0]", "createdAt:desc");

  const response = await fetch(`${getStrapiBaseUrl()}/api/categories?${params.toString()}`, {
    headers: getStrapiRequestHeaders(),
    next: { tags: ["categories"] },
  });

  if (!response.ok) {
    if (response.status === 404) return [];
    if (response.status === 401) return [];
    throw new Error(`Failed to fetch categories list (${response.status})`);
  }

  const payload = await response.json();
  return payload.data || [];
}

export const getCategoriesCached = unstable_cache(
  async (locale: Locale) => fetchCategoriesList(locale),
  ["categories"],
  { revalidate: 3600, tags: ["categories"] }
);
