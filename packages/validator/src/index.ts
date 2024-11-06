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
	 * 验证身份证号码的有效性
	 */
	public static isIdCard(idCard: string): boolean {
		// -- 城市代码列表，用于验证身份证的省份编码是否有效
		const cityCodes: Record<string, string> = {
			11: '北京',
			12: '天津',
			13: '河北',
			14: '山西',
			15: '内蒙古',
			21: '辽宁',
			22: '吉林',
			23: '黑龙江',
			31: '上海',
			32: '江苏',
			33: '浙江',
			34: '安徽',
			35: '福建',
			36: '江西',
			37: '山东',
			41: '河南',
			42: '湖北',
			43: '湖南',
			44: '广东',
			45: '广西',
			46: '海南',
			50: '重庆',
			51: '四川',
			52: '贵州',
			53: '云南',
			54: '西藏',
			61: '陕西',
			62: '甘肃',
			63: '青海',
			64: '宁夏',
			65: '新疆',
			71: '台湾',
			81: '香港',
			82: '澳门',
			91: '国外'
		};

		// -- 检查身份证格式是否符合15位或18位的标准
		const isCardNo =
			/^[1-9]\d{5}(18|19|20)?\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/.test(
				idCard
			);

		// -- 验证身份证的省份编码是否存在于城市代码列表
		const isValidProvince = !!cityCodes[idCard.slice(0, 2)];

		// -- 提取身份证中的生日信息并验证其合理性
		const year =
			idCard.length === 18
				? +idCard.slice(6, 10)
				: +('19' + idCard.slice(6, 8));
		const month = +idCard.slice(
			idCard.length === 18 ? 10 : 8,
			idCard.length === 18 ? 12 : 10
		);
		const day = +idCard.slice(
			idCard.length === 18 ? 12 : 10,
			idCard.length === 18 ? 14 : 12
		);

		// -- 创建生日日期对象并检查是否是有效日期，且年龄范围在3到150岁之间
		const birthday = new Date(year, month - 1, day);
		const isValidBirthday =
			birthday.getFullYear() === year &&
			birthday.getMonth() + 1 === month &&
			birthday.getDate() === day &&
			year >= new Date().getFullYear() - 150 &&
			year <= new Date().getFullYear() - 3;

		// 计算校验位（仅适用于18位身份证），并验证身份证最后一位是否符合校验规则
		const calcChecksum = (card: string): boolean => {
			const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
			const checkDigits = [
				'1',
				'0',
				'X',
				'9',
				'8',
				'7',
				'6',
				'5',
				'4',
				'3',
				'2'
			];
			const sum = card
				.slice(0, 17)
				.split('')
				.reduce((acc, curr, idx) => acc + +curr * weights[idx], 0);
			return checkDigits[sum % 11] === card[17];
		};

		// 当为15位身份证时，将其转换为18位以便进行校验位验证
		const toEighteenDigits = (card: string): string => {
			if (card.length === 15) {
				// 1. 插入'19'以扩展年份部分，使之符合18位身份证格式
				const extendedCard = card.slice(0, 6) + '19' + card.slice(6);

				// 2. 定义校验码列表，用于与校验和匹配，得到校验位
				const checkDigits = [
					'1',
					'0',
					'X',
					'9',
					'8',
					'7',
					'6',
					'5',
					'4',
					'3',
					'2'
				];

				// 3. 定义加权因子列表，用于计算校验和
				const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];

				// 4. 计算加权和，将15位号码（扩展为18位的前17位）逐位乘以加权因子并求和
				const sum = Array.from(extendedCard).reduce(
					(acc, num, idx) => acc + +num * weights[idx],
					0
				);

				// 5. 通过取模得到对应的校验码
				const checksum = checkDigits[sum % 11];

				// 6. 将校验码添加到身份证号码末尾，形成完整的18位号码
				return extendedCard + checksum;
			}

			// 如果输入已经是18位，直接返回
			return card;
		};

		// 执行完整的校验过程
		return (
			isCardNo &&
			isValidProvince &&
			isValidBirthday &&
			(idCard.length === 15 || calcChecksum(toEighteenDigits(idCard)))
		);
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
	 * 1.	普通车牌号 (regularPlatePattern)：该正则表达式确保车牌号码包含一个省份简称（汉字）和五个字符（A-Z 或 0-9），并且不包含字母 I 和 O
	 * 2.	新能源小型车 (newEnergySmallPattern)：验证省份简称 + 发牌机关字母（D 或 F） + 一位字母或数字 + 四位数字。
	 * 3.	新能源大型车 (newEnergyLargePattern)：验证省份简称 + 发牌机关字母 + 前五位数字 + 最后一个字母为 D 或 F。
	 */
	public static isLicensePlate(licensePlate: string) {
		// 普通车辆的车牌号规则：汉字 + A-Z + 5位A-Z或0-9，且不包含字母I和O
		const regularPlatePattern =
			/^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-HJ-NP-Z0-9]{4}[A-HJ-NP-Z0-9挂学警港澳台]{1}$/;

		// 新能源小型车牌号规则：省份简称（1位汉字）+ 发牌机关代号（1位字母D或F）+ 1位字母或数字 + 4位数字
		const newEnergySmallPattern =
			/^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[DF][A-HJ-NP-Z0-9][0-9]{4}$/;

		// 新能源大型车牌号规则：省份简称（1位汉字）+ 发牌机关代号（1位字母）+ 前5位数字 + 第6位字母D或F
		const newEnergyLargePattern =
			/^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[0-9]{5}[DF]$/;

		// 检查车牌号是否符合普通车辆规则或新能源汽车规则
		return (
			regularPlatePattern.test(licensePlate) ||
			newEnergySmallPattern.test(licensePlate) ||
			newEnergyLargePattern.test(licensePlate)
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
