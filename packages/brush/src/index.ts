/**
 * 构造函数选项
 */
export type BrushOptions = {
	/** ID */
	id?: string;
	/** 画笔颜色，默认值 #333 */
	color?: string;
	/** 画笔粗细，默认值 2 */
	thickness?: number;
	/** 生命周期内临时保留画板内容 */
	storage?: boolean;
	/** 绘画记录·最大长度，默认值 50 */
	maxHistoriesLength?: number;
	/** 开始绘制回调 */
	onDrawBegin?: () => void;
	/** 结束绘制回调 */
	onDrawEnd?: () => void;
};

/**
 * 挂载选项
 */
export type BrushMountOptions = {
	/** 挂载元素 */
	target?: HTMLElement;
};

/**
 * 坐标点
 */
export type BrushPoint = { x: number; y: number };

/**
 * 保存图片选项
 */
export type BrushImageOptions = {
	/** 文件类型 */
	type: string;
	/** 文件名 */
	filename: string;
	/** 图片质量 */
	quality: number;
};

/**
 * 历史记录
 */
export type BrushHistory = {
	/** 时间戳 */
	timestamp: number;
	/** 数据 */
	data: ImageData;
};

export default class Brush {
	/** 配置项目 */
	private brushOptions: Required<BrushOptions>;
	/** 画板 */
	private canvas: HTMLCanvasElement | null = null;
	/** 画笔 */
	private ctx: CanvasRenderingContext2D | null = null;
	/** 橡皮擦元素 */
	private eraserCursor: HTMLDivElement | null = null;
	/** 绘制状态 */
	private isDrawing: boolean = false;
	/** 橡皮擦状态 */
	private isEraser: boolean = false;
	/** 上一次位置 */
	private prevPoint: BrushPoint = { x: 0, y: 0 };
	/** 绘画记录·列表 */
	private histories: Array<BrushHistory> = [];
	/** 绘画记录·下标（用于处理撤销和重做） */
	private historiesIndex: number = -1;

	/**
	 * 构造函数
	 * @param options
	 */
	constructor(options?: BrushOptions) {
		this.brushOptions = {
			id: 'LG_BRUSH_PERSISTENCE',
			color: '#333',
			thickness: 2,
			storage: false,
			maxHistoriesLength: 50,
			onDrawBegin: () => { },
			onDrawEnd: () => { },
			...(options || {})
		};
	}

	/**
	 * 获取默认文件名，保存图片时调用
	 * @returns 
	 */
	private _getDefaultFilename() {
		const date = new Date();
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		const hour = String(date.getHours()).padStart(2, '0');
		const minute = String(date.getMinutes()).padStart(2, '0');
		const seconds = String(date.getSeconds()).padStart(2, '0');
		return `BRUSH_${year}${month}${day}${hour}${minute}${seconds}.jpg`;
	}


	/**
	 * 获取非行间样式
	 * @param el
	 * @param attr
	 * @returns
	 */
	private _getStyle(el: HTMLElement, attr: string): string {
		// 兼容IE
		if ((el as any).currentStyle) {
			return (el as any).currentStyle[attr];
		} else {
			return getComputedStyle(el, null).getPropertyValue(attr);
		}
	}

	/**
	 * 开始绘制
	 * @param event
	 * @returns
	 */
	private _drawBegin(event: MouseEvent | TouchEvent) {
		// -- 异常处理
		if (!this.ctx) return;
		// -- 开始绘制回调
		this.brushOptions.onDrawBegin();
		// -- 更新绘制状态
		this.isDrawing = true;
		// -- 获取鼠标在画布中的位置
		const point = this._getCanvasPoint(event);
		// -- 记录当前位置，用于移动中计算连线坐标
		this.prevPoint = point;
		// -- 绘制圆点
		this._drawCircle(point.x, point.y, Math.ceil(this.ctx.lineWidth / 2));
		// -- 橡皮擦模式下，橡皮擦元素并更新橡皮擦游标位置
		if (this.isEraser && this.eraserCursor) {
			this.eraserCursor.style.display = 'block';
			this.eraserCursor.style.left = point.x + 'px';
			this.eraserCursor.style.top = point.y + 'px';
		}
	}
	/**
	 * 正在绘制
	 * @param event
	 * @returns
	 */
	private _drawing(event: MouseEvent | TouchEvent) {
		// -- 异常处理
		if (!this.isDrawing) return;
		// -- 获取鼠标在画布中的位置
		const newPoint = this._getCanvasPoint(event);
		// -- 实时绘制线条
		this._drawLine(this.prevPoint.x, this.prevPoint.y, newPoint.x, newPoint.y);
		// -- 更新 prevPoint
		this.prevPoint = newPoint;
		// -- 橡皮擦模式下，更新橡皮擦游标位置
		if (this.isEraser && this.eraserCursor) {
			this.eraserCursor.style.left = newPoint.x + 'px';
			this.eraserCursor.style.top = newPoint.y + 'px';
		}
	}
	/**
	 * 结束绘制
	 * @returns
	 */
	private _drawEnd() {
		// -- 异常处理
		if (!this.isDrawing) return;
		// -- 结束绘制回调
		this.brushOptions.onDrawEnd();
		// -- 更新状态
		this.isDrawing = false;
		// -- 每次画完之后，将当前画板数据存入历史记录
		this._saveToHistories();
		// -- 橡皮擦模式下，隐藏橡皮擦游标元素
		if (this.isEraser && this.eraserCursor) {
			this.eraserCursor.style.display = 'none';
		}
	}

	/**
	 * 绘制线条
	 * @param x1
	 * @param y1
	 * @param x2
	 * @param y2
	 */
	private _drawLine(x1: number, y1: number, x2: number, y2: number) {
		this.ctx?.beginPath();
		this.ctx?.moveTo(x1, y1);
		this.ctx?.lineTo(x2, y2);
		this.ctx?.stroke();
		this.ctx?.closePath();
	}

	/**
	 * 绘制圆点
	 * 鼠标按下时调用
	 * @param {*} x
	 * @param {*} y
	 * @param {*} radius
	 */
	private _drawCircle(x: number, y: number, radius: number) {
		if (!this.ctx) return;
		this.ctx.fillStyle = this.ctx.strokeStyle;
		this.ctx.beginPath();
		this.ctx.arc(x, y, radius, 0, Math.PI * 2);
		this.ctx.fill();
		this.ctx.closePath();
	}

	/**
	 * 计算偏移
	 * @param dom
	 * @returns
	 */
	private _calcOffset(element: HTMLElement) {
		let parentElement = element.offsetParent;
		const rect = { left: element.offsetLeft, top: element.offsetTop };
		while (parentElement) {
			const { offsetLeft, offsetTop, offsetParent } = parentElement as HTMLElement;
			rect.left += offsetLeft;
			rect.top += offsetTop;
			parentElement = offsetParent;
		}
		return rect;
	}

	/**
	 * 获取鼠标在画布中的位置
	 * 兼容移动端
	 * @param {MouseEvent | TouchEvent} event
	 * @returns
	 */
	private _getCanvasPoint(event: MouseEvent | TouchEvent): BrushPoint {
		if (!this.canvas) return { x: 0, y: 0 };
		let clientX = 0;
		let clientY = 0;
		if ('touches' in event && event.touches.length > 0) {
			clientX = event.touches[0].pageX;
			clientY = event.touches[0].pageY;
		} else {
			clientX = (event as MouseEvent).pageX || (event as MouseEvent).clientX;
			clientY = (event as MouseEvent).pageY || (event as MouseEvent).clientY;
		}
		const rect = this._calcOffset(this.canvas);
		const x = clientX - rect.left;
		const y = clientY - rect.top;

		return { x, y };
	}

	/**
	 * 存储历史记录
	 */
	private _saveToHistories() {
		// -- 异常处理
		if (!this.ctx || !this.canvas) return;
		// -- 判断当前历史记录是否抵达边界值，如果抵达，则删除第1项并更新下标
		if (this.histories.length >= this.brushOptions.maxHistoriesLength) {
			this.histories.shift();
			this.historiesIndex--;
		}
		// -- 追加新纪录
		this.histories.push({
			data: this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height),
			timestamp: Date.now()
		});
		this.historiesIndex++;
	}


	/**
	 * 挂载画笔工具
	 * @param options
	 * @returns
	 */
	public mount(options?: BrushMountOptions) {
		// -- 移除元素（避免重复调用挂载函数）
		if (this.canvas || this.eraserCursor) this.destroy();

		// -- 解构（如果没有传递目标元素，则默认挂载到 body 元素上）
		const { target = document.body } = options || {};

		// -- 由于 canvas 使用绝对定位，因此需判断挂载目标元素是否指定定位模式
		if (this._getStyle(target, 'position') === 'static') {
			target.style.position = 'relative';
		}

		// -- 创建 canvas
		const canvas = document.createElement('canvas');
		canvas.classList.add('brush-canvas');
		canvas.width = target.scrollWidth;
		canvas.height = target.scrollHeight;
		canvas.style.position = 'absolute';
		canvas.style.left = '0';
		canvas.style.top = '0';
		canvas.style.cursor = 'pointer';
		canvas.style.zIndex = '99999';

		// -- 配置画笔
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		ctx.lineWidth = this.brushOptions.thickness;
		ctx.strokeStyle = this.brushOptions.color;
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
		(ctx as any).willReadFrequently = true;

		// -- 创建橡皮擦元素
		const eraserCursor = document.createElement('div');
		eraserCursor.classList.add('brush-eraser-cursor');
		eraserCursor.style.display = 'none';
		eraserCursor.style.border = '2px solid #000';
		eraserCursor.style.borderRadius = '50%';
		eraserCursor.style.pointerEvents = 'none';
		eraserCursor.style.position = 'absolute';
		eraserCursor.style.transform = 'translate(-50%, -50%)';
		eraserCursor.style.zIndex = '99999';

		// -- 挂载画板和橡皮擦元素
		target.appendChild(canvas);
		target.appendChild(eraserCursor);

		// -- 赋值记录
		this.canvas = canvas;
		this.ctx = ctx;
		this.eraserCursor = eraserCursor;

		// -- 处理临时存储画板内容
		if (this.brushOptions.storage && this.historiesIndex !== -1) {
			const snapshot = this.histories[this.historiesIndex];
			ctx.putImageData(snapshot.data, 0, 0);
		} else {
			this._saveToHistories();
		}

		// -- 事件监听
		// -- Mobile
		canvas.addEventListener('touchstart', this._drawBegin.bind(this), { passive: false });
		canvas.addEventListener('touchmove', this._drawing.bind(this), { passive: false });
		canvas.addEventListener('touchend', this._drawEnd.bind(this), { passive: false });
		// -- PC
		canvas.addEventListener('mousedown', this._drawBegin.bind(this));
		canvas.addEventListener('mousemove', this._drawing.bind(this));
		canvas.addEventListener('mouseup', this._drawEnd.bind(this));
		canvas.addEventListener('mouseleave', this._drawEnd.bind(this));
	}

	/**
	 * 卸载画笔工具
	 */
	public destroy() {
		// -- 异常处理
		if (!this.canvas || !this.eraserCursor) return;
		// -- 移除事件监听
		// -- Mobile
		this.canvas.removeEventListener('touchstart', this._drawBegin.bind(this));
		this.canvas.removeEventListener('touchmove', this._drawing.bind(this));
		this.canvas.removeEventListener('touchend', this._drawEnd.bind(this));
		// -- PC
		this.canvas.removeEventListener('mousedown', this._drawBegin.bind(this));
		this.canvas.removeEventListener('mousemove', this._drawing.bind(this));
		this.canvas.removeEventListener('mouseup', this._drawEnd.bind(this));
		this.canvas.removeEventListener('mouseleave', this._drawEnd.bind(this));

		// -- 移除DOM
		this.canvas.remove();
		this.eraserCursor.remove();

		// -- 复位元素
		this.canvas = null;
		this.ctx = null;
		this.eraserCursor = null;
		this.isDrawing = false;
		this.isEraser = false;
		this.prevPoint = { x: 0, y: 0 };
		if (!this.brushOptions.storage) {
			this.histories = [];
			this.historiesIndex = -1;
		}
	}

	/**
	 * 清空画板
	 */
	public clear() {
		if (!this.ctx || !this.canvas) return;
		// -- 清空画板
		this.ctx.clearRect(0, 0, this.canvas.width || 0, this.canvas.height || 0);
		// -- 将当前操作存入历史记录
		this._saveToHistories();
	}

	/**
	 * 设置画笔粗细
	 * @param thickness
	 */
	public setBrushThickness(thickness: number) {
		// -- 异常处理
		if (!this.ctx) return;
		// -- 设置画笔粗细
		this.ctx.lineWidth = thickness;
		// -- 橡皮擦模式
		if (this.isEraser && this.eraserCursor) {
			this.eraserCursor.style.width = this.eraserCursor.style.height =
				thickness + 'px';
		}
	}

	/**
	 * 设置画笔颜色
	 * @param color
	 */
	public setBrushColor(color: string) {
		// -- 异常处理
		if (!this.ctx) return;
		// -- 更新画笔颜色
		this.ctx.strokeStyle = color;
	}

	/**
	 * 撤销（上一步）
	 */
	public undo() {
		// -- 异常处理
		if (!this.ctx) return;
		// -- 判断是否抵达边界值
		if (this.historiesIndex === 0) return;
		// -- 下标-1
		--this.historiesIndex;
		// -- 根据下标，获取快照
		const snapshot = this.histories[this.historiesIndex];
		// -- 将快照呈现在画布上
		this.ctx.putImageData(snapshot.data, 0, 0);
	}

	/**
	 * 重做（下一步）
	 */
	public redo() {
		// -- 异常处理
		if (!this.ctx) return;
		// -- 判断是否抵达边界值
		if (this.historiesIndex === this.histories.length - 1) return;
		// -- 下标+1
		++this.historiesIndex;
		// -- 根据下标，获取快照
		const snapshot = this.histories[this.historiesIndex];
		// -- 将快照呈现在画布上
		this.ctx.putImageData(snapshot.data, 0, 0);
	}
	/**
	 * 获取历史纪录
	 * @returns
	 */
	public getHistories() {
		return this.histories;
	}

	/**
	 * 保存图片
	 * @param options
	 * @returns
	 */
	public saveToImage(options?: BrushImageOptions) {
		// -- 异常处理1
		if (!this.canvas) return;
		// -- 解构
		const defaultFilename = this._getDefaultFilename();
		const { filename = defaultFilename, type = 'image/jpg', quality = 75 } = options || {};
		// -- 获取画板链接
		const url = this.canvas.toDataURL(type, quality);
		// -- 模拟点击下载
		const a = document.createElement('a');
		a.setAttribute('href', url);
		a.setAttribute('download', filename);
		a.setAttribute('target', '_blank');
		a.click();
	}

	/**
	 * 设置橡皮擦状态
	 */
	public setEraserStatus(status: boolean) {
		// -- 异常处理
		if (!this.eraserCursor || !this.ctx) return;
		// -- 更新橡皮擦状态值
		this.isEraser = status;
		// -- 判断橡皮擦状态值
		if (this.isEraser) {
			// 设置为“目标擦除”模式
			this.ctx.globalCompositeOperation = 'destination-out';
			// 设置橡皮擦游标尺寸（同画笔粗细）
			this.eraserCursor.style.width = this.eraserCursor.style.height =
				this.ctx.lineWidth + 'px';
		} else {
			// 设置为“正常绘制”模式
			this.ctx.globalCompositeOperation = 'source-over';
		}
	}
}
