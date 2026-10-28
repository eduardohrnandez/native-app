// The browser has no app sandbox, so files live in memory for the session. Photos persist through the cloud sync.
const entries = new Map<string, Uint8Array | "dir">();

type Part = string | { uri: string };

function join(parts: readonly Part[]): string {
    const segments = parts.map((part) => (typeof part === "string" ? part : part.uri));
    return segments
        .join("/")
        .replaceAll(/\/{2,}/g, "/")
        .replace(/^file:\//, "file:///");
}

function nameOf(uri: string): string {
    return uri.split("/").findLast((segment) => segment !== "") ?? "";
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
        return entries.get(this.uri) instanceof Uint8Array;
    }

    get size(): number {
        const stored = entries.get(this.uri);
        return stored instanceof Uint8Array ? stored.byteLength : 0;
    }

    create(): void {
        if (!this.exists) {
            entries.set(this.uri, new Uint8Array());
        }
    }

    write(data: string | Uint8Array | ArrayBuffer): void {
        entries.set(this.uri, toBytes(data));
    }

    delete(): void {
        entries.delete(this.uri);
    }

    bytesSync(): Uint8Array {
        const stored = entries.get(this.uri);
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
        entries.set(destination.uri, this.bytesSync());
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
        entries.set(this.uri, "dir");
    }

    delete(): void {
        for (const key of [...entries.keys()]) {
            if (key.startsWith(this.uri)) {
                entries.delete(key);
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
