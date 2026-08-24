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
  const avatar = profile.avatar;
  const avatarStyle = style.components.avatar;
  const photo = avatar ? (
    // eslint-disable-next-line @next/next/no-img-element -- print/PDF needs a raw img
    <img
      className="resume-avatar"
      src={avatar}
      alt=""
      data-shape={avatarStyle.shape}
      style={{
        width: `${avatarStyle.sizeMm}mm`,
        height: `${avatarStyle.sizeMm}mm`,
        maxWidth: `${avatarStyle.sizeMm}mm`,
        maxHeight: `${avatarStyle.sizeMm}mm`,
      }}
    />
  ) : null;

  return (
    <header
      className="resume-header"
      data-box="header"
      data-keep-together="true"
      data-align={style.components.header.alignment}
      data-rule={style.components.header.rule ? "true" : "false"}
      data-avatar={avatar ? avatarStyle.position : undefined}
    >
      {photo && avatarStyle.position !== "right" ? photo : null}
      <div className="resume-identity">
        <h1 className="resume-name">{profile.name || "Untitled"}</h1>
        {profile.title ? <p className="resume-headline">{profile.title}</p> : null}
        <ContactLine
          contact={profile.contact}
          separator={style.components.header.contactSeparator}
          showIcons={style.icons.showContactIcons}
          icons={style.contactIcons}
        />
      </div>
      {photo && avatarStyle.position === "right" ? photo : null}
    </header>
  );
}
