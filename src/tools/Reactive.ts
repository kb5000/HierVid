import { useEffect, useRef } from "react"

export class Observable<T> {
  onEvent: [(data: T) => void, Observable<any>][] = []
  connected: Observable<any>[] = []

  emit(val: T) {
    for (const [f, _] of this.onEvent) {
      f(val)
    }
  }

  disconnect(observable: Observable<any>) {
    const newEvents: [(data: T) => void, Observable<any>][] = []
    for (const i of this.onEvent) {
      if (i[1] !== observable) {
        newEvents.push(i)
      }
    }
    this.onEvent = newEvents
  }

  dispose() {
    this.connected.forEach(obs => {
      obs.disconnect(this)
    })
    this.connected = []
  }

  delta(judgeFunc?: (last: T, current: T) => boolean) {
    const newObs = new Observable<T>()
    newObs.connected.push(this)
    let last: T | undefined = undefined
    let first = true
    this.onEvent.push([(data) => {
      if (first) {
        first = false
        last = data
        newObs.emit(data)
      } else if ((judgeFunc && !judgeFunc(last!, data)) || (!judgeFunc && last !== data)) {
        last = data
        newObs.emit(data)
      }
    }, newObs])
    return newObs
  }

  map<E>(func: (val: T) => (E)) {
    const newObs = new Observable<E>()
    newObs.connected.push(this)
    this.onEvent.push([(data) => {
      newObs.emit(func(data))
    }, newObs])
    return newObs
  }

  filter(func: (val: T) => boolean) {
    const newObs = new Observable<T>()
    newObs.connected.push(this)
    this.onEvent.push([(data) => {
      if (func(data)) {
        newObs.emit(data)
      }
    }, newObs])
    return newObs
  }

  dropMap<E>(func: (val: T, drop: () => void) => E) {
    const newObs = new Observable<E>()
    newObs.connected.push(this)
    this.onEvent.push([(data) => {
      let needDrop = false
      let res = func(data, () => needDrop = true)
      if (needDrop) {
        newObs.emit(res)
      }
    }, newObs])
    return newObs 
  }

  triggered<E>(func: (val: T) => Promise<E>) {
    const newObs = new Observable<E>()
    newObs.connected.push(this)
    this.onEvent.push([(data) => {
      func(data).then((val) => {
        newObs.emit(val)
      })
    }, newObs])
    return newObs
  }

  delayed(func: (val: T) => boolean) {
    const newObs = new Observable<T>()
    newObs.connected.push(this)
    let saved: T[] = []
    this.onEvent.push([(data) => {
      saved.push(data)
      if (!func(data)) {
        const toEmit = saved
        saved = []
        for (const i of toEmit) {
          newObs.emit(i)
        }
      }
    }, newObs])
    return newObs
  }
  
  add(...obses: Observable<T>[]) {
    const newObs = new Observable<T>()
    newObs.connected.push(this)
    this.onEvent.push([(data) => {
      newObs.emit(data)
    }, newObs])
    for (const obs of obses) {
      newObs.connected.push(obs)
      obs.onEvent.push([(data) => {
        newObs.emit(data)
      }, newObs])
    }
    return newObs
  }

  filterLast(func: (last: T, current: T) => boolean, emitFirst?: boolean) {
    const newObs = new Observable<T>()
    let cur: [T] | [] = []
    newObs.connected.push(this)
    this.onEvent.push([(data) => {
      if (cur.length === 0) {
        cur = [data]
        if (emitFirst ?? true) {
          newObs.emit(data)
        }
        return
      }
      if (func(cur[0], data)) {
        newObs.emit(data)
      }
      cur[0] = data
    }, newObs])
    return newObs
  }

  reduce<E>(init: E, func: (acc: E, current: T) => E) {
    const newObs = new Observable<E>()
    newObs.connected.push(this)
    let acc = init;
    this.onEvent.push([(data) => {
      acc = func(acc, data)
      newObs.emit(acc)
    }, newObs])
    return newObs
  }

  buffer(judgeFunc: (buf: T[], times: number[]) => boolean) {
    const newObs = new Observable<T[]>()
    newObs.connected.push(this)
    let buf: T[] = []
    let times: number[] = []
    this.onEvent.push([(data) => {
      buf.push(data)
      times.push(Date.now())
      if (judgeFunc(buf, times)) {
        buf.pop()
        newObs.emit(buf)
        buf = [data]
        times = [times.pop()!]
      }
    }, newObs])
    return newObs
  }
}

export function useObserve<T>(orig: Observable<T>, gen: (orig: Observable<T>) => void, deps?: React.DependencyList | undefined) {
  useEffect(() => {
    const origList = new Set(orig.onEvent.map(x => x[1]))
    gen(orig)
    const diffList = orig.onEvent.filter(x => !origList.has(x[1]));

    return () => {
      diffList.forEach(x => {
        orig.disconnect(x[1])
      })
    }
  }, deps)
}

export function useReactive<T>(func: (orig: Observable<T>) => void, deps?: React.DependencyList | undefined) {
  const orig = useRef(new Observable<T>())
  useEffect(() => {
    const origList = new Set(orig.current.onEvent.map(x => x[1]))
    func(orig.current)
    const diffList = orig.current.onEvent.filter(x => !origList.has(x[1]));

    return () => {
      diffList.forEach(x => {
        orig.current.disconnect(x[1])
      })
    }
  }, deps)
  return orig.current
}
