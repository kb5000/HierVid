import {v4 as uuidv4} from 'uuid'

export class Category {
  constructor(
    public name: string = "",
    public image: string = "",
    public description: string = "",
  ) {}
}

export class Template {
  constructor(
    public name: string = "",
    public image: string = "",
    public description: string = "",
    public type: string = "",
    public settings: any,
  ) {}
}
