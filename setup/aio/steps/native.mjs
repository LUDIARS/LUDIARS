/**
 * 手順 12 (任意): Pictor → Tela → Praeforma の overlay ホストを <root>/.build/ にビルドする。
 * CMake は Visual Studio / Build Tools に同梱のものを vswhere で見つける。
 * Build Tools が無ければ導入コマンドを案内して止める (管理者権限のインストールはしない)。
 */
import { existsSync } from "node:fs";
import { join } from "node:path";
import { run, runOrThrow } from "../lib/exec.mjs";

const STEP = "native";
const VSWHERE = join(process.env["ProgramFiles(x86)"] ?? "C:/Program Files (x86)", "Microsoft Visual Studio", "Installer", "vswhere.exe");
const INSTALL_HINT =
  "winget install --id Microsoft.VisualStudio.2022.BuildTools -e --override " +
  '"--quiet --wait --norestart --add Microsoft.VisualStudio.Workload.VCTools --includeRecommended"';

export async function native(ctx) {
  const { root, report } = ctx;
  if (process.platform !== "win32") { report.skip(STEP, "Windows 以外は各リポの README の手順で"); return; }
  const cmake = findCmake();
  if (!cmake) throw new Error(`C++ ビルド環境が見つかりません。管理者の PowerShell で次を実行してください: ${INSTALL_HINT}`);
  const out = join(root, ".build");
  const targets = [
    { name: "pictor", output: join(out, "pictor", "Release", "pictor.lib"), configure: ["-S", join(root, "Pictor"), "-B", join(out, "pictor"), "-DPICTOR_BUILD_DEMO=OFF", "-DPICTOR_BUILD_TESTS=OFF", "-DPICTOR_ENABLE_PROFILER=OFF"], target: "pictor" },
    { name: "tela", output: join(out, "tela-install", "lib", "cmake", "Tela", "TelaConfig.cmake"), configure: ["-S", join(root, "Tela"), "-B", join(out, "tela"), "-DTELA_BUILD_WINDOWS=ON", ...pictorArgs(root, out)], install: join(out, "tela-install") },
    { name: "pf-overlay", output: join(out, "pf-overlay", "Release", "praeforma_overlay.exe"), configure: ["-S", join(root, "Praeforma", "libraries", "native-overlay", "host"), "-B", join(out, "pf-overlay"), `-DCMAKE_PREFIX_PATH=${join(out, "tela-install")}`, ...pictorArgs(root, out)] },
  ];
  for (const target of targets) {
    if (existsSync(target.output) && !ctx.args.refresh) { report.skip(STEP, `${target.name}: ビルド済み`); continue; }
    if (!report.dryRun) {
      runOrThrow(cmake, [...target.configure, "-G", "Visual Studio 17 2022", "-A", "x64"]);
      runOrThrow(cmake, ["--build", target.configure[3], "--config", "Release", ...(target.target ? ["--target", target.target] : []), "--", "-m", "-v:minimal"]);
      if (target.install) runOrThrow(cmake, ["--install", target.configure[3], "--config", "Release", "--prefix", target.install]);
    }
    report.done(STEP, `${target.name}: ${target.output}`);
  }
}

function pictorArgs(root, out) {
  return [`-DTELA_PICTOR_INCLUDE_DIR=${join(root, "Pictor", "include")}`, `-DTELA_PICTOR_LIBRARY=${join(out, "pictor", "Release", "pictor.lib")}`];
}

function findCmake() {
  if (!existsSync(VSWHERE)) return null;
  const installation = run(VSWHERE, ["-latest", "-products", "*", "-requires", "Microsoft.VisualStudio.Component.VC.Tools.x86.x64", "-property", "installationPath"]).stdout.trim();
  if (!installation) return null;
  const cmake = join(installation, "Common7", "IDE", "CommonExtensions", "Microsoft", "CMake", "CMake", "bin", "cmake.exe");
  return existsSync(cmake) ? cmake : null;
}
