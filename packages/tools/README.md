# lg-tools

常用工具函数

# 安装

```shell
$ npm install @likg/tools
# OR
$ yarn add @likg/tools
# OR
$ pnpm add @likg/tools
```

# 使用

```typescript
import Tools from '@likg/tools';
```

# API

```js
 /**
 * 获取queryString参数值
 * @param key
 * @param queryString
 * @returns T
 */
static query<T = any>(key?: string | null, queryString?: string): T;
/**
 * 将对象转换为query参数
 * eg. {name: 'muzili', age: 30} --> ?name=muzili&age=30
 * @param obj
 * @param hasPrefix 是否需要添加 `?` 前缀，默认true
 */
static convertToQueryWith(obj: Record<string, string | number | boolean>, hasPrefix?: boolean): string;
/**
 * 将对象转为formData格式
 * @param object
 * @returns
 */
static convertToFormDataWith(object: Record<string, any>): FormData;
/**
 * 处理日期格式
 * @param v  时间戳 / 日期字符串 / 日期对象
 * @param format 格式 YYYY-MM-DD HH:mm:ss dddd
 */
static dateFormat(v: number | string | Date, format?: string): string;
/**
 * 删除数组中的指定元素
 * @param arr
 * @param key
 * @param value
 */
static del<T>(arr: T[], key: keyof T, value: any): T[];
/**
 * 对象数组根据指定key去重
 * @param arr
 * @param key
 * @returns
 */
static unique<T extends object>(arr: T[], key: keyof T): T[];
/**
 * 手机号码格式
 * 对于参数格式，手机号固定长度为11位，程序将其分为三部分，如对于手机号：188 1234 5678，其中：
 * $1 -> 188；$2 -> 1234；$3 -> 5678
 * 如果format字段填写的格式为：'$1 **** $3'，则返回数据为：188 **** 5678
 * 这样封装的目的在于手机号的格式可以自由组合，更加灵活。
 * @param phone 手机号
 * @param format 格式字符串 如：'$1 $2 $3'，默认值：$1 **** $2
 */
static phoneFormatter(phone: string, format?: string): string;
/**
 * px转vw
 * @param pixel
 */
static px2vw(pixel: number): string;
/**
 * 剪贴板
 * @param value 复制内容
 * @returns Promise
 */
static clipboard(value: string): Promise<unknown>;
/**
 * 时间倒计时
 * @param options 配置项
 * @param options.timeStamp 剩余时间戳，单位秒
 * @param options.mode      倒计时模式 default/标准时间，seconds/秒，为 seconds 时，超过 60s 不会转成分，小于 10 时不添加前置位“0”
 * @param options.type      倒计时类型 default/秒制；ms/毫秒制
 * @param options.format    返回格式 dd hh:mm:ss，不传则返回元组类型[天,时,分,秒,毫秒]
 * @param options.showDay   是否显示天 true-超过24小时天数+1；false-超过24小时累计小时值，默认为true
 * @param options.pending   倒计时持续状态
 * @param options.complete  倒计时结束
 * @returns
 */
static timeDown(options: {
    timeStamp: number;
    mode?: 'default' | 'seconds';
    type?: 'default' | 'ms';
    format?: string;
    showDay?: boolean;
    pending: (time: string | string[]) => void;
    complete: () => void;
}): () => void;
/**
 * 获取数据类型
 * @param target
 */
static toRawType(target: any): string;
/**
 * 百度统计
 * @param options
 */
static track(options: ITrackPv | ITrackEs): void;
/**
 * 随机字符
 * @param length
 * @param type
 */
static randomCharacters(length: number, type?: 'default' | 'uppercase' | 'lowercase' | 'digital'): string;
/**
 * 获取指定范围内的随机数
 * @param min
 * @param max
 */
static randomDecimals(min: number, max: number): number;
/**
 * 获取指定范围内的随机整数
 * @param min
 * @param max
 */
static randomInteger(min: number, max: number): number;
/**
 * 全屏
 */
static launchFullscreen(): void;
/**
 * 退出全屏
 */
static exitFullscreen(): void;
/**
 * Blob流转Excel
 * @param data 流
 * @param fileName 导出文件名
 */
static exportExcel(data: Blob, fileName: string): Promise<unknown>;
/**
 * 获取年份集合
 * @param start 开始年/默认值：1970
 * @param end 结束年/默认值：当前年
 * @returns
 */
static getYears(start?: number, end?: number): string[];
/**
 * 获取月份集合：[1-12]
 * @returns
 */
static getMonths(): string[];
/**
 * 获取某月的天数集合
 * @param options 可选项/如果赋值，则表示获取精确天数，默认为31天即[1-31]
 * @returns
 */
static getDays(options?: {
    year: number;
    month: number;
}): string[];
/**
 * 批量下载（导出）文件
 *
 * 使用 blob 流式下载时，需要注意以下几点：
 * 1. 处理跨域问题：如果服务器没有设置合适的CORS策略，可能会阻止JavaScript访问文件。因此，需要确保服务器允许跨域请求。
 * 2. 处理文件格式问题：不同的浏览器可能对不同的文件格式支持程度不同。因此，需要确保服务器提供的文件格式兼容各种浏览器，即指定 Content-Type。
 *    当服务器不知道文件的确切 MIME 类型时，会使用 binary/octet-stream 作为默认值，导致浏览器会将这种 MIME 类型的数据作为二进制文件进行处理，通常会提示用户下载该文件。
 * 3. 部分浏览器无法下载：可能是因为浏览器会发送两次请求，第一次，HEAD 请求，判断文件是否存在，第二次，发送 GET 请求，下载文件。因此安全规则需要加入 HEAD 请求和 GET 请求。
 *
 * @param resources  资源数组，Array<{ source: string | Blob; filename?: string }>
 * @param mode 下载类型：link｜blob，默认值 blob
 * @returns
 */
static downloadFiles(resources: Array<{
    source: string | Blob;
    filename?: string;
}>, mode?: 'link' | 'blob'): Promise<void>;
/**
 * 处理数字小于10时的格式/在小于10的数字前面拼接0
 * @param num
 * @returns
 */
static numFormat(num: number): string;
/**
 * 获取当前运行环境
 * @returns
 * - android：安卓环境
 * - ios：iOS环境
 * - weixin：微信环境
 * - alipay：支付宝环境
 * - unknown：未知环境
 */
static getEnv(): "weixin" | "alipay" | "android" | "ios" | "unknown";
/**
 * 获取文件存储路径
 * 一般用于规范对象存储时的文件管理规范
 * 生成格式如下：存储目录名/日期/随机字符（3个）+时间戳_图片本身名字.后缀名
 * 示例：admin/avatar/20210630/ULK1625036350104_logo.png
 * @param file
 * @param dirName
 * @returns
 */
static getFilePath(file: File, dirName: string): string;
/**
 * 将 Base64 字符串转换为 Uint8Array
 * @param {string} base64String - Base64 字符串
 * @returns {Uint8Array} - 转换后的 Uint8Array
 */
static base64ToUint8Array(base64String: string): Uint8Array;
/**
 * 将给定的目标（URL、文件对象或 Blob 对象）转换为 Base64 编码的字符串。
 *
 * 该函数处理以下情况：
 * - 指向图像的 URL，获取图像并将其转换为 Base64。
 * - 文件对象，直接将其转换为 Base64。
 * - Blob 对象，直接将其转换为 Base64。
 *
 * @param  target - 要转换为 Base64 的目标。
 * @returns 一个 Promise 对象，解析为 Base64 编码的字符串，
 * @throws 如果目标不是有效的 URL、文件或 Blob，则抛出错误。
 *
 */
static base64(target: string | File | Blob): Promise<string>;
/**
 * 动态加载script标签
 * @param src {string | string[]} 加载脚本的地址，
 * @param type {string} 默认值：text/javascript
 * @returns
 */
static loadScript(src: string | string[], type?: string): Promise<boolean>;
/**
 * 深拷贝
 * @param source 源数据
 * @returns
 */
static deepClone<T = any>(source: T): T;
/**
 * 更新对象，支持namePath形式
 * 如果你需要深拷贝更新，请试用Tools.deepUpdate
 * @param source  原始对象
 * @param namePath eg: 'user' or 'user.name'
 * @param value   更新值
 */
static update<T = Record<string, any>>(source: T, namePath: string, value: any): T;
/**
 * 深拷贝更新对象值
 * @param source  原始对象
 * @param namePath eg: 'user' or 'user.name'
 * @param value   更新值
 * @returns
 */
static deepUpdate<T = Record<string, any>>(source: T, namePath: string, value: any): T;
/**
 * 获取上一天
 * @returns 返回日期对象
 */
static getLastDay(): Date;
/**
 * 获取上一月
 * @returns 返回日期对象
 */
static getLastMonth(): Date;
/**
 * 函数防抖
 * @param cb  回调函数
 * @param delay 延迟时间，默认500ms
 * @returns
 */
static debounce(cb: (...args: any) => void, delay?: number): (...args: any) => void;
/**
 * 输入日期查询星座
 * @param $1 日期/数值类型，为数值类型是，$1表示月份(1-12)
 * @param $2 数值类型 日期（天）(1-31)
 * @returns 如果匹配，则返回对应星座，否则返回空字符串（''）
 */
static getConstellation($1: number | Date, $2?: number): string;
/**
 * Canvas - 绘制多行文本
 * @param context canvas 上下文
 * @param text 绘制文本
 * @param x 文本左上角x坐标
 * @param y 文本左上角y坐标
 * @param lineHeight 一行所占的高度（行高）
 * @param maxWidth 一行所占的最大宽度，用于计算判断遍历fill文本时是否应该换行，默认为canvas宽度
 * @param maxRows 最多行（默认最多显示5行）
 * @returns 返回所占高度（用于动态绘制后续元素）
 */
static canvasFillText(context: CanvasRenderingContext2D, text: string, x: number, y: number, lineHeight: number, maxWidth?: number, rows?: number): number;
/**
 * 文本溢出省略处理
 * @param str  源字符串
 * @param len  长度 / 规则，指定前后保留的位数，默认为6
 * @param type 省略类型: 'head' | 'center' | 'tail'
 * @returns
 */
static ellipsis(str: string, len?: number, type?: 'head' | 'middle' | 'tail'): string;
/**
 * 解析日期字符串
 * 一般用于根据年月筛选时，将日期字符串返回起始传递给后端（严格上来讲后端处理即可）
 * 如：2022-02，返回 {start: '202-02-01 00:00:00', end: '202-02-28 23:59:59'}
 * @param dateString 日期字符串，格式：YYYY-MM
 * @returns
 */
static analysisDateString(dateString: string): {
    start: undefined;
    end: undefined;
} | {
    start: string;
    end: string;
};
/**
 * 打乱数组的顺序
 * @param array - 需要打乱顺序的数组
 * @returns 打乱顺序后的数组
 */
static shuffleArray<T = any>(array: T[]): T[];
/**
 * 线程休眠
 * @param delay
 * @returns
 */
static sleep(delay?: number): Promise<unknown>;
```
