// 檢查buffer和傳入數組值是否一致
export function checkFontBuffer (arr, buf) {
  // let flag = false;
  for (let i = 0; i < arr.length;i++) {
    let info = arr[i];
    let starIndex = info.index || 0;
    if (info.buffer.every((num, index) => {
      console.log(i, index, num, buf[starIndex + index]);
      return num === buf[starIndex + index]
    })) {
      console.log(info);
      if (info.subBuffer) {
        console.log(checkFontBuffer(info.subBuffer, buf))
        return checkFontBuffer(info.subBuffer, buf)
      }
      return true;
    }
  }
  return false
}
// 檢查是否為字體格式
export function checkFontFileType (buf) {
  let fontTypeInfo = [
    {
      ext: 'woff',
			mime: 'application/font-woff',
      checkBuffer: [{
        buffer: [0x77, 0x4F, 0x46, 0x46], 
        subBuffer: [
          {index: 4, buffer: [0x00, 0x01, 0x00, 0x00]},
          {index: 4, buffer: [0x4F, 0x54, 0x54, 0x4F]}
        ]
      }]
    },
    {
      ext: 'woff2',
			mime: 'application/font-woff',
      checkBuffer: [{
        buffer: [0x77, 0x4F, 0x46, 0x32],
        subBuffer: [
          {index: 4, buffer: [0x00, 0x01, 0x00, 0x00]},
          {index: 4, buffer: [0x4F, 0x54, 0x54, 0x4F]}
        ]
      }]
    },
    {
			ext: 'eot',
			mime: 'application/octet-stream',
      checkBuffer: [{
        index: 34,
        buffer: [0x4C, 0x50],
        subBuffer: [
          {index: 8, buffer: [0x00, 0x00, 0x01]},
          {index: 8, buffer: [0x01, 0x00, 0x02]},
          {index: 8, buffer: [0x02, 0x00, 0x02]},
        ]
      }]
    },
    {
			ext: 'ttf',
			mime: 'application/font-sfnt',
      checkBuffer: [{
        buffer: [0x00, 0x01, 0x00, 0x00, 0x00]
      }]
    },
    {
			ext: 'otf',
			mime: 'application/font-sfnt',
      checkBuffer: [{
        buffer: [0x4F, 0x54, 0x54, 0x4F, 0x00]
      }]
    }
  ]

  for (let i = 0; i < fontTypeInfo.length; i++) {
    let info = fontTypeInfo[i];
    if (checkFontBuffer(info.checkBuffer, buf)) {
      console.log(i)
      return info
    }
  }
	// if (checkBuffer([0x77, 0x4F, 0x46, 0x46, 0x00, 0x01, 0x00, 0x00], buf) || checkBuffer([0x77, 0x4F, 0x46, 0x46, 0x4F, 0x54, 0x54, 0x4F], buf)) {
	// 	return {
	// 		ext: 'woff',
	// 		mime: 'application/font-woff'
	// 	};
	// }

	// if (checkBuffer([0x77, 0x4F, 0x46, 0x32, 0x00, 0x01, 0x00, 0x00], buf) || checkBuffer([0x77, 0x4F, 0x46, 0x32, 0x4F, 0x54, 0x54, 0x4F], buf)) {
	// 	return {
	// 		ext: 'woff2',
	// 		mime: 'application/font-woff'
	// 	};
  // }

	// if (
  //   checkBuffer([0x4C, 0x50], buf, 34) &&
	// 	(
  //     checkBuffer([0x00, 0x00, 0x01], buf, 8) || 
  //     checkBuffer([0x01, 0x00, 0x02], buf, 8) || 
  //     checkBuffer([0x02, 0x00, 0x02], buf, 8)
	// 	)) 
  // {
  // return {
	// 		ext: 'eot',
	// 		mime: 'application/octet-stream'
	// 	};
	// }

	// if (checkBuffer([0x00, 0x01, 0x00, 0x00, 0x00], buf)) {
	// 	return {
	// 		ext: 'ttf',
	// 		mime: 'application/font-sfnt'
	// 	};
	// }

	// if (checkBuffer([0x4F, 0x54, 0x54, 0x4F, 0x00], buf)) {
	// 	return {
	// 		ext: 'otf',
	// 		mime: 'application/font-sfnt'
	// 	};
	// }
}

// 字符串轉Unicode
export function string2UCode (text) {
  let chatCode = [];
  for (let i = 0; i < text.length; i++) {
    chatCode.push(text.charCodeAt(i))
  }
  return chatCode
}