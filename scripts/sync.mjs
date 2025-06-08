import { Octokit } from "@octokit/rest";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = "lwg1111";
const REPO_NAME = "my-thoughts";

const octokit = new Octokit({ auth: GITHUB_TOKEN });

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function fetchIssues() {
  let all = [], page = 1;
  while (true) {
    const { data } = await octokit.issues.listForRepo({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      state: "open",
      per_page: 100,
      page,
    });
    if (!data.length) break;
    all = all.concat(data);
    page++;
  }

  return all.map(issue => ({
    title: issue.title,
    body: issue.body,
    created_at: issue.created_at,
    html_url: issue.html_url,
    tags: issue.labels.map(l => l.name),
  }));
}

async function saveJSON() {
  const issues = await fetchIssues();
  const outputPath = path.join(__dirname, "..", "data.json");  // ✅ 写入根目录
  fs.writeFileSync(outputPath, JSON.stringify(issues, null, 2));
}

saveJSON().catch(console.error);
