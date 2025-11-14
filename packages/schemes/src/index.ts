interface PushOptions {
	// 携带参数
	query?: Record<string, any>;
	// 是否需要原生实现导航栏（默认：0）
	needHeader?: 0 | 1;
	// 是否需要原生返回（默认：1）
	appBack?: 0 | 1;
}

class HSchemes {
	private __SCHEME: string = "";
	private __BASE: string = "";

	// 构造单例
	private static instance: HSchemes | null = null;

	// 私有构造函数，防止外部实例化
	private constructor() {}

	/**
	 * 获取Scheme单例实例对象
	 * @returns 返回实例对象
	 */
	public static defaultSchemes(): HSchemes {
		if (HSchemes.instance === null) {
			HSchemes.instance = new HSchemes();
		}
		return HSchemes.instance;
	}

	/**
	 * 全局配置项，你应该在项目初始化时调用config进行配置。
	 *
	 * @param scheme scheme地址，只需要配置前缀，如：ddou://www.d-dou.com
	 * @param base 二级目录地址
	 */
	public config(scheme: string, base: string = ""): void {
		if (base && !/^\//.test(base)) {
			base = `/${base}`;
		}
		this.__SCHEME = scheme;
		this.__BASE = base;
	}

	/**
	 * 跳转H5页面
	 *
	 * @param path H5路由
	 * @param options 可选项
	 */
	public push(path: string, options: PushOptions = {}): void {
		const SCHEME_PUSH = `${this.__SCHEME}/push`;
		// 解构参数
		const { query, needHeader = 0, appBack = 1 } = options;

		let url: string;
		if (/^http/.test(path)) {
			url = path;
		} else {
			url = `${window.location.origin}${this.__BASE}${path}?needHeader=${needHeader}&appBack=${appBack}`;
			if (query) {
				Object.keys(query).forEach((key) => {
					url += `&${key}=${query[key]}`;
				});
			}
		}

		const schemeHref = `${SCHEME_PUSH}?url=${encodeURIComponent(url)}`;
		window.location.href = schemeHref;
	}

	/**
	 * 切换原生tab页
	 * @param index tab索引
	 */
	public switchTab(index: number): void {
		const SCHEME_SWITCH = `${this.__SCHEME}/switch`;
		window.location.href = `${SCHEME_SWITCH}?index=${index}`;
	}

	/**
	 * 跳转原生页面
	 *
	 * @param path 页面路径
	 * @param params 可选参数
	 */
	public jump(path: string, params?: Record<string, any>): void {
		const SCHEME_JUMP = `${this.__SCHEME}/jump`;
		let schemeHref = `${SCHEME_JUMP}${path}`;
		if (params) {
			schemeHref += "?";
			Object.keys(params).forEach((key) => {
				schemeHref += `${key}=${params[key]}&`;
			});
			schemeHref = schemeHref.slice(0, -1);
		}
		window.location.href = schemeHref;
	}

	/**
	 * 原生打开外部浏览器
	 * @param url 资源地址
	 */
	public openBrowser(url: string): void {
		const SCHEME_BROWSER = `${this.__SCHEME}/browser`;
		window.location.href = `${SCHEME_BROWSER}?url=${encodeURIComponent(url)}`;
	}
}

// 导出单例
const Schemes = HSchemes.defaultSchemes();
export default Schemes;
