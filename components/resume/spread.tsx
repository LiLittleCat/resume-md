import type { ReactNode } from "react";

export function Spread({
  left,
  right,
}: {
  left: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div className="resume-spread">
      <div className="resume-spread-main">{left}</div>
      {right ? <div className="resume-spread-meta">{right}</div> : null}
    </div>
  );
}
