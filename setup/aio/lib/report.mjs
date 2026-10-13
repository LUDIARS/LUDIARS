/** 手順ごとの結果 (done / skip / warn / fail) を記録し、最後に要約する。 */
export function createReport({ dryRun }) {
  const lines = [];
  const add = (step, status, detail) => {
    lines.push({ step, status, detail });
    console.log(`[${step}] ${status}${detail ? `: ${detail}` : ""}`);
  };
  return {
    dryRun,
    done(step, detail) { add(step, dryRun ? "plan" : "done", detail); },
    skip(step, detail) { add(step, "skip", detail); },
    warn(step, detail) { add(step, "warn", detail); },
    fail(step, detail) { add(step, "fail", detail); },
    summary() {
      const counts = {};
      for (const line of lines) counts[line.status] = (counts[line.status] ?? 0) + 1;
      return { counts, failed: lines.filter((line) => line.status === "fail") };
    },
  };
}
