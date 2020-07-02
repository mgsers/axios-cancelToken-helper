# axios-cancelToken-helper
axios取消重复请求好帮手

使用方法

```js
// 在同一个相同请求还没返回之前再次请求，通过拦截器取消前一次请求，只保留最后一次请求
// 通过 pendingRequest 数组进行管理，每个数组对象包括 key 唯一请求标识以及 func 保存着该次请求所缓存的 cancelToken 取消请求函数(具体参考axios cancelToken 官方文档)
// 在发出相同请求或者请求成功后，把当前请求从 pendingRequest 数组中剔除
// 从而能去除没必要的重复请求
import { addPending, removePending, REPEATSYMBOL } from './axios-cancelToken-helper'

service.interceptors.request.use(config => {
  removePending(config, () => addPending(config))
  return config
}, error => {
  return Promise.reject(error)
})

service.interceptors.response.use(response => {
  removePending(response.config)
  .....
}, error => {
  if (error.message === REPEATSYMBOL) {
    console.log('取消重复请求')
  }
})
```

