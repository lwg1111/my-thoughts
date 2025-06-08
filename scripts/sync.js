// scripts/sync.js

const { Octokit } = require('@octokit/rest');
const fs = require('fs');
const path = require('path');

// ✅ 通过环境变量获取 Token
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// ✅ 改为你自己的用户名和仓库名（不是 '你的用户名'）
const REPO_OWNER = 'lwg1111';
const REPO_NAME = 'my-thoughts';

const octokit = new Octokit({ auth: GITHUB_TOKEN });

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

    if (data.length === 0) break;
    all = all.concat(data);
    page++;
  }

  return all.map(issue => ({
    id: issue.id,
    number: issue.number,
    title: issue.title,
    body: issue.body,
    created_at: issue.created_at,
    updated_at: issue.updated_at,
    url: issue.html_url,
    tags: issue.labels.map(label => label.name),
  }));
}

async function saveJSON() {
  const issues = await fetchIssues();

  // ✅ 创建 public 文件夹
  const dir = path.join(__dirname, '..', 'public');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);

  // ✅ 写入文件
  fs.writeFileSync(
    path.join(dir, 'data.json'),
    JSON.stringify(issues, null, 2),
    'utf-8'
  );

  console.log(`✅ Synced ${issues.length} issues to public/data.json`);
}

saveJSON().catch(error => {
  console.error('❌ Failed to sync issues:', error.message);
  process.exit(1);
});
