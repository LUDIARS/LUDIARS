/** 手順 5: Excubitor に届くか確かめる。起動は OS のサービスが持つので、ここでは起こさず案内する。 */
import { cached, excubitorBase } from "../context.mjs";
import { reachable } from "../lib/http.mjs";

const STEP = "excubitor";

export async function excubitor(ctx) {
  const base = await cached(ctx, "exBase", () => excubitorBase(ctx.root));
  if (!(await reachable(base, "/api/v1/services"))) {
    throw new Error(
      "Excubitor に届きません。Excubitor の README の手順でサービスを導入・起動してから再実行してください " +
      "(npm run build と frontend の build のあと `npm run ctl -- excubitor start --json`)。",
    );
  }
  ctx.report.done(STEP, `${base} に到達`);
}
