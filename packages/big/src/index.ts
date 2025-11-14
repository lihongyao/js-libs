type OperationType = "+" | "-" | "*" | "/";

class Big {
	private v: number;
	constructor(v: number | string) {
		const t = parseFloat(v.toString());
		this.v = Number.isNaN(t) ? 0 : t;
	}
	/**
	 * 工具函数：转换整数，返回倍数及整数值，比如
	 * 100  >>> { times: 1,   num: 100 } ===> 100
	 * 3.14 >>> { times: 100, num: 3.14} ===> 314
	 * @param n number
	 */
	private toInteger(n: number) {
		const ret = { times: 1, num: 0 };
		if (Number.isInteger(n)) {
			ret.num = n;
			return ret;
		}
		ret.times = 10 ** n.toString().split(".")[1].length;
		ret.num = parseInt((n * ret.times).toString(), 10);
		return ret;
	}
	/**
	 * 工具函数：执行运算
	 * @param m 数值m
	 * @param n 数值n
	 * @param key 运算符
	 */
	private operation(m: number = 0, n: number = 0, key: OperationType) {
		const o1 = this.toInteger(m);
		const o2 = this.toInteger(n);

		const n1 = o1.num;
		const n2 = o2.num;

		const t1 = o1.times;
		const t2 = o2.times;

		const max = Math.max(t1, t2);
		let result = 0;
		switch (key) {
			case "+":
				if (t1 < t2) {
					result = n1 * (t2 / t1) + n2;
				} else if (t1 > t2) {
					result = n1 + n2 * (t1 / t2);
				} else {
					result = n1 + n2;
				}
				result /= max;
				break;
			case "-":
				if (t1 < t2) {
					result = n1 * (t2 / t1) - n2;
				} else if (t1 > t2) {
					result = n1 - n2 * (t1 / t2);
				} else {
					result = n1 - n2;
				}
				result /= max;
				break;
			case "*":
				result = (n1 * n2) / (t1 * t2);
				break;
			case "/":
				result = (n1 * t2) / (t1 * n2);
				break;
			default:
				result = 0;
		}
		return new Big(result);
	}
	/**
	 * 工具函数：数值化
	 * @param n
	 */
	private numeric(n: number | string | Big) {
		if (n instanceof Big) {
			return n.v;
		} else {
			const t = parseFloat(n.toString());
			return Number.isNaN(t) ? 0 : t;
		}
	}

	/**
	 * 加法运算
	 * @param {number|string|Big} n 运算值
	 */
	public plus(n: number | string | Big) {
		return this.operation(this.v, this.numeric(n), "+");
	}
	/**
	 * 减法运算
	 * @param {number|string|Big} n 运算值
	 */
	public minus(n: number | string | Big) {
		return this.operation(this.v, this.numeric(n), "-");
	}
	/**
	 * 乘法运算
	 * @param {number|string|Big} n 运算值
	 */
	public multipliedBy(n: number | string | Big) {
		return this.operation(this.v, this.numeric(n), "*");
	}
	/**
	 * 除法运算
	 * @param {number|string|Big} n 运算值
	 */
	public dividedBy(n: number | string | Big) {
		return this.operation(this.v, this.numeric(n), "/");
	}

	/**
	 * 解析结果
	 */
	public parse() {
		return this.v;
	}

	/**
	 * 小数点后固定指定位数，比如固定小数点后5位数字，则有
	 * 30 → 30.00000
	 * 3.14 → 3.14000
	 * @param {number} v
	 */
	public static digits(v: number, len: number = 2) {
		if (Number.isInteger(v)) {
			return `${v}.${Array(len).fill(0).join("")}`;
		} else {
			const [prefix, suffix] = v.toString().split(".");
			const sLen = suffix.length;
			if (sLen > len) {
				return `${prefix}.${suffix.slice(0, len)}`;
			} else if (sLen < len) {
				return `${prefix}.${suffix}${Array(len - sLen)
					.fill(0)
					.join("")}`;
			} else {
				return `${prefix}.${suffix}`;
			}
		}
	}
	public digits(len: number) {
		return Big.digits(this.v, len);
	}

	/**
	 * 人民币格式处理
	 * - 非数字：返回0
	 * - 整数：直接返回
	 * - 小数：保留小数点后两位，超出两位则截取
	 * @param {number|string} v
	 */
	public static rmb(v: number | string) {
		if (Number.isNaN(Number(v))) {
			return "0";
		} else {
			const foo = v.toString();
			if (/^[0-9]+$/.test(foo)) {
				return foo;
			} else {
				const [prefix, suffix] = foo.split(".");
				const sLen = suffix.length;
				if (sLen > 2) {
					return `${prefix}.${suffix.slice(0, 2)}`;
				} else if (sLen < 2) {
					return `${foo}0`;
				} else {
					return foo;
				}
			}
		}
	}
	public rmb() {
		return Big.rmb(this.v);
	}
	/**
	 * 切割数字
	 * @param {number|string} v
	 */
	public static split(v: number | string) {
		if (Number.isNaN(Number(v))) {
			return [];
		} else {
			return v
				.toString()
				.split(".")
				.map((item, i) => {
					if (i === 1) {
						return item.padEnd(2, "0");
					}
					return item;
				});
		}
	}
	public split() {
		return Big.split(this.v);
	}

	/**
	 * 省略 --> 如果超过1万，则返回万制，转换后小数点后保留两位
	 * 比如：12345 返回 1.23万
	 * @param {number|string} v
	 */
	public static ellipsis(v: number | string) {
		// 如果不是数值类型并且转换之后不为数字，则直接返回传入值
		if (Number.isNaN(Number(v))) {
			return v.toString();
		}
		// 如果传入数值小于1万则没必要转换，直接返回
		if (+v < 10000) {
			return v.toString();
		}
		// 超过1万，处理之后再返回
		return `${Big.rmb(+v / 10000)}万`;
	}
	public ellipsis() {
		return Big.ellipsis(this.v);
	}
}

export default Big;
