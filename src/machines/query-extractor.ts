import { Machine, actions, EventObject } from "xstate"
import { registerMachine, getServices, getService } from "../utils/services"
import queryExtractorImpl, {
  Queries,
  QueryStatus,
} from "../implementations/query-extractor"

type QueryExtractionResultEvent = EventObject & { data: Queries }
type RegisterFileEvent = EventObject & { componentPath: string }

interface QueryExtractorContext {
  extraFiles: string[]
}

const statusToEventType = {
  EXTRACTED: "QUERY_EXTRACTED",
  BABEL_ERROR: "QUERY_EXTRACTION_BABEL_ERROR",
  GRAPHQL_ERROR: "QUERY_EXTRACTION_GRAPHQL_ERROR",
}

const queryExtractor = Machine<QueryExtractorContext>(
  {
    id: `query-extractor`,
    initial: `waitingForInit`,
    context: {
      extraFiles: [],
    },
    states: {
      waitingForInit: {
        on: {
          SCHEMA_CREATED: {
            target: `active.extracting`,
          },
          REGISTER_FILE: {
            actions: `registerFile`,
            cond: `fileNotRegistered`,
          },
        },
      },
      active: {
        initial: `idle`,
        activities: [`watchingFiles`],
        onExit: () => {
          console.log("onExit")
        },
        states: {
          idle: {},
          extracting: {
            onExit: () => {
              console.log("onexit 2")
            },
            invoke: {
              id: `compileQueries`,
              src: async (ctx, event) => {
                return await queryExtractorImpl(ctx.extraFiles)
              },
              onDone: [
                {
                  target: `idle`,
                  actions: [`handleQueryExtractionResult`],
                  cond: `dev`,
                },
                {
                  target: `#query-extractor.done`,
                  actions: [`handleQueryExtractionResult`],
                  cond: `prod`,
                },
              ],
            },
          },
          // completed: {
          //   on: {
          //     "": [
          //       {
          //         target: `idle`,
          //         cond: `dev`,
          //       },
          //       {
          //         target: `#query-extractor.done`,
          //         cond: `prod`,
          //       },
          //     ],
          //   },
          // },
        },
        on: {
          FILE_CHANGED: `active.extracting`,
          REGISTER_FILE: {
            actions: `registerFile`,
            target: `active.extracting`,
            cond: `fileNotRegistered`,
          },
        },
      },
      done: {},
    },
  },
  {
    activities: {
      watchingFiles: () => {
        console.log("watching files")
        return () => {
          console.log("finish watching files")
        }
      },
    },
    guards: {
      dev: () => true,
      prod: () => false,
      fileNotRegistered: (ctx, event: QueryExtractionResultEvent) => {
        return (
          event.componentPath && !ctx.extraFiles.includes(event.componentPath)
        )
      },
    },
    actions: {
      handleQueryExtractionResult: (ctx, event: QueryExtractionResultEvent) => {
        console.log(`extraction done`, event)
        for (let [componentPath, query] of event.data.entries()) {
          if (query.isStaticQuery) {
          } else if (!ctx.extraFiles.includes(componentPath)) {
            console.log(
              "there are no pages using this template man",
              componentPath
            )
          } else {
            const event = {
              type: statusToEventType[query.status],
              query: query.text,
            }

            console.log(
              "sending to",
              componentPath,
              query.status,
              query.text,
              event
            )
            getService({
              type: `page-component`,
              id: componentPath,
            }).send(event)
          }
        }
        // getService(`query-extractor`)
        // const { services } = getServices(`page-component`)
        // services.id
      },

      extractQueries: () => {
        console.log("extract queries")
      },
      registerFile: actions.assign({
        extraFiles: (ctx, event: RegisterFileEvent) => {
          console.log(`register file`, event.componentPath)
          return ctx.extraFiles.concat(event.componentPath)
        },
      }),
    },
  }
)

registerMachine(queryExtractor)
