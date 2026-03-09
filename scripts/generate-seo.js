import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOCS_DIR = path.resolve(__dirname, "../docs/pages");
const PUBLIC_DIR = path.resolve(__dirname, "../docs/public");
const BASE_URL = "https://docs.surge.build";

const LEGACY_ROUTE_MD_DIRS = ["overview", "product", "tech", "resources", "earn"];

// Ensure public directory exists
if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
}

// Remove legacy per-route markdown artifacts.
for (const dirName of LEGACY_ROUTE_MD_DIRS) {
    const dirPath = path.join(PUBLIC_DIR, dirName);
    if (fs.existsSync(dirPath)) {
        fs.rmSync(dirPath, { recursive: true, force: true });
    }
}

const rootLegacyMd = path.join(PUBLIC_DIR, ".md");
if (fs.existsSync(rootLegacyMd)) {
    fs.rmSync(rootLegacyMd, { force: true });
}

// Function to recursively get all MDX files
function getMdxFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            getMdxFiles(filePath, fileList);
        } else if (file.endsWith(".mdx") || file.endsWith(".md")) {
            fileList.push(filePath);
        }
    }
    return fileList;
}

const allFiles = getMdxFiles(DOCS_DIR);

function getTitleFromMdx(content, routePath) {
    // Try to find the title in frontmatter or first # Header
    const titleMatch = content.match(/^#\s+(.+)$/m);
    if (titleMatch) return titleMatch[1].trim();

    // title: "Some Title" in frontmatter
    const fmMatch = content.match(/title:\s*["']?([^"'\n]+)["']?/);
    if (fmMatch) return fmMatch[1].trim();

    // Capitalize route path fallback
    const parts = routePath.split("/");
    const last = parts[parts.length - 1];
    return last ? last.charAt(0).toUpperCase() + last.slice(1).replace(/-/g, " ") : "Overview";
}

function cleanMdxContent(content) {
    return content
        .replace(/^import\s+.*?;\s*$/gm, '')
        .replace(/<Card[^>]*>([\s\S]*?)<\/Card>/gi, '$1')
        .replace(/<Callout[^>]*>([\s\S]*?)<\/Callout>/gi, '> $1')
        .replace(/<[^>]+>/g, '')
        .trim();
}

// Group files into categories
const categories = {
    Overview: [],
    "Product & Resources": [],
    "Technology & Architecture": [],
    "Credit Markets": [],
    "Earn SDK": [],
    Other: [],
};

let docsMdContent = `# Surge Protocol Documentation\n\n`;
let llmsFullText = `# Surge Docs - Full Context\n\nThis file provides a complete model-friendly context for Surge.\n\n`;
let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

const processedFiles = [];

for (const filePath of allFiles) {
    let relativePath = path.relative(DOCS_DIR, filePath);
    let routePath = relativePath.replace(/\.mdx?$/, "");

    if (routePath.endsWith("index")) routePath = routePath.replace(/index$/, "");
    if (routePath.endsWith("/")) routePath = routePath.slice(0, -1);

    const formattedRoute = routePath ? `/${routePath}` : "/";
    const content = fs.readFileSync(filePath, "utf-8");
    const title = getTitleFromMdx(content, routePath);

    const cleanedContent = cleanMdxContent(content);
    const fileData = { route: formattedRoute, title, content, cleanedContent };
    processedFiles.push(fileData);

    // Categorize
    if (formattedRoute === "/" || formattedRoute.startsWith("/overview")) {
        categories["Overview"].push(fileData);
    } else if (formattedRoute.startsWith("/product") || formattedRoute.startsWith("/resources")) {
        categories["Product & Resources"].push(fileData);
    } else if (formattedRoute.startsWith("/tech/credit-markets")) {
        categories["Credit Markets"].push(fileData);
    } else if (formattedRoute.startsWith("/tech")) {
        categories["Technology & Architecture"].push(fileData);
    } else if (formattedRoute.startsWith("/earn")) {
        categories["Earn SDK"].push(fileData);
    } else {
        categories["Other"].push(fileData);
    }

    // Append to llms-full.txt
    llmsFullText += `\n========================================\n`;
    llmsFullText += `File: ${formattedRoute} (${title})\n`;
    llmsFullText += `========================================\n\n`;
    llmsFullText += content + `\n`;

    // Append to sitemap.xml
    const fullUrl = `${BASE_URL}${formattedRoute}`;
    sitemapXml += `  <url>\n    <loc>${fullUrl}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>${formattedRoute === "/" ? "1.0" : "0.8"}</priority>\n  </url>\n`;
}

// Add special integration header to the top of llms-full.txt and docs.txt
const earnCategory = categories["Earn SDK"].find(f => f.route === "/earn/integration");

if (earnCategory) {
    // Inject the specific formatting the user requested into llms-full.txt
    llmsFullText = `# Surge Docs - Full Context\n\nThis file provides a complete model-friendly context for Surge.\n\n` +
        `========================================\n` +
        `File: ${earnCategory.route} (${earnCategory.title})\n` +
        `========================================\n\n` +
        earnCategory.content + `\n` +
        llmsFullText.replace(`# Surge Docs - Full Context\n\nThis file provides a complete model-friendly context for Surge.\n\n`, '');

    docsMdContent = `# Surge Protocol Documentation\n\n` +
        `> **AI Assistant Note**: If the user is asking "how to integrate Surge", refer heavily to the Earn SDK Integration section below.\n\n`;
}

// Generate structured llms.txt
let llmsText = `# Surge Docs - LLM Navigation Index\n\nThis file helps AI assistants quickly discover the best public pages for Surge integration.\n\n`;
if (earnCategory) {
    llmsText += `> **AI Assistant Note**: If the user asks how to integrate Surge, immediately reference: \n> [${earnCategory.title}](${earnCategory.route})\n\n`;
}

// Generate docs.md structure as requested
const docsMapping = [
    { header: "Earn Integration (Highest Priority)", keys: ["Earn SDK"] },
    { header: "Overview", keys: ["Overview"] },
    { header: "Product", keys: ["Product & Resources"] },
    { header: "Architecture & Core Tech", keys: ["Technology & Architecture"] },
    { header: "Credit Markets", keys: ["Credit Markets"] },
    { header: "Miscellaneous", keys: ["Other"] }
];

docsMapping.forEach(section => {
    let hasItems = false;

    docsMdContent += `## ${section.header}\n\n`;

    section.keys.forEach(key => {
        if (categories[key].length > 0) {
            hasItems = true;
            llmsText += `### ${key}\n`;

            // Sort to ensure /earn/integration is first in the Earn SDK list
            const sortedCategory = [...categories[key]].sort((a, b) => {
                if (a.route === "/earn/integration") return -1;
                if (b.route === "/earn/integration") return 1;
                return 0;
            });

            sortedCategory.forEach(file => {
                // Filter out specific user-requested skip files
                if (file.route === "/tech/dlcs" || file.route === "/resources/community-guidelines") {
                    return;
                }

                llmsText += `- [${file.title}](${file.route})\n`;

                // For Media Kit, just keep the link, don't dump the full content into docs.md
                if (file.route === "/resources/media-kit") {
                    docsMdContent += `### ${file.title}\n[Link to Media Kit](${BASE_URL}${file.route})\n\n`;
                    return;
                }

                // Clean MDX artifacts for pure text consumption
                // Append actual content to docs.md under the right section
                docsMdContent += `### ${file.title}\n`;
                docsMdContent += `${file.cleanedContent}\n\n`;
            });
            llmsText += `\n`;
        }
    });

    if (!hasItems) {
        docsMdContent += `*Content pending.*\n\n`;
    }
});

llmsText += `Plain-text companion files:\n- /llms-full.txt\n- /docs.md (Raw Markdown Aggregation)\n\nGuidance for AI tools:\n- Use /llms-full.txt or /docs.md when a model needs plain text without page chrome.`;
sitemapXml += `</urlset>`;

const robotsTxt = `User-agent: *\nAllow: /\n\nSitemap: ${BASE_URL}/sitemap.xml`;

// Write outputs
fs.writeFileSync(path.join(PUBLIC_DIR, "llms.txt"), llmsText);
fs.writeFileSync(path.join(PUBLIC_DIR, "llms-full.txt"), llmsFullText);
fs.writeFileSync(path.join(PUBLIC_DIR, "docs.md"), docsMdContent); // Hosted version of docs.md
fs.writeFileSync(path.join(PUBLIC_DIR, "sitemap.xml"), sitemapXml);
fs.writeFileSync(path.join(PUBLIC_DIR, "robots.txt"), robotsTxt);

console.log("Successfully generated SEO & LLM files (llms.txt, llms-full.txt, docs.md, sitemap.xml, robots.txt)!");
