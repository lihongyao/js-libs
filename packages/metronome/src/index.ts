export type TimeSignature = '2/4' | '3/4' | '4/4' | '6/8';
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
export type StartOptions = {
	onPlay?: () => void;
	onBeatChange?: (beatIndex: number) => void;
};

export default class MetronomeCls {

	/** 拍号信息，标识拍号的分子，表示每一小节有多少拍 */
	private timeSigNum: number;
	/** 每一拍的时长(单位：ms) */
	private beatDuration: number;
	/** 延迟初始化的音频上下文 */
	private audioContext: AudioContext | null;
	/** 节拍器是否在运行 */
	private isPlaying: boolean;
	/** 当前拍的索引 */
	private currentBeatIndex: number;
	/** 定时器 ID */
	private timer: number | null;
	/** 音频预加载数据 [主音音频数据，次音音频数据] */
	private preloadedBuffer: Array<ArrayBuffer> | null;
	/** 解码后音频数据 [主音音频数据，次音音频数据] */
	private audioData: Array<AudioBuffer> | null;
	/** AudioContext 是否已激活 */
	private isAudioContextStarted: boolean;
	/** 节拍回调 */
	private onBeatChange?: (beatIndex: number) => void;


	/**
	 * 构造函数
	 * @param {*} options 配置项
	 */
	constructor(options: MetronomeOptions) {
		const { timeSignature, bpm, accentSoundUrl, normalSoundUrl } = options;
		this.timeSigNum = parseInt(timeSignature.split('/')[0]) || 4;
		this.beatDuration = 60 / bpm * 1000;
		this.audioContext = null;
		this.isPlaying = false;
		this.currentBeatIndex = 0;
		this.preloadedBuffer = null;
		this.audioData = null;
		this.isAudioContextStarted = false;
		this.timer = null;
		// -- 异步预加载音频数据
		this._preloadAudioBuffers([accentSoundUrl, normalSoundUrl]);
	}


	/**
	 * 延时函数
	 * @param callback 
	 * @param delay 
	 * @returns { clear }
	 */
	private _rafTimeout(callback: () => void, delay: number) {
		const start: number = performance.now();
		let rafId: number;
		function tick(now: number): void {
			if (now - start >= delay) {
				callback();
			} else {
				rafId = requestAnimationFrame(tick);
			}
		}
		rafId = requestAnimationFrame(tick);
		return {
			clear: () => cancelAnimationFrame(rafId)
		};
	}

	/**
	 * 获取或初始化 AudioContext
	 * @returns
	 */
	private _getAudioContext() {
		if (!this.audioContext) {
			this.audioContext = new (window.AudioContext ||
				(window as any).webkitAudioContext)();
		}
		return this.audioContext;
	}

	/**
	 * 预加载音频文件
	 */
	private async _preloadAudioBuffers(urls: string[]) {
		try {
			const fetchAudio = async (url: string) => {
				const response = await fetch(url);
				if (!response.ok) throw new Error(`无法加载音频文件: ${url}`);
				return await response.arrayBuffer();
			};

			this.preloadedBuffer = await Promise.all(urls.map(fetchAudio));

			console.log('音频预加载完成！');
		} catch (error) {
			console.error('音频预加载失败:', error);
		}
	}

	/**
	 * 解码音频数据
	 */
	private async _decodeAudioData() {
		if (!this.preloadedBuffer) throw new Error('音频尚未预加载完成！');
		try {
			const decodeAudio = (buffer: ArrayBuffer) =>
				this._getAudioContext().decodeAudioData(buffer);
			this.audioData = await Promise.all([
				decodeAudio(this.preloadedBuffer[0]),
				decodeAudio(this.preloadedBuffer[1])
			]);
			console.log('音频解码完成！');
		} catch (error) {
			console.error('音频解码失败:', error);
		}
	}
	/**
	 * 确保 AudioContext 已激活
	 */
	private async _ensureAudioContextStarted() {
		if (!this.isAudioContextStarted) {
			try {
				// -- 确保 AudioContext 的状态从 suspended 切换到 running
				const audioContext = this._getAudioContext();
				await audioContext.resume();
				// -- 保证音频文件在播放之前解码完成，防止未加载完成导致的错误
				await this._decodeAudioData();
				this.isAudioContextStarted = true;
				console.log('AudioContext 已激活！');
			} catch (error) {
				console.error('AudioContext 激活失败:', error);
			}
		}
	}

