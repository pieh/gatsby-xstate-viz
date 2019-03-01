import { Machine, actions } from "xstate"
import { registerMachine, getServices } from "../utils/services"

const queryExtractor = Machine(
  {
    id: `query-extractor`,
    initial: `waitingForInit`,
    context: {
      extractionScheduled: true,
    },
    states: {
      waitingForInit: {
        on: {
          SCHEMA_CREATED: {
            target: `active`,
            actions: `extractQueries`,
          },
        },
      },
      active: {
        // onEntry: `extractQueries`,
        on: {
          EXTRACT_QUERY: {
            actions: `extractQueries`,
          },
          FILE_CHANGED: {
            actions: `extractQueries`,
          },
        },
      },
    },
  },
  {
    actions: {
      extractQueries: actions.assign({
        extractionScheduled: (ctx, event) => {
          console.log("extract")
          // setTimeout(() => {
          //   getServices(`page-component`).send({
          //     type: `QUERY_EXTRACTED`,
          //     query: `some-cached-query`,
          //   })
          // }, 1000)

          return false
        },
      }),
    },
  }
)

registerMachine(queryExtractor, `query-extractor`)
