import { useState, useEffect, useCallback } from "react";

export interface GitHubCommit {
  sha: string;
  message: string;
  author: string;
  date: string;
  url: string;
}

export function useGitHubActivity(username: string, enabled: boolean = true) {
  const [commits, setCommits] = useState<GitHubCommit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const fetchRecentCommits = useCallback(async () => {
    if (!enabled || !username) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch user's public events
      const response = await fetch(
        `https://api.github.com/users/${username}/events/public?per_page=30`
      );

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const events = await response.json();

      // Filter push events and extract commits
      const pushEvents = events.filter((e: any) => e.type === "PushEvent");
      const recentCommits: GitHubCommit[] = [];

      pushEvents.forEach((event: any) => {
        event.payload?.commits?.forEach((commit: any) => {
          recentCommits.push({
            sha: commit.sha,
            message: commit.message,
            author: commit.author.name,
            date: event.created_at,
            url: `https://github.com/${event.repo.name}/commit/${commit.sha}`,
          });
        });
      });

      // Load last known commits from localStorage
      const storedCommitsStr = localStorage.getItem(`github-commits-${username}`);
      const storedCommitShas = storedCommitsStr ? JSON.parse(storedCommitsStr) : [];

      // Find new commits
      const newCommits = recentCommits.filter(
        (c) => !storedCommitShas.includes(c.sha)
      );

      if (newCommits.length > 0) {
        // Save new commit SHAs
        const allShas = recentCommits.map((c) => c.sha).slice(0, 50);
        localStorage.setItem(`github-commits-${username}`, JSON.stringify(allShas));

        // Only trigger notifications after first load (when lastChecked exists)
        if (lastChecked) {
          return newCommits;
        }
      }

      setCommits(recentCommits);
      setLastChecked(new Date());
      setLoading(false);
      return [];
    } catch (err) {
      console.error("Error fetching GitHub activity:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setLoading(false);
      return [];
    }
  }, [username, enabled, lastChecked]);

  // Poll every 5 minutes
  useEffect(() => {
    if (!enabled) return;

    // Initial fetch
    fetchRecentCommits();

    // Set up polling interval (5 minutes = 300000ms)
    const interval = setInterval(() => {
      fetchRecentCommits();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [enabled, fetchRecentCommits]);

  return {
    commits,
    loading,
    error,
    lastChecked,
    refetch: fetchRecentCommits,
  };
}
