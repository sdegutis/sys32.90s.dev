type FileSystemObserverRecordCommon = {};

type FileSystemObserverRecordAppeared = {
  type: 'appeared',
  root: FileSystemHandle,
  changedHandle: FileSystemHandle | null,
  relativePathComponents: string[],
};

type FileSystemObserverRecordDisappeared = {
  type: 'disappeared',
  root: FileSystemHandle,
  changedHandle: null,
  relativePathComponents: string[],
};

type FileSystemObserverRecordModified = {
  type: 'modified',
  root: FileSystemHandle,
  changedHandle: FileSystemHandle | null,
  relativePathComponents: string[],
};

type FileSystemObserverRecordMoved = {
  type: 'moved',
  root: FileSystemHandle,
  changedHandle: FileSystemHandle | null,
  relativePathComponents: string[],
  relativePathMovedFrom: string[],
};

type FileSystemObserverRecordUnknown = {
  type: 'unknown',
  root: FileSystemHandle,
  changedHandle: null,
  relativePathComponents: string[],
};

type FileSystemObserverRecordErrored = {
  type: 'errored',
  root: FileSystemHandle,
  changedHandle: null,
  relativePathComponents: string[],
};

type FileSystemObserverRecord =
  | FileSystemObserverRecordAppeared
  | FileSystemObserverRecordDisappeared
  | FileSystemObserverRecordModified
  | FileSystemObserverRecordMoved
  | FileSystemObserverRecordUnknown
  | FileSystemObserverRecordErrored;

declare class FileSystemObserver {
  constructor(callback: (records: FileSystemObserverRecord[], observer: FileSystemObserver) => void);
  observe(fileHandle: FileSystemHandle): void;
  observe(fileHandle: FileSystemDirectoryHandle, options?: { recursive: boolean }): void;
  private unobserve(fileHandle: FileSystemHandle): void;
  disconnect(): void;
}
