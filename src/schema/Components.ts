import { ComponentType } from "./PlayModel";

export class Video {}


export interface PortData {
  target: string;
  fromTime: number;
  toTime: number;
}

export interface VideoPort {
  outId: string;
  time: number;
  outTime: number;
}

export interface SingleVideoNodeData {}
export interface MultipleVideoNodeData {}

export interface VideoNode {
  id: string;
  highlight: boolean;
  folded: boolean;
  width: number;
  ports: VideoPort[];
  data: SingleVideoNodeData | MultipleVideoNodeData;
}

export interface TimeNodeData {
  id: string;
  parent: string | null;
  width: number;
  ports: PortData[];
  data: {
    component?: string
    type?: ComponentType
  };
}
