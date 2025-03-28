import { GitHubRepository, GitHubCommit, GitHubIssue, GitHubPullRequest } from "@shared/schema";

// Fetch user repositories
export async function fetchUserRepositories(
  token: string,
  username: string
): Promise<GitHubRepository[]> {
  try {
    const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`, {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`GitHub API error (${response.status}): ${errorText}`);
    }

    const repositories: GitHubRepository[] = await response.json();
    return repositories;
  } catch (error) {
    console.error("Failed to fetch user repositories:", error);
    throw new Error(`Failed to fetch repositories: ${error.message}`);
  }
}

// Fetch repository commits
export async function fetchRepositoryCommits(
  token: string,
  username: string,
  repo: string
): Promise<GitHubCommit[]> {
  try {
    const response = await fetch(`https://api.github.com/repos/${username}/${repo}/commits?per_page=30`, {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`GitHub API error (${response.status}): ${errorText}`);
    }

    const commits: GitHubCommit[] = await response.json();
    return commits;
  } catch (error) {
    console.error(`Failed to fetch commits for ${username}/${repo}:`, error);
    throw new Error(`Failed to fetch commits: ${error.message}`);
  }
}

// Fetch repository issues
export async function fetchRepositoryIssues(
  token: string,
  username: string,
  repo: string
): Promise<GitHubIssue[]> {
  try {
    const response = await fetch(`https://api.github.com/repos/${username}/${repo}/issues?state=all&per_page=30`, {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`GitHub API error (${response.status}): ${errorText}`);
    }

    // Filter out pull requests which are also returned by the issues endpoint
    const issues: GitHubIssue[] = (await response.json()).filter(
      (issue: any) => !issue.pull_request
    );
    
    return issues;
  } catch (error) {
    console.error(`Failed to fetch issues for ${username}/${repo}:`, error);
    throw new Error(`Failed to fetch issues: ${error.message}`);
  }
}

// Fetch repository pull requests
export async function fetchRepositoryPullRequests(
  token: string,
  username: string,
  repo: string
): Promise<GitHubPullRequest[]> {
  try {
    const response = await fetch(`https://api.github.com/repos/${username}/${repo}/pulls?state=all&per_page=30`, {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`GitHub API error (${response.status}): ${errorText}`);
    }

    const pullRequests: GitHubPullRequest[] = await response.json();
    return pullRequests;
  } catch (error) {
    console.error(`Failed to fetch pull requests for ${username}/${repo}:`, error);
    throw new Error(`Failed to fetch pull requests: ${error.message}`);
  }
}
