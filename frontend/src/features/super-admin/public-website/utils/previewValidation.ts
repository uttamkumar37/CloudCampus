import type { WebsiteNavigation, WebsitePage, WebsiteSeo, WebsiteTheme } from '../types';

export type PreviewDevice = 'desktop' | 'tablet' | 'mobile';

export type PreviewValidationIssue = {
  device: PreviewDevice;
  severity: 'error' | 'warning';
  message: string;
};

export type PreviewValidationResult = {
  device: PreviewDevice;
  label: string;
  width: number;
  issues: PreviewValidationIssue[];
};

type PreviewValidationInput = {
  pages: WebsitePage[];
  navigation: WebsiteNavigation[];
  themes: WebsiteTheme[];
  seo: WebsiteSeo[];
};

const DEVICES: Array<{ device: PreviewDevice; label: string; width: number }> = [
  { device: 'desktop', label: 'Desktop', width: 1280 },
  { device: 'tablet', label: 'Tablet', width: 768 },
  { device: 'mobile', label: 'Mobile', width: 390 },
];

export function validateWebsitePreview(input: PreviewValidationInput): PreviewValidationResult[] {
  return DEVICES.map(({ device, label, width }) => ({
    device,
    label,
    width,
    issues: validateDevice(device, input),
  }));
}

export function hasBlockingPreviewIssues(results: PreviewValidationResult[]): boolean {
  return results.some((result) => result.issues.some((issue) => issue.severity === 'error'));
}

function validateDevice(device: PreviewDevice, input: PreviewValidationInput): PreviewValidationIssue[] {
  const issues: PreviewValidationIssue[] = [];
  const homePage = input.pages.find((page) => normalizeSlug(page.slug) === 'home' || page.slug === '/');
  const publishedPages = input.pages.filter((page) => page.published);
  const visibleNavigation = input.navigation.filter((item) => item.visible);
  const publishedThemes = input.themes.filter((theme) => theme.published);
  const theme = publishedThemes[0] ?? input.themes[0] ?? null;

  if (input.pages.length === 0) {
    issues.push(error(device, 'Create at least one public page.'));
  }
  if (!homePage) {
    issues.push(error(device, "Add a home page with slug 'home' or '/'."));
  }
  if (publishedPages.length === 0) {
    issues.push(error(device, 'Publish at least one page for preview.'));
  }
  for (const page of input.pages) {
    if (!isText(page.seoJson.title)) {
      issues.push(error(device, `Add SEO title for ${page.title}.`));
    }
    if (!isText(page.seoJson.description)) {
      issues.push(error(device, `Add SEO description for ${page.title}.`));
    }
  }

  if (!theme) {
    issues.push(error(device, 'Create a website theme.'));
  } else {
    for (const token of ['primary', 'accent', 'surface']) {
      if (!isText(theme.tokensJson[token])) {
        issues.push(error(device, `Add theme token '${token}'.`));
      }
    }
  }

  if (visibleNavigation.length === 0) {
    issues.push(error(device, 'Add at least one visible navigation item.'));
  }
  if (!visibleNavigation.some((item) => item.path === '/')) {
    issues.push(error(device, "Add a visible '/' navigation item."));
  }

  if (device === 'desktop') {
    if (publishedPages.length < Math.min(3, input.pages.length)) {
      issues.push(warning(device, 'Desktop preview has limited published page coverage.'));
    }
    if (input.seo.length === 0) {
      issues.push(warning(device, 'Add route-level SEO rows for richer search previews.'));
    }
  }

  if (device === 'tablet') {
    const primaryItems = visibleNavigation.filter((item) => item.groupName === 'primary');
    if (primaryItems.length > 8) {
      issues.push(warning(device, 'Primary navigation may wrap on tablet; keep it to 8 items or fewer.'));
    }
  }

  if (device === 'mobile') {
    if (visibleNavigation.length > 8) {
      issues.push(warning(device, 'Mobile menu has many visible items; confirm the drawer remains scannable.'));
    }
    for (const page of input.pages) {
      const description = page.seoJson.description;
      if (typeof description === 'string' && description.length > 180) {
        issues.push(warning(device, `${page.title} SEO description is long for mobile previews.`));
      }
    }
  }

  return issues;
}

function normalizeSlug(slug: string): string {
  return slug.startsWith('/') ? slug.slice(1) : slug;
}

function isText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function error(device: PreviewDevice, message: string): PreviewValidationIssue {
  return { device, severity: 'error', message };
}

function warning(device: PreviewDevice, message: string): PreviewValidationIssue {
  return { device, severity: 'warning', message };
}
