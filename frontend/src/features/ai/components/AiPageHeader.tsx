import { ReactNode } from "react";

type AiPageHeaderProps = {
  eyebrow?: string;
  title: string;
  description: string;
  children?: ReactNode;
};

export function AiPageHeader({ eyebrow = "CloudCampus AI", title, description, children }: AiPageHeaderProps) {
  return (
    <header className="page-header">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {children ? <div className="page-header__actions">{children}</div> : null}
    </header>
  );
}
