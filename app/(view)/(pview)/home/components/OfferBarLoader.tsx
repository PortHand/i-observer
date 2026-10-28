import { connection } from "next/server";
import { getOffer } from "@/server/features/offerTimer/module/offerTimerModule";
import OfferBar from "./OfferBar";

/** The offer bar when a countdown is running, else nothing. Reads the database: render inside <Suspense>. */
export default async function OfferBarLoader() {
  // The timer comes from the database, so read it per request (cached a minute), never at build time.
  await connection();
  const offer = await getOffer();
  return offer ? <OfferBar offer={offer} /> : null;
}
