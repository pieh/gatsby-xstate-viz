import { isHidden } from "./utils"

type Listener = (data: TrackerData) => void

export interface TrackerData {
  listeners: Set<Listener>
  element: Element | undefined
  rect: ClientRect | undefined
  hidden: boolean
}

class Tracker {
  public elements: Map<string, TrackerData> = new Map()
  constructor() {
    if (typeof window !== "undefined") {
      window.addEventListener("resize", () => {
        this.updateAll()
      })
    }
  }

  updateAll(): void {
    Array.from(this.elements.keys()).forEach(key => {
      this.update(null, key, this.elements.get(key)!.element)
    })
  }

  update(serviceId: string, id: string, element: Element | null | undefined) {
    if (serviceId) {
      id = `${serviceId}-${id}`
    }

    if (!this.elements.get(id)) {
      this.elements.set(id, {
        listeners: new Set(),
        element: element || undefined,
        rect: element ? element.getBoundingClientRect() : undefined,
        hidden: isHidden(element),
      })
    }
    const data = {
      ...this.elements.get(id)!,
      element: element || undefined,
      rect: element ? element.getBoundingClientRect() : undefined,
      hidden: isHidden(element),
    }

    this.notify(data)

    if (element) {
      const desc = element.querySelectorAll(`[data-id]`)

      Array.from(desc).forEach(el => {
        const id = el.getAttribute(`data-id`)!

        this.update(serviceId, id, el)
      })
    }
  }

  listen(serviceId: string, id: string, listener: Listener) {
    id = `${serviceId}-${id}`
    if (!this.elements.get(id)) {
      this.elements.set(id, {
        listeners: new Set(),
        element: undefined,
        rect: undefined,
        hidden: true,
      })
    }

    const data = this.elements.get(id)!
    data.listeners.add(listener)

    this.notify(data)
  }

  get(serviceId: string, id: string): TrackerData | undefined {
    id = `${serviceId}-${id}`
    if (this.elements.get(id)) {
      return this.elements.get(id)
    }

    return undefined
  }

  notify(data: TrackerData) {
    data.listeners.forEach(listener => {
      listener(data)
    })
  }
}

const tracker = new Tracker()

export { tracker }
