  

  // 用來自动清除cdn緩存
  var reg = /timestamp\s?=\s?([0-9]+)/; // 獲取打包時間戳
  // 獲取url參數
  function getUrlParam (searchKey) {
    let searchParam = location.search;
    let params = {};
    if (searchParam) {
      searchParam.slice('1').split('&').forEach((param) => {
        let [key, value] = param.split('=');
        params[key] = value;
      });
    }
    if (searchKey) {
      if (params.hasOwnProperty(searchKey)) {
        return params[searchKey] === undefined ? true : params[searchKey];
      }
      return;
    }
    return params;
  }
  // 設置url參數
  function setUrlParam (key, val, isUrl = true) {
    let urlParam = getUrlParam();
    let search = location.search;
    if (search) {
      let newParamArr = [];
      urlParam[key] = val;
      for (let k in urlParam) {
        newParamArr.push(urlParam[k] === undefined ? k : `${k}=${urlParam[k]}`);
      }
      search = `?${newParamArr.join('&')}`;
    } else {
      search = `?${key}=${val}`;
    }
    return isUrl ? `${location.protocol}//${location.host}${location.pathname}${search}${location.hash}` : search;
  }
  // 請求html文件
  function requireHtml () {
    // return fetch(`./index.html?t=${Date.now()}`).then(res =>{
    //   if (res.ok) {
    //     res.text().then(text=> {
    //       let match = text.match(reg);
    //       if (match && match[1]) {
    //         Promise.resolve(match[1]);
    //       } else {
    //         Promise.reject({discription: '請求匹配值為空', res: match});
    //       }
    //     })
    //   } else {
    //     Promise.reject({discription: '請求html文件錯誤', res: res.statusText})
    //   }
    // })
    return new Promise(function(resolve, reject) {
      let xhq = new XMLHttpRequest();
      xhq.onreadystatechange = function () {
        if (xhq.readyState === 4) {
          let match = xhq.responseText.match(reg);
          if (match && match[1]) {
            resolve(match[1]);
          } else {
            reject({discription: '請求匹配值為空', res: match});
          }
        }
      }
      xhq.onerror = function (err) {
        reject({discription: '請求html文件錯誤', res: err})
      };
      xhq.open('get', `./index.html?t=${Date.now()}`);
      xhq.send();
    })
  }
  
  requireHtml().then((res) => {
    if (Number(res) === timestamp) {
      console.log('打包時間:', new Date(Number(res)).toLocaleString());
    } else {
      location.replace(setUrlParam('t', res));
    }
  }).catch(err => {
    console.log('獲取時間戳失敗', err);
  })
