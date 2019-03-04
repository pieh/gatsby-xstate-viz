export const delay = (timeout = 500) =>
  new Promise(resolve => setTimeout(resolve, timeout))
