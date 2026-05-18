import { create } from 'zustand';

type WebsiteTab =
  | 'dashboard'
  | 'pages'
  | 'sections'
  | 'content-blocks'
  | 'navigation'
  | 'branding'
  | 'seo'
  | 'media'
  | 'analytics'
  | 'demo'
  | 'investor'
  | 'publish';

type PublicWebsiteStore = {
  activeTab: WebsiteTab;
  selectedPageId: string | null;
  setActiveTab: (tab: WebsiteTab) => void;
  setSelectedPageId: (pageId: string | null) => void;
};

export const usePublicWebsiteStore = create<PublicWebsiteStore>((set) => ({
  activeTab: 'dashboard',
  selectedPageId: null,
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedPageId: (selectedPageId) => set({ selectedPageId }),
}));
