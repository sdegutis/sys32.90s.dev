export type DriveFile = { type: 'file', content: string };
export type DriveFolder = { type: 'folder' };
export type DriveItem = DriveFolder | DriveFile;

export interface Drive {

  items: Map<string, DriveItem>;

  init(): Promise<void>;
  deinit?(): void;

  mkdir(path: string): Promise<void>;
  putfile(path: string, content: string): Promise<void>;

}
