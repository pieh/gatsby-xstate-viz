import { Machine, actions } from "xstate"
import { registerMachine, getService } from "../utils/services"

const QueryState = {
  none: `NONE`,
  extracted: `EXTRACTED`,
  graphqlError: `GRAPHQL_ERROR`,
  babelError: `BABEL_ERROR`,
}

const setQueryState = state => {
  return {
    actions: actions.assign({
      queryState: state,
    }),
  }
}

const pageComponent = Machine(
  {
    id: `page-component`,
    initial: `active`,
    context: {
      query: undefined,
      queryState: QueryState.none,
      pages: new Set(),
    },
    states: {
      active: {
        onEntry: [`readCachedQuery`, `extractQuery`],
        on: {
          QUERY_EXTRACTION_GRAPHQL_ERROR: setQueryState(
            QueryState.graphqlError
          ),
          QUERY_EXTRACTION_BABEL_ERROR: setQueryState(QueryState.babelError),
          QUERY_EXTRACTED: [
            {
              actions: [`setQuery`, `tellPagesThatQueryChanged`],
              cond: (context, event) => {
                return event.query !== context.query
              },
            },
            setQueryState(QueryState.extracted),
          ],
          NEW_PAGE: {
            actions: `newPage`,
            cond: (context, event) => event.path,
          },
        },
      },
      // idle: {
      //   on: {
      //     FILE_CHANGED: `extractingQuery`,
      //     NEW_PAGE: {
      //       actions: `newPage`,
      //       cond: (context, event) => event.path,
      //     },
      //   },
      // },
    },
  },
  {
    actions: {
      setQuery: actions.assign({
        query: (ctx, event) => event.query,
        queryState: () => QueryState.extracted,
      }),
      tellPagesThatQueryChanged: (ctx, event) => {
        ctx.pages.forEach(page => {
          getService({ id: page, type: `page` }).send({
            type: "QUERY_TEXT",
            query: ctx.query,
          })
        })

        console.log(`queueQueryRunning`)
      },
      extractQuery: () => {
        getService({ id: `query-extractor` }).send(`EXTRACT_QUERY`)
        // console.log(`queueQueryExtraction`)
      },
      readCachedQuery: actions.assign({
        query: `some-cached-query`,
        // console.log(`readCachedQuery`)
      }),
      newPage: actions.assign({
        pages: (ctx, event) => {
          ctx.pages.add(event.path)

          return ctx.pages
        },
      }),
    },
  }
)

registerMachine(pageComponent)
