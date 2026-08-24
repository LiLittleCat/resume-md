import type {
  CompleteIconConfig,
  CompleteSpacing,
  CompleteTypography,
  ComponentStyles,
  ContactField,
  FontStack,
  LayoutDefaults,
  LocaleId,
  PageConfig,
  PaginationRules,
  ResumeIcon,
  SectionId,
  ThemeColors,
  ThemeId,
} from "../schema";

export interface ResolvedSectionStyle {
  typography: CompleteTypography;
  spacing: CompleteSpacing;
  layout: LayoutDefaults[keyof LayoutDefaults] | undefined;
  icon: ResumeIcon | undefined;
  showSectionIcon: boolean;
}

export interface ResolvedDocumentStyle {
  themeId: ThemeId;
  localeId: LocaleId;
  fonts: FontStack;
  colors: ThemeColors;
  typography: CompleteTypography;
  spacing: CompleteSpacing;
  page: PageConfig & { widthMm: number; heightMm: number };
  icons: CompleteIconConfig & { showContactIcons: boolean };
  layout: LayoutDefaults;
  components: ComponentStyles;
  pagination: PaginationRules;
  contactIcons: Record<ContactField, ResumeIcon>;
  sections: Record<SectionId, ResolvedSectionStyle>;
}
