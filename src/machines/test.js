// Available variables:
// Machine (machine factory function)
// XState (all XState exports)

const sameActionsForPageComponent = {
  QUERY_CHANGED: {
    target: `idle`,
    actions: [`queueQueryRunning`, `invalidateQueryResults`],
  },
  QUERY_EXTRACTION_GRAPHQL_ERROR: `queryExtractionGraphQLError`,
  QUERY_EXTRACTION_BABEL_ERROR: `queryExtractionBabelError`,
  FILE_CHANGED: {
    target: `extractingQuery`,
    actions: `queueQueryExtraction`,
  },
}

const QueryState = {
  none: 0,
  extracted: 1,
  graphqlError: 2,
  babelError: 3,
}

const lightMachine = Machine({
  type: `parallel`,
  states: {
    page: {
      initial: `initial`,
      states: {
        initial: {
          on: {
            "": {
              actions: `getPageComponentMachine`,
              target: `idle`,
            },
          },
        },
        idle: {},
      },
    },
    pageComponent: {
      initial: `initial`,
      context: {
        query: ``,
        queryState: QueryState.none,
      },
      states: {
        initial: {
          on: {
            "": {
              actions: `queueQueryExtraction`,
              target: `idle`,
            },
          },
        },
        idle: {
          on: {
            FILE_CHANGED: {
              target: `extractingQuery`,
              actions: `queueQueryExtraction`,
            },
          },
        },
        extractingQuery: {
          on: {
            QUERY_EXTRACTION_GRAPHQL_ERROR: {
              target: `idle`,
              actions: `test`,
            },
          },
        },
      },
    },
    queryRunner: {
      initial: `initial`,
      states: {
        initial: {
          on: {
            "": {
              target: `waitingForInit`,
              actions: `pauseQueryQueue`,
            },
          },
        },
        waitingForInit: {
          on: {
            RUN_INITIAL_QUERIES: {
              actions: `runQueries`,
              target: `runningQueries`,
            },
            RUN_QUERY: {
              actions: `addQueryToQueue`,
            },
          },
        },
        runningQueries: {
          on: {
            "": {
              actions: `reusmeQueryQueue`,
            },
            QUERY_RESULT_SUCESS: {
              actions: `emitQueryResults`,
            },
            QUERY_RESULT_ERROR: {
              actions: `emitQueryError`,
            },
            QUERY_QUEUE_DRAINED: {
              target: `idle`,
              actions: `pauseQueryQueue`,
            },
            CREATE_NODE: {
              target: `waitingForAPIsToFinish`,
              actions: `pauseQueryQueue`,
            },
          },
        },
        waitingForAPIsToFinish: {
          on: {
            API_RUNNING_QUEUE_EMPTY: `runningQueries`,
          },
        },
        idle: {
          on: {
            RUN_QUERY: `runningQueries`,
          },
        },
      },
    },
    queryExtractor: {
      initial: `initial`,
      states: {
        initial: {
          on: {
            SCHEMA_CREATED: `idle`,
            EXTRACT_QUERY_COMMAND: {
              actions: `addPathToQueue`,
            },
          },
        },
        idle: {
          on: {
            "": {
              actions: `extractQueuedComponents`,
            },
            EXTRACT_QUERY_COMMAND: {
              actions: `extractQueuedComponents`,
            },
          },
        },
      },
    },
  },
})
