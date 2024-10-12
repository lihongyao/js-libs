/**
 * 全局声明
 */
declare global {
	interface Window {
		_hmt: any;
		wx: any;
	}
}

// 百度统计
interface ITrackPv {
	type: 'pv';
	pageURL?: string /** 指定要统计PV的页面URL。此项必选，必须是以”/”（斜杠）开头的相对路径 */;
}
interface ITrackEs {
	type: 'es';
	category: string /** 要监控的目标的类型名称，通常是同一组目标的名字，比如”视频”、”音乐”、”软件”、”游戏”等等。该项必选 */;
	action?: string /** 用户跟目标交互的行为，如”播放”、”暂停”、”下载”等等。该项必选。 */;
	opt_label?: string /** 事件的一些额外信息，通常可以是歌曲的名称、软件的名称、链接的名称等等。该项可选。 */;
	opt_value?: string /** 事件的一些数值信息，比如权重、时长、价格等等，在报表中可以看到其平均值等数据。该项可选。 */;
}

class Tools {
	// 构造单例
	private static instance: Tools;
	private constructor() {}
	static defaultUtils() {
		if (!this.instance) {
			this.instance = new Tools();
		}
		return this.instance;
	}
	/**
	 * 获取queryString参数值
	 * @param key
	 * @param queryString
	 * @returns T
	 */
	public static query<T = any>(key?: string | null, queryString?: string) {
		let s = '';
		if (queryString) {
			s = /^http/.test(queryString) ? queryString.split('?')[1] : queryString;
		} else {
			s = window.location.search;
		}
		if (s) {
			s = /\?/.test(s) ? s.slice(1) : s;
			const o: Record<string, any> = {};
			s.split('&').forEach((item) => {
				if (/=/.test(item)) {
					const t = item.split('=');
					const k = t[0];
					const v = t[1];
					o[k] = v ? decodeURIComponent(v) : undefined;
				}
			});
			if (key) {
				return (key ? (o[key] ? o[key] : '') : o) as T;
			} else {
				return o as T;
			}
		}
		return (key ? '' : {}) as unknown as T;
	}
	/**
	 * 将对象转换为query参数
	 * eg. {name: 'muzili', age: 30} --> ?name=muzili&age=30
	 * @param obj
	 * @param hasPrefix 是否需要添加 `?` 前缀，默认true
	 */
	public static convertToQueryWith(
		obj: Record<string, string | number | boolean>,
		hasPrefix = true
	) {
		if (!obj || Tools.toRawType(obj) !== 'object') return '';
		let res = hasPrefix ? '?' : '';
		Object.keys(obj).forEach((key: string) => {
			const v = obj[key];
			res += `${key}=${v !== undefined ? encodeURIComponent(v) : ''}&`;
		});
		if (res) {
			return res.slice(0, res.length - 1);
		}
		return res;
	}

	/**
	 * 将对象转为formData格式
	 * @param object
	 * @returns
	 */
	public static convertToFormDataWith(object: Record<string, any>) {
		const formData = new FormData();
		for (const key of Object.keys(object)) {
			formData.append(key, object[key]);
		}
		return formData;
	}

	/**
	 * 处理日期格式
	 * @param v  时间戳 / 日期字符串 / 日期对象
	 * @param format 格式 YYYY-MM-DD HH:mm:ss
	 */
	public static dateFormat(v: number | string | Date, format?: string) {
		// 格式处理
		function formatNumber(n: number | string) {
			n = n.toString();
			return n[1] ? n : '0' + n;
		}

		// 由于 iOS 在微信小程序中不支持 2024-01-01 00:00:00 创建日期
		// 因此需要特殊处理将参数转换为成 2024/01/01 00:00:00 格式
		const reg = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
		if (typeof v === 'string' && reg.test(v)) {
			v = v.replace(/-/g, '/');
		}

		// 尝试使用 Date 对象进行解析
		const date = new Date(v);
		if (isNaN(date.getTime())) {
			return '-';
		}

		// 获取年月日、时分秒
		const year = date.getFullYear().toString();
		const month = formatNumber(date.getMonth() + 1);
		const day = formatNumber(date.getDate());
		const hour = formatNumber(date.getHours());
		const minute = formatNumber(date.getMinutes());
		const second = formatNumber(date.getSeconds());
		// 判断是否存在格式
		if (format) {
			return format
				.replace(/YYYY/gi, year)
				.replace(/MM/, month)
				.replace(/DD/, day)
				.replace(/HH/, hour)
				.replace(/mm/, minute)
				.replace(/ss/, second);
		}
		let res = '';
		res += year + '-' + month + '-' + day + ' ';
		res += hour + ':' + minute + ':' + second;
		return res;
	}

	/**
	 * 删除数组中的指定元素
	 * @param arr
	 * @param key
	 * @param value
	 */
	public static del<T>(arr: T[], key: keyof T, value: any): T[] {
		const tmp = [...arr];
		const index = tmp.findIndex((item: T) => item[key] === value);
		tmp.splice(index, 1);
		return tmp;
	}

	/**
	 * 对象数组根据指定key去重
	 * @param arr
	 * @param key
	 * @returns
	 */
	public static unique<T extends object>(arr: T[], key: keyof T): T[] {
		const obj: Record<string, any> = {};
		const res = arr.reduce((temps: T[], next: T) => {
			const v = next[key] + '';
			obj[v] ? '' : (obj[v] = true && temps.push(next));
			return temps;
		}, []);
		return res;
	}

	/**
	 * 手机号码格式
	 * 对于参数格式，手机号固定长度为11位，程序将其分为三部分，如对于手机号：188 1234 5678，其中：
	 * $1 -> 188；$2 -> 1234；$3 -> 5678
	 * 如果format字段填写的格式为：'$1 **** $3'，则返回数据为：188 **** 5678
	 * 这样封装的目的在于手机号的格式可以自由组合，更加灵活。
	 * @param phone 手机号
	 * @param format 格式字符串 如：'$1 $2 $3'，默认值：$1 **** $2
	 */
	public static phoneFormatter(phone: string, format = '$1 **** $2') {
		if (phone && typeof phone === 'string' && phone.length === 11) {
			return phone.replace(
				/(\d{3})(\d{4})(\d{4})/,
				(_, $1: string, $2: string, $3: string) => {
					return format.replace('$1', $1).replace('$2', $2).replace('$3', $3);
				}
			);
		}
		return '';
	}
	/**
	 * px转vw
	 * @param pixel
	 */
	public static px2vw(pixel: number): string {
		return `${(pixel / 375) * 100}vw`;
	}
	/**
	 * 剪贴板
	 * @param value 复制内容
	 * @returns Promise
	 */
	public static clipboard(value: string) {
		return new Promise((resolve, reject) => {
			const input = document.createElement('input');
			input.setAttribute('value', value);
			document.body.appendChild(input);

			input.select();
			const result = document.execCommand('copy');
			document.body.removeChild(input);
			if (result) {
				resolve(null);
			} else {
				reject();
			}
		});
	}

	/**
	 * 时间倒计时
	 * @param options 配置项
	 * @param options.format    返回格式 dd hh:mm:ss，不传则返回元组类型[天,时,分,秒,毫秒]
	 * @param options.mode      倒计时模式 default/标准时间；seconds/秒，为 seconds 时，超过 60s 不会转成分，小于 10 时不添加前置位“0”
	 * @param options.type      倒计时格式 default/秒制；ms/毫秒制
	 * @param options.showDay   是否显示天 true-超过24小时天数+1；false-超过24小时累计小时值，默认为true
	 * @param options.pending   倒计时持续状态
	 * @param options.complete  倒计时结束
	 * @returns
	 */
	public static timeDown(options: {
		timeStamp: number;
		format?: string;
		mode?: 'default' | 'seconds';
		type?: 'default' | 'ms';
		showDay?: boolean;
		pending: (time: string | string[]) => void;
		complete: () => void;
	}) {
		// -- 解构参数
		const {
			timeStamp,
			format,
			mode = 'default',
			type = 'default',
			showDay = true,
			pending,
			complete
		} = options;
		// -- 定义变量
		let counter = timeStamp;
		let t: number;
		const interval = type === 'default' ? 1000 : 100;
		// -- 处理时间格式
		const f = (n: number | string) => {
			if (mode === 'seconds') return String(n);
			return Number(n) < 10 ? '0' + n : String(n);
		};
		// -- 按标准倒计时处理
		const calcForDefault = () => {
			const day = showDay ? f(Math.floor(counter / 1000 / 60 / 60 / 24)) : '';
			const hours = showDay
				? f(Math.floor((counter / 1000 / 60 / 60) % 24))
				: f(Math.floor(counter / 1000 / 60 / 60));
			const minutes = f(Math.floor((counter / 1000 / 60) % 60));
			const seconds = f(Math.floor((counter / 1000) % 60));
			const millisecond = f(Math.floor((counter % 1000) / 100));
			let res: string | string[] = '';
			// 判断是否格式返回
			if (format) {
				res = format
					.replace(/dd/gi, day)
					.replace(/hh/gi, hours)
					.replace(/mm/gi, minutes)
					.replace(/ss/gi, seconds)
					.replace(/ms/gi, millisecond);
			} else {
				if (type === 'default') res = [day, hours, minutes, seconds];
				if (type === 'ms') res = [day, hours, minutes, seconds, millisecond];
			}
			if (counter <= 0) {
				clearInterval(t);
				complete();
			} else {
				pending(res);
			}
		};
		const calcForSeconds = () => {
			const seconds = f(Math.floor(counter / 1000));
			const millisecond = f(Math.floor((counter % 1000) / 100));
			let res: string | string[] = '';
			if (format) {
				res = format.replace(/ss/gi, seconds).replace(/ms/gi, millisecond);
			} else {
				if (type === 'default') res = [seconds];
				if (type === 'ms') res = [seconds, millisecond];
			}
			if (counter <= 0) {
				clearInterval(t);
				complete();
			} else {
				pending(res);
			}
		};
		if (counter <= 0) {
			complete();
		} else {
			const tick = () => {
				counter -= interval;
				if (mode === 'default') calcForDefault();
				if (mode === 'seconds') calcForSeconds();
			};
			if (mode === 'default') calcForDefault();
			if (mode === 'seconds') calcForSeconds();
			t = setInterval(tick, interval);
			return t;
		}
	}

	/**
	 * 获取数据类型
	 * @param target
	 */
	public static toRawType(target: any) {
		return Object.prototype.toString.call(target).slice(8, -1).toLowerCase();
	}

	/**
	 * 百度统计
	 * @param options
	 */
	public static track(options: ITrackPv | ITrackEs) {
		if (window._hmt) {
			switch (options.type) {
				case 'pv':
					window._hmt.push([
						'_trackPageview',
						options.pageURL || location.pathname
					]);
					break;
				case 'es':
					window._hmt.push([
						'_trackEvent',
						options.category,
						options.action || 'click',
						options.opt_label,
						options.opt_value
					]);
					break;
			}
		}
	}
	/**
	 * 随机字符
	 * @param length
	 * @param type
	 */
	public static randomCharacters(
		length: number,
		type?: 'default' | 'uppercase' | 'lowercase' | 'digital'
	) {
		type = type || 'default';
		let bStr = '';
		switch (type) {
			case 'digital':
				bStr += '0123456789';
				break;
			case 'uppercase':
				bStr += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
				break;
			case 'lowercase':
				bStr += 'abcdefghijklmnopqrstuvwxyz';
				break;
			default:
				bStr += '0123456789';
				bStr += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
				bStr += 'abcdefghijklmnopqrstuvwxyz';
		}
		let rStr = '';
		for (let i = 0; i < length; ++i) {
			const index = Math.floor(Math.random() * bStr.length);
			rStr += bStr.slice(index, index + 1);
		}
		return rStr;
	}
	/**
	 * 获取指定范围内的随机数
	 * @param min
	 * @param max
	 */
	public static randomDecimals(min: number, max: number) {
		// 异常处理
		if (min === undefined || max === undefined || isNaN(min) || isNaN(max)) {
			return -1;
		} else {
			return Math.random() * (max - min) + min;
		}
	}
	/**
	 * 获取指定范围内的随机整数
	 * @param min
	 * @param max
	 */
	public static randomInteger(min: number, max: number) {
		if (min === undefined || max === undefined || isNaN(min) || isNaN(max)) {
			return -1;
		} else {
			return Math.floor(Math.random() * (max - min + 1)) + min;
		}
	}
	/**
	 * 全屏
	 */
	public static launchFullscreen() {
		const el: any = document.documentElement;
		const rfs =
			el.requestFullScreen ||
			el.webkitRequestFullScreen ||
			el.mozRequestFullScreen ||
			el.msRequestFullscreen;
		if (typeof rfs !== 'undefined' && rfs) {
			rfs.call(el);
		}
		return;
	}
	/**
	 * 退出全屏
	 */
	public static exitFullscreen() {
		if (document.fullscreenElement) {
			const el: any = document;
			const cfs =
				el.exitFullscreen ||
				el.mozCancelFullScreen ||
				el.webkitCancelFullScreen ||
				el.msExitFullscreen;
			if (typeof cfs !== 'undefined' && cfs) {
				cfs.call(el);
			}
		}
	}

