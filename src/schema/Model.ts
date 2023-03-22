import { ModelContext } from "../tools/ModelContext"

export class Model {
  basicClass: string | null = null
  template: string | null = null
  val = ""
}

export const Context = new ModelContext(new Model())
