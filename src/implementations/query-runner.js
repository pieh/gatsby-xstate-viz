import BetterQueueMemory from "better-queue-memory"
import BetterQueue from "better-queue"
import { delay } from "../utils/misc"
import { getService } from "../utils/services"

// console.log(BetterQueueMemory, BetterQueue)

const q = new BetterQueue(
  async (task, cb) => {
    console.log("[query-runner] handling", task)
    await delay(1000)

    cb(null, { task, result: `ok` })
  },
  {
    store: new BetterQueueMemory(),
    // filter: (task, cb) => {
    //   return false
    // },
    merge: (oldTask, newTask, cb) => {
      cb(null, newTask)
    },
  }
)

const pauseQueryQueue = () => {
  // console.log("[query-runner] pausing")
  q.pause()
}
const resumeQueryQueue = () => {
  // console.log("[query-runner] resuming")
  q.resume()
}
const addToQueryToQueue = arg => {
  // console.log("adding task", arg)
  // return new Promise(resolve => {
  q.push(arg, (e, result) => {
    getService(`query-runner`).send({
      type: `QUERY_RESULT`,
      ...result,
    })
    // console.log(e, result)
  })
  // })
}

q.drain = () => {
  getService(`query-runner`).send(`QUERY_QUEUE_DRAINED`)
}

export { pauseQueryQueue, resumeQueryQueue, addToQueryToQueue }
