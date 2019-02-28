import React from "react"
import { StateChart } from "../state-chart"
import { Machine, interpret, actions } from "xstate"

const { assign } = actions

// const machineDef =

// const machine = JSON.stringify(machineDef)

const machine = Machine(
  {
    id: `pageComponents`,
    initial: `inactive`,
    context: {
      isInBootstrap: true,
      componentPath: ``,
      query: ``,
    },
    states: {
      inactive: {
        id: "hmmm",
        on: {
          // Transient transition
          // Will transition to either 'inactiveWhileBootstrapping' or 'extractingQueries'
          // immediately upon entering 'inactive' state if the condition is met.
          "": [
            { target: `inactiveWhileBootstrapping`, cond: `isBootstrapping` },
            { target: `extractingQueries`, cond: `isNotBootstrapping` },
          ],
        },
      },
      inactiveWhileBootstrapping: {
        on: {
          BOOTSTRAP_FINISHED: {
            target: `extractingQueries`,
            actions: `setBootstrapFinished`,
          },
          QUERY_EXTRACTED: `runningPageQueries`,
          QUERY_EXTRACTION_GRAPHQL_ERROR: `queryExtractionGraphQLError`,
          QUERY_EXTRACTION_BABEL_ERROR: `queryExtractionBabelError`,
        },
      },
      extractingQueries: {
        onEntry: [`extractQueries`],
        on: {
          BOOTSTRAP_FINISHED: {
            actions: `setBootstrapFinished`,
          },
          QUERY_CHANGED: `runningPageQueries`,
          QUERY_DID_NOT_CHANGE: `idle`,
          QUERY_EXTRACTION_GRAPHQL_ERROR: `queryExtractionGraphQLError`,
          QUERY_EXTRACTION_BABEL_ERROR: `queryExtractionBabelError`,
        },
      },
      queryExtractionGraphQLError: {
        on: {
          PAGE_COMPONENT_CHANGED: `extractingQueries`,
          BOOTSTRAP_FINISHED: {
            actions: `setBootstrapFinished`,
          },
        },
      },
      queryExtractionBabelError: {
        on: {
          PAGE_COMPONENT_CHANGED: `extractingQueries`,
          BOOTSTRAP_FINISHED: {
            actions: `setBootstrapFinished`,
          },
        },
      },
      runningPageQueries: {
        onEntry: [`setQuery`, `runPageComponentQueries`],
        on: {
          BOOTSTRAP_FINISHED: {
            actions: `setBootstrapFinished`,
          },
          QUERIES_COMPLETE: `idle`,
        },
      },
      idle: {
        on: {
          PAGE_COMPONENT_CHANGED: `extractingQueries`,
          BOOTSTRAP_FINISHED: {
            actions: `setBootstrapFinished`,
          },
        },
      },
    },
  },
  {
    guards: {
      isBootstrapping: context => context.isInBootstrap,
      isNotBootstrapping: context => !context.isInBootstrap,
    },
    actions: {
      extractQueries: () => {
        // const {
        //   debounceCompile,
        // } = require(`../../internal-plugins/query-runner/query-watcher`)
        // debounceCompile()
      },
      runPageComponentQueries: context => {
        // const {
        //   queueQueriesForPageComponent,
        // } = require(`../../internal-plugins/query-runner/query-watcher`)
        // // Wait a bit as calling this function immediately triggers
        // // an Action call which Redux squawks about.
        // setTimeout(() => {
        //   queueQueriesForPageComponent(context.componentPath)
        // }, 0)
      },
      setQuery: assign({
        query: (ctx, event) => {
          if (event.query) {
            return event.query
          } else {
            return ctx.query
          }
        },
      }),
      setBootstrapFinished: assign({
        isInBootstrap: false,
      }),
    },
  }
)

console.log({ machine })

export default () => (
  <div>
    <StateChart height="100vh" machine={machine} />
  </div>
)
