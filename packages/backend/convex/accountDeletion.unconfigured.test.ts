/// <reference types="vite/client" />

import { convexTest } from "convex-test";
import { expect, test, vi } from "vite-plus/test";

import { api } from "./_generated/api";
import schema from "./schema";
import { authenticatedAs, seedAuthUser } from "./test.helpers";

vi.mock(import("@outlayr/env/backend"), () => ({ env: {} }));

const modules = import.meta.glob("./**/*.ts");

test("starts a deletion when no upstream service is configured, since it has nothing to erase", async () => {
    const t = convexTest(schema, modules);
    const owner = await seedAuthUser(t);

    const prepared = await authenticatedAs(t, owner).mutation(api.accountDeletion.prepare, {});

    expect(prepared.resumeSecret).toBeTruthy();
    await expect(t.run((ctx) => ctx.db.query("accountDeletionJobs").collect())).resolves.toHaveLength(1);
});
