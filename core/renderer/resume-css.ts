export const RESUME_DOCUMENT_CSS = `
.resume-root {
  box-sizing: border-box;
  width: var(--resume-page-width);
  max-width: 100%;
  color: var(--resume-color-text);
  background: var(--resume-color-background);
  font-family: var(--resume-font-stack);
  font-size: var(--resume-body-size);
  font-weight: var(--resume-body-weight);
  line-height: var(--resume-body-leading);
  overflow-wrap: break-word;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

.resume-root *,
.resume-root *::before,
.resume-root *::after {
  box-sizing: border-box;
}

.resume-page-pad {
  padding: var(--resume-margin-top) var(--resume-margin-right) var(--resume-margin-bottom) var(--resume-margin-left);
}

.resume-header {
  display: flex;
  flex-direction: column;
  gap: 1.6mm;
  margin-bottom: var(--resume-header-gap);
}

.resume-identity {
  display: flex;
  flex-direction: column;
  gap: 1.6mm;
  min-width: 0;
}

.resume-header[data-align="center"] {
  align-items: center;
  text-align: center;
}

.resume-header[data-rule="true"] {
  padding-bottom: 3mm;
  border-bottom: 0.45pt solid var(--resume-color-rule);
}

.resume-header[data-avatar="left"],
.resume-header[data-avatar="right"] {
  display: grid;
  align-items: center;
  column-gap: 4.5mm;
  text-align: left;
}

.resume-header[data-avatar="left"] {
  grid-template-columns: var(--resume-avatar-size) minmax(0, 1fr);
}

.resume-header[data-avatar="right"] {
  grid-template-columns: minmax(0, 1fr) var(--resume-avatar-size);
}

.resume-header[data-avatar="left"] .resume-avatar {
  grid-column: 1;
  grid-row: 1;
}

.resume-header[data-avatar="left"] .resume-identity {
  grid-column: 2;
}

.resume-header[data-avatar="right"] .resume-identity {
  grid-column: 1;
}

.resume-header[data-avatar="right"] .resume-avatar {
  grid-column: 2;
  grid-row: 1;
}

.resume-header[data-avatar="left"] .resume-contact,
.resume-header[data-avatar="right"] .resume-contact {
  justify-content: flex-start;
}

.resume-header[data-avatar="center"] {
  align-items: center;
  text-align: center;
  gap: 2.2mm;
}

.resume-header[data-avatar] {
  overflow: hidden;
}

.resume-root .resume-avatar {
  display: block;
  width: var(--resume-avatar-size);
  height: var(--resume-avatar-size);
  max-width: var(--resume-avatar-size);
  max-height: var(--resume-avatar-size);
  flex: 0 0 var(--resume-avatar-size);
  object-fit: cover;
  object-position: center top;
  background: var(--resume-color-muted);
  print-color-adjust: exact;
  -webkit-print-color-adjust: exact;
}

.resume-root .resume-avatar[data-shape="circle"] {
  border-radius: 50%;
}

.resume-root .resume-avatar[data-shape="square"] {
  border-radius: 0.8mm;
}

.resume-name {
  margin: 0;
  color: var(--resume-color-accent);
  font-family: var(--resume-name-font, var(--resume-font-stack));
  font-size: var(--resume-name-size);
  font-weight: var(--resume-name-weight);
  letter-spacing: var(--resume-name-tracking);
  line-height: var(--resume-name-leading);
}

.resume-headline {
  margin: 0;
  font-size: var(--resume-headline-size);
  font-weight: var(--resume-headline-weight);
  letter-spacing: var(--resume-headline-tracking);
  line-height: var(--resume-headline-leading);
}

.resume-contact {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  gap: 0.8mm 2.4mm;
  align-items: center;
  justify-content: inherit;
  color: var(--resume-color-muted);
  font-size: var(--resume-meta-size);
  line-height: var(--resume-meta-leading);
}

.resume-header[data-align="center"] .resume-contact {
  justify-content: center;
}

.resume-contact-cluster {
  display: inline-flex;
  align-items: center;
  gap: 2.2mm;
}

.resume-contact-item {
  display: inline-flex;
  align-items: center;
  gap: var(--resume-icon-gap);
  color: inherit;
  text-decoration: none;
}

.resume-contact-sep {
  color: var(--resume-color-muted);
  opacity: 0.7;
}

.resume-contact-cluster[data-line-start="true"] .resume-contact-sep {
  display: none;
}

.resume-contact-sep-measure {
  position: absolute;
  visibility: hidden;
  pointer-events: none;
}

.resume-section {
  margin-top: var(--resume-section-gap);
}

.resume-section:first-of-type {
  margin-top: 0;
}

.resume-section-title {
  display: flex;
  align-items: center;
  gap: var(--resume-icon-gap);
  margin: 0 0 var(--resume-content-gap);
  color: var(--resume-color-accent);
  break-after: avoid-page;
  page-break-after: avoid;
}

.resume-section-title-text {
  font-size: var(--resume-section-title-size);
  font-weight: var(--resume-section-title-weight);
  letter-spacing: var(--resume-section-title-tracking);
  line-height: var(--resume-section-title-leading);
}

.resume-section-title[data-transform="uppercase"] .resume-section-title-text {
  text-transform: uppercase;
}

.resume-section-title[data-rule="true"] {
  padding-bottom: 1.2mm;
  border-bottom: 0.45pt solid var(--resume-color-rule);
}

.resume-icon {
  display: inline-flex;
  width: var(--resume-icon-size);
  height: var(--resume-icon-size);
  flex: 0 0 var(--resume-icon-size);
  color: currentColor;
  letter-spacing: 0;
  text-transform: none;
}

.resume-icon svg {
  width: 100%;
  height: 100%;
  stroke-width: var(--resume-icon-stroke);
}

.resume-icon[data-filled="true"] svg {
  fill: currentColor;
  stroke: none;
  stroke-width: 0;
}

.resume-item {
  margin-top: var(--resume-item-gap);
  break-inside: avoid-page;
  page-break-inside: avoid;
}

.resume-item:first-child {
  margin-top: 0;
}

.resume-spread {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 4mm;
}

.resume-spread-main {
  min-width: 0;
}

.resume-spread-main .resume-item-title {
  white-space: nowrap;
}

.resume-spread-middle {
  min-width: 0;
  flex: 1 1 auto;
  white-space: nowrap;
}

.resume-spread-meta {
  flex-shrink: 0;
  max-width: 42%;
  white-space: nowrap;
  color: var(--resume-color-muted);
  font-size: var(--resume-meta-size);
  font-weight: var(--resume-meta-weight);
  letter-spacing: var(--resume-meta-tracking);
  line-height: var(--resume-meta-leading);
  text-align: right;
}

.resume-spread-meta[data-tone="text"],
.resume-date {
  color: var(--resume-color-text);
}

.resume-item-title {
  margin: 0;
  font-size: var(--resume-item-title-size);
  font-weight: var(--resume-item-title-weight);
  letter-spacing: var(--resume-item-title-tracking);
  line-height: var(--resume-item-title-leading);
}

.resume-item-subtitle {
  margin: 0.4mm 0 0;
  font-size: var(--resume-item-subtitle-size);
  font-weight: var(--resume-item-subtitle-weight);
  letter-spacing: var(--resume-item-subtitle-tracking);
  line-height: var(--resume-item-subtitle-leading);
}

.resume-spread-middle .resume-item-subtitle {
  margin-top: 0;
}

.resume-item-header {
  break-after: avoid-page;
  page-break-after: avoid;
}

.resume-body,
.resume-paragraph {
  margin: var(--resume-paragraph-gap) 0 0;
  font-size: var(--resume-body-size);
  font-weight: var(--resume-body-weight);
  letter-spacing: var(--resume-body-tracking);
  line-height: var(--resume-body-leading);
}

.resume-body:first-child,
.resume-paragraph:first-child {
  margin-top: var(--resume-content-gap);
}

.resume-bullets {
  margin: var(--resume-content-gap) 0 0;
  padding: 0;
  list-style: none;
}

.resume-bullet {
  position: relative;
  margin: 0 0 var(--resume-bullet-gap);
  padding: 0 0 0 3.8mm;
  font-size: var(--resume-bullet-size);
  font-weight: var(--resume-bullet-weight);
  letter-spacing: var(--resume-bullet-tracking);
  line-height: var(--resume-bullet-leading);
  break-inside: avoid-page;
  page-break-inside: avoid;
}

.resume-bullet::before {
  position: absolute;
  left: 0.6mm;
  content: "•";
  color: var(--resume-color-accent);
}

.resume-bullet:last-child {
  margin-bottom: 0;
}

.resume-numbered-list {
  padding-left: 4.8mm;
  list-style: decimal;
}

.resume-numbered-list .resume-bullet {
  padding-left: 0.6mm;
}

.resume-numbered-list .resume-bullet::before {
  content: none;
}

.resume-subhead {
  margin: var(--resume-content-gap) 0 0.6mm;
  color: var(--resume-color-text);
  font-size: var(--resume-body-size);
  font-weight: 600;
  letter-spacing: 0.04em;
  line-height: var(--resume-meta-leading);
  break-after: avoid-page;
}

.resume-project-block {
  margin-top: calc(var(--resume-content-gap) + 0.8mm);
}

.resume-project-block > .resume-subhead {
  margin: 0 0 1mm;
}

.resume-project-block > .resume-body,
.resume-project-block > .resume-tech,
.resume-project-block > .resume-bullets {
  margin-top: 0;
}

.resume-project-block > .resume-tech {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8mm 2.2mm;
}

.resume-tech-item {
  white-space: nowrap;
}

.resume-skills[data-layout="inline"] .resume-skill-group {
  display: flex;
  gap: 2mm;
  align-items: baseline;
  margin-top: var(--resume-item-gap);
  break-inside: avoid-page;
}

.resume-skills[data-layout="inline"] .resume-skill-group:first-child {
  margin-top: 0;
}

.resume-skills[data-layout="inline"] .resume-skill-name {
  flex: 0 0 22mm;
  font-size: var(--resume-item-title-size);
  font-weight: var(--resume-item-title-weight);
}

.resume-skills[data-layout="inline"] .resume-skill-items {
  min-width: 0;
  font-size: var(--resume-body-size);
  line-height: var(--resume-body-leading);
}

.resume-skill-list {
  margin: 0;
  padding: 0 0 0 5mm;
}

ol.resume-skill-list {
  list-style: decimal;
}

ul.resume-skill-list {
  list-style: disc;
}

.resume-skills[data-layout="stacked"] .resume-skill-group {
  margin-top: var(--resume-item-gap);
  break-inside: avoid-page;
}

.resume-skills[data-layout="stacked"] .resume-skill-group:first-child {
  margin-top: 0;
}

.resume-skills[data-layout="stacked"] .resume-skill-name {
  font-size: var(--resume-item-title-size);
  font-weight: var(--resume-item-title-weight);
  margin-bottom: 0.6mm;
}

.resume-tech {
  margin-top: var(--resume-content-gap);
  color: var(--resume-color-muted);
  font-size: var(--resume-body-size);
  font-weight: var(--resume-body-weight);
  letter-spacing: var(--resume-body-tracking);
  line-height: var(--resume-body-leading);
}

.resume-stacked-meta {
  margin-top: 0.4mm;
  color: var(--resume-color-muted);
  font-size: var(--resume-meta-size);
}

@media print {
  .resume-root {
    width: auto;
  }
}
`.trim();
