import { LayoutType } from "../LayoutWrapper"

export type EventType = ("onClick" | "onCanPlay" | "onEnded" | "onDurationChange")

export class OnClickEvent {
  event: EventType = "onClick"
  sender: string
  layout: LayoutType
  args: {} = {}

  constructor(sender: string, layout: LayoutType) {
    this.sender = sender
    this.layout = layout
  }
}
