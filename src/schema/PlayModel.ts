import { BranchConfig } from "../pages/flowPages/Branch/Config"
import { CheckConfig } from "../pages/flowPages/Check/Config"
import { CycleConfig } from "../pages/flowPages/Cycle/Config"
import { TimeNodeData } from "./Components"

export interface EventModel {
  sender: string,
  event: string,
  action: string,
  args: Record<string, any>,
}

export type TemplateConfigType = BranchConfig | CycleConfig | CheckConfig
export type ComponentType = "Branch" | "Cycle" | "Check"

export interface TemplateModel {
  selectedClass: any,
  template: ComponentType | "",
  templateConfig: TemplateConfigType | null,
  componentConfig: Record<string, TemplateConfigType>
  currentConfig: { type: ComponentType, name: string } | null
}

export class PlayModel {
  objTab: Record<string, any> = {}
  root: string = ""
  events: EventModel[] = []
  timeNodes: Record<string, TimeNodeData> = {}
  timeArrs: Record<string, string[]> = {}
  templateData: TemplateModel = {
    selectedClass: null,
    template: "",
    templateConfig: null,
    componentConfig: {},
    currentConfig: null,
  }
}

export const clearModel = (draft: PlayModel) => {
  draft.root = "root"
  draft.objTab = {
    root: {
      data: {},
      rootLayout: "start",
      rootComponent: "returnComponent",
    },
    returnComponent: {
      id: "returnComponent",
      type: "Sequential",
      layoutType: "Component",
      parent: null,
      endTo: null,
      children: [
        {
          type: "Layout",
          id: "rootLayout",
        },
      ],
    },
  };
  draft.events = [];
  draft.timeNodes = {};
  draft.timeArrs = { _null: [] };
  draft.templateData = {
    selectedClass: draft.templateData.selectedClass,
    template: "",
    templateConfig: null,
    componentConfig: {},
    currentConfig: null,
  };
}

export class Scene {
  rootLayout: string = ""
  rootComponent: string = ""
  data: any
}

export class Layout {
  id: string = ""
  type: string = "Video"
  layoutType: "Layout" = "Layout"
  parent: string | null = null
  endTo: string | null = null
  data: any
}

export class ComponentModel {
  id: string = ""
  type: "Sequential" | "Parallel" = "Sequential"
  layoutType: "Component" = "Component"
  parent: string | null = null
  endTo: string | null = null
  children: {type: "Layout" | "Component", id: string}[] = []
}

export function pickFirst(target: Layout | ComponentModel, objs: Record<string, any>): string | null {
  if (target.layoutType === "Layout") {
    return target.id
  } else {
    const res = (objs[target.children[0]?.id] as (Layout | ComponentModel | undefined)) ?? null
    if (res) {
      return pickFirst(res, objs)
    } else {
      return null
    }
  }
}

export function pickNext(target: Layout | ComponentModel, objs: Record<string, any>): string | null {
  if (target.endTo) return target.endTo
  if (target.parent === null) return null
  const par = objs[target.parent] as ComponentModel
  if (par.type === "Sequential") {
    const idx = par.children.findIndex(x => x.id === target.id)
    if (idx === -1) return null
    if (idx < par.children.length - 1) {
      const res = (objs[par.children[idx + 1].id] as (Layout | ComponentModel)) ?? null
      if (res) {
        return pickFirst(res, objs)
      } else {
        return null
      }
    } else {
      return pickNext(par, objs)
    }
  } else {
    return pickNext(par, objs)
  }
}

export function pickFirst2(current: string | null, objs: PlayModel): string | null {
  let res = current === null ? objs.timeArrs["_null"][0] : current
  while (res in objs.timeArrs) {
    res = objs.timeArrs[res][0]
  }
  return res
}

export function pickNext2(current: string, objs: PlayModel): string | null {
  let depth = 0;
  let tres: string | null = current;
  while (tres) {
    tres = objs.timeNodes[tres].parent
    depth += 1
  }
  
  const pickNextHelper = (current: string, objs: PlayModel, depth: number): string | null => {
    if (depth % 2 === 0) {
      // parallel
      return pickNextHelper(objs.timeNodes[current].parent!, objs, depth - 1)
    }
    const par = objs.timeNodes[current].parent ?? "_null"
    const idx = objs.timeArrs[par].findIndex(x => x === current)
    if (idx === -1) return null
    if (idx < objs.timeArrs[par].length - 1) {
      const res = objs.timeArrs[par][idx + 1]
      return pickFirst2(res, objs)
    } else {
      if (par === "_null") return null
      else return pickNextHelper(par, objs, depth - 1)
    }
  }

  return pickNextHelper(current, objs, depth)
}
