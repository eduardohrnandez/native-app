/** Native SQLite answers synchronously from the first call, so there is nothing to wait for. */
export async function warmDatabase(): Promise<void> {
    await Promise.resolve();
}
