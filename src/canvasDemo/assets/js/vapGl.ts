// 顶点着色器源码
let vertexShaderSource = `
// 设置浮点数精度为中等精度
precision mediump float;
// 接收点在 canvas 坐标系上的坐标(x, y)
attribute vec2 a_texCood;
attribute vec2 a_position;
// 接收 canvas 的宽高尺寸
attribute vec2 a_screen_size;

attribute vec2 a_rgb_cood;
attribute vec2 a_alpha_cood;

varying vec2 v_texCood;
varying vec2 v_rgb_cood;
varying vec2 v_alpha_cood;

void main () {
  // 屏幕坐标转为裁剪坐标
  vec2 position = (a_position / a_screen_size) * 2.0 - 1.0;
  // canvas Y轴从上到下, gl从下到上, 取反
  position = position * vec2(1.0, -1.0);
  gl_Position = vec4(position, 0, 1);
  // v_texCood = a_texCood;
  v_rgb_cood = a_rgb_cood;
  v_alpha_cood = a_alpha_cood;
  // 点大小
  // gl_PointSize = 10.0;
}`;

// 片元着色器源码
let fragmentShaderSource = `
precision mediump float;
// 纹理
uniform sampler2D u_image_rgb;
// 纹理
// uniform sampler2D u_image_alpha;

// varying vec2 v_texCood;
// 原色通道坐標
varying vec2 v_rgb_cood;
// 透明通道坐標
varying vec2 v_alpha_cood;

void main () {
  
  // 自己計算圖片坐標
  // vec4 rgb_config = vec4(0.0, 0.0,  400.0/608.0, 1.0);
  // vec4 alpha_config = vec4(404.0/608.0, 0, 200.0/608.0, 200.0/400.0);
  // vec2 rgbCood = vec2((v_texCood.x * rgb_config.z) + rgb_config.x, (rgb_config.w - v_texCood.y * rgb_config.w) + rgb_config.y);
  // vec2 alphaCood = vec2((v_texCood.x * alpha_config.z) + alpha_config.x, (alpha_config.w - v_texCood.y * alpha_config.w) + alpha_config.y);
  // vec4 rgb = texture2D(u_image_rgb, rgbCood);
  // vec4 alpha = texture2D(u_image_rgb, alphaCood);

  // 根據圖片坐標計算
  vec4 rgb = texture2D(u_image_rgb, v_rgb_cood);
  vec4 alpha = texture2D(u_image_rgb, v_alpha_cood);

  // 在纹理上寻找对应颜色值
  gl_FragColor = vec4(rgb.rgb, alpha.r);
}`;