	/**
	 * Blob流转Excel
	 * @param data 流
	 * @param fileName 导出文件名
	 */
	public static exportExcel(data: Blob, fileName: string) {
		return new Promise((resolve, reject) => {
			if (
				[
					'application/vnd.ms-excel',
					'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
				].indexOf(data.type) !== -1
			) {
				const blob = new Blob([data], { type: 'application/xlsx' });
				const objectURL = URL.createObjectURL(blob);
				let a: HTMLAnchorElement | null = document.createElement('a');
				a.download = fileName + '.xlsx';
				a.href = objectURL;
				a.click();
				URL.revokeObjectURL(objectURL);
				a = null;
				resolve(1);
			} else {
				reject(0);
			}
		});
	}
	/**
	 * 获取年份集合
	 * @param start 开始年/默认值：1970
	 * @param end 结束年/默认值：当前年
	 * @returns
	 */
	public static getYears(
		start: number = 1970,
		end: number = new Date().getFullYear()
	) {
		const years: string[] = [];
		for (let i = start; i <= end; i++) {
			years.push(`${i.toString()}年`);
		}
		return years;
	}
	/**
	 * 获取月份集合：[1-12]
	 * @returns
	 */
	public static getMonths() {
		const months: string[] = [];
		for (let i = 1; i <= 12; i++) {
			months.push((i < 10 ? `0${i}` : i.toString()) + '月');
		}
		return months;
	}
	/**
	 * 获取某月的天数集合
	 * @param options 可选项/如果赋值，则表示获取精确天数，默认为31天即[1-31]
	 * @returns
	 */
	public static getDays(options?: { year: number; month: number }) {
		const days: string[] = [];
		let max = 31;
		if (options) {
			const { year, month } = options;
			if ([4, 6, 9, 11].indexOf(month) !== -1) {
				max = 30;
			} else if (month === 2) {
				// 计算是否闰年
				if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
					max = 29;
				} else {
					max = 28;
				}
			}
		}
		for (let i = 1; i <= max; i++) {
			days.push((i < 10 ? `0${i}` : i.toString()) + '日');
		}
		return days;
	}

	/**
	 * 批量下载（导出）文件
	 *
	 * 使用 blob 流式下载时，需要注意以下几点：
	 * 1. 处理跨域问题：如果服务器没有设置合适的CORS策略，可能会阻止JavaScript访问文件。因此，需要确保服务器允许跨域请求。
	 * 2. 处理文件格式问题：不同的浏览器可能对不同的文件格式支持程度不同。因此，需要确保服务器提供的文件格式兼容各种浏览器，即指定 Content-Type。
	 *    当服务器不知道文件的确切 MIME 类型时，会使用 binary/octet-stream 作为默认值，导致浏览器会将这种 MIME 类型的数据作为二进制文件进行处理，通常会提示用户下载该文件。
	 *
	 * @param urls 文件地址，在线链接
	 * @param filename 文件名
	 * @param mode 下载类型：link（链接） | blob（文件流），默认值 blob
	 * @returns
	 */
	public static async downloadFiles(
		urls: string[],
		filename?: string | null,
		mode: 'link' | 'blob' = 'blob'
	) {
		// -- 异常处理
		if (!urls || urls.length === 0) {
			throw new Error('downloadFiles：urls 缺失或无下载资源');
		}

		// -- 下载方法
		const download = (href: string, filename: string) => {
			const a = document.createElement('a');
			a.style.display = 'none';
			a.href = href;
			a.download = filename;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			if (mode === 'blob') {
				URL.revokeObjectURL(href);
			}
		};

		// -- 生成文件名
		const generateFilename = (
			url: string,
			index: number,
			filename?: string | null
		): string => {
			let __filename: string;

			const urlObj = new URL(url);
			const pathname = urlObj.pathname;

			if (filename) {
				__filename = filename;
				if (urls.length > 1) __filename += index + 1;
			} else {
				const start = pathname.lastIndexOf('/') + 1;
				const end =
					pathname.lastIndexOf('.') !== -1
						? pathname.lastIndexOf('.')
						: pathname.length;
				__filename = pathname.slice(start, end);
			}

			const dotIndex = pathname.lastIndexOf('.');
			const extension = dotIndex !== -1 ? pathname.slice(dotIndex) : '.bin';

			return __filename + extension;
		};

		// -- 转换成 blob 并下载
		const convertToBlob = async (url: string, filename: string) => {
			try {
				const response = await fetch(url, { mode: 'cors' }); // Ensure CORS is enabled
				if (!response.ok) {
					throw new Error('downloadFiles：无法读取文件数据');
				}
				const blobData = await response.blob();
				download(URL.createObjectURL(blobData), filename);
			} catch (error: any) {
				throw new Error('downloadFiles：' + error.message);
			}
		};

		// -- 批量下载
		const downloadPromises = urls.map((url, index) => {
			const __filename = generateFilename(url, index, filename);
			if (mode === 'blob') {
				return convertToBlob(url, __filename);
			} else {
				download(url, __filename);
				return Promise.resolve();
			}
		});

		await Promise.all(downloadPromises);
	}

	/**
	 * 处理数字小于10时的格式/在小于10的数字前面拼接0
	 * @param num
	 * @returns
	 */
	public static numFormat(num: number) {
		return num < 10 ? `0${num}` : num.toString();
	}

	/**
	 * 获取当前运行环境
	 * @returns
	 * - android：安卓环境
	 * - ios：iOS环境
	 * - weixin：微信环境
	 * - alipay：支付宝环境
	 * - unknown：未知环境
	 */
	public static getEnv() {
		const _userAgent = window.navigator.userAgent;
		if (/MicroMessenger/i.test(_userAgent)) {
			return 'weixin';
		} else if (/AlipayClient/i.test(_userAgent)) {
			return 'alipay';
		} else if (/Linux|Android/i.test(_userAgent)) {
			return 'android';
		} else if (/iPhone/i.test(_userAgent)) {
			return 'ios';
		} else {
			return 'unknown';
		}
	}
	/**
	 * 获取文件存储路径
	 * 一般用于规范对象存储时的文件管理规范
	 * 生成格式如下：存储目录名/日期/随机字符（3个）+时间戳_图片本身名字.后缀名
	 * 示例：admin/avatar/20210630/ULK1625036350104_logo.png
	 * @param file
	 * @param dirName
	 * @returns
	 */
	public static getFilePath(file: File, dirName: string) {
		// 格式化
		const formatter = (n: number) => (n < 10 ? `0${n}` : n);
		// 当前日期
		const curDate = new Date();
		const year = curDate.getFullYear();
		const month = curDate.getMonth() + 1;
		const date = curDate.getDate();
		// 日期目录
		const dateDir = `${year}${formatter(month)}${formatter(date)}`; // 如：20210630
		// 获取文件后缀
		const suffix = file.name.split('.').slice(-1).toString();
		const filePath = `${dirName}/${dateDir}/${Tools.randomCharacters(
			3,
			'uppercase'
		)}${curDate.getTime()}.${suffix}`;
		return filePath;
	}

	/**
	 * 将 Base64 字符串转换为 Uint8Array
	 * @param {string} base64String - Base64 字符串
	 * @returns {Uint8Array} - 转换后的 Uint8Array
	 */
	public static base64ToUint8Array(base64String: string): Uint8Array {
		// -- 移除 data: 前缀（如果存在）
		const base64 = base64String.includes(',')
			? base64String.split(',')[1]
			: base64String;

		// -- 补齐 Base64 字符串的长度，使其长度是4的倍数
		const padding = '='.repeat((4 - (base64.length % 4)) % 4);
		const formattedBase64 = (base64 + padding)
			.replace(/-/g, '+') // 替换 URL 安全的字符
			.replace(/_/g, '/'); // 替换 URL 安全的字符

		// -- 解码 Base64 字符串
		try {
			const rawData = window.atob(formattedBase64);
			const outputArray = new Uint8Array(rawData.length);

			// 将解码后的字符串转换为 Uint8Array
			for (let i = 0; i < rawData.length; ++i) {
				outputArray[i] = rawData.charCodeAt(i);
			}

			return outputArray;
		} catch (error) {
			console.error('Failed to decode Base64 string:', error);
			throw new Error('Invalid Base64 string');
		}
	}

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
	public static base64(target: string | File | Blob): Promise<string> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			const handleFileOrBlob = (fileOrBlob: File | Blob) => {
				reader.readAsDataURL(fileOrBlob);
				reader.onload = () => {
					resolve(reader.result as string);
				};
				reader.onerror = () => {
					reject(new Error('读取文件或Blob对象失败'));
				};
			};
			if (target instanceof File || target instanceof Blob) {
				handleFileOrBlob(target);
			} else if (typeof target === 'string' && /http/.test(target)) {
				const xhr = new XMLHttpRequest();
				xhr.open('GET', target, true);
				xhr.responseType = 'blob';
				xhr.onload = function () {
					if (this.status === 200) {
						handleFileOrBlob(this.response);
					} else {
						reject(new Error('请求图片失败，状态码: ' + this.status));
					}
				};
				xhr.onerror = () => {
					reject(new Error('请求图片失败'));
				};
				xhr.send();
			} else {
				reject(new Error('文件格式有误或目标类型不支持'));
			}
		});
	}
	/**
	 * 动态加载script标签
	 * @param src {string | string[]} 加载脚本的地址，
	 * @param type {string} 默认值：text/javascript
	 */
	public static loadScript(
		src: string | string[],
		type: string = 'text/javascript'
	) {
		// 异常处理
		if (!src || (src && src.length === 0)) {
			throw new Error('lg-tools: loading script error. [no params]');
		}
		if (['string', 'array'].indexOf(Tools.toRawType(src)) === -1) {
			throw new Error('lg-tools: loading script error. [type error]');
		}
		let srcs: string[] = [];
		// 如果传入的是字符串
		if (Tools.toRawType(src) === 'string') {
			srcs = [src as string];
		}
		// 如果传入的数组
		if (Tools.toRawType(src) === 'array') {
			srcs = src as string[];
		}
		srcs.forEach((s) => {
			const script = window.document.createElement('script');
			script.setAttribute('type', type);
			script.setAttribute('src', s);
			document.body.appendChild(script);
		});
	}

	/**
	 * 深拷贝
	 * @param source 源数据
	 * @returns
	 */
	public static deepClone<T = any>(source: T): T {
		// -- 处理初始值
		const cloneObj = (Array.isArray(source) ? [] : {}) as
			| Record<string, any>
			| T;
		// -- 判断处理
		if (source && typeof source === 'object') {
			for (const key in source) {
				if (Object.prototype.hasOwnProperty.call(source, key)) {
					// 判断 source 子元素是否为对象
					if (
						source[key] &&
						typeof source[key] === 'object' &&
						!(source[key] instanceof HTMLElement)
					) {
						// 如果是，递归复制
						cloneObj[key] = Tools.deepClone(source[key]);
					} else {
						// 如果不是，简单复制
						cloneObj[key] = source[key];
					}
				}
			}
		}
		return cloneObj as T;
	}
	/**
	 * 更新对象，支持namePath形式
	 * 如果你需要深拷贝更新，请试用Tools.deepUpdate
	 * @param source  原始对象
	 * @param namePath eg: 'user' or 'user.name'
	 * @param value   更新值
	 */
	public static update<T = Record<string, any>>(
		source: T,
		namePath: string,
		value: any
	) {
		if (/\./.test(namePath)) {
			let cash: any = source;
			let i = 0;
			const keys = namePath.split('.');
			while (i < keys.length - 1) {
				const k = keys[i++];
				if (k in cash) {
					cash = cash[k];
				} else {
					cash[k] = {};
					cash = cash[k];
				}
			}
			cash[keys[keys.length - 1]] = value;
		} else {
			source[namePath as keyof T] = value;
		}
		return source;
	}
	/**
	 * 深拷贝更新对象值
	 * @param source  原始对象
	 * @param namePath eg: 'user' or 'user.name'
	 * @param value   更新值
	 * @returns
	 */
	public static deepUpdate<T = Record<string, any>>(
		source: T,
		namePath: string,
		value: any
	) {
		const o = Tools.deepClone<T>(source);
		return Tools.update<T>(o, namePath, value);
	}

	/**
	 * 获取上一天
	 * @returns 返回日期对象
	 */
	public static getLastDay() {
		return new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
	}
	/**
	 * 获取上一月
	 * @returns 返回日期对象
	 */
	public static getLastMonth() {
		const date = new Date();
		let year = date.getFullYear();
		let month = date.getMonth();
		if (month === 0) {
			year = year - 1;
			month = 12;
		}
		return new Date(`${year}-${month}`);
	}
	/**
	 * 函数防抖
	 * @param cb  回调函数
	 * @param delay 延迟时间，默认500ms
	 * @returns
	 */
	public static debounce(cb: (...args: any) => void, delay = 500) {
		let t: any = null;
		return (...args: any) => {
			t && clearTimeout(t);
			t = setTimeout(() => {
				cb.apply(this, args);
			}, delay);
		};
	}

	/**
	 * 输入日期查询星座
	 * @param $1 日期/数值类型，为数值类型是，$1表示月份(1-12)
	 * @param $2 数值类型 日期（天）(1-31)
	 * @returns 如果匹配，则返回对应星座，否则返回空字符串（''）
	 */
	public static getConstellation($1: number | Date, $2?: number) {
		// - 如果第1个参数没有传，则直接返回空字符串
		if (!$1) {
			return '';
		}
		// - 定义日期
		let month: number;
		let day: number;
		// - 如果第1个参数为Date类型，则直接赋值month、day变量；
		if (Tools.toRawType($1) === 'date') {
			month = ($1 as Date).getMonth() + 1;
			day = ($1 as Date).getDate();
		} else if (typeof $1 !== 'number' || typeof $2 !== 'number') {
			return '';
		} else if ($1 < 1 || $1 > 12 || $2 < 1 || $2 > 31) {
			return '';
		} else {
			month = $1;
			day = $2;
		}
		// - 返回匹配星座
		let r = '';
		switch (month) {
			case 1:
				r = day > 19 ? '水瓶座' : '摩羯座';
				break;
			case 2:
				r = day > 18 ? '双鱼座' : '水瓶座';
				break;
			case 3:
				r = day > 20 ? '白羊座' : '双鱼座';
				break;
			case 4:
				r = day > 19 ? '金牛座' : '白羊座';
				break;
			case 5:
				r = day > 20 ? '双子座' : '金牛座';
				break;
			case 6:
				r = day > 21 ? '巨蟹座' : '双子座';
				break;
			case 7:
				r = day > 22 ? '狮子座' : '巨蟹座';
				break;
			case 8:
				r = day > 22 ? '处女座' : '狮子座';
				break;
			case 9:
				r = day > 22 ? '天秤座' : '处女座';
				break;
			case 10:
				r = day > 23 ? '天蝎座' : '天秤座';
				break;
			case 11:
				r = day > 22 ? '射手座' : '天蝎座';
				break;
			case 12:
				r = day > 21 ? '摩羯座' : '射手座';
				break;
		}
		return r;
	}

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
	public static canvasFillText(
		context: CanvasRenderingContext2D,
		text: string,
		x: number,
		y: number,
		lineHeight: number,
		maxWidth?: number,
		rows = 5
	) {
		// 1. 异常处理
		if (
			!context ||
			typeof text !== 'string' ||
			typeof x !== 'number' ||
			typeof y !== 'number' ||
			typeof lineHeight !== 'number' ||
			typeof maxWidth !== 'number'
		) {
			return 0;
		}
		// 2. 默认配置
		context.textBaseline = 'top';
		// 3. 获取canvas实例
		const canvas = context.canvas;
		// 4. 最大宽度(如果没有设置maxWidth，则自动获取canvas宽度作为maxWidth值)
		const _maxWidth =
			typeof maxWidth === 'undefined'
				? (canvas && canvas.width) || 200
				: maxWidth;
		// 5. 定义一些变量
		let lineWidth = 0; // 动态计算当前行在追加1个字符后所占的宽度（用于与maxWidth比较判断是否应该换行）
		let curRow = 1; // 记录当前行
		let lastSubStrIndex = 0; // 记录上一次开始截取的下标位置（用于下一行fill时截取字符串）
		// 6. 遍历字符
		const letters = text.split('');
		for (let i = 0; i < letters.length; i++) {
			// 累计计算拼接当前字符后当前行所占的宽度
			lineWidth += context.measureText(letters[i]).width;
			// 如果追加1个字符后所占宽度大于最大宽度，则需要换行（或者说就应该渲染当前行了）
			if (lineWidth > _maxWidth) {
				// 行数+1
				curRow++;
				// 截取要展示的字符（截取到i即可，因为如果加上下标值为i的字符已经超过了maxWidth）
				let fillStr = text.slice(lastSubStrIndex, i);
				// 如果当前行大于了最大显示行数，则已省略后续文本渲染，超出部分以“...”呈现
				if (curRow > rows && text.length > i) {
					fillStr = text.substring(lastSubStrIndex, i - 2) + ' ...';
				}
				// 渲染当前行的文本
				context.fillText(fillStr, x, y);
				// 另起一行，重置lineWidth
				lineWidth = 0;
				// 更新下一行渲染时的y坐标值
				y += lineHeight;
				// 更新下一行截取字符串渲染的起始位置
				lastSubStrIndex = i;
				// 如果渲染行数大于等于最大行数，则跳出循环
				if (curRow > rows) {
					break;
				}
			}
			// 当只剩最后一字时，绘制剩余部分。
			if (i === text.length - 1) {
				context.fillText(text.slice(lastSubStrIndex, i + 1), x, y);
				curRow++;
			}
		}
		return (curRow - 1) * lineHeight;
	}

	/**
	 * 文本溢出省略处理
	 * @param str  源字符串
	 * @param len  长度 / 规则，指定前后保留的位数，默认为6
	 * @param type 省略类型: 'head' | 'center' | 'tail'
	 * @returns
	 */
	public static ellipsis(
		str: string,
		len = 6,
		type: 'head' | 'middle' | 'tail' = 'middle'
	) {
		// 异常处理
		if (typeof str !== 'string' || !str || (str && str.length <= len)) {
			return str;
		}
		// 如果字符串长度在 len ~ len * 2 之间，重新计算len
		if (str.length < len * 2) {
			len = Math.ceil(str.length / 2);
		}
		const s1 = str.slice(0, len);
		const s2 = str.slice(-len);

		switch (type) {
			case 'head':
				return `··· ${s2}`;
			case 'middle':
				return `${s1} ··· ${s2}`;
			case 'tail':
				return `${s1} ···`;
			default:
				return str;
		}
	}

	/**
	 * 解析日期字符串
	 * 一般用于根据年月筛选时，将日期字符串返回起始传递给后端（严格上来讲后端处理即可）
	 * 如：2022-02，返回 {start: '202-02-01 00:00:00', end: '202-02-28 23:59:59'}
	 * @param dateString 日期字符串，格式：YYYY-MM
	 * @returns
	 */
	public static analysisDateString(dateString: string) {
		if (typeof dateString !== 'string') {
			return { start: undefined, end: undefined };
		}
		// -- 解构日期字符串
		const [year, month] = dateString.split('-');
		// -- 异常处理
		if (isNaN(Number(year)) || isNaN(Number(month))) {
			return { start: undefined, end: undefined };
		}
		// -- 计算平年 & 闰年
		let isLeapYear = false;
		if ((+year % 4 === 0 && +year % 100 !== 0) || +year % 400 === 0) {
			isLeapYear = true;
		}
		// -- 处理
		const dayArr = [
			31,
			isLeapYear ? 29 : 28,
			31,
			30,
			31,
			30,
			31,
			31,
			30,
			31,
			30,
			31
		];
		const days = dayArr[+month - 1];
		// -- 返回
		return {
			start: `${dateString}-01 00:00:00`,
			end: `${dateString}-${days < 10 ? '0' + days : days} 23:59:59`
		};
	}

	/**
	 * 打乱数组的顺序
	 * @param array - 需要打乱顺序的数组
	 * @returns 打乱顺序后的数组
	 */
	public static shuffleArray<T = any>(array: T[]): T[] {
		// -- 创建一个数组的副本以防止修改原数组
		const shuffledArr = [...array];
		// -- 使用Fisher-Yates算法打乱数组
		for (let i = shuffledArr.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[shuffledArr[i], shuffledArr[j]] = [shuffledArr[j], shuffledArr[i]];
		}
		return shuffledArr;
	}

	/**
	 * 线程休眠
	 * @param delay
	 * @returns
	 */
	public static sleep(delay = 500) {
		return new Promise((resolve) => setTimeout(resolve, delay));
	}
}
export default Tools;
