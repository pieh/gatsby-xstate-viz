import { Machine } from "xstate"
import { registerMachine, getService } from "../utils/services"
import { delay, actions } from "../utils/misc"

const bootstrap = Machine(
  {
    id: `bootstrap`,
    initial: `init`,
    states: {
      init: {
        on: {
          BOOTSTRAP_START: `createPages`,
        },
      },
      createPages: {
        onEntry: `createPages`,
        on: {
          CREATE_PAGES_END: `extractQueries`,
        },
      },
      extractQueries: {
        onEntry: `extractQueries`,
        on: {
          QUERIES_EXTRACTED: `runQueries`,
        },
      },
      runQueries: {
        onEntry: `runInitialQueries`,
        QUERY_QUEUE_DRAINED: `idle`,
      },
      idle: {},
    },
  },
  {
    actions: {
      extractQueries: () => {
        getService(`query-extractor`).send(`SCHEMA_CREATED`)
      },
      runInitialQueries: () => {
        getService(`query-runner`).send(`RUN_INITIAL_QUERIES`)
      },
      createPages: async () => {
        await delay(1000)
        actions.createPage({
          path: `/`,
          component: "templates/index.js",
        })
        actions.createPage({
          path: `/post-A`,
          component: "templates/post.js",
        })
        actions.createPage({
          path: `/post-B`,
          component: "templates/post.js",
        })

        await delay(1000)
        getService(`bootstrap`).send(`CREATE_PAGES_END`)
      },
    },
  }
)

registerMachine(bootstrap)
