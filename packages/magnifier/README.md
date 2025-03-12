# 安装

```shell
$ pnpm add @likg/magnifier
```

# 使用

```tsx
import Magnifier from '@likg/magnifier';

const magnifier = new Magnifier(options);

// -- 挂载放大镜
magnifier.mount();
// -- 卸载放大镜
magnifier.destory();
```

> 提示：实际使用中，您只需要 挂载 和 卸载 两个API方法即可。

# MagnifierOptions

```ts
interface MagnifierOptions {
	/** 放大镜初始尺寸，默认值200x200 */
	initialSize?: Size;
	/** 放大镜最小尺寸，默认值500x500 */
	minSize?: Size;
	/** 放大镜最大尺寸，默认值100x100 */
	maxSize?: Size;
	/** 四周触发拖拽缩放的间距，默认值 20 */
	resizeSpacing?: number;
	/** 缩放比例，默认值 1 */
	scaleRatio?: number;
	/** 边框颜色，默认值 #7B68EE */
	borderColor?: string;
	/** 是否允许跨源图像污染画布 */
	allowTaint?: boolean;
	/** 跨域地址 */
	useCORS?: boolean;
	proxy?: string;
	/** 调试模式 */
	debug?: boolean;
	/** 异常处理 */
	onError?: (error: Error) => void;
}
```

# 尾言

`@likg/magnifier` 主要依赖 [html2canvas](https://html2canvas.hertzen.com/) 实现，当你发现放大镜内容不完整时，可以参考 html2canvas 关于 CSS 样式的兼容。

推荐阅读博文 [基于原生 js + html2canvas 实现网页放大镜](https://juejin.cn/spost/7313242064196141065) 了解该库的封装思路。

# 日志

由于 html2canvas<sup>1.4.1</sup> 不兼容 oklch 模式，而 Tailwind CSS<sup>4.0+</sup> 中的调色板从 rgb 变成了 oklch，导致在使用 html2canvas 时控制台抛出如下错误：

```
Error: Attempting to parse an unsupported color function "oklch"
```

因此，采用 [html2canvas-pro](https://www.npmjs.com/package/html2canvas-pro) 替代 html2canvas。
