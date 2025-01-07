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
	/** BPM */
	private bpm: number;
	/** 拍号信息，标识拍号的分子，表示每一小节有多少拍 */
	private timeSigNum: number;
	/** 延迟初始化的音频上下文 */
	private audioContext: AudioContext | null;

	/** 节拍器是否在运行 */
	private isPlaying: boolean;
	/** 下一拍的调度时间 */
	private scheduledTime: number;
	/** 当前拍的索引 */
	private currentBeatIndex: number;
	/** 定时器 ID */
	private timer: number | null;
	/** 主音的预加载数据 */
	private preloadedAccentBuffer: ArrayBuffer | null;
	/** 次音的预加载数据 */
	private preloadedNormalBuffer: ArrayBuffer | null;
	/** 主音解码后的音频数据 */
	private accentAudioData: AudioBuffer | null;
	/** 次音解码后的音频数据 */
	private normalAudioData: AudioBuffer | null;
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
		this.bpm = bpm || 60;
		this.timeSigNum = parseInt(timeSignature.split('/')[0]) || 4;
		this.audioContext = null;
		this.isPlaying = false;
		this.scheduledTime = 0;
		this.currentBeatIndex = 0;
		this.timer = null;
		this.preloadedAccentBuffer = null;
		this.preloadedNormalBuffer = null;
		this.accentAudioData = null;
		this.normalAudioData = null;
		this.isAudioContextStarted = false;
		// -- 异步预加载音频数据
		this._preloadAudioBuffers([accentSoundUrl, normalSoundUrl]);
	}

	/**
	 * 音频是否已预加载
	 */
	get isPreloaded() {
		return (
			this.preloadedAccentBuffer !== null && this.preloadedNormalBuffer !== null
		);
	}

	/**
	 * 音频是否已解码
	 */
	get isDecoded() {
		return this.accentAudioData !== null && this.normalAudioData !== null;
	}

	/**
	 * 获取或初始化 AudioContext
	 * @returns
	 */
	_getAudioContext() {
		if (!this.audioContext) {
			this.audioContext = new (window.AudioContext ||
				(window as any).webkitAudioContext)();
		}
		return this.audioContext;
	}

	/**
	 * 预加载音频文件
	 */
	async _preloadAudioBuffers(urls: string[]) {
		try {
			const fetchAudio = async (url: string) => {
				const response = await fetch(url);
				if (!response.ok) throw new Error(`无法加载音频文件: ${url}`);
				return await response.arrayBuffer();
			};

			const buffers = await Promise.all(urls.map(fetchAudio));
			this.preloadedAccentBuffer = buffers[0];
			this.preloadedNormalBuffer = buffers[1];

			console.log('音频预加载完成！');
		} catch (error) {
			console.error('音频预加载失败:', error);
		}
	}

	/**
	 * 解码音频数据
	 */
	async _decodeAudioData() {
		if (!this.isPreloaded) throw new Error('音频尚未预加载完成！');
		try {
			const decodeAudio = (buffer: ArrayBuffer) =>
				this._getAudioContext().decodeAudioData(buffer);
			[this.accentAudioData, this.normalAudioData] = await Promise.all([
				decodeAudio(this.preloadedAccentBuffer!),
				decodeAudio(this.preloadedNormalBuffer!)
			]);
			console.log('音频解码完成！');
		} catch (error) {
			console.error('音频解码失败:', error);
		}
	}
	/**
	 * 确保 AudioContext 已激活
	 */
	async _ensureAudioContextStarted() {
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
	_scheduleNextBeat() {
		const BASE_LOOKAHEAD = 0.1; // 最小调度窗口
		const interval = 60 / this.bpm; // 每拍间隔时间
		const lookahead = Math.max(BASE_LOOKAHEAD, interval * 0.75); // 动态调整调度窗口

		// 在调度窗口内安排所有需要播放的节拍音效
		while (this.scheduledTime < this.audioContext!.currentTime + lookahead) {
			// 计算当前节拍在节拍循环中的位置
			// •	currentBeatIndex % timeSigNum 的结果是当前节拍在循环中的索引。
			// •	例如，对于 4/4 拍的节拍器，节拍顺序是 0, 1, 2, 3，然后循环。
			const beatIndex = this.currentBeatIndex % this.timeSigNum;
			// 选择当前节拍要播放的音效
			// •	如果当前节拍是小节的第一拍（beatIndex === 0），播放强调音效（accentAudioData）。
			// •	否则，播放普通音效（normalAudioData）。
			const audioData =
				beatIndex === 0 ? this.accentAudioData : this.normalAudioData;

			this.onBeatChange?.(beatIndex);

			// 在指定时间点播放音效
			this._playSound(audioData!, this.scheduledTime);

			// 更新 scheduledTime 为下一拍的时间点。
			// 增加 currentBeatIndex，表示节拍器即将进入下一拍。
			this.scheduledTime += interval;
			this.currentBeatIndex++;
		}

		// 设置一个定时器，调用自身以实现循环调度
		// •	如果 isPlaying 为真（表示节拍器正在运行），使用 setTimeout 设置一个定时器。
		// •	定时器的时间间隔是 lookahead 秒（乘以 1000 转换为毫秒），确保调度器在下一次播放前再次运行。
		if (this.isPlaying) {
			this.timer = window.setTimeout(
				() => requestAnimationFrame(() => this._scheduleNextBeat()),
				lookahead * 1000
			);
		}
	}

	/**
	 * 播放音频
	 * @param {*} audioData
	 * @param {*} time
	 */
	_playSound(audioData: AudioBuffer, time: number) {
		if (!audioData) return;
		const audioCtx = this._getAudioContext();
		const source = audioCtx.createBufferSource();
		source.buffer = audioData;
		source.connect(audioCtx.destination);
		source.start(Math.max(time, audioCtx.currentTime));
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
		if (!this.isPreloaded) {
			console.warn('音频尚未预加载！');
			return;
		}
		this.onBeatChange = options.onBeatChange;

		await this._ensureAudioContextStarted();

		if (!this.isDecoded) {
			console.warn('音频尚未解码！');
			return;
		}

		this.isPlaying = true;
		this.scheduledTime = this._getAudioContext().currentTime;
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
		this.scheduledTime = 0;
		this.currentBeatIndex = 0;
		if (this.timer) {
			clearTimeout(this.timer);
			this.timer = null;
		}
	}

	/**
	 * 设置BPM
	 * @param {*} bpm
	 */
	setBPM(bpm: number) {
		this.bpm = bpm;
		this.currentBeatIndex = 0;
		this.timer && clearTimeout(this.timer);
		this.isPlaying && this._scheduleNextBeat();
	}
	/**
	 * 设置拍号
	 * @param {*} timeSignature
	 */
	setTimeSignature(timeSignature: string) {
		this.timeSigNum = parseInt(timeSignature.split('/')[0]);
		this.currentBeatIndex = 0;
		this.timer && clearTimeout(this.timer);
		this.isPlaying && this._scheduleNextBeat();
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
		this.accentAudioData = null;
		this.normalAudioData = null;
		this.preloadedAccentBuffer = null;
		this.preloadedNormalBuffer = null;
	}
}
