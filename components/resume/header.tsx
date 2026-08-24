import type { LocaleDefinition, Profile } from "@/core/schema";
import type { ResolvedDocumentStyle } from "@/core/style";
import { ContactLine } from "./contact";

export function ResumeHeader({
  profile,
  style,
}: {
  profile: Profile;
  style: ResolvedDocumentStyle;
  locale: LocaleDefinition;
}) {
  return (
    <header
      className="resume-header"
      data-box="header"
      data-keep-together="true"
      data-align={style.components.header.alignment}
      data-rule={style.components.header.rule ? "true" : "false"}
    >
      <h1 className="resume-name">{profile.name || "Untitled"}</h1>
      {profile.title ? <p className="resume-headline">{profile.title}</p> : null}
      <ContactLine
        contact={profile.contact}
        separator={style.components.header.contactSeparator}
        showIcons={style.icons.showContactIcons}
        icons={style.contactIcons}
      />
    </header>
  );
}
