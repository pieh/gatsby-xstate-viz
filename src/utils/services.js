import * as XState from "xstate"
import { isProduction } from "apollo-utilities"

const services = {}

const listeners = new Set()
const onNewService = fn => {
  const wrapped = () => fn

  listeners.add(wrapped)
  return () => {
    listeners.delete(wrapped)
  }
}

const triggerUpdate = () => listeners.forEach(fn => fn()(services))

const getServices = type => {
  const servicesOfType = Object.values(services).filter(
    service => service.machine.id === type
  )
  return {
    send: event => {
      servicesOfType.forEach(s => s.service.send(event))
    },
    services: servicesOfType,
  }
}

const getService = arg => {
  if (typeof arg === `string`) {
    arg = {
      id: arg,
    }
  }

  let { id, type, args = {}, createIfNotFound = true } = arg
  if (!type) {
    // for single/global instances
    type = id
  }

  const serviceID = `${type}-${id}`
  if (serviceID in services) {
    return services[serviceID].service
  } else if (!createIfNotFound) {
    return null
  }

  const machineDef = machineLookup[type]

  console.log(machineDef)

  const machine = machineDef.withContext({
    ...machineDef.context,
    ...args,
  })

  const serviceDescription = {
    service: XState.interpret(machine).start(),
    id,
    machine,
    current: machine.initialState,
  }

  serviceDescription.service.onTransition(current => {
    serviceDescription.current = current
  })

  services[serviceID] = serviceDescription
  triggerUpdate()
  return serviceDescription.service
}

const isDev = true

const machineLookup = {}

const registerMachine = machineDef => {
  machineLookup[machineDef.id] = machineDef

  machineDef.machine.options.guards = {
    ...machineDef.machine.options.guards,
    dev: () => isDev,
    prod: () => isProduction,
  }

  // [`dev`] = () => isDev
  // machineDef.machine.options.guards[`prod`] = () => !isDev
  // console.log(machineDef)
  Object.values(services).forEach(serviceDef => {
    if (serviceDef.machine.id === machineDef.id) {
      serviceDef.service.stop()

      serviceDef.machine = machineDef.withContext(serviceDef.current.context)
      serviceDef.service = XState.interpret(serviceDef.machine).start()
      serviceDef.service.state = serviceDef.current
    }
  })
  triggerUpdate()
}

export { getService, getServices, onNewService, services, registerMachine }
