export interface TftItem {
  guid: string;
  name: string;
  nameId: string;
  id: number;
  color: Color;
  squareIconPath: string;
}

export interface Color {
  R: number;
  B: number;
  G: number;
  A: number;
}
