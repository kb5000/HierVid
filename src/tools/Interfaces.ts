
export interface PointObject {
  left: number;
  top: number;
}

export interface SizeObject {
  width: number;
  height: number;
}

export type Position = PointObject & SizeObject;

export const addRelativeMark = (obj: SizeObject | PointObject | Position) => {
  let res: Record<string, string> = {}
  if ("width" in obj) {
    res.height = obj.height + "%"
    res.width = obj.width + "%"
  }
  if ("top" in obj) {
    res.top = obj.top + "%"
    res.left = obj.left + "%"
  }
  return res
}
