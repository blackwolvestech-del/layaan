// Shape of catalog.generated.json, produced by scripts/assets from the local photographs.

export interface SourceImage {
  file: string;
  basePath: string;
  width: number;
  height: number;
  placeholder: string;
  alt: string;
  view: string | null;
  placements: string[];
}

export interface SourceLook {
  key: string;
  workingName: string;
  colour: string;
  category: string;
  collections: string[];
  visual: string;
  pieces: string[];
  unconfirmedPieces: string[];
  stylingProps: string[];
  images: SourceImage[];
}

export interface SourceCatalog {
  note: string;
  widths: number[];
  categories: { key: string; name: string }[];
  collections: { key: string; name: string }[];
  looks: SourceLook[];
  editorial: (SourceImage & { looks: string[] })[];
  reel: {
    video: string;
    poster: string;
    posterWebp: string;
    width: number;
    height: number;
    durationSeconds: number;
  } | null;
  logoAspect: number;
}
