/*
 * @Author: Li-HONGYAO
 * @Date: 2020-11-28 03:43:56
 * @LastEditors: Lee
 * @LastEditTime: 2023-08-17 13:30:35
 * @Description:
 */

interface ICheckFileSize {
	type: 'size';
	maxSize: number;
	file: File;
}
interface ICheckFileExtension {
	type: 'extension';
	accept: string;
	file: File;
}

class Validator {
	/**
	 * 中文名校验
	 * @param v
	 */
	public static isChineseName(v: string) {
		return /^[\u4e00-\u9fa5]{2,6}$/.test(v);
	}
	/**
	 * 身份证校验
	 * @param v
	 */
	public static isIdCard(id: string) {
		// 18位身份证正则表达式
		const regex18 = /^(\\d{17}[0-9X]$)/;
		// 15位身份证正则表达式
		const regex15 = /^\d{15}$/;

		// 检查长度和基本格式
		if (id.length === 18) {
			if (!regex18.test(id)) return false;

			// 18位身份证号最后一位为校验位
			const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
			const checkCodes = '10X98765432';

			let sum = 0;
			for (let i = 0; i < 17; i++) {
				sum += Number(id[i]) * weights[i];
			}

			const checkCode = checkCodes[sum % 11];
			return checkCode === id[17];
		} else if (id.length === 15) {
			return regex15.test(id);
		}

		return false; // 不符合身份证号长度
	}
	/**
	 * 验证微信号
	 * 1. 可使用6-20个字母、数字、下划线和减号；
	 * 2. 必须以字母开头（字母不区分大小写）；
	 * 3. 不支持设置中文；
	 * @param v
	 */
	public static isWeChatId(v: string) {
		return /^[a-zA-Z][a-zA-Z\d_-]{5,19}$/.test(v);
	}
	/**
	 * 验证QQ号
	 * @param v
	 */
	public static isQQ(v: string) {
		return /^\d{5,15}$/.test(v);
	}
	/**
	 * 验证邮箱
	 * @param v
	 */
	public static isEmail(v: string) {
		return /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(v);
	}
	/**
	 * 验证手机号
	 * @param v
	 */
	public static isTel(v: string) {
		return /^1[3-9]\d{9}$/.test(v);
	}
	/**
	 * 验证手机验证码
	 * @param v
	 */
	public static isCode(v: string) {
		return /^\d{6}$/.test(v);
	}
	/**
	 * 验证Android环境
	 */
	public static isAndroid() {
		return /Linux|Android/i.test(window.navigator.userAgent);
	}
	/**
	 * 验证iOS环境
	 */
	public static isiOS() {
		return /iPhone/i.test(window.navigator.userAgent);
	}
	/**
	 * 验证微信环境
	 */
	public static isWeixin() {
		return /MicroMessenger/i.test(window.navigator.userAgent);
	}
	/**
	 * 验证是否是刘海屏
	 */
	public static isBangScreen() {
		return (
			window && window.screen.height >= 812 && window.devicePixelRatio >= 2
		);
	}

	/**
	 * 判断是否是有效日期
	 * @param date
	 * @returns
	 */
	public static isValidDate(date: Date) {
		return date instanceof Date && !isNaN(date.getTime());
	}

	/**
	 * 判断某个日期是否是今日
	 * @param $
	 * @returns
	 */
	public static isToday(v: Date | string | number) {
		const d1 = new Date(v);
		if (Validator.isValidDate(d1)) {
			const d2 = new Date();
			const s1 = `${d1.getFullYear()}${d1.getMonth()}${d1.getDate()}`;
			const s2 = `${d2.getFullYear()}${d2.getMonth()}${d2.getDate()}`;
			return s1 === s2;
		}
		return false;
	}
	/**
	 * 校验目标值是否是一个JSON字符串
	 * @param target
	 * @returns
	 */
	public static isJSON(target: any) {
		if (typeof target !== 'string') {
			return false;
		}
		try {
			const obj = JSON.parse(target);
			if (obj && typeof obj === 'object') {
				return true;
			} else {
				return false;
			}
		} catch (e) {
			return false;
		}
	}

	/**
	 * 检验目标字符串是否包含音频后缀
	 * @param src
	 */
	public static isAudio(src: string) {
		return /\.(mp3|wav|ogg|flac|aac|wma|m4a)\b/g.test(src);
	}

	/**
	 * 检验目标字符串是否包含视频后缀
	 * @param src
	 */
	public static isVideo(src: string) {
		return /\.(mp4|avi|mov|wmv|flv|mkv|webm)\b/g.test(src);
	}

	/**
	 * 文件尺寸/扩展名校验
	 * @param options
	 * @returns
	 */
	public static checkFile(options: ICheckFileSize | ICheckFileExtension) {
		const { type, file } = options;

		// 校验文件大小
		if (type === 'size') {
			const { maxSize } = options;
			if (file.size > maxSize * 1024 * 1024) {
				return false;
			}
			return true;
		}

		// 校验文件后缀
		if (type === 'extension') {
			let { accept } = options;
			const index = file.name.lastIndexOf('.');
			if (index === -1) {
				return false;
			}
			const extension = file.name.slice(index);
			if (/image\/\*/i.test(accept)) {
				accept = '.jpg, .jpeg, .png, .gif, .bmp, .webp, .svg';
			} else if (/video\/\*/i.test(accept)) {
				accept = '.mp4, .avi, .mkv, .mov, .wmv, .flv, .rmvb, .mpeg, .mpg';
			} else if (/audio\/\*/i.test(accept)) {
				accept = '.mp3, .wav, .wma, .rm, .mid, .aac, .ogg';
			}
			return accept
				.split(',')
				.map((v) => v.trim())
				.includes(extension);
		}
		return false;
	}

	/**
	 * 车牌号校验
	 * @param plate
	 * @returns
	 */
	public static isLicensePlate(plate: string) {
		// 1. 蓝牌车牌（民用车）：1个汉字 + 1个字母 + 5个字母或数字
		const bluePlate =
			/^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼港澳]{1}[A-Z]{1}[A-Z0-9]{5}$/;
		// 2. 黄牌车牌（货车或营运车）：1个汉字 + 1个字母 + 5个字母或数字，但第二个字符不能是字母 'I' 或 'O'
		const yellowPlate =
			/^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼港澳]{1}[A-HJ-NP-Z]{1}[A-Z0-9]{5}$/;
		// 3. 绿牌车牌（新能源车）：1个汉字 + 1个字母 + D或F + 5个字母或数字（小型新能源）或 4个数字
		const greenPlateSmall =
			/^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼港澳]{1}[A-Z]{1}[DF]{1}[A-Z0-9]{5}$/;
		const greenPlateLarge =
			/^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼港澳]{1}[A-Z]{1}[DF]{1}[0-9]{4}$/;
		return (
			bluePlate.test(plate) ||
			yellowPlate.test(plate) ||
			greenPlateSmall.test(plate) ||
			greenPlateLarge.test(plate)
		);
	}

	/**
	 * 驾驶证号校验（粗率）
	 * @param license
	 * @returns
	 */
	public static isDriverLicense(license: string) {
		return /^[A-Z]{1}[0-9]{1}[A-Z]{1}[0-9]{1}[A-Z]{1}[0-9]{1}[0-9]{2}$/.test(
			license
		);
	}

	/**
	 * 行驶证号校验（粗率）
	 * @param license
	 * @returns
	 */
	public static isVehicleLicense(license: string) {
		return /^[A-Z]{1}[A-Z0-9]{1}\d{5}[A-Z0-9]{3}\d{5}$/.test(license);
	}
}

export default Validator;