class VapGl {
  canvas: HTMLCanvasElement;
  webgl: WebGLRenderingContext;
  program: WebGLProgram;
  constructor(config) {
    this.canvas = config.el;
    this.initCanvas();
    (window as any).vapGl = this;
  }
  initCanvas() {
    this.webgl = this.canvas.getContext('webgl', {
      alpha: true,
    }) as WebGLRenderingContext;

    // 设置视口
    this.webgl.viewport(0, 0, this.canvas.width, this.canvas.height);
    // 生成着色器程序
    this.program = this.createProgram(this.webgl, vertexShaderSource, fragmentShaderSource) as WebGLProgram;
    if (!this.program) return;
    // 使用着色器程序
    this.webgl.useProgram(this.program);

    // 找到顶点着色器中 a_texCood 变量的地址
    var a_position = this.webgl.getAttribLocation(this.program, 'a_position');
    // 找到顶点着色器中 a_texCood 变量的地址
    var a_texCood = this.webgl.getAttribLocation(this.program, 'a_texCood');
    // 找到顶点着色器中 a_screen_size 变量的地址
    var a_screen_size = this.webgl.getAttribLocation(this.program, 'a_screen_size');
    // 找到片元着色器中 u_Color 变量的地址;
    // var u_Color = this.webgl.getUniformLocation(this.program, 'u_Color');

    // 给顶点着色器中的 a_screen_size 设置屏幕宽高信息
    this.webgl.vertexAttrib2f(a_screen_size, this.webgl.canvas.width, this.webgl.canvas.height);

    // 创建缓冲区
    var positionBuffer = this.webgl.createBuffer();
    // 绑定缓冲区
    this.webgl.bindBuffer(this.webgl.ARRAY_BUFFER, positionBuffer);
    // 将数据写入缓冲区
    this.webgl.bufferData(
      this.webgl.ARRAY_BUFFER,
      new Float32Array([
        0, this.canvas.height,
        0, 0,
        this.canvas.width, 0,
        this.canvas.width, this.canvas.height
      ]),
      this.webgl.STATIC_DRAW
    );

    // // 启用对应属性
    this.webgl.enableVertexAttribArray(a_position);
    // 每次迭代运行提取两个单位数据
    var size = 2;
    // 每个单位的数据类型是32位浮点型
    var type = this.webgl.FLOAT;
    // 不需要归一化数据
    var normalize = false;
    // 0 = 移动单位数量 * 每个单位占用内存（sizeof(type)）
    // 每次迭代运行运动多少内存到下一个数据开始点
    var stride = 0;
    // 从缓冲起始位置开始读取
    var offset = 0;
    // 告诉属性怎么从positionBuffer中读取数据 (ARRAY_BUFFER)
    this.webgl.vertexAttribPointer(a_position, size, type, normalize, stride, offset);

    // 创建缓冲区
    var texcoordBuffer1 = this.webgl.createBuffer();
    // 绑定缓冲区
    this.webgl.bindBuffer(this.webgl.ARRAY_BUFFER, texcoordBuffer1);
    // 将数据写入缓冲区, 纹理坐标系从左下角开始算
    this.webgl.bufferData(this.webgl.ARRAY_BUFFER, new Float32Array([0.0, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0]), this.webgl.STATIC_DRAW);
    // 启用对应属性
    this.webgl.enableVertexAttribArray(a_texCood);
    // 告诉属性怎么从positionBuffer中读取数据 (ARRAY_BUFFER)
    this.webgl.vertexAttribPointer(a_texCood, 2, this.webgl.FLOAT, false, 0, 0);



    // // 找到顶点着色器中 a_rgb_cood 变量的地址
    var a_rgb_cood = this.webgl.getAttribLocation(this.program, 'a_rgb_cood')
    var a_alpha_cood = this.webgl.getAttribLocation(this.program, 'a_alpha_cood')

    // 创建缓冲区
    var texcoordBuffer2 = this.webgl.createBuffer();
    // 绑定缓冲区
    this.webgl.bindBuffer(this.webgl.ARRAY_BUFFER, texcoordBuffer2);
    // 将数据写入缓冲区, 纹理坐标系从左下角开始算
    let rgbaBuffer = new Float32Array([
      0.0, 1.0,
      0.0, 0.0,
      400.0/608.0, 0.0,
      400.0/608.0, 1.0
    ])
    const rgbaBufferSize = rgbaBuffer.BYTES_PER_ELEMENT;

    console.log(rgbaBufferSize, rgbaBuffer)
    this.webgl.bufferData(this.webgl.ARRAY_BUFFER,rgbaBuffer , this.webgl.STATIC_DRAW);
    // 启用对应属性
    this.webgl.enableVertexAttribArray(a_rgb_cood);
    // 告诉属性怎么从positionBuffer中读取数据 (ARRAY_BUFFER)
    this.webgl.vertexAttribPointer(a_rgb_cood, 2, this.webgl.FLOAT, false, 0 , 0);

    var texcoordBuffer3 = this.webgl.createBuffer();
    this.webgl.bindBuffer(this.webgl.ARRAY_BUFFER, texcoordBuffer3);
    this.webgl.bufferData(this.webgl.ARRAY_BUFFER, new Float32Array([
      404.0/608.0, 200.0/400.0,
      404.0/608.0, 0.0,
      404.0/608.0 + 200.0/608.0, 0.0,
      404.0/608.0 + 200.0/608.0, 200.0/400.0,
    ]) , this.webgl.STATIC_DRAW);
    // 启用对应属性
    this.webgl.enableVertexAttribArray(a_alpha_cood);
    // 告诉属性怎么从positionBuffer中读取数据 (ARRAY_BUFFER)
    this.webgl.vertexAttribPointer(a_alpha_cood, 2, this.webgl.FLOAT, false, 0, 0);
  }

