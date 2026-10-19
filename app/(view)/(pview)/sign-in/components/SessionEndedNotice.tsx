import { CircleAlert } from "lucide-react";
import { sessionEndedParam } from "@/helper/route";
import { sessionEnded } from "../content/signInContent";

/** Says why the visitor is here when a newer sign-in on another browser ended theirs. */
export default async function SessionEndedNotice({ searchParams }: { searchParams: PageProps<"/sign-in">["searchParams"] }) {
  if ((await searchParams)[sessionEndedParam] === undefined) return null;
  return (
    <p className="form-error" role="status">
      <CircleAlert className="icon icon--sm" strokeWidth={1.75} />
      <span>{sessionEnded}</span>
    </p>
  );
}
