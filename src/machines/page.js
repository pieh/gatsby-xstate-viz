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
    initial: `init`,
    context: {
      path: ``,
      componentPath: ``,
      pageContext: {},
      dataDependencies: {},
      queryResult: null,
    },

    on: {
      QUERY_RESULT: {
        actions: [`handleQueryResults`],
      },
    },
    states: {
      init: {
        onEntry: [
          `initPageComponentService`,
          `readCachedContext`,
          `readCachedDataDependencies`,
        ],
        on: {
          "": [
            {
              target: `active`,
              // actions: initActions,
              //   cond: `dev`,
              // },
              // {
              //   target: `active`,
              //   // actions: initActions,
              //   cond: `prod`,
            },
          ],
        },
      },
      // inactive: {
      //   on: {
      //     QUERY_TEXT: {
      //       actions: [`invalidateQueryResult`],
      //     },
      //     DIRTY_DEPENDENCY: {
      //       actions: [`invalidateQueryResult`],
      //       cond: `isInDataDependencies`,
      //     },
      //     PAGE_ACTIVE: `active`,
      //   },
      // },
      active: {
        initial: `idle`,
        on: {
          QUERY_TEXT: {
            actions: [`invalidateQueryResult`],
            target: `active.queryRunning`,
          },
          DIRTY_DEPENDENCY: {
            actions: [
              `invalidateQueryResult` /*`getQueryTextFromPageComponent`*/,
            ],
            target: `active.waitingForQueryText`,
            cond: `isInDataDependencies`,
          },

          // PAGE_INACTIVE: `inactive`,
        },
        states: {
          idle: {},
          queryRunning: {},
          waitingForQueryText: {},
        },
      },
    },
  },
  {
    actions: {
      initPageComponentService: ctx => {
        getPageComponentService(ctx.componentPath).send({
          type: `NEW_PAGE`,
          path: ctx.path,
        })
      },
      queueQueryRunning: (ctx, event) => {
        console.log(`run query ${ctx.path}: "${event.query}"`)
      },
      invalidateDataDependencies: (ctx, event) => {
        console.log("invalidating for ", ctx.path)
      },
      handleQueryResults: function(ctx, event, a, b, c) {
        console.log("handleQueryResults", ctx, event, a, b, c, this)
      },
      getQueryTextFromPageComponent: ctx => {
        console.log("get query from page component", ctx.componentPath)
        getPageComponentService(ctx.componentPath).send({
          type: `GET_QUERY_TEXT`,
          path: ctx.path,
        })
      },
    },
    guards: {
      isInDataDependencies: (ctx, event) => true,
      dev: () => true,
      prod: () => false,
    },
  }
)

registerMachine(page)
