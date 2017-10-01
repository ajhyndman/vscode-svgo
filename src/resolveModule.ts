'use strict';
import * as path from 'path';
import { execSync } from 'child_process';

/**
 * Resolve a module. Uses default node module resolution, but includes global
 * paths and an optional workspace root override.
 *
 * @param moduleName The name of the module we want to resolve.
 * @param workspaceRoot An absolute path including a workspace root to resolve from.
 */
function resolveModule(moduleName: string, workspaceRoot?: string) {
  let globalNpmDir;
  try {
    globalNpmDir =
      execSync('npm config get prefix')
        .toString()
        .trim() + '/lib/node_modules';
  } catch (e) {
    // This error will generally be too low level to be useful to users.
    // We log it for debugging purposes, anyway.
    console.log(e);
  }
  let globalYarnDir;
  try {
    globalYarnDir =
      execSync('yarn global dir')
        .toString()
        .trim() + '/node_modules';
  } catch (e) {
    // This error will generally be too low level to be useful to users.
    // We log it for debugging purposes, anyway.
    console.log(e);
  }

  const NODE_PATH = [
    workspaceRoot,
    globalNpmDir,
    globalYarnDir,
    process.env.NODE_PATH,
  ]
    .filter(p => p)
    .join(path.delimiter);

  const modulePath = execSync(
    `node --print "require.resolve('${moduleName}')"`,
    { env: { ...process.env, NODE_PATH } },
  )
    .toString()
    .trim();

  return require(modulePath);
}

export default resolveModule;
