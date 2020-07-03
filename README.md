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

源码解读

```js
// 在请求之前先判断是否设置config.cancelToken，有则监听cancelToken实例的promise
// 如果其promise resolve之后，则调用request的abort方法切断请求
if (config.cancelToken) {
  // Handle cancellation
  config.cancelToken.promise.then(function onCanceled(cancel) {
    if (!request) {
      return;
    }

    request.abort();
    reject(cancel);
    // Clean up request
    request = null;
  });
}
// cancelToken文件
function CancelToken(executor) {
  if (typeof executor !== 'function') {
    throw new TypeError('executor must be a function.');
  }
  // 这里的就是上述监听的promise，把这个promise的执行权交给resolvePromise变量，并暴露给executor函数
  // executor执行则resolve promise，从而触发上述request.abort方法
  var resolvePromise;
  this.promise = new Promise(function promiseExecutor(resolve) {
    resolvePromise = resolve;
  });

  var token = this;
  executor(function cancel(message) {
    if (token.reason) {
      // Cancellation has already been requested
      return;
    }

    token.reason = new Cancel(message);
    resolvePromise(token.reason);
  });
}
// 只是一个包装的语法糖，方便调用
CancelToken.source = function source() {
  var cancel;
  var token = new CancelToken(function executor(c) {
    cancel = c;
  });
  return {
    token: token,
    cancel: cancel
  };
};
```

