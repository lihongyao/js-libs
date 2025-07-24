# 概述

`@likg/brush` 基于 canvas 实现，主要提供画笔相关的常用方法，有关画板工具栏的布局，请自行根据产品需求设计。

本库兼容【PC】端和【Mobile】端，后续会不间断地更新和完善。

> 提示：如果你想搞懂实现原理，欢迎阅读我在稀土掘金的文章：[浅谈 js+canvas 实现画板工具 >>](https://juejin.cn/post/7294082278514966578)

# 安装

```shell
$ pnpm add @likg/brush
```

# 使用

```ts
import Brush from '@likg/brush';
const brush = new Brush(BrushOptions)
```

# APIs

- `mount(options:  BrushMountOptions)`：挂载画笔
- `destroy()`：卸载画笔
- `clear()`：清空画板
- `setBrushThickness(thickness: number)`：设置画笔粗细
- `setBrushColor(color: string)`：设置画笔颜色
- `undo()`：撤销（上一步）
- `redo()`：重做（下一步）
- `getHistories()`：获取历史纪录
- `saveToImage(options?: BrushImageOptions)`：保存图片
- `setEraserStatus(status: boolean)`：设置橡皮擦状态

# Typings

## BrushOptions

```tsx
type BrushOptions = {
  /** ID */
  id?: string;
  /** 画笔颜色（初始） */
  color?: string;
  /** 画笔粗细（初始） */
  thickness?: number;
  /** 生命周期内临时保留画板内容 */
  storage?: boolean;
  /** 绘画记录·最大长度（默认值 50） */
  maxHistoriesLength?: number;
  /** 开始绘制回调 */
  onDrawBegin?: () => void;
  /** 结束绘制回调 */
  onDrawEnd?: () => void;
}
```

## BrushMountOptions

```tsx
type BrushMountOptions = {
  /** 目标元素 */
  target?: HTMLElement;
}
```

## BrushImageOptions

```tsx
type BrushImageOptions = {
  type: string;
  filename: string;
  quality: any;
}
```