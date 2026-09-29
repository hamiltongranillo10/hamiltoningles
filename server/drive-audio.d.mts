import type { IncomingMessage, ServerResponse } from 'node:http';

export const MAX_AUDIO_BYTES: number;
export class DriveAudioError extends Error {
  status: number;
  constructor(status: number, message: string);
}
export function parseDriveFileId(value: unknown): string | null;
export function fetchDriveAudio(
  driveUrl: unknown,
  fetchImpl?: typeof fetch,
): Promise<{ bytes: Buffer; contentType: string; extension: string }>;
export function handleDriveAudioRequest(
  req: IncomingMessage,
  res: ServerResponse,
  options?: { fetchImpl?: typeof fetch },
): Promise<void>;
