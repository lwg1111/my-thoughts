// scripts/sync.mjs

import { Octokit } from "@octokit/rest";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = 'lwg1111';
const REPO_NAME = 'my-thoughts';

const octokit = new Octokit({ auth: GITHUB_TOKEN });

// __dirname 替代方法（ESM）
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function fetchIssues() {
  let all = [], page = 1;

  while (true) {
    const { data } = await octokit.issues.listForRepo({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      state: 'open',
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
    labels: issue.labels.map(l => l.name),
  }));
}

async function saveJSON() {
  const issues = await fetchIssues();
  const dir = path.join(__dirname, '..', 'public');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
  fs.writeFileSync(path.join(dir, 'data.json'), JSON.stringify(issues, null, 2), 'utf-8');
  console.log(`✅ Synced ${issues.length} issues to public/data.json`);
}

saveJSON().catch(err => {
  console.error('❌ Error syncing issues:', err.message);
  process.exit(1);
});
