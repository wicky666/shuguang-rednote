export type XhsBridgeCallback<T> = (result: T) => void;

export type XhsPostNoteOptions = {
  title?: string;
  content?: string;
  pageType?: "video_publish" | "photo_publish" | "slides_edit";
  mediaInfo: {
    image_resources?: Array<{ url: string }>;
    video_resources?: { video_url: string; cover_url?: string };
    live_photo_resources?: Array<{ url: string; video_url: string }>;
  };
  tags?: string;
};

export type XhsBridgeResult = {
  errMsg: string;
  errCode?: number;
  filePath?: string;
};

export type XhsMiniToolApi = {
  postNote(options: XhsPostNoteOptions): Promise<XhsBridgeResult>;
  saveImageToPhotosAlbum(options: { filePath: string }): Promise<XhsBridgeResult>;
  writeTempFile(options: { data: string }): Promise<XhsBridgeResult>;
  openRedPage(options: { type: string; params?: Record<string, string> }): Promise<XhsBridgeResult>;
};

declare global {
  interface Window {
    xhs?: {
      miniTool?: XhsMiniToolApi;
    };
  }
}

export {};
