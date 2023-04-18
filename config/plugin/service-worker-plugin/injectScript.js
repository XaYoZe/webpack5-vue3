// buildTime: 打包时间
// actName: 活动名
// outputName: serviceworker文件名
window.buildTime = $buildTime$
// url分割
let urlReg = /^(https?:\/\/[^\/]*)([^?]*)([^#]*)(.*)/
function splitUrl(url = location.href) {
  let urlExec = urlReg.exec(url)
  let origin = urlExec[1]
  let pathname = urlExec[2]
  let search = urlExec[3]
  let hash = urlExec[4]
  return { origin, pathname, search, hash }
}

// 獲取url參數
function getUrlParams(search = location.search) {
  let params = {}
  let searchParam = search
  if (searchParam) {
    searchParam
      .slice('1')
      .split('&')
      .forEach((param) => {
        let [key, value] = param.split('=')
        params[key] = value || true
      })
  }
  return params
}

// 重定向链接
function createRedirectedUrl(url, timestamp) {
  let urlObj = splitUrl(url)
  let newSearch = '?'
  let searchParamsArr = []
  let searchParams = getUrlParams(urlObj.search)
  searchParams['t'] = timestamp
  for (let prop in searchParams) {
    searchParamsArr.push(prop + '=' + searchParams[prop])
  }
  newSearch += searchParamsArr.join('&')
  return `${urlObj.origin}${urlObj.pathname}${newSearch}${urlObj.hash}`
}

// 获取版本时间
function getVersion (callback) {
  if (window.fetch) {
    fetch('./version', { cache: 'no-cache' })
    .then((res) => res.text())
    .then((version) => {
      callback(version)
    })
  } else {
    let xhq = new XMLHttpRequest();
    xhq.onreadystatechange = function () {
        if (xhq.readyState === 4) {
          callback(xhq.responseText);
        }
    }
    xhq.open('get', './version')
    xhq.setRequestHeader('cache-control', 'no-cache')
    xhq.send()
  }
}

// 重定向
getVersion((version) => {
  let upgrade = buildTime < version
  setTimeout(() => {
    console.log('页面更新:%c' + upgrade + '\n%c打包时间:%c' + (new Date(buildTime)).toLocaleString(), 'color: red', '', 'color: green')
  }, 1000)
  if (upgrade) {
    let newUrl = createRedirectedUrl(location.href, version)
    location.replace(newUrl)
  }
})

if ('serviceWorker' in navigator) {
  let swReg = null;
  function onMessage (event) {
    let message = event.data
    switch (message.type) {
      case 'log': // 打印
        console.log.apply(null, message.data)
        break
      case 'delete': // 删除数据完成
        navigator.serviceWorker.removeEventListener('message', onMessage)
        swReg && swReg.unregister();
        break
    default:
        console.log(event)
        break
    }
  }
  navigator.serviceWorker.addEventListener('message', onMessage);
  // 参数带有noSw取消注册sw
  if (getUrlParams().noSw) {
    navigator.serviceWorker.getRegistration(location.href).then(res => {
      if (res) { 
        swReg = res;
        res.active && res.active.postMessage({type: 'delete'})
      }
    })
  } else {
    navigator.serviceWorker.register('$outputName$?t=$buildTime$&name=$projName$').then((reg) => {
      if (reg.installing || reg.active) {
        (reg.installing || reg.active).postMessage({ type: 'load', data: { url: location.href } })
      }
    })
  }
}