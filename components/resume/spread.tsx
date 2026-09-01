import type { ReactNode } from "react";

export function Spread({
  left,
  middle,
  right,
  rightTone = "muted",
}: {
  left: ReactNode;
  middle?: ReactNode;
  right?: ReactNode;
  rightTone?: "muted" | "text";
}) {
  return (
    <div className="resume-spread">
      <div className="resume-spread-main">{left}</div>
      {middle ? <div className="resume-spread-middle">{middle}</div> : null}
      {right ? (
        <div className="resume-spread-meta" data-tone={rightTone}>
          {right}
        </div>
      ) : null}
    </div>
  );
}
