import { getService } from "./services"

export const delay = (timeout = 500) =>
  new Promise(resolve => setTimeout(resolve, timeout))

export const actions = {
  createPage: ({ path, component: componentPath }) => {
    getService({
      id: path,
      type: `page`,
      args: {
        path,
        componentPath,
      },
    })
  },
}
