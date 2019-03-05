// // import { queue } from "async-es"
import BetterQueueMemory from "better-queue-memory"
import BetterQueue from "better-queue"
import { delay } from "../utils/misc"
import { getService } from "../utils/services"

console.log(BetterQueueMemory, BetterQueue)

const q = new BetterQueue(
  async (task, cb) => {
    console.log("[query-runner] handling", task)
    await delay(1000)
    cb(null, { task })
  },
  {
    store: new BetterQueueMemory(),
  }
)

console.log(q)
const pauseQueryQueue = () => q.pause()
const resumeQueryQueue = () => q.resume()
const addToQueryToQueue = arg => {
  console.log("adding task")
  return new Promise(resolve => {
    q.push(arg, (err, data) => {
      resolve()

      console.log("finished task", { arg, err, data })

      // getService(`query-runner`).send({
      //   type: `QUERY_RESULT`,
      //   data:
      // })
    })
  })
}

q.drain = () => {
  getService(`query-runner`).send(`QUERY_QUEUE_DRAINED`)
}

// console.log(BetterQueueMemory, BetterQueue)

export { pauseQueryQueue, resumeQueryQueue, addToQueryToQueue }
// const noop = () => {}
// export {
//   noop as pauseQueryQueue,
//   noop as resumeQueryQueue,
//   noop as addToQueryToQueue,
// }
