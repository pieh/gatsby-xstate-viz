import { Machine, actions } from "xstate"
import { registerMachine } from "../utils/services"

const queryQueueStates = {
  none: `NONE`,
  paused: `PAUSED`,
  running: `RUNNING`,
}

const queryRunner = Machine(
  {
    id: `query-runner`,
    initial: `waitingForInit`,
    context: {
      queueState: queryQueueStates.none,
    },
    states: {
      waitingForInit: {
        onEntry: `pauseQueryQueue`,
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
        onEntry: `reusmeQueryQueue`,
        on: {
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
          API_RUNNING_START: {
            target: `waitingForAPIsToFinish`,
            actions: `pauseQueryQueue`,
          },
          RUN_QUERY: {
            actions: `addQueryToQueue`,
          },
        },
      },
      waitingForAPIsToFinish: {
        on: {
          API_RUNNING_QUEUE_EMPTY: `runningQueries`,
          RUN_QUERY: {
            actions: `addQueryToQueue`,
          },
          QUERY_RESULT_SUCESS: {
            actions: `addQueryToQueue`,
          },
          QUERY_RESULT_ERROR: {
            actions: `addQueryToQueue`,
          },
        },
      },
      idle: {
        on: {
          RUN_QUERY: `runningQueries`,
          RUN_QUERY: {
            actions: `addQueryToQueue`,
          },
        },
      },
    },
  },
  {
    actions: {
      pauseQueryQueue: actions.assign({
        queueState: queryQueueStates.paused,
      }),
      reusmeQueryQueue: actions.assign({
        queueState: queryQueueStates.running,
      }),
    },
  }
)

registerMachine(queryRunner)
