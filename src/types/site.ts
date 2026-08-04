import type { LocalizedString } from '@/lib/localized';

export type SectionType =
  | 'hero'
  | 'marquee'
  | 'categories'
  | 'productGrid'
  | 'ctaBand'
  | 'richText'
  | 'couponBanner';

export type SectionCanvas = 'night' | 'cream' | 'light' | 'pistachio';

export type ProductGridSource =
  | 'featured'
  | 'sale'
  | 'bestseller'
  | 'newest'
  | 'manual';

export type LocField = LocalizedString | string;

export interface NavLinkConfig {
  label: LocField;
  href: string;
  enabled: boolean;
}

export interface FooterColumn {
  title: LocField;
  links: { label: LocField; href: string }[];
}

export interface PageSection {
  id: string;
  type: SectionType;
  enabled: boolean;
  title?: string;
  config: Record<string, unknown>;
}

export interface AiWidgetConfig {
  enabled: boolean;
  title: LocField;
  subtitle: LocField;
  buttonLabel: LocField;
  welcomeMessage: LocField;
}

export interface SiteSettings {
  _id?: string;
  brandName: LocField;
  tagline: LocField;
  logoUrl?: string;
  contactEmail: string;
  contactPhone: string;
  navLinks: NavLinkConfig[];
  footerAbout: LocField;
  footerColumns: FooterColumn[];
  footerNote: LocField;
  aiWidget: AiWidgetConfig;
  homeSections: PageSection[];
}

export interface PublicSite {
  brandName: LocField;
  tagline: LocField;
  logoUrl?: string;
  contactEmail: string;
  contactPhone: string;
  navLinks: NavLinkConfig[];
  footerAbout: LocField;
  footerColumns: FooterColumn[];
  footerNote: LocField;
  aiWidget: AiWidgetConfig;
  homeSections: PageSection[];
}

export const SECTION_TYPE_LABELS: Record<SectionType, string> = {
  hero: 'Hero (banner lớn)',
  marquee: 'Dải chữ chạy',
  categories: 'Danh mục sản phẩm',
  productGrid: 'Lưới sản phẩm',
  ctaBand: 'Khối CTA',
  richText: 'Nội dung chữ',
  couponBanner: 'Banner voucher',
};
