# 考试系统·连线题

推荐博文：稀土掘金·[浅谈 js+canvas 实现考试系统·拖拽连线题](https://juejin.cn/post/7278945628906487843)

# 安装

```shell
$ npm install @likg/match-line
$ yarn add @likg/match-line
$ pnpm add @likg/match-line
```

```tsx
import MatchLine from '@likg/match-line';
const matchLine = new MatchLine(options: MatchLineConfigs);
```

## MatchLineOptions

连线题选项数据结构：

```ts
export type MatchLineOptions = Array<{
  leftOption: string;
  rightOption: string;
}>
```
示例如下：
```js
[
  { leftOption: '水果', rightOption: '🥕' },
  { leftOption: '动物', rightOption: '🚗' },
  { leftOption: '汽车', rightOption: '🐒' },
  { leftOption: '蔬菜', rightOption: '🍌' },
]
```

## MatchLineAnswers

答案数据结构：

```ts
export type MatchLineAnwsers = Record<string, string>;
```
示例如下：
```
{
  水果: '🥕',
  动物: '🚗',
  汽车: '🐒',
  蔬菜: '🍌',
}
```

## MatchLineConfigs

| 属性             | 数据类型                                  | 描述                                                         |
| ---------------- | ----------------------------------------- | ------------------------------------------------------------ |
| container        | HTMLElement                               | 外层容器·包裹canvas和左右布局元素的容器<br />布局结构：div.container>div.options+canvas+backCanvas |
| canvas           | HTMLCanvasElement                         | 实际连线标签Canvas                                           |
| backCanvas       | HTMLCanvasElement                         | 模拟连线标签Canvas                                           |
| items            | NodeListOf\<HTMLElement>                  | 连线元素标签                                                 |
| itemActiveCls    | string                                    | 「可选」连线元素标签激活状态的类名，默认：active             |
| strokeStyle      | string \| CanvasGradient \| CanvasPattern | 「可选」画笔颜色，默认：\#6495ED                             |
| lineWidth        | number                                    | 「可选」画笔粗细，默认：1                                    |
| answers          | MatchLineAnswers                          | 「可选」用户连线答案·可选（在查看试卷详情以及纠错时必传      |
| standardAnswers  | MatchLineAnswers                          | 「可选」标准答案（在纠错时必传）                             |
| checkAnswers     | boolean                                   | 「可选」是否纠错（为true时必传answers 和 standardAnswers 字段） |
| correctlineColor | string                                    | 「可选」正确连线颜色，默认值：'#3CB371'                      |
| mislineColor     | string                                    | 「可选」错误连线颜色，默认值：'#DC143C'                      |
| disabled         | boolean                                   | 「可选」是否禁用（在查看试卷详情以及纠错时必传true）         |
| debug            | boolean                                   | 「可选」是否启用调式模式                                     |
| onChange         | (anwsers: MatchLineAnswers) => void       | 「可选」每一次连线成功的回调·参数为连线结果集                |

# APIs

- `matchLine.reset()`：重置
- `matchLine.undo()`：撤销
- `matchLine.getAnswers()`：获取连线结果
- `matchLine.checkAnswers()`：纠错

# 使用指南

## 布局

```html
<div class="container">
	<!-- 工具栏 -->
	<div class="tools">
		<div class="button reset">重置</div>
		<div class="button undo">撤销</div>
		<div class="button check">纠错</div>
	</div>
	<div class="content">
		<!-- 左侧 -->
		<div class="list left">
			<div class="item" data-value="水果" data-ownership="L">水果</div>
			<div class="item" data-value="动物" data-ownership="L">动物</div>
			<div class="item" data-value="汽车" data-ownership="L">汽车</div>
			<div class="item" data-value="蔬菜" data-ownership="L">蔬菜</div>
		</div>
		<!-- 右侧 -->
		<div class="list right">
			<div class="item" data-value="🥕" data-ownership="R">🥕</div>
			<div class="item" data-value="🚗" data-ownership="R">🚗</div>
			<div class="item" data-value="🐒" data-ownership="R">🐒</div>
			<div class="item" data-value="🍌" data-ownership="R">🍌</div>
		</div>
		<!-- 实际连线标签 -->
		<canvas id="canvas" width="400" height="250"></canvas>
		<!-- 模拟连线标签 -->
		<canvas id="backCanvas" width="400" height="250"></canvas>
	</div>
</div>
```

> 提示：请严格按照上面的布局方式布局，**连线元素必须设置 `data-value` 和 `data-ownership` 属性**，便于处理连线逻辑。

## 代码示例（react）

**`QuestionMatchLine.tsx`**

```tsx
import React, { useEffect, useRef, useState } from 'react';
import './QuestionMatchLine.less';
import MatchLine from './m';

// -- 数据源
const dataSource = [
  { leftOption: '水果', rightOption: '🥕' },
  { leftOption: '动物', rightOption: '🚗' },
  { leftOption: '汽车', rightOption: '🐒' },
  { leftOption: '蔬菜', rightOption: '🍌' },
];

// -- 标准答案
const standardAnswers = {
  水果: '🍌',
  动物: '🐒',
  汽车: '🚗',
  蔬菜: '🥕',
};

const QuestionMatchLine: React.FC = React.memo(() => {
  const [matchLine, setMatchLine] = useState<MatchLine | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const backCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // -- 初始化连线库
    if (canvasRef.current && backCanvasRef.current && containerRef.current) {
      const items = containerRef.current.querySelectorAll('.option');
      if (items.length > 0) {
        const matching = new MatchLine({
          container: containerRef.current,
          items: items as NodeListOf<HTMLElement>,
          canvas: canvasRef.current,
          backCanvas: backCanvasRef.current,
          itemActiveCls: 'active',
          standardAnswers,
          debug: true,
          onChange: (anwsers) => {
            console.log(anwsers);
          },
        });
        setMatchLine(matching);
      }
    }
  }, []);

  const renderItems = (ownership: 'L' | 'R') => {
    const k = ownership === 'L' ? 'leftOption' : 'rightOption';
    return dataSource.map((item, index) => (
      <div
        className="option"
        key={index}
        data-value={item[k]}
        data-ownership={ownership}
      >
        {item[k]}
      </div>
    ));
  };
  return (
    <div className="match-line">
      <div className="tools">
        <button onClick={() => matchLine?.reset()}>重置</button>
        <button onClick={() => matchLine?.undo()}>撤销</button>
        <button
          onClick={() => {
            const anwsers = matchLine?.getAnswers();
            console.log(anwsers);
          }}
        >
          查询
        </button>
        <button onClick={() => matchLine?.checkAnswers()}>纠错</button>
      </div>
      <div className="contents" ref={containerRef}>
        <div className="leftOptions">{renderItems('L')}</div>
        <div className="rightOptions">{renderItems('R')}</div>
        <canvas ref={canvasRef}></canvas>
        <canvas ref={backCanvasRef}></canvas>
      </div>
    </div>
  );
});

export default QuestionMatchLine;
```

**`QuestionMatchLine.less`**

```less
.match-line {
  width: 400px;
  height: auto;
  margin: 100px auto;
  .tools {
    margin-bottom: 16px;
    button {
      margin-right: 8px;
    }
  }
  .contents {
    border: 1px dashed #ccc;
    position: relative;
    box-sizing: border-box;
    padding: 24px;
    display: flex;
    justify-content: space-between;
    align-items: centers;
    .option {
      width: 100px;
      height: 40px;
      background-color: #fff;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 4px;
      cursor: pointer;
      user-select: none;
      color: #555;
      position: relative;
      z-index: 1;
      &.active {
        background: #6495ed;
        color: #fff;
      }
      &:not(:last-child) {
        margin-bottom: 16px;
      }
    }
    canvas {
      position: absolute;
      top: 0;
      left: 0;
    }
  }
}

```

# 后续

我将持续优化升级 **MatchLine**，如果大家有什么疑问或建议欢迎留言。
