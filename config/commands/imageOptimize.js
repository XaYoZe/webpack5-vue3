// 图片压缩
// 使用google squoosh
// 運行 npm run sPb miya:2020:demo
const path = require('path'),
    fs = require('fs'),
    protobuf = require('protobufjs'),
    program = require('commander'),
    os = require('os'),
    { ImagePool } = require('@squoosh/lib');
program.version('0.1.0').option('-pyf, --pyf <string>', 'Add project:year:folder').parse(process.argv);

const [project, year, folder] = program._optionValues.pyf.split(':')
const imgReg = /png|jpg|jpeg$/; // 图片格式正则

// 获取图片
function getImageList(src, imgArr) {
    try {
        let dir = fs.readdirSync(src, { withFileTypes: true });
        dir.forEach(async (item) => {
            if (item.isDirectory()) {
                getImageList(path.resolve(src, item.name), imgArr);
            } else if (imgReg.test(item.name)) {
                imgArr.push(path.resolve(src, item.name));
            }
        });
    } catch (err) {
        // console.log(err);
        throw err;
    }
}

// 开始执行
async function start() {
    let imgArr = [];
    const projSrc = path.resolve(__dirname, `../` ,project, year, folder); // 項目文件夾目錄
    getImageList(projSrc, imgArr);
    const imagePool = new ImagePool(os.cpus().length);
    let beforeSize = 0;
    let afterSize = 0;
    let num = 0;
    imgArr.forEach(async (src, index) => {
        let file = await fs.promises.readFile(src);
        let image = imagePool.ingestImage(file);
        // 图片处理
        // await image.preprocess();
        // 图片解码
        await image.decoded;
        // 编码格式
        let encodedType = 'mozjpeg';
        /\.png$/.test(src) && (encodedType = 'oxipng');
        // 配置
        const encodeOptions = { mozjpeg: 'auto', oxipng: 'auto', jxl: 'auto', wp2: {} };
        // 重新编码
        await image.encode({ [encodedType]: encodeOptions[encodedType] });
        // 获取压缩后数据
        const rawEncodedImage = await image.encodedWith[encodedType];
        // 大于原文件不覆盖
        if (rawEncodedImage.size < file.length) {
            await fs.writeFileSync(src, rawEncodedImage.binary);
        }
        num++; // 计数
        beforeSize += file.length / 1024; // 计算压缩前大小
        afterSize += (rawEncodedImage.size < file.length ? rawEncodedImage.size : file.length) / 1024; // 计算压缩后大小
        console.log(
            `${num}/${imgArr.length}`,
            encodeOptions[encodedType],
            parseFloat((file.length / 1024).toFixed(2)),
            '\bkb',
            parseFloat((rawEncodedImage.size / 1024).toFixed(2)),
            '\bkb',
            ((1 - rawEncodedImage.size / file.length) * 100).toFixed(2),
            '\b%',
            src
        );
        // 最后执行完退出
        if (num === imgArr.length) {
            imagePool.close();
            console.log(
                '压缩前:',
                parseInt(beforeSize),
                '\bkb',
                '压缩后:',
                parseInt(afterSize),
                '\bkb',
                '压缩率',
                ((1 - afterSize / beforeSize) * 100).toFixed(2),
                '\b%'
            );
        }
    });
    //
}
start();
