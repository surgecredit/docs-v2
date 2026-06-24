import React, { useEffect } from "react";

import "./styles.css";

type LayoutProps = {
  children: React.ReactNode;
  frontmatter?: any;
  path?: string;
};

export default function Layout({ children }: LayoutProps) {
  useEffect(() => {
    const createMenuItemContent = (
      title: string,
      description: string,
      iconPath: string,
      external = true
    ) => {
      const iconEl = document.createElement("span");
      iconEl.className = "surge-ai-item-icon";

      const iconImage = document.createElement("img");
      iconImage.className = "surge-ai-item-icon-image";
      iconImage.src = iconPath;
      iconImage.alt = "";
      iconImage.setAttribute("aria-hidden", "true");
      iconEl.appendChild(iconImage);

      const textWrap = document.createElement("span");
      textWrap.className = "surge-ai-item-text";

      const titleEl = document.createElement("span");
      titleEl.className = "surge-ai-item-title";
      titleEl.textContent = external ? `${title} ↗` : title;

      const descriptionEl = document.createElement("span");
      descriptionEl.className = "surge-ai-item-description";
      descriptionEl.textContent = description;

      textWrap.appendChild(titleEl);
      textWrap.appendChild(descriptionEl);

      return { iconEl, textWrap };
    };

    const createMenuLink = (
      className: string,
      title: string,
      description: string,
      iconPath: string,
      href: string
    ) => {
      const link = document.createElement("a");
      link.setAttribute("role", "menuitem");
      link.setAttribute("tabindex", "-1");
      link.className = `${className} surge-ai-menuitem`;
      link.href = href;
      link.target = "_blank";
      link.rel = "noreferrer";

      const { iconEl, textWrap } = createMenuItemContent(
        title,
        description,
        iconPath
      );
      link.appendChild(iconEl);
      link.appendChild(textWrap);

      return link;
    };

    const enhanceAiMenu = (menu: HTMLElement) => {
      if (menu.dataset.surgeAiEnhanced === "true") return;

      const menuItems = Array.from(
        menu.querySelectorAll<HTMLElement>('[role="menuitem"]')
      );
      const copyItem = menuItems.find((item) =>
        (item.textContent || "").toLowerCase().includes("copy page for llms")
      );

      if (!copyItem) return;

      menu.classList.add("surge-ai-menu");

      const className = copyItem.className;
      const pageUrl = `${window.location.origin}${window.location.pathname}`;
      const query = `Read from ${pageUrl} so I can ask questions about it.`;

      const chatgptLink = createMenuLink(
        className,
        "Open in ChatGPT",
        "Ask questions about this page",
        "/assets/icons/chatgpt.svg",
        `https://chatgpt.com?hints=search&q=${encodeURIComponent(query)}`
      );
      const claudeLink = createMenuLink(
        className,
        "Open in Claude",
        "Ask questions about this page",
        "/assets/icons/claude.svg",
        `https://claude.ai/new?q=${encodeURIComponent(query)}`
      );
      const perplexityLink = createMenuLink(
        className,
        "Open in Perplexity",
        "Ask questions about this page",
        "/assets/icons/perplexity.svg",
        `https://www.perplexity.ai/search/new?q=${encodeURIComponent(query)}`
      );

      copyItem.className = `${className} surge-ai-menuitem`;
      copyItem.textContent = "";
      const copyContent = createMenuItemContent(
        "Copy page",
        "Copy page as Markdown for LLMs",
        "/assets/icons/copy.svg",
        false
      );
      copyItem.appendChild(copyContent.iconEl);
      copyItem.appendChild(copyContent.textWrap);

      menu.insertBefore(chatgptLink, copyItem);
      menu.insertBefore(claudeLink, copyItem);
      menu.insertBefore(perplexityLink, copyItem.nextSibling);
      menu.dataset.surgeAiEnhanced = "true";
    };

    const enhanceAiTriggers = () => {
      const triggers = Array.from(
        document.querySelectorAll<HTMLElement>(
          'button[aria-haspopup="menu"], [role="button"][aria-haspopup="menu"], a[aria-haspopup="menu"]'
        )
      );

      triggers.forEach((trigger) => {
        const text = (trigger.textContent || "").trim().toLowerCase();
        if (text.includes("open in chatgpt")) {
          trigger.classList.add("surge-ai-trigger");
        }
      });
    };

    const scanMenus = () => {
      const menus = Array.from(
        document.querySelectorAll<HTMLElement>('[role="menu"]')
      );
      menus.forEach(enhanceAiMenu);
      enhanceAiTriggers();
    };

    scanMenus();

    const observer = new MutationObserver(() => {
      scanMenus();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
    };
  }, []);

  return <div className="surge-app-shell">{children}</div>;
}
