/**
 * Minimal GitHub REST client: just enough to commit files to a repo from the browser.
 * The token is a fine-grained personal access token that the owner pastes into the dashboard;
 * it lives only in that browser's localStorage and is sent only to api.github.com.
 */

const API = 'https://api.github.com'

export class GitHubError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

async function request(token, path, { method = 'GET', body } = {}) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new GitHubError(res.status, friendly(res.status, data.message))
  }
  return res.status === 204 ? null : res.json()
}

function friendly(status, message = '') {
  if (status === 401) return 'GitHub rejected the token. Check that it was copied in full and has not expired.'
  if (status === 403) return `GitHub refused the request (${message || 'forbidden'}). The token needs "Contents: Read and write" on this repository.`
  if (status === 404) return 'Repository or branch not found, or the token has no access to it. Check owner, repo name and branch.'
  if (status === 409 || status === 422) return `GitHub could not apply the commit (${message}). Try again in a moment.`
  return message || `GitHub error ${status}`
}

const repoPath = ({ owner, repo }) => `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`

/** Checks the token can reach the repo and write to it. */
export async function testConnection({ owner, repo, token }) {
  const info = await request(token, repoPath({ owner, repo }))
  return {
    fullName: info.full_name,
    defaultBranch: info.default_branch,
    canPush: !!info.permissions?.push,
    isPrivate: info.private,
  }
}

/**
 * Commits several files in ONE commit (so the site only rebuilds once).
 * files: [{ path, content, encoding: 'utf-8' | 'base64' }]
 */
export async function commitFiles({ owner, repo, branch, token, files, message }) {
  const base = repoPath({ owner, repo })
  const ref = await request(token, `${base}/git/ref/heads/${encodeURIComponent(branch)}`)
  const parentSha = ref.object.sha
  const parent = await request(token, `${base}/git/commits/${parentSha}`)

  const tree = []
  for (const file of files) {
    const blob = await request(token, `${base}/git/blobs`, {
      method: 'POST',
      body: { content: file.content, encoding: file.encoding },
    })
    tree.push({ path: file.path, mode: '100644', type: 'blob', sha: blob.sha })
  }

  const newTree = await request(token, `${base}/git/trees`, {
    method: 'POST',
    body: { base_tree: parent.tree.sha, tree },
  })
  const commit = await request(token, `${base}/git/commits`, {
    method: 'POST',
    body: { message, tree: newTree.sha, parents: [parentSha] },
  })
  await request(token, `${base}/git/refs/heads/${encodeURIComponent(branch)}`, {
    method: 'PATCH',
    body: { sha: commit.sha },
  })

  return { sha: commit.sha, url: `https://github.com/${owner}/${repo}/commit/${commit.sha}` }
}