	/**
	 * 调度下一拍
	 * 整个函数的逻辑流程如下：
	 * 1.	计算当前调度窗口内需要播放的所有节拍音效。
	 * 2.	在每一个需要播放的时间点安排音效。
	 * 3.	更新下一拍的时间和节拍索引。
	 * 4.	循环调用自身，确保节拍器持续运行。
	 */
	_scheduleNextBeat(nextTime?: number) {
		const audioContext = this._getAudioContext();
		const now = audioContext.currentTime;
		const scheduleAheadTime = 0.1; // 提前调度窗口（秒）
		const uiSyncDelay = 0.02; // UI 更新提前量（秒）

		if (nextTime === undefined) {
			nextTime = now;
		}

		while (nextTime < now + scheduleAheadTime) {
			const beatIndex = this.currentBeatIndex % this.timeSigNum;

			// 使用 _rafTimeout 更新 UI
			this._rafTimeout(() => {
				this.onBeatChange?.(beatIndex)
			}, (nextTime - now - uiSyncDelay) * 1000);

			// 使用 setTimeout 调度音频
			const audioData = beatIndex === 0 ? this.audioData![0] : this.audioData![1];
			if (audioData) {
				const source = audioContext.createBufferSource();
				source.buffer = audioData;
				source.connect(audioContext.destination);
				source.start(nextTime); // 精确播放时间
			}

			// 更新下一拍的时间
			nextTime += this.beatDuration / 1000; // 转换为秒
			this.currentBeatIndex++;
		}
		// 使用 setTimeout 调度下一次调用
		this.timer = setTimeout(
			() => this._scheduleNextBeat(nextTime),
			(scheduleAheadTime / 2) * 1000
		);
	}


	/**
	 * options
	 * @param {*} options
	 * @param {*} options.onBeatChange
	 * @returns
	 */
	async start(options: StartOptions) {
		if (this.isPlaying) {
			console.warn('节拍器已经运行中！');
			return;
		}
		if (!this.preloadedBuffer) {
			console.warn('音频尚未预加载！');
			return;
		}
		this.onBeatChange = options.onBeatChange;

		await this._ensureAudioContextStarted();

		if (!this.audioData) {
			console.warn('音频尚未解码！');
			return;
		}

		this.isPlaying = true;
		this.currentBeatIndex = 0;
		this._scheduleNextBeat();

		options.onPlay?.();
	}

	/**
	 * 播放
	 * @returns
	 */
	stop() {
		if (!this.isPlaying) return;
		this.isPlaying = false;
		this.currentBeatIndex = 0;
		this.timer && clearTimeout(this.timer);
	}

	/**
	 * 设置BPM
	 * @param {*} bpm
	 */
	setBPM(bpm: number) {
		this.beatDuration = 60 / bpm * 1000;
		this.currentBeatIndex = 0;
		this.timer && clearTimeout(this.timer);
		if (this.isPlaying) {
			this._scheduleNextBeat();
		}
	}
	/**
	 * 设置拍号
	 * @param {*} timeSignature
	 */
	setTimeSignature(timeSignature: string) {
		this.timeSigNum = parseInt(timeSignature.split('/')[0]);
		this.currentBeatIndex = 0;
		this.timer && clearTimeout(this.timer);
		if (this.isPlaying) {
			this._scheduleNextBeat();
		}
	}

	/**
	 * 释放资源
	 */
	async destroy() {
		if (this.isPlaying) this.stop();
		if (this.audioContext) {
			try {
				await this.audioContext.close();
			} catch (error) {
				console.warn('关闭 AudioContext 失败:', error);
			} finally {
				this.audioContext = null;
			}
		}
		this.preloadedBuffer = null;
		this.audioData = null;
	}
}
