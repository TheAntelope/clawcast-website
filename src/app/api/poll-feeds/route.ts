// Cron entry point. Vercel hits this on the schedule defined in vercel.json
// and walks every persisted creator, polling for new Substack posts and
// rendering up to one new episode each.
//
// Auth: if CRON_SECRET is set in the environment, Vercel attaches an
// `Authorization: Bearer ${CRON_SECRET}` header to cron requests and we
// enforce it. When the secret is unset (local dev), the endpoint is open so
// it can be hit manually for testing.

import { listCreatorRecords } from "@/lib/creators-store";
import { pollCreator, type PollOutcome } from "@/lib/poll";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

type CreatorReport = {
  creatorId: string;
  feed: string;
  voice: string;
  outcomes: PollOutcome[];
};

export async function GET(request: Request): Promise<Response> {
  if (!isAuthorized(request)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const records = await listCreatorRecords();
  const startedAt = new Date().toISOString();

  const reports: CreatorReport[] = [];
  for (const record of records) {
    const outcomes = await pollCreator(record);
    reports.push({
      creatorId: record.id,
      feed: record.substack.feed,
      voice: record.voice.name,
      outcomes,
    });
  }

  const tallies = countOutcomes(reports);
  return Response.json({
    ok: true,
    startedAt,
    finishedAt: new Date().toISOString(),
    creatorsPolled: records.length,
    ...tallies,
    reports,
  });
}

function isAuthorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  const header = req.headers.get("authorization");
  return header === `Bearer ${secret}`;
}

function countOutcomes(reports: CreatorReport[]) {
  let rendered = 0;
  let skipped = 0;
  let errored = 0;
  for (const r of reports) {
    for (const o of r.outcomes) {
      if (o.kind === "rendered") rendered++;
      else if (o.kind === "error") errored++;
      else skipped++;
    }
  }
  return { rendered, skipped, errored };
}
