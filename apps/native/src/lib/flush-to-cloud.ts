import { runPhotoSync } from "@/data/photo-sync-core";
import { runSync } from "@/data/sync-engine-core";
import type { Database } from "@/db/client";
import { photoTransport, syncTransport } from "@/lib/convex";
import { photoFiles } from "@/lib/photo-storage";

const MAX_PASSES = 10;
const FLUSH_DEADLINE_MS = 25_000;

async function flushPasses(db: Database): Promise<void> {
    for (let pass = 0; pass < MAX_PASSES; pass += 1) {
        // oxlint-disable-next-line no-await-in-loop -- photos go first, since an upload stamps its row with the key
        const { uploaded } = await runPhotoSync(db, photoFiles, photoTransport());
        // oxlint-disable-next-line no-await-in-loop -- the push must follow the upload that created its rows
        await runSync(db, syncTransport());
        if (uploaded === 0) {
            return;
        }
    }
}

/**
 * Sign-out wipes this phone's copy, so whatever only exists here goes up first. Best effort and bounded: an
 * offline phone must still be able to sign out.
 */
export async function flushToCloud(db: Database): Promise<void> {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const deadline = new Promise<void>((resolve) => {
        timer = setTimeout(resolve, FLUSH_DEADLINE_MS);
    });
    try {
        await Promise.race([flushPasses(db), deadline]);
    } catch (error) {
        console.warn("[finta] could not flush before sign-out", error);
    } finally {
        clearTimeout(timer);
    }
}
