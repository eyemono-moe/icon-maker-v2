export type PngDimensions = {
  w: number;
  h: number;
  square?: boolean;
};

export interface PngEncoder {
  encode(svg: string, dimensions: PngDimensions): Promise<Uint8Array>;
}
