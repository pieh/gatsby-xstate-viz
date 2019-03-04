import { Machine } from "xstate"
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
    on: {
      RUN_QUERY: {
        actions: `addQueryToQueue`,
      },
    },
    states: {
      waitingForInit: {
        onEntry: `pauseQueryQueue`,
        on: {
          RUN_INITIAL_QUERIES: `runningQueries.initial`,
        },
      },
      runningQueries: {
        initial: `initial`,
        activities: [`runningQueries`],
        // onEntry: `reusmeQueryQueue`,
        on: {
          QUERY_RESULT: {
            actions: `sendQueryResult`,
          },
          // QUERY_QUEUE_DRAINED: {
          //   target: `idle`,
          //   // actions: `pauseQueryQueue`,
          // },
          API_RUNNING_START: {
            target: `waitingForAPIsToFinish`,
            // actions: `pauseQueryQueue`,
          },
        },
        states: {
          // states: {
          initial: {
            on: {
              QUERY_QUEUE_DRAINED: [
                {
                  target: `active-in-dev`,
                  cond: `dev`,
                },
                {
                  target: `#query-runner.done`,
                  cond: `prod`,
                },
              ],
            },
          },
          "active-in-dev": {},
          // },
        },
      },
      waitingForAPIsToFinish: {
        on: {
          API_RUNNING_QUEUE_EMPTY: `runningQueries`,
          QUERY_RESULT: {
            actions: `addQueryToQueue`,
          },
        },
      },
      done: {
        // on: {
        //   RUN_QUERY: {
        //     actions: `this-should-not-happen`,
        //   },
        // },
      },
    },
  },
  {
    // guards: {
    //   dev: () => true,
    //   prod: () => false,
    // },
    activities: {
      runningQueries: () => {
        console.log("running queries")
        return () => {
          console.log("pausing query running")
        }
      },
    },
    actions: {
      addQueryToQueue: (ctx, event) => {
        console.log(`add to the queue`, ctx, event)
      },
    },
  }
)

registerMachine(queryRunner)
