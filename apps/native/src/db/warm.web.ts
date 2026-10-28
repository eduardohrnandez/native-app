import { openDatabaseAsync } from "expo-sqlite";

import { DATABASE_NAME, DATABASE_OPTIONS } from "./client-options";

// The web engine lives in a worker, and a synchronous call that has to wait for the worker's storage gives up with a
// timeout. Opening the same database asynchronously first caches it there, so the synchronous open finds it ready.
export async function warmDatabase(): Promise<void> {
    await openDatabaseAsync(DATABASE_NAME, DATABASE_OPTIONS);
}
