import { openDatabaseAsync } from "expo-sqlite";

import { DATABASE_NAME, DATABASE_OPTIONS } from "./client-options";

const OPEN_ATTEMPTS = 8;
const RETRY_DELAY_MS = 750;

function delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

// The web engine lives in a worker, and a synchronous call that has to wait for the worker's storage gives up with a
// timeout. Opening the same database asynchronously first caches it there, so the synchronous open finds it ready.
// A hard reload can leave the previous page's worker holding the storage lock for a moment, hence the retries.
export async function warmDatabase(): Promise<void> {
    for (let attempt = 1; ; attempt += 1) {
        try {
            // oxlint-disable-next-line no-await-in-loop -- each retry waits for the previous page's lock to clear
            await openDatabaseAsync(DATABASE_NAME, DATABASE_OPTIONS);
            return;
        } catch (error) {
            if (attempt >= OPEN_ATTEMPTS) {
                throw error;
            }
            // oxlint-disable-next-line no-await-in-loop -- see above
            await delay(RETRY_DELAY_MS);
        }
    }
}
