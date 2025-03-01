type FileSystemObserverRecord =
  | { root: FileSystemHandle, relativePathComponents: string[], type: 'appeared', changedHandle: FileSystemHandle }
  | { root: FileSystemHandle, relativePathComponents: string[], type: 'disappeared', changedHandle: null }
  | { root: FileSystemHandle, relativePathComponents: string[], type: 'modified', changedHandle: FileSystemHandle }
  | { root: FileSystemHandle, relativePathComponents: string[], type: 'moved', changedHandle: FileSystemHandle, relativePathMovedFrom: string[] }
  | { root: FileSystemHandle, relativePathComponents: string[], type: 'unknown', changedHandle: null }
  | { root: FileSystemHandle, relativePathComponents: string[], type: 'errored', changedHandle: null };

declare class FileSystemObserver {
  constructor(callback: (records: FileSystemObserverRecord[], observer: FileSystemObserver) => void);
  observe(fileHandle: FileSystemHandle): void;
  observe(fileHandle: FileSystemDirectoryHandle, options?: { recursive: boolean }): void;
  private unobserve(fileHandle: FileSystemHandle): void;
  disconnect(): void;
}
