# 节拍器

![](https://github.com/lihongyao/js-libs/raw/main/packages/metronome/assets/m.jpg)

节拍器是一种能发出稳定节拍的装置，在乐理学习和音乐演奏中用于确定速度、训练节奏。

`@likg/metronome` 基于原生 JavaScript 实现，提供了常用方法。

# 安装

```shell
$ npm install @likg/metronome
$ pnpm add @likg/metronome
$ yarn add @likg/metronome
```

# 使用

```tsx
// 1. 导入 @likg/metronome
import MetronomeCls from '@likg/metronome';

// 2. 构造实例
const metronomeCls = new MetronomeCls({
  bpm: 90,
  timeSignature: '4/4',
  accentSoundUrl: '/assets/piano/Click1.ogg',
  normalSoundUrl: '/assets/piano/Click2.ogg'
});

// 3. 启用节拍器
metronomeCls.start( ... );

// 4. 停止节拍器
metronomeCls.stop( ... );                
```

# API

```tsx
/**
 * options
 * @param {*} options
 * @param {*} options.onBeatChange
 * @returns
 */
start(options: StartOptions): Promise<void>;
/**
 * 播放
 * @returns
 */
stop(): void;
/**
 * 设置BPM
 * @param {*} bpm
 */
setBPM(bpm: number): void;
/**
 * 设置拍号
 * @param {*} timeSignature
 */
setTimeSignature(timeSignature: string): void;
/**
 * 释放资源
 */
destroy(): Promise<void>;
```

# MetronomeOptions

```ts
export type MetronomeOptions = {
	/** BPM */
	bpm: number;
	/** 拍号 */
	timeSignature: TimeSignature;
	/** 主音资源链接 */
	accentSoundUrl: string;
	/** 次音资源链接 */
	normalSoundUrl: string;
};
```

# StartOptions
```ts
export type StartOptions = {
	onPlay?: () => void;
	onBeatChange?: (beatIndex: number) => void;
};
```