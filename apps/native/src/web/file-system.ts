// The browser has no app sandbox. Reads are synchronous, so files live in a map that is loaded from IndexedDB at
// startup and written back on every change.
const entries = new Map<string, Uint8Array | "dir">();
const DB_NAME = "finta-files";
const STORE = "entries";

function openDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = () => request.result.createObjectStore(STORE);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error ?? new Error("IndexedDB unavailable"));
    });
}

const dbPromise: Promise<IDBDatabase | null> =
    typeof indexedDB === "undefined" ? Promise.resolve(null) : openDb().catch(() => null);

function persist(run: (store: IDBObjectStore) => void): void {
    dbPromise
        .then((db) => {
            if (db !== null) {
                run(db.transaction(STORE, "readwrite").objectStore(STORE));
            }
        })
        .catch(() => undefined);
}

function put(uri: string, value: Uint8Array | "dir"): void {
    entries.set(uri, value);
    persist((store) => store.put(value, uri));
}

function drop(uri: string): void {
    entries.delete(uri);
    persist((store) => store.delete(uri));
}

async function load(): Promise<void> {
    const db = await dbPromise;
    if (db === null) {
        return;
    }
    await new Promise<void>((resolve) => {
        const request = db.transaction(STORE, "readonly").objectStore(STORE).openCursor();
        request.onsuccess = () => {
            const cursor = request.result;
            if (cursor === null) {
                resolve();
                return;
            }
            const { key, value } = cursor;
            if (typeof key === "string" && (value === "dir" || value instanceof Uint8Array)) {
                entries.set(key, value);
            }
            cursor.continue();
        };
        request.onerror = () => resolve();
    });
}

// The app renders only after this settles, so the first read already sees the saved files.
export const fileSystemReady: Promise<void> = load();

const OPAQUE_URI = /^(blob|data|https?):/;

type Part = string | { uri: string };

function join(parts: readonly Part[]): string {
    const segments = parts.map((part) => (typeof part === "string" ? part : part.uri));
    if (segments.length === 1 && OPAQUE_URI.test(segments[0] ?? "")) {
        return segments[0] ?? "";
    }
    return segments
        .join("/")
        .replaceAll(/\/{2,}/g, "/")
        .replace(/^file:\//, "file:///");
}

function nameOf(uri: string): string {
    return uri.split("/").findLast((segment) => segment !== "") ?? "";
}

const DATA_URI = /^data:([^;,]*)(;base64)?,(.*)$/s;
const BASE64_CHUNK = 0x8000;

function decodeBase64(text: string): Uint8Array {
    const binary = atob(text);
    return Uint8Array.from(binary, (char) => char.codePointAt(0) ?? 0);
}

function encodeBase64(bytes: Uint8Array): string {
    let binary = "";
    for (let offset = 0; offset < bytes.length; offset += BASE64_CHUNK) {
        binary += String.fromCodePoint(...bytes.subarray(offset, offset + BASE64_CHUNK));
    }
    return btoa(binary);
}

// The picker hands back data: URIs on the web, which can be read without a round trip.
function fromDataUri(uri: string): Uint8Array | null {
    const match = DATA_URI.exec(uri);
    if (match === null) {
        return null;
    }
    return match[2] === undefined ? new TextEncoder().encode(decodeURIComponent(match[3] ?? "")) : decodeBase64(match[3] ?? "");
}

const MIME_BY_EXTENSION: Record<string, string> = {
    gif: "image/gif",
    jpeg: "image/jpeg",
    jpg: "image/jpeg",
    png: "image/png",
    svg: "image/svg+xml",
    webp: "image/webp",
};
const objectUrls = new Map<string, { bytes: Uint8Array; url: string }>();

// An image tag cannot read the virtual file system, so a stored file is shown through a blob URL.
export function objectUrlFor(address: string): string | null {
    const uri = join([address]);
    const bytes = entries.get(uri);
    if (!(bytes instanceof Uint8Array)) {
        return null;
    }
    const cached = objectUrls.get(uri);
    if (cached?.bytes === bytes) {
        return cached.url;
    }
    const extension = uri.split(".").pop()?.toLowerCase() ?? "";
    const url = URL.createObjectURL(new Blob([bytes.slice()], { type: MIME_BY_EXTENSION[extension] ?? "image/jpeg" }));
    objectUrls.set(uri, { bytes, url });
    return url;
}

function toBytes(data: string | Uint8Array | ArrayBuffer): Uint8Array {
    if (typeof data === "string") {
        return new TextEncoder().encode(data);
    }
    return data instanceof Uint8Array ? data : new Uint8Array(data);
}

export const Paths = {
    cache: { uri: "file:///cache/" },
    document: { uri: "file:///document/" },
    join: (...parts: Part[]): string => join(parts),
};

export class File {
    uri: string;

    constructor(...parts: Part[]) {
        this.uri = join(parts);
    }

    get name(): string {
        return nameOf(this.uri);
    }

    get exists(): boolean {
        return entries.get(this.uri) instanceof Uint8Array || this.uri.startsWith("data:");
    }

    get extension(): string {
        const dot = this.name.lastIndexOf(".");
        return dot === -1 ? "" : this.name.slice(dot);
    }

    get size(): number {
        const stored = entries.get(this.uri);
        return stored instanceof Uint8Array ? stored.byteLength : 0;
    }

    create(): void {
        if (!this.exists) {
            put(this.uri, new Uint8Array());
        }
    }

    write(data: string | Uint8Array | ArrayBuffer, options?: { encoding?: string }): void {
        put(this.uri, options?.encoding === "base64" && typeof data === "string" ? decodeBase64(data) : toBytes(data));
    }

    writeSync(data: string | Uint8Array | ArrayBuffer, options?: { encoding?: string }): void {
        this.write(data, options);
    }

    createSync(): void {
        this.create();
    }

    base64Sync(): string {
        return encodeBase64(this.bytesSync());
    }

    copySync(destination: { uri: string }, _options?: { overwrite?: boolean }): void {
        this.copy(destination);
    }

    moveSync(destination: { uri: string }): void {
        this.move(destination);
    }

    delete(): void {
        drop(this.uri);
    }

    bytesSync(): Uint8Array {
        const stored = entries.get(this.uri) ?? fromDataUri(this.uri) ?? undefined;
        if (!(stored instanceof Uint8Array)) {
            throw new Error(`File not found: ${this.uri}`);
        }
        return stored;
    }

    async bytes(): Promise<Uint8Array> {
        return await Promise.resolve(this.bytesSync());
    }

    textSync(): string {
        return new TextDecoder().decode(this.bytesSync());
    }

    async text(): Promise<string> {
        return await Promise.resolve(this.textSync());
    }

    copy(destination: { uri: string }): void {
        put(destination.uri, this.bytesSync());
    }

    move(destination: { uri: string }): void {
        this.copy(destination);
        this.delete();
        this.uri = destination.uri;
    }
}

export class Directory {
    uri: string;

    constructor(...parts: Part[]) {
        const joined = join(parts);
        this.uri = joined.endsWith("/") ? joined : `${joined}/`;
    }

    get name(): string {
        return nameOf(this.uri);
    }

    get exists(): boolean {
        return entries.get(this.uri) === "dir";
    }

    create(): void {
        put(this.uri, "dir");
    }

    delete(): void {
        for (const key of [...entries.keys()]) {
            if (key.startsWith(this.uri)) {
                drop(key);
            }
        }
    }

    list(): (Directory | File)[] {
        const children: (Directory | File)[] = [];
        for (const [key, value] of entries) {
            const rest = key.slice(this.uri.length);
            if (key.startsWith(this.uri) && rest !== "" && !rest.slice(0, -1).includes("/")) {
                children.push(value === "dir" ? new Directory(key) : new File(key));
            }
        }
        return children;
    }
}

// Bytes for a blob: address are only reachable asynchronously; this loads them so later reads can stay synchronous.
export async function adoptBlob(uri: string): Promise<void> {
    if (!uri.startsWith("blob:")) {
        return;
    }
    const response = await fetch(uri);
    entries.set(uri, new Uint8Array(await response.arrayBuffer()));
}
