// 使用serviceWorker缓存资源

// 客户端打印
ExtendableMessageEvent.prototype.log = function () {
  this.source && this.source.postMessage({ type: 'log', data: JSON.parse(JSON.stringify(Array.from(arguments))) })
}

// url分割
let urlReg = /^(https?:\/\/[^\/]*)([^?]*)([^#]*)(.*)/
function splitUrl(url) {
  let urlExec = urlReg.exec(url)
  let origin = urlExec[1]
  let pathname = urlExec[2]
  let search = urlExec[3]
  let hash = urlExec[4]
  return { origin, pathname, search, hash }
}

// 獲取url參數
function getUrlParams(search) {
  let params = {}
  let searchParam = search || location.search
  if (searchParam) {
    searchParam
      .slice('1')
      .split('&')
      .forEach((param) => {
        let [key, value] = param.split('=')
        params[key] = value
      })
  }
  return params
}

// 生成正则
function createReg(arr) {
  let regList = arr.map((item) => new RegExp(item))
  return function (url) {
    return regList.some((item) => item.test(url))
  }
}

// 数据存取
let db = null
function getStore(name, mode = 'readwrite') {
  return new Promise((res, rej) => {
    if (db) {
      return res(db.transaction(name, mode).objectStore(name))
    }
    // 打开数据库
    let dbRequest = indexedDB.open('ws', 1)
    dbRequest.onsuccess = function (event) {
      db = event.target.result
      res(db.transaction(name, mode).objectStore(name))
    }
    dbRequest.onupgradeneeded = function (event) {
      let result = event.target.result
      if (!result.objectStoreNames.contains('projCacheList')) {
        let objectStore = result.createObjectStore('projCacheList', { keyPath: 'name' })
        objectStore.createIndex('name', 'name', { unique: true })
        objectStore.createIndex('count', 'count', { unique: false })
      }
    }
    dbRequest.onerror = function (err) {
      rej(err)
    }
  })
}
// 数据获取状态
function dataStatus(store) {
  return new Promise((res, rej) => {
    store.onsuccess = function () {
      res(store.result)
    }
    store.onerror = function (event) {
      rej(event)
    }
  })
}

let urlParams = getUrlParams() // 链接参数
let actName = urlParams['name'] // url的name
let buildTime = urlParams['t'] // url的t
let oldTimestamp = '' // 舊緩存時間
let maxCacheSize = 10 // 最大缓存数量;
let cacheFileList = $cacheFileList$ // 替换成构建输入文件列表
let actCacheName = actName + '_' + buildTime
let commonCacheName = 'common'

// 不缓存的列表, 从后匹配pathname
let excludeFileList = ['/version']
function checkExcludeFile(url) {
  return excludeFileList.some((item) => {
    if (splitUrl(url).pathname.endsWith(item)) {
      return true
    }
    return false
  })
}

// 缓存列表
let includeList = createReg(['^https://localhost:8080'])

// 缓存公用资源
let commonList = createReg([])

// 安装
this.addEventListener('install', async function (event) {
  console.log(`添加缓存: %c${actCacheName}\n%c缓存時間: %c${new Date(+buildTime).toLocaleString()}`, 'color: red', '', 'color: green', event)
  event.waitUntil(caches.open(actCacheName).then((cache) => cache.addAll(cacheFileList).then(this.skipWaiting)))
})

// 收到信息
this.addEventListener('message', async function (event) {
  let sourceClient = event.source
  let messageData = event.data
  let projCacheList = await getStore('projCacheList')
  switch (messageData.type) {
    // 增加权重
    case 'load':
      // event.log(`进入页面: %c${actCacheName}\n%c缓存時間: %c${new Date(+buildTime).toLocaleString()}`, 'color: red', '', 'color: green')
      let result = (await dataStatus(projCacheList.get(actName))) || { name: actName, count: 0 }
      result.count = result.count + 1
      await dataStatus(projCacheList.put(result))
      event.log(`权重%c+1\n%c当前: %c${result.count}`, 'color: red', '', 'color: green')
      break
    case 'create':
      for (let i = 0; i < 50; i++) {
        let val = parseInt(Math.random() * 1000)
        caches.open(String(val))
        projCacheList.put({ name: String(val), count: val })
      }
      break
    case 'delete':
      await Promise.all([caches.keys().then(async function (keyList) {
        return Promise.all([keyList.map(function (key) {
          let keys = key.split('_')
          // 删除同一个活动名字的缓存
          if (keys[0] === actName) {
            return caches.delete(key)
          }
        })])
      }), dataStatus(projCacheList.delete(actName))])
      sourceClient.postMessage({type: 'delete'})
      event.log(`删除%c缓存%c和%c数据`, 'color: red', '', 'color: green')
      break
    default:
      event.log(`接受信息: %c${actCacheName}\n%c缓存時間: %c${new Date(+buildTime).toLocaleString()}`, 'color: red', '', 'color: green')
      break
  }
})

// 卸载
this.addEventListener('activate', function (event) {
  // 刪除舊緩存
  event.waitUntil(
    caches.keys().then(async function (keyList) {
      let cacheMap = {} // 活动名映射缓存名
      // 清除旧活动缓存
      await Promise.all(
        keyList.map(function (key) {
          let keys = key.split('_')
          cacheMap[keys[0]] = keys
          // 删除同一个活动名字的其他缓存
          if (keys[0] === actName) {
            if (buildTime > keys[1]) {
              console.log(`删除旧项目缓存: %c${actName}\n%c缓存時間: %c${new Date(+keys[1]).toLocaleString()}`, 'color: red', '', 'color: green')
              return caches.delete(key)
            }
          }
        })
      )
      // 是否超出限制
      let projCacheList = await getStore('projCacheList')
      let all = await dataStatus(projCacheList.getAll())
      let sort = all.sort((a, b) => a.count - b.count)
      let deleteSize = sort.length - maxCacheSize
      // 超出限制处理删除低权重缓存
      if (deleteSize > 0) {
        console.log(`超出缓存限制: %c${maxCacheSize}\n%当前数量: %c${sort.length}`, 'color: red', '', 'color: green')
        let deleteList = []
        for (let i = 0; i < deleteSize; i++) {
          if (sort[i].name === actName) {
            deleteSize++
            continue
          }
          let cacheName = cacheMap[sort[i].name]
          console.log(`删除少用缓存: %c${cacheName}\n`, 'color: red')
          deleteList.push(caches.delete(cacheName), dataStatus(projCacheList.delete(sort[i].name)))
        }
        await Promise.all(deleteList)
      }
    })
  )
})

// 请求劫持
this.addEventListener('fetch', function (event) {
  // 非get请求以及非允许的域名不缓存
  if (event.request.method !== 'GET' || !includeList(event.request.url) || checkExcludeFile(event.request.url)) {
    event.respondWith(fetch(event.request))
    return
  }
  event.respondWith(
    caches.match(event.request).then(function (resp) {
      return (
        resp ||
        fetch(event.request)
          .then(function (response) {
            // 如果公用文件就放公用缓存
            return caches.open(commonList(event.request.url) ? commonCacheName : actCacheName).then(function (cache) {
              cache.put(event.request, response.clone())
              return response
            })
          })
          .catch((err) => {
            return err
          })
      )
    })
  )
})
