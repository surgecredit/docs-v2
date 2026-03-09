import React, { useEffect, useState } from "react";
import LockScreen from "./components/LockScreen";
import { authConfig } from "./config";

import "./styles.css";

type LayoutProps = {
  children: React.ReactNode;
  frontmatter?: any;
  path?: string;
};

export default function Layout({ children }: LayoutProps) {
  // Check if lock screen is enabled from config
  const lockScreenEnabled = authConfig.lockScreenEnabled;

  const [isAuthenticated, setIsAuthenticated] = useState(!lockScreenEnabled);
  const [isLoading, setIsLoading] = useState(lockScreenEnabled);

  useEffect(() => {
    if (!lockScreenEnabled) {
      // Already handled by initial state, but keep for safety if config changes dynamically
      return;
    }

    // Check authentication status
    const authStatus = localStorage.getItem("surge-docs-authenticated-v2");
    const authTimestamp = localStorage.getItem("surge-docs-auth-timestamp-v2");

    if (authStatus === "true" && authTimestamp) {
      // Check if authentication is still valid (24 hours)
      const now = Date.now();
      const authTime = parseInt(authTimestamp);
      const twentyFourHours = 24 * 60 * 60 * 1000;

      if (now - authTime < twentyFourHours) {
        setIsAuthenticated(true);
      } else {
        // Clear expired authentication
        localStorage.removeItem("surge-docs-authenticated-v2");
        localStorage.removeItem("surge-docs-auth-timestamp-v2");
      }
    }

    setIsLoading(false);
  }, [lockScreenEnabled]);

  // Inject valid passwords into a meta tag for public auth script
  useEffect(() => {
    const raw = authConfig.validPasswords.join(",");

    if (!raw) return;

    let meta = document.querySelector(
      'meta[name="surge-valid-passwords"]'
    ) as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "surge-valid-passwords");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", raw);
  }, []);

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

    const getMarkdownUrl = () => `${window.location.origin}/docs.md`;

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
      // const markdownLink = createMenuLink(
      //   className,
      //   "View as Markdown",
      //   "View full docs as plain text",
      //   "/assets/icons/markdown.svg",
      //   getMarkdownUrl()
      // );
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
      // menu.insertBefore(markdownLink, copyItem);
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

  const handleUnlock = () => {
    setIsAuthenticated(true);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-white via-gray-50 to-white dark:from-[#0d1111] dark:via-[#1a1a1a] dark:to-[#0d1111]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#f4431b] border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (lockScreenEnabled && !isAuthenticated) {
    return <LockScreen onUnlock={handleUnlock} />;
  }

  return <div className="surge-app-shell">{children}</div>;
}
