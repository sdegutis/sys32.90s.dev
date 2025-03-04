export type DriveFile = { type: 'file', content: string };
export type DriveFolder = { type: 'folder' };
export type DriveItem = DriveFolder | DriveFile;

export interface Drive {

  items: Map<string, DriveItem>;

  mount(): Promise<void>;
  unmount?(): void;

  putdir(path: string): Promise<void>;
  putfile(path: string, content: string): Promise<void>;

  rmdir(path: string): Promise<void>;
  rmfile(path: string): Promise<void>;

}
