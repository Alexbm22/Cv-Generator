import { appendFile, mkdir, readFile } from 'fs/promises';
import path from 'path';

export interface DownloadActionLogEntry {
    schemaVersion: 1;
    timestamp: string;
    level: 'error' | 'warn' | 'info';
    event: string;
    actionId: string;
    userId: number;
    cvId: string;
    downloadId: string | null;
    snapshotId: string | null;
    snapshotHash: string;
    downloadStatus: 'pending' | 'completed' | null;
    trigger: 'client_failure' | 'server_prepare' | 'completion' | 'ttl_sweeper';
    failureType: string;
    message: string;
    stack: string | null;
    pendingExpiresAt: string | null;
    s3Keys: string[];
    cleanup: {
        dbDeleted: boolean;
        deletedS3Keys: string[];
        failedS3Keys: string[];
    };
}

export class ActionLogService {
    private static readonly logDirectory = path.resolve(process.cwd(), 'logs');

    static async append(entry: DownloadActionLogEntry): Promise<void> {
        await mkdir(this.logDirectory, { recursive: true });
        const date = entry.timestamp.slice(0, 10);
        const filePath = path.join(this.logDirectory, `download-actions-${date}.ndjson`);
        await appendFile(filePath, `${JSON.stringify(entry)}\n`, 'utf8');
    }

    static async findByActionId(actionId: string): Promise<DownloadActionLogEntry[]> {
        const files = await import('fs/promises').then(({ readdir }) => readdir(this.logDirectory)).catch(() => [] as string[]);
        const matches = await Promise.all(files
            .filter(fileName => fileName.endsWith('.ndjson'))
            .map(async fileName => {
                const contents = await readFile(path.join(this.logDirectory, fileName), 'utf8');
                return contents.split('\n')
                    .filter(Boolean)
                    .map(line => JSON.parse(line) as DownloadActionLogEntry)
                    .filter(entry => entry.actionId === actionId);
            }));

        return matches.flat();
    }
}