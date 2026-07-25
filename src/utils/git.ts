import { spawn } from 'child_process';
import { mkdtemp, rm } from 'fs/promises';
import path from 'path';
import os from 'os';

let isGit = true; // is git installed?

/**
 * Checks that Git is installed by running `git --version`.
 * Throws if Git is not found or fails.
 */
export const checkGitInstalled = (): Promise<void> => {
  return new Promise((resolve) => {
    const child = spawn('git', ['--version'], { stdio: 'ignore' });
    child.on('error', () => {
      console.warn('Git is not installed. Try with `npx isomorphic-git`');
      isGit = false;
    });
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        console.warn(`Git command failed with code ${code}`);
        isGit = false;
      }
    });
  });
};

/**
 * Clones a remote repository into a temporary directory.
 * @returns Path to the temporary directory
 */
export const cloneRepository = async (
  url: string,
  branch?: string,
): Promise<string> => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'codepick-remote-'));

  await new Promise<void>((resolve, reject) => {
    const child = isGit
      ? spawn(
          'git',
          [
            'clone',
            ...['--depth', '1'],
            ...(branch ? ['--branch', branch] : []),
            url,
            tempDir,
          ],
          { stdio: 'inherit' },
        )
      : // if git not installed, use isomorphic-git cli
        spawn(
          'npx',
          [
            'isomorphic-git',
            'clone',
            '--url=' + url,
            '--dir=' + tempDir,
            ...(branch ? ['--ref=' + branch] : []),
            'depth=1',
            'singleBranch=true',
          ],
          { stdio: 'inherit' },
        );
    child.on('error', (err) => {
      reject(new Error(`Failed to execute git: ${err.message}`));
    });
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`git clone failed with code ${code}`));
      }
    });
  });

  return tempDir;
};

/**
 * Removes a temporary directory recursively
 */
export const cleanupTempDir = async (dir: string): Promise<void> => {
  try {
    await rm(dir, { recursive: true, force: true });
  } catch (error) {
    console.warn(
      `Warning: Could not clean up temporary directory ${dir}:`,
      error,
    );
  }
};
