/**
 * GitHub Assets Upload Utility
 *
 * Organizes uploads into a folder structure in a separate GitHub repo.
 *
 * Required env vars:
 *   GITHUB_TOKEN   - GitHub personal access token with repo scope
 *   GITHUB_USERNAME - GitHub username (repo owner)
 *   ASSETS_REPO     - Assets repo name (e.g., "nilay-assets")
 *   ASSETS_BRANCH   - Optional, defaults to "main"
 */

export type UploadCategory =
  | "home"
  | "resume"
  | "projects"
  | "blogs"
  | "about"
  | "skills"
  | "misc";

export const UPLOAD_CATEGORIES: {
  value: UploadCategory;
  label: string;
  hasSubfolder: boolean;
  placeholder: string;
}[] = [
  { value: "home", label: "Home Page", hasSubfolder: false, placeholder: "profile" },
  { value: "resume", label: "Resume", hasSubfolder: false, placeholder: "resume" },
  { value: "projects", label: "Projects", hasSubfolder: true, placeholder: "project-name" },
  { value: "blogs", label: "Blogs", hasSubfolder: true, placeholder: "blog-post-title" },
  { value: "about", label: "About", hasSubfolder: false, placeholder: "about-photo" },
  { value: "skills", label: "Skills", hasSubfolder: false, placeholder: "skill-icon" },
  { value: "misc", label: "Miscellaneous", hasSubfolder: true, placeholder: "folder-name" },
];

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 60);
}

export function buildUploadPath(
  category: UploadCategory,
  filename: string,
  extension: string,
  subfolder?: string
): string {
  const cat = UPLOAD_CATEGORIES.find((c) => c.value === category);
  const safeName = slugify(filename) || "file";
  const ext = extension.replace(/^\./, "").toLowerCase();

  if (cat?.hasSubfolder && subfolder) {
    const safeSub = slugify(subfolder);
    return `${category}/${safeSub}/${safeName}.${ext}`;
  }

  return `${category}/${safeName}.${ext}`;
}

function getRepoUrl(): string {
  const owner = process.env.GITHUB_USERNAME;
  const repo = process.env.ASSETS_REPO;

  if (!owner || !repo) {
    throw new Error(
      "GITHUB_USERNAME and ASSETS_REPO environment variables are required."
    );
  }

  return `https://api.github.com/repos/${owner}/${repo}/contents`;
}

function getRawUrl(path: string): string {
  const owner = process.env.GITHUB_USERNAME;
  const repo = process.env.ASSETS_REPO;
  const branch = process.env.ASSETS_BRANCH || "main";

  return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
}

/**
 * Uploads a file to the GitHub assets repo.
 * Handles both new files and updates to existing files.
 * Returns the raw CDN URL of the uploaded file.
 */
export async function uploadToGitHub(
  buffer: Buffer,
  path: string,
  commitMessage?: string
): Promise<string> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error("GITHUB_TOKEN environment variable is required.");
  }

  const repoUrl = getRepoUrl();
  const apiUrl = `${repoUrl}/${path}`;
  const branch = process.env.ASSETS_BRANCH || "main";

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github.v3+json",
    "Content-Type": "application/json",
    "User-Agent": "nilay-portfolio",
  };

  // Check if file already exists (need SHA to update)
  let existingSha: string | undefined;
  try {
    const checkRes = await fetch(apiUrl, { headers });
    if (checkRes.ok) {
      const data = await checkRes.json();
      existingSha = data.sha;
    }
  } catch {
    // File doesn't exist, that's fine
  }

  // Build request body
  const body: Record<string, unknown> = {
    message: commitMessage || `Upload: ${path}`,
    content: buffer.toString("base64"),
    branch,
  };

  // Include SHA if updating existing file
  if (existingSha) {
    body.sha = existingSha;
  }

  // Upload
  const res = await fetch(apiUrl, {
    method: "PUT",
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const msg =
      (errorData as { message?: string }).message || `HTTP ${res.status}`;
    throw new Error(`GitHub upload failed: ${msg}`);
  }

  return getRawUrl(path);
}

/**
 * Deletes a file from the GitHub assets repo.
 */
export async function deleteFromGitHub(path: string): Promise<void> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN not set.");

  const apiUrl = `${getRepoUrl()}/${path}`;

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github.v3+json",
    "Content-Type": "application/json",
    "User-Agent": "nilay-portfolio",
  };

  // Get SHA of existing file
  const checkRes = await fetch(apiUrl, { headers });
  if (!checkRes.ok) {
    throw new Error("File not found.");
  }

  const { sha } = await checkRes.json();

  const res = await fetch(apiUrl, {
    method: "DELETE",
    headers,
    body: JSON.stringify({
      message: `Delete: ${path}`,
      sha,
      branch: process.env.ASSETS_BRANCH || "main",
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to delete file from GitHub.");
  }
}