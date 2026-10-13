/**
 * 子プロセスの実行。shell を通さず、引数は配列で渡す。
 * Windows の npm は .cmd なので shell 無しでは起動できない。Node から npm-cli.js を直接呼ぶ。
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";

export function run(command, args, { cwd, env, input } = {}) {
  const result = spawnSync(command, args, {
    cwd,
    env: { ...process.env, ...env },
    encoding: "utf8",
    input,
    maxBuffer: 1 << 28,
    shell: false,
    windowsHide: true,
  });
  return {
    code: result.status ?? 1,
    stdout: result.stdout ?? "",
    stderr: `${result.stderr ?? ""}${result.error ? result.error.message : ""}`,
  };
}

/** 失敗したら標準エラーの末尾を添えて例外にする。 */
export function runOrThrow(command, args, options = {}) {
  const result = run(command, args, options);
  if (result.code !== 0) {
    const tail = result.stderr.trim().split(/\r?\n/).slice(-5).join("\n");
    throw new Error(`${command} ${args[0] ?? ""} が失敗しました (exit ${result.code})\n${tail}`);
  }
  return result;
}

export function npmCliPath() {
  const candidates = [
    join(dirname(process.execPath), "node_modules", "npm", "bin", "npm-cli.js"),
    join(dirname(process.execPath), "..", "lib", "node_modules", "npm", "bin", "npm-cli.js"),
  ];
  const found = candidates.find((candidate) => existsSync(candidate));
  if (!found) throw new Error("npm-cli.js が Node の配布物の中に見つかりません");
  return found;
}

export function npm(args, options = {}) {
  return runOrThrow(process.execPath, [npmCliPath(), ...args], options);
}
