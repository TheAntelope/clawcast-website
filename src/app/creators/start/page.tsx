import { redirect } from "next/navigation";
import { nextIncompleteStep, readCreatorState } from "@/lib/creator-state";

export default async function CreatorStartIndex() {
  const state = await readCreatorState();
  redirect(`/creators/start/${nextIncompleteStep(state)}`);
}
