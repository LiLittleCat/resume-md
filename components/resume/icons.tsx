import type { LucideIcon } from "lucide-react";
import {
  Award,
  BadgeCheck,
  Blocks,
  Braces,
  Briefcase,
  Building2,
  CircleUser,
  Code2,
  FolderCode,
  FolderGit2,
  Globe,
  GraduationCap,
  IdCard,
  Languages,
  Mail,
  MapPin,
  Medal,
  Phone,
  Rocket,
  School,
  Trophy,
  UserRound,
  Wrench,
} from "lucide-react";
import type { ResumeIcon } from "@/core/schema";

export const LUCIDE_BY_RESUME_ICON: Record<ResumeIcon, LucideIcon> = {
  profile: CircleUser,
  summary: UserRound,
  skills: Wrench,
  code: Code2,
  braces: Braces,
  wrench: Wrench,
  briefcase: Briefcase,
  company: Building2,
  project: FolderCode,
  rocket: Rocket,
  blocks: Blocks,
  education: GraduationCap,
  school: School,
  award: Award,
  trophy: Trophy,
  medal: Medal,
  certificate: BadgeCheck,
  language: Languages,
  location: MapPin,
  email: Mail,
  phone: Phone,
  website: Globe,
  github: FolderGit2,
  linkedin: IdCard,
};

export function getLucideIcon(id: ResumeIcon): LucideIcon {
  return LUCIDE_BY_RESUME_ICON[id];
}
