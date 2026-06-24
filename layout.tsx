import React from "react";

type LayoutProps = {
  children: React.ReactNode;
  // Vocs passes these, but we don't need them here.
  frontmatter?: any;
  path?: string;
};

export default function Layout({ children }: LayoutProps) {
  return <div className="surge-app-shell">{children}</div>;
}
