import React from "react"

interface SetModel<T> {
  (setVal: (cloned: T) => void): void
}

export class ModelContext<T> {
  val: [T, SetModel<T>]
  Context: React.Context<[T, SetModel<T>]>
  updater?: (val: [T, SetModel<T>]) => void

  constructor(init: T) {
    this.val = [init, (setVal: (cloned: T) => void) => {
      setVal(this.val[0])
      this.updater?.([...this.val])
    }]
    this.Context = React.createContext(this.val)
  }
}
