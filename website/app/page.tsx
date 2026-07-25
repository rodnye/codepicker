'use client';

import { useState } from 'react';

export default function Home() {
  const [repoUrl, setRepoUrl] = useState('');
  const [patterns, setPatterns] = useState('**');
  const [absolute, setAbsolute] = useState(false);
  const [lines, setLines] = useState<number | undefined>(undefined);
  const [includeLineNumbers, setIncludeLineNumbers] = useState(false);
  const [includeDocs, setIncludeDocs] = useState(false);
  const [gitignore, setGitignore] = useState(true);
  const [codeignore, setCodeignore] = useState(true);
  const [dotIgnore, setDotIgnore] = useState(true);
  const [defaultPatterns, setDefaultPatterns] = useState(true);
  const [remoteBranch, setRemoteBranch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const patternsArray = patterns
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean);

      const response = await fetch('/api/pick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patterns: patternsArray,
          absolute,
          lines: lines || undefined,
          includeLineNumbers,
          includeDocs,
          gitignore,
          codeignore,
          dotIgnore,
          defaultPatterns,
          remote: repoUrl || undefined,
          remoteBranch: remoteBranch || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to pick files');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'codepick-output.md';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-white dark:bg-zinc-900 text-black dark:text-white">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Codepicker Web</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Repository URL <span className="text-red-700">*</span>
            </label>
            <input
              type="url"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/user/repo"
              className="w-full px-3 py-2 border rounded-md bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Glob patterns (comma separated)
            </label>
            <input
              type="text"
              value={patterns}
              onChange={(e) => setPatterns(e.target.value)}
              placeholder="src/**/*.ts, package.json"
              className="w-full px-3 py-2 border rounded-md bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Lines limit (optional)
            </label>
            <input
              type="number"
              value={lines ?? ''}
              onChange={(e) =>
                setLines(e.target.value ? parseInt(e.target.value) : undefined)
              }
              placeholder="e.g., 100"
              className="w-full px-3 py-2 border rounded-md bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Options</label>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={absolute}
                  onChange={(e) => setAbsolute(e.target.checked)}
                />
                <span>Absolute paths</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={includeLineNumbers}
                  onChange={(e) => setIncludeLineNumbers(e.target.checked)}
                />
                <span>Line numbers</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={includeDocs}
                  onChange={(e) => setIncludeDocs(e.target.checked)}
                />
                <span>Include docs</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={gitignore}
                  onChange={(e) => setGitignore(e.target.checked)}
                />
                <span>Use .gitignore</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={codeignore}
                  onChange={(e) => setCodeignore(e.target.checked)}
                />
                <span>Use .codeignore</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={dotIgnore}
                  onChange={(e) => setDotIgnore(e.target.checked)}
                />
                <span>Use .ignore</span>
              </label>
              <label className="flex items-center space-x-2 col-span-2">
                <input
                  type="checkbox"
                  checked={defaultPatterns}
                  onChange={(e) => setDefaultPatterns(e.target.checked)}
                />
                <span>Use default ignore patterns</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Remote branch (optional)
            </label>
            <input
              type="text"
              value={remoteBranch}
              onChange={(e) => setRemoteBranch(e.target.value)}
              placeholder="main, develop, or commit SHA"
              className="w-full px-3 py-2 border rounded-md bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Pick files'}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-300 rounded-md">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
