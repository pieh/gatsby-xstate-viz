import { Machine } from "xstate"
import { registerMachine, getService } from "../utils/services"

const getPageComponentService = componentPath =>
  getService({
    id: componentPath,
    type: `page-component`,
    args: {
      componentPath,
    },
  })

const page = Machine(
  {
    id: `page`,
    initial: `initial`,
    context: {
      path: ``,
      componentPath: ``,
      pageContext: {},
      dataDependencies: {},
    },
    states: {
      initial: {
        onEntry: [
          `initPageComponentService`,
          `readCachedContext`,
          `readCachedDataDependencies`,
        ],
        on: {
          "": {
            target: `idle`,
          },
        },
      },
      idle: {
        on: {
          QUERY_TEXT: {
            actions: [`invalidateQueryResult`, `queueQueryRunning`],
          },
          CREATE_NODE: {
            actions: [`invalidateQueryResult`, `getQueryTextFromPageComponent`],
            cond: `isInDataDependencies`,
          },
          DELETE_NODE: {
            actions: [`invalidateQueryResult`, `getQueryTextFromPageComponent`],
            cond: `isInDataDependencies`,
          },
        },
      },
    },
  },
  {
    actions: {
      initPageComponentService: context => {
        getPageComponentService(context.componentPath).send({
          type: `NEW_PAGE`,
          path: context.path,
        })
      },
      queueQueryRunning: (ctx, event) => {
        console.log(`run query ${ctx.path}: "${event.query}"`)
      },
      invalidateDataDependencies: () => {},
    },
    guards: {
      isInDataDependencies: (ctx, event) => false,
    },
  }
)

registerMachine(page)
