import { Machine, actions } from "xstate"
import { registerMachine, getService } from "../utils/services"

const pageComponent = Machine(
  {
    id: `page-component`,
    initial: `init`,
    context: {
      query: undefined,
      pages: [],
    },

    // onEntry: [],
    on: {
      NEW_PAGE: {
        actions: `newPage`,
        cond: `pathNotRegistered`,
      },
      QUERY_EXTRACTION_GRAPHQL_ERROR: `graphqlError`,
      QUERY_EXTRACTION_BABEL_ERROR: `babelError`,
      QUERY_EXTRACTED: [
        {
          target: `success`,
          actions: [`setQuery`, `sendQueryTextToAllPages`],
          // cond: `queryChanged`,
        },
        // {
        //   target: `success`,
        // },
      ],
    },
    states: {
      init: {
        onEntry: [`registerInQueryExtractor`, `readCachedQuery`],
      },
      none: {},
      success: {
        // onEntry: `warnIfNoPages`,
        on: {
          GET_QUERY_TEXT: {
            actions: `sendQueryTextToSinglePage`,
            cond: `pathRegistered`,
          },
        },
      },
      babelError: {},
      graphqlError: {},
    },
  },
  {
    guards: {
      queryChanged: (context, event) => {
        return event.query !== context.query
      },
      pathRegistered: (ctx, event) => {
        return ctx.pages.includes(event.path)
      },
      pathNotRegistered: (context, event) => {
        return event.path && !context.pages.includes(event.path)
      },
    },
    actions: {
      // warnIfNoPages: ctx => {
      //   if (ctx.pages.length === 0) {
      //     console.log("no pages", ctx.componentPath)
      //   }
      // },
      setQuery: actions.assign({
        query: (ctx, event) => {
          console.log("set query", event)
          return event.query
        },
      }),
      sendQueryTextToSinglePage: (ctx, event) => {
        getService({ id: event.path, type: `page` }).send({
          type: "QUERY_TEXT",
          query: ctx.query,
        })
      },
      sendQueryTextToAllPages: (ctx, event) => {
        console.log("sending query")
        ctx.pages.forEach(page => {
          getService({ id: page, type: `page` }).send({
            type: "QUERY_TEXT",
            query: ctx.query,
          })
        })

        // console.log(`queueQueryRunning`)
      },
      extractQuery: () => {
        getService({ id: `query-extractor` }).send(`EXTRACT_QUERY`)
      },
      readCachedQuery: actions.assign({
        query: `some-cached-query`,
      }),
      newPage: actions.assign({
        pages: (ctx, event) => {
          console.log(`new page "${ctx.componentPath}" = ${event.path}`)
          return ctx.pages.concat(event.path)
        },
      }),
      registerInQueryExtractor: (ctx, event) => {
        console.log("aaa", ctx)
        getService(`query-extractor`).send({
          type: `REGISTER_FILE`,
          componentPath: ctx.componentPath,
        })
      },
    },
  }
)

registerMachine(pageComponent)
