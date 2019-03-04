import { delay } from "../utils/misc"
// let index = 1

export type QueryStatus = "EXTRACTED" | "BABEL_ERROR" | "GRAPHQL_ERROR"

// copied from gatsby types
type RootQuery = {
  // name: string
  // path: string
  text: string
  // originalText: string
  isStaticQuery: boolean
  // hash: string

  // new stuff
  status: QueryStatus
}
export type Queries = Map<string, RootQuery>

export default async (extraFiles: string[]): Promise<Queries> => {
  // const id = index
  // console.log(`start extracting #${id}`)
  // index++
  await delay(2500)

  const TODOFiles = new Set(extraFiles)

  const result: Queries = new Map()

  result.set(`template-A`, {
    text: `extracted-query`,
    status: `EXTRACTED`,
    isStaticQuery: false,
  })
  TODOFiles.delete(`template-A`)

  result.set(`template-B`, {
    status: `GRAPHQL_ERROR`,
    text: ``,
    isStaticQuery: false,
  })

  TODOFiles.delete(`template-B`)

  TODOFiles.forEach(extraFile => {
    result.set(extraFile, {
      status: `EXTRACTED`,
      text: ``,
      isStaticQuery: false,
    })
  })

  return result
}
