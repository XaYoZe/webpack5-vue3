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
let projName = urlParams['name'] // url的name
let buildTime = urlParams['t'] // url的t
let oldTimestamp = '' // 舊緩存時間
let maxCacheSize = 10 // 最大缓存数量;
let cacheFileList = $cacheFileList$ // 替换成构建输入文件列表
let projCacheName = projName + '_' + buildTime
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
let includeList = createReg(['^http://localhost:8080'])

// 缓存公用资源
let commonList = createReg([])

/**
 * 刪除指定項目緩存
 * @param {string} tagetName 目標緩存名
 * @param {function} filter 過濾條件
 * @returns 
 */
function deleteProjCache (tagetName, filter) {
  let projNameReg = new RegExp('^' + tagetName);
  return caches.keys().then(async function (keyList) {
    return Promise.all(keyList.map(cacheName =>{
      if (projNameReg.test(cacheName) && (!filter || filter && filter(cacheName))) {
        console.log(`删除項目缓存: %c${cacheName}\n%c缓存時間: %c${new Date(+cacheName.split('_')[1]).toLocaleString()}`, 'color: red', '', 'color: green')
        return caches.delete(cacheName)
      }
    }))
  })
}

// 刪除舊緩存
function deleteOldCache () {
  return deleteProjCache(projName, cacheName => {
    console.log(cacheName, projCacheName, cacheName !== projCacheName)
    return cacheName !== projCacheName
  })
}

// 刪除不常用緩存
async function deleteLowUseCache () {
  // 是否超出限制
  let projCacheList = await getStore('projCacheList')
  let all = await dataStatus(projCacheList.getAll())
  let sort = all.sort((a, b) => b.count - a.count)
  let deleteSize = sort.length - maxCacheSize
  let deleteList = []
  // 超出限制处理删除低权重缓存
  if (deleteSize > 0) {
    console.log(`超出缓存限制: %c${maxCacheSize}\n%c%当前数量: %c${sort.length}`, 'color: red', '', 'color: green')
    for (let i = 0; i < deleteSize; i++) {
      if (sort[i].name === projName) {
        deleteSize++
        continue
      }
      console.log(`删除低活跃缓存: %c${cacheName}\n`, 'color: red')
      deleteList.push(deleteProjCache(sort[i].name), dataStatus(projCacheList.delete(sort[i].name)))
    }
  }
  return Promise.all(deleteList)
}

// 安装
this.addEventListener('install', async function (event) {
  console.log(`添加缓存: %c${projCacheName}\n%c缓存時間: %c${new Date(+buildTime).toLocaleString()}`, 'color: red', '', 'color: green', event)
  let staticPathReg = /^static\/|\/static\//
  event.waitUntil(Promise.all(cacheFileList.map(async cachePath => {
    // 跳過靜態資源
    if (staticPathReg.test(cachePath)) return
    // 只添加已有緩存
    let cacheStore =  await caches.open(projCacheName);
    return caches.match(cachePath).then(resp=> resp && cacheStore.put(cachePath, resp))
  })).then(this.skipWaiting))
})

// 收到信息
this.addEventListener('message', async function (event) {
  let sourceClient = event.source
  let messageData = event.data
  let projCacheList = await getStore('projCacheList')
  switch (messageData.type) {
    // 增加权重
    case 'load':
      let curItem = null;
      let curName = messageData.data || projName;
      let all = await dataStatus(projCacheList.getAll())
      for (let i = 0; i < all.length; i++) {
        let item = all[i];
        if (item.name == curName) {
          curItem = item
          item.count = Math.max(Math.min(item.count - 1, item.count), 0);
        } else {
          item.count++
        }
        await dataStatus(projCacheList.put(item))
      }
      if (!curItem) {
        dataStatus(projCacheList.add({ name: curName, count: 0 }))
      }
      break
    case 'create':
      for (let i = 0; i < 50; i++) {
        let val = parseInt(Math.random() * 1000)
        caches.open(String(val))
        projCacheList.put({ name: String(val), count: val })
      }
      break
    case 'delete':
      deleteLowUseCache()
      event.log(`删除%c缓存%c和%c数据`, 'color: red', '', 'color: green')
      break
    case 'unregister':
      await deleteProjCache(projName)
      projCacheList = await getStore('projCacheList')
      await dataStatus(projCacheList.delete(projName))
      sourceClient.postMessage({type: 'deleteEnd'});
      break
    default:
      event.log(`接受信息: %c${projCacheName}\n%c缓存時間: %c${new Date(+buildTime).toLocaleString()}`, 'color: red', '', 'color: green')
      break
  }
})

// 卸载
this.addEventListener('activate', function (event) {
  // 刪除舊緩存
  event.waitUntil(
    caches.keys().then(async function (keyList) {
      let cacheMap = {} // 項目名映射缓存名
      // 清除旧項目缓存
      await Promise.all(
        keyList.map(function (key) {
          let keys = key.split('_')
          cacheMap[keys[0]] = keys
          // 删除同一个項目名字的其他缓存
          if (keys[0] === projName) {
            if (buildTime > keys[1]) {
              console.log(`删除旧项目缓存: %c${projName}\n%c缓存時間: %c${new Date(+keys[1]).toLocaleString()}`, 'color: red', '', 'color: green')
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
          if (sort[i].name === projName) {
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
            return caches.open(commonList(event.request.url) ? commonCacheName : projCacheName).then(function (cache) {
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
