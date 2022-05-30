

// url工具
const urlTool = {
  /**
   * 获取URL请求参数
   * @param  {string} [searchKey] 查找是否有该键名
   * @returns {object | string} 有查找键名是返回值，否者返回所有
   */
  getUrlParam: function (searchKey) {
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
  },
  /**
 * 设置URL请求参数
 * @param {string} key 设置的键
 * @param {string} val 设置的值
 * @param {Boolean} isUrl 返回是否是url谅解
 * @returns {string} 默认返回URL链接，isUrl为false时返回请求参数字符串
 */
  setUrlParam: function (key, val, isUrl = true) {
    let urlParam = urlTool.getUrlParam();
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
  },
  /**
 * 删除URL请求参数
 * @param {string} key 删除的键
 * @param {Boolean} isUrl 返回是否是url谅解
 * @returns {string} 默认返回URL链接，isUrl为false时返回请求参数字符串
 */
  removeUrlParam: function (key, isUrl = true) {
    let urlParam = urlTool.getUrlParam();
    let newParamArr = [];
    let search = '';
    for (let k in urlParam) {
      if (k !== key) {
        newParamArr.push(urlParam[k] === undefined ? k : `${k}=${urlParam[k]}`);
      }
    }
    search = newParamArr.length > 0 ? `?${newParamArr.join('&')}` : '';
    return isUrl ? `${location.protocol}//${location.host}${location.pathname}${search}${location.hash}` : search;
  }
};



// cookie工具
const cookieTool = {
  // 設置cookie
  setCookie: function (name, value, s) {
    let expires = '';
    let date = new Date();
    if (s) {
      date.setTime(date.getTime() + s);
      expires = `;expires=${date.toGMTString()}`;
    }
    if (!value) {
      date.setTime(date.getTime() + s);
      expires = `;expires=${date.toGMTString()}`;
    }
    document.cookie = `${name}=${value}${expires}`;
  },
  // 獲取cookie
  getCookie: function (name) {
    let cookieReg = /\b([^;\=]*)\=([^;]*);?/g;
    let cookie = document.cookie;
    let cookieObj = {};
    let cookieExec = null;
    while (cookieExec = cookieReg.exec(cookie)) {
      let [src, key, value] = cookieExec;
      cookieObj[key] = value;
    }
    if (name) {
      return cookieObj[name];
    }
    return cookieObj
  }
};