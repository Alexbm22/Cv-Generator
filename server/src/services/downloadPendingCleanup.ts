import { DownloadWorkflowService } from '@/services/downloadWorkflow';

const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

// to be replaced with a more robust solution in the future, this function will periodically clean up expired pending downloads
export const startDownloadPendingCleanup = () => {
    const timer = setInterval(() => {
        DownloadWorkflowService.cleanupExpiredPendingDownloads()
            .catch(error => console.error('Pending download cleanup failed:', error));
    }, CLEANUP_INTERVAL_MS);

    timer.unref();
};