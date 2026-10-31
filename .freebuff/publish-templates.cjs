/**
 * GitHub repository-ni yaradır, lokal staging repo-nu push edir və v1.0.0 tag-i qoyur.
 * Token yalnız yaddaşda istifadə olunur: çap edilmir, fayla yazılmır.
 */
const { spawnSync } = require('node:child_process');
const path = require('node:path');

const REPO_NAME = process.env.REPO_NAME || 'website-templates';
const REPO_DESC = 'Centralized website templates for SiteX — fetched on demand, never stored on the app server.';
const PRIVATE = process.env.REPO_PRIVATE !== 'false';
const STAGE = path.join(__dirname, 'website-templates');

function readCredential() {
  const res = spawnSync('git', ['credential', 'fill'], {
    input: 'protocol=https\nhost=github.com\n\n',
    encoding: 'utf8',
    env: { ...process.env, GIT_TERMINAL_PROMPT: '0', GCM_INTERACTIVE: 'never' },
  });
  if (res.status !== 0) throw new Error('GitHub kimliyi oxunmadı');
  const out = {};
  for (const line of res.stdout.split('\n')) {
    const i = line.indexOf('=');
    if (i > 0) out[line.slice(0, i)] = line.slice(i + 1);
  }
  if (!out.username || !out.password) throw new Error('GitHub token tapılmadı');
  return { username: out.username, token: out.password };
}

async function api(token, method, url, body) {
  const res = await fetch(`https://api.github.com${url}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'SiteX-Template-Publisher',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { json = null; }
  return { status: res.status, ok: res.ok, json, text };
}

function git(args, token) {
  const auth = Buffer.from(`x-access-token:${token}`).toString('base64');
  const res = spawnSync('git', ['-c', `http.https://github.com/.extraheader=AUTHORIZATION: basic ${auth}`, ...args], {
    cwd: STAGE,
    encoding: 'utf8',
    env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
  });
  return { status: res.status, stdout: res.stdout, stderr: res.stderr };
}

(async () => {
  const { username, token } = readCredential();
  console.log('authenticated as:', username);

  let me = await api(token, 'GET', '/user');
  if (!me.ok) throw new Error(`GET /user failed: ${me.status}`);
  const owner = me.json.login;
  console.log('owner:', owner);

  const repoRes = await api(token, 'POST', '/user/repos', {
    name: REPO_NAME,
    description: REPO_DESC,
    private: PRIVATE,
    has_issues: true,
    has_wiki: false,
    has_projects: false,
    auto_init: false,
    license_template: 'mit',
  });

  if (repoRes.ok) {
    console.log('repo created:', repoRes.json.full_name, '| private:', repoRes.json.private);
  } else if (repoRes.status === 422) {
    console.log('repo already exists (422) — reusing:', `${owner}/${REPO_NAME}`);
  } else {
    throw new Error(`create repo failed: ${repoRes.status} ${repoRes.text.slice(0, 300)}`);
  }

  const remote = `https://github.com/${owner}/${REPO_NAME}.git`;

  const setRemote = git(['remote', 'remove', 'origin'], token);
  void setRemote;
  const addRemote = git(['remote', 'add', 'origin', remote], token);
  if (addRemote.status !== 0) throw new Error(`remote add failed: ${addRemote.stderr.slice(-300)}`);

  const push = git(['push', '-u', 'origin', 'main', '--force'], token);
  if (push.status !== 0) throw new Error(`push failed: ${(push.stderr || '').slice(-500)}`);
  console.log('pushed main:', push.stderr.trim().split('\n').slice(-2).join(' | '));

  const tagExists = git(['tag', '-l', 'v1.0.0'], token).stdout.trim();
  if (!tagExists) {
    const tag = git(['tag', '-a', 'v1.0.0', '-m', 'v1.0.0 — initial template catalog'], token);
    if (tag.status !== 0) throw new Error(`tag create failed: ${tag.stderr.slice(-300)}`);
  }
  const pushTag = git(['push', 'origin', 'v1.0.0'], token);
  if (pushTag.status !== 0) throw new Error(`tag push failed: ${(pushTag.stderr || '').slice(-500)}`);
  console.log('tag pushed: v1.0.0');

  const check = await api(token, 'GET', `/repos/${owner}/${REPO_NAME}/contents/manifest.json?ref=v1.0.0`);
  console.log('manifest.json on v1.0.0:', check.status, check.ok ? `size=${check.json.size}` : check.text.slice(0, 200));

  const tpl = await api(token, 'GET', `/repos/${owner}/${REPO_NAME}/contents/templates/restaurant-modern/template.json?ref=v1.0.0`);
  console.log('restaurant-modern/template.json:', tpl.status, tpl.ok ? `size=${tpl.json.size}` : tpl.text.slice(0, 200));

  const ls = await api(token, 'GET', `/repos/${owner}/${REPO_NAME}/contents/templates?ref=v1.0.0`);
  console.log('template folders:', ls.ok ? ls.json.length : ls.status);

  console.log('REPO_FULL_NAME=' + `${owner}/${REPO_NAME}`);
  console.log('REPO_PRIVATE=' + PRIVATE);
})().catch((error) => {
  console.error('ERROR:', error.message);
  process.exit(1);
});
