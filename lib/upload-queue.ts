import { db } from "./db";
import { uploadToR2 } from "./r2";

export interface UploadJobData {
  id: string;
  fileName: string;
  contentType: string;
  fileSize: number;
  fileData: Buffer;
  key: string;
}

class UploadQueue {
  private queue: Map<string, UploadJobData> = new Map();
  private processing: boolean = false;
  private maxConcurrent: number = 2;
  private currentProcessing: number = 0;

  async addToQueue(data: UploadJobData): Promise<string> {
    // Create job in database
    const job = await db.uploadJob.create({
      data: {
        fileName: data.fileName,
        contentType: data.contentType,
        fileSize: data.fileSize,
        status: "pending",
      },
    });

    // Add to memory queue
    this.queue.set(job.id, data);
    
    // Start processing if not already running
    if (!this.processing) {
      this.processQueue();
    }

    return job.id;
  }

  private async processQueue() {
    if (this.processing) return;
    this.processing = true;

    while (this.queue.size > 0 || this.currentProcessing > 0) {
      // Process jobs up to max concurrent
      while (this.currentProcessing < this.maxConcurrent && this.queue.size > 0) {
        const entry = this.queue.entries().next().value;
        if (!entry) break;
        const [jobId, data] = entry;
        this.queue.delete(jobId);
        this.currentProcessing++;

        this.processJob(jobId, data).finally(() => {
          this.currentProcessing--;
        });
      }

      // Wait a bit before checking again
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    this.processing = false;
  }

  private async processJob(jobId: string, data: UploadJobData) {
    try {
      // Update status to processing
      await db.uploadJob.update({
        where: { id: jobId },
        data: { status: "processing" },
      });

      // Upload to storage
      const storageKey = await uploadToR2(data.key, data.fileData, data.contentType);

      // Update status to completed
      await db.uploadJob.update({
        where: { id: jobId },
        data: { 
          status: "completed",
          storageKey,
        },
      });

    } catch (error) {
      // Update status to failed
      await db.uploadJob.update({
        where: { id: jobId },
        data: { 
          status: "failed",
          error: error instanceof Error ? error.message : "Unknown error",
        },
      });
    }
  }

  async getJobStatus(jobId: string) {
    return await db.uploadJob.findUnique({
      where: { id: jobId },
    });
  }

  async getPendingJobs() {
    return await db.uploadJob.findMany({
      where: { status: "pending" },
      orderBy: { createdAt: "asc" },
    });
  }
}

export const uploadQueue = new UploadQueue();

// Helper function to determine if file should be queued
export function shouldQueueFile(fileSize: number): boolean {
  // Queue files larger than 5MB
  return fileSize > 5 * 1024 * 1024; // 5MB
}
