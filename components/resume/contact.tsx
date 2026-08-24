import { CONTACT_FIELDS, type Contact, type ContactField, type ResumeIcon } from "@/core/schema";
import { ResumeGlyph } from "./resume-icon";

const FIELD_HREF: Partial<Record<ContactField, (value: string) => string>> = {
  email: (value) => `mailto:${value}`,
  phone: (value) => `tel:${value.replace(/[^\d+]/g, "")}`,
  github: identity,
  linkedin: identity,
  website: identity,
};

function identity(value: string): string {
  return value;
}

export function displayContactValue(field: ContactField, value: string): string {
  if (field === "github" || field === "linkedin" || field === "website") {
    return value.replace(/^https?:\/\//, "").replace(/\/$/, "");
  }
  return value;
}

export function ContactLine({
  contact,
  separator,
  showIcons,
  icons,
}: {
  contact: Contact;
  separator: string;
  showIcons: boolean;
  icons: Record<ContactField, ResumeIcon>;
}) {
  const items = CONTACT_FIELDS.filter((field) => contact[field]);
  if (items.length === 0) return null;

  return (
    <div className="resume-contact">
      {items.map((field, index) => {
        const value = contact[field];
        if (!value) return null;
        const href = FIELD_HREF[field]?.(value);
        const content = (
          <>
            {showIcons ? <ResumeGlyph icon={icons[field]} /> : null}
            <span>{displayContactValue(field, value)}</span>
          </>
        );
        return (
          <span key={field} className="resume-contact-cluster">
            {index > 0 ? <span className="resume-contact-sep">{separator}</span> : null}
            {href ? (
              <a className="resume-contact-item" href={href}>
                {content}
              </a>
            ) : (
              <span className="resume-contact-item">{content}</span>
            )}
          </span>
        );
      })}
    </div>
  );
}
