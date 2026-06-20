import { spawn } from 'child_process';
import { mkdtemp, rm } from 'fs/promises';
import path from 'path';
import os from 'os';

/**
 * Checks that Git is installed by running `git --version`.
 * Throws if Git is not found or fails.
 */
export const checkGitInstalled = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const child = spawn('git', ['--version'], { stdio: 'ignore' });
    child.on('error', (err) => {
      reject(new Error(`Git is not installed or not in PATH: ${err.message}`));
    });
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Git command failed with code ${code}`));
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

  const args = ['clone', '--depth', '1'];
  if (branch) {
    args.push('--branch', branch);
  }
  args.push(url, tempDir);

  await new Promise<void>((resolve, reject) => {
    const child = spawn('git', args, { stdio: 'inherit' });
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