  drawScene(gl) {
    // 设置清空画布的颜色
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    // 清空画布
    gl.clear(gl.COLOR_BUFFER_BIT);
    // 重新赋值数据
    // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(position), gl.STATIC_DRAW);
    // 绘制图元设置为三角形
    var primitiveType = gl.TRIANGLE_FAN;
    // 从顶点数组的开始位置获取顶点数据
    var offset = 0;
    // 绘制的点数
    var count = 4;
    // 渲染数据
    gl.drawArrays(primitiveType, offset, count);
  }
  /**
   * 生成着色器对象
   * @param { WebGLRenderingContext } gl  webgl上下文
   * @param {(gl.FRAGMENT_SHADER|gl.VERTEX_SHADER)} type 着色器类型
   * @param {String} shaderSource 着色器源码
   * @returns { WebGLShader|viod } 着色器对象
   **/
  createShader(gl: WebGLRenderingContext, type: number, shaderSource: string): WebGLShader | void {
    // 创建着色器对象
    var shader = gl.createShader(type) as WebGLShader;
    // 设置着色器源码
    gl.shaderSource(shader, shaderSource);
    // 编译着色器
    gl.compileShader(shader);
    // 查看着色器编译状态
    var status = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (status) return shader;
    // 打印着色器编译日志
    console.log(gl.getShaderInfoLog(shader));
  }
  /**
   * 生成着色器程序
   * @param { WebGLRenderingContext }  gl webgl上下文
   * @param vertexShader 顶点着色器对象
   * @param fragmentShader 片元着色器对象
   *
   */
  createProgram(gl: WebGLRenderingContext, vertexShaderSource: string, fragmentShaderSource: string): WebGLProgram | void {
    // 生成顶点着色器对象
    var vertexShader = this.createShader(this.webgl, this.webgl.VERTEX_SHADER, vertexShaderSource) as WebGLShader;
    // 生成片元着色器对象
    var fragmentShader = this.createShader(this.webgl, this.webgl.FRAGMENT_SHADER, fragmentShaderSource) as WebGLShader;
    // 创建着色器程序对象
    var program = gl.createProgram() as WebGLShader;
    // 为着色器程序添加着色器对象
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    // 链接着色器程序到上下文
    gl.linkProgram(program);
    // 着色器程序连接状态
    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
      return program;
    }
    // 着色器连接日志
    console.log(gl.getProgramInfoLog(program));
  }

  createTexture(gl: WebGLRenderingContext, image: HTMLImageElement, index): WebGLTexture {
    // 切换到纹理对象
    gl.activeTexture(this.webgl.TEXTURE0 + index);
    // 创建纹理对象
    var texture = gl.createTexture() as WebGLTexture;
    // 绑定纹理
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // 翻转图片
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    // 有透明通道需要设置,否则有蒙层
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    // 设置纹理参数
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    // 指定二维纹理图像
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    // this.webgl.bindTexture(this.webgl.TEXTURE_2D, texture);
    // gl.bindTexture(gl.TEXTURE_2D, texture);
    return texture;
  }
  /**
   * @param {string} str 图片路径
   */
  drawImage(img1: HTMLImageElement, img2: HTMLImageElement) {
    var u_image_rgb = this.webgl.getUniformLocation(this.program, 'u_image_rgb');
    // var u_image_alpha = this.webgl.getUniformLocation(this.program, 'u_image_alpha');
    // 绑定变量到纹理单元
    this.webgl.uniform1i(u_image_rgb, 0); // 纹理单元 0
    // this.webgl.uniform1i(u_image_alpha, 1); // 纹理单元 1
    // 关联图片到纹理单元
    let imgTexture1 = this.createTexture(this.webgl, img1, 0);
    // let imgTexture2 = this.createTexture(this.webgl, img2, 1);
    this.drawScene(this.webgl);
  }
}

export default VapGl;
