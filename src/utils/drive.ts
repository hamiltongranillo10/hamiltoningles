export function extractDriveFileId(value: string): string | null {
  if (value.length > 2048) return null;
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' || url.hostname !== 'drive.google.com' || url.username || url.password || url.port) return null;

  const pathMatch = url.pathname.match(/^\/file\/d\/([A-Za-z0-9_-]{5,200})(?:\/|$)/);
  const queryId = (url.pathname === '/open' || url.pathname === '/uc') ? url.searchParams.get('id') : null;
  const id = pathMatch?.[1] ?? queryId;
  return id && /^[A-Za-z0-9_-]{5,200}$/.test(id) ? id : null;
}

export function drivePreviewUrl(id: string): string {
  return `https://drive.google.com/file/d/${encodeURIComponent(id)}/preview`;
}
