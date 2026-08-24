import type { LocaleDefinition, LocaleId } from "@/core/schema";
import { enUS } from "./en-US";
import { zhCN } from "./zh-CN";

export const locales: Record<LocaleId, LocaleDefinition> = {
  "zh-CN": zhCN,
  "en-US": enUS,
};

export { zhCN, enUS };
