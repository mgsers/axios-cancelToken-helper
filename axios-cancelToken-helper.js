import axios from 'axios'

const CancelToken = axios.CancelToken
let pendingRequest = []
export const REPEATSYMBOL = 'repeatRequest'

export function keyFactory(config) {
  let { method, params, data, url } = config
  params = JSON.stringify(params) || ''
  data = JSON.stringify(data) || ''
  return `${method}_${params}_${data}_${url}`
}
// 如果接口有拼接字段，则通过此函数去除
function removeString(string, target = process.env.BASE_API_URL) {
  return string.replace(target, '')
}

export function removePending(config, cb) {
  for (let i in pendingRequest) {
    if (pendingRequest[i].key === removeString(keyFactory(config))) {
      pendingRequest[i].func()
      pendingRequest.splice(i, 1)
    }
  }

  if (cb) cb()
}

export function addPending(config) {
  config.cancelToken = new CancelToken(resolve => {
    pendingRequest.push({ key: removeString(keyFactory(config)), func: resolve.bind(null, REPEATSYMBOL) })
  })
}
