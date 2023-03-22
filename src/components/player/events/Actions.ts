import { EventType } from "./Events";

export type ActionType = ("jump")

export interface JumpAction {
  sender: string,
  event: EventType,
  action: "jump",
  args: {
    target: string,
  },
}
