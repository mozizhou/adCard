/**
 * 移动端音频播放修复工具 - 遵循移动端音频播放最佳实践
 * 核心原则：
 * 1. 音频播放必须在直接的点击事件处理函数中调用
 * 2. 避免 setTimeout、Promise、async/await 等打断用户交互链
 * 3. 在用户首次交互时提前调用一次静音音频"解锁"音频权限
 * 4. 不要在异步回调中调用 audio.play()，而是在点击事件中直接调用
 */

interface AudioInstance {
  id: string;
  audio: HTMLAudioElement;
  isPlaying: boolean;
  isLoaded: boolean;
  src: string;
}

class MobileAudioManager {
  private currentAudio: AudioInstance | null = null;
  private audioCache: Map<string, AudioInstance> = new Map();
  private userInteractionDetected = false;
  private isUnlocked = false;
  private silentAudio: HTMLAudioElement | null = null;

  constructor() {
    // 只在客户端环境初始化
    if (typeof window !== 'undefined') {
      this.setupUserInteractionDetection();
      this.createSilentAudio();
    }
  }

  /**
   * 创建静音音频用于解锁
   */
  private createSilentAudio() {
    if (typeof window === 'undefined') return;

    try {
      // 创建一个极短的静音音频数据URL
      const silentAudioData = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
      this.silentAudio = new Audio(silentAudioData);
      this.silentAudio.preload = 'auto';
      this.silentAudio.volume = 0;
      this.silentAudio.loop = false;

      // 设置移动端优化属性
      if ('playsInline' in this.silentAudio) {
        (this.silentAudio as any).playsInline = true;
      }
      if ('webkitPlaysInline' in this.silentAudio) {
        (this.silentAudio as any).webkitPlaysInline = true;
      }

      console.log('静音音频创建成功');
    } catch (error) {
      console.warn('创建静音音频失败:', error);
    }
  }

  /**
   * 设置用户交互检测
   */
  private setupUserInteractionDetection() {
    // 检查是否在浏览器环境
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    const events = ['touchstart', 'touchend', 'mousedown', 'keydown', 'click'];

    const handleUserInteraction = () => {
      this.userInteractionDetected = true;

      // 在用户首次交互时立即解锁音频权限
      this.unlockAudio();

      // 移除事件监听器，避免重复触发
      events.forEach(event => {
        document.removeEventListener(event, handleUserInteraction);
      });
    };

    events.forEach(event => {
      document.addEventListener(event, handleUserInteraction, { once: true });
    });
  }

  /**
   * 解锁音频权限（在用户交互中调用）
   */
  private unlockAudio() {
    if (this.isUnlocked || !this.silentAudio) {
      return;
    }

    try {
      // 在用户交互中直接播放静音音频来解锁权限
      const playPromise = this.silentAudio.play();

      if (playPromise !== undefined) {
        playPromise.then(() => {
          this.isUnlocked = true;
          console.log('音频权限已解锁');
          // 立即暂停静音音频
          this.silentAudio!.pause();
          this.silentAudio!.currentTime = 0;
        }).catch((error) => {
          console.warn('音频解锁失败:', error);
        });
      } else {
        this.isUnlocked = true;
        console.log('音频权限已解锁（同步）');
      }
    } catch (error) {
      console.warn('音频解锁异常:', error);
    }
  }

  /**
   * 创建音频实例
   */
  private createAudioInstance(src: string): AudioInstance {
    const audio = new Audio();

    // 设置音频属性
    audio.preload = 'auto';
    audio.crossOrigin = 'anonymous';
    audio.volume = 1.0;

    // 移动端优化设置
    if ('playsInline' in audio) {
      (audio as any).playsInline = true;
    }
    if ('webkitPlaysInline' in audio) {
      (audio as any).webkitPlaysInline = true;
    }

    audio.src = src;

    const audioId = `audio_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

    return {
      id: audioId,
      audio: audio,
      isPlaying: false,
      isLoaded: false,
      src: src
    };
  }

  /**
   * 播放音频（遵循移动端最佳实践）
   * 必须在直接的用户交互事件中调用
   */
  playAudio(src: string): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        // 检查是否在浏览器环境
        if (typeof window === 'undefined') {
          console.warn('不在浏览器环境，无法播放音频');
          resolve(false);
          return;
        }

        // 检查是否有用户交互
        if (!this.userInteractionDetected) {
          console.warn('需要用户交互才能播放音频');
          resolve(false);
          return;
        }

        // 停止当前播放的音频
        this.stopCurrentAudio();

        // 检查缓存
        let audioInstance = this.audioCache.get(src);
        if (!audioInstance) {
          audioInstance = this.createAudioInstance(src);
          this.audioCache.set(src, audioInstance);
        }

        this.currentAudio = audioInstance;
        const audio = audioInstance.audio;

        // 标记是否已经resolved，避免重复resolve
        let isResolved = false;

        // 设置事件监听器
        const onCanPlay = () => {
          console.log('音频可以播放');
          audioInstance!.isLoaded = true;
        };

        const onPlay = () => {
          console.log('音频开始播放');
          audioInstance!.isPlaying = true;
        };

        const onEnded = () => {
          console.log('音频播放完成');
          audioInstance!.isPlaying = false;
          this.currentAudio = null;
          cleanup();
          if (!isResolved) {
            isResolved = true;
            resolve(true);
          }
        };

        const onError = (error: any) => {
          console.error('音频播放失败:', error);
          audioInstance!.isPlaying = false;
          this.currentAudio = null;
          cleanup();
          if (!isResolved) {
            isResolved = true;
            resolve(false);
          }
        };

        const cleanup = () => {
          audio.removeEventListener('canplay', onCanPlay);
          audio.removeEventListener('play', onPlay);
          audio.removeEventListener('ended', onEnded);
          audio.removeEventListener('error', onError);
        };

        // 添加事件监听器
        audio.addEventListener('canplay', onCanPlay);
        audio.addEventListener('play', onPlay);
        audio.addEventListener('ended', onEnded);
        audio.addEventListener('error', onError);

        // 关键：在用户交互中直接调用 play()，不要等待异步操作
        const playPromise = audio.play();

        if (playPromise !== undefined) {
          playPromise.then(() => {
            console.log('音频播放成功启动');
          }).catch((error) => {
            console.error('音频播放启动失败:', error);
            onError(error);
          });
        }

      } catch (error) {
        console.error('播放音频时发生错误:', error);
        resolve(false);
      }
    });
  }

  /**
   * 停止当前音频
   */
  stopCurrentAudio() {
    if (this.currentAudio && this.currentAudio.audio) {
      try {
        const audio = this.currentAudio.audio;

        // 停止播放
        audio.pause();
        audio.currentTime = 0;

        this.currentAudio.isPlaying = false;
        this.currentAudio = null;
        console.log('音频已停止');
      } catch (error) {
        console.warn('停止音频时出错:', error);
      }
    }
  }

  /**
   * 预加载音频（提高播放成功率）
   */
  preloadAudio(src: string) {
    // 检查是否在浏览器环境
    if (typeof window === 'undefined') {
      console.warn('不在浏览器环境，无法预加载音频');
      return;
    }

    // 检查是否已经缓存
    if (this.audioCache.has(src)) {
      console.log('音频已在缓存中:', src);
      return;
    }

    try {
      const audioInstance = this.createAudioInstance(src);
      this.audioCache.set(src, audioInstance);

      // 预加载音频
      audioInstance.audio.load();
      console.log('音频预加载完成:', src);
    } catch (error) {
      console.error('预加载音频失败:', error);
    }
  }



  /**
   * 检查浏览器音频支持
   */
  checkAudioSupport(): { canPlay: boolean; formats: string[] } {
    // 检查是否在浏览器环境
    if (typeof window === 'undefined') {
      return {
        canPlay: false,
        formats: []
      };
    }

    try {
      // 使用原生 Audio API 检查支持的格式
      const audio = new Audio();
      const formats = [];

      if (audio.canPlayType('audio/mpeg')) formats.push('mp3');
      if (audio.canPlayType('audio/wav')) formats.push('wav');
      if (audio.canPlayType('audio/ogg')) formats.push('ogg');
      if (audio.canPlayType('audio/mp4')) formats.push('mp4');
      if (audio.canPlayType('audio/webm')) formats.push('webm');

      return {
        canPlay: formats.length > 0,
        formats
      };
    } catch (error) {
      console.error('检查音频支持时出错:', error);
      return {
        canPlay: false,
        formats: []
      };
    }
  }

  /**
   * 获取音频管理器状态
   */
  getStatus() {
    return {
      audioAvailable: typeof window !== 'undefined' && typeof Audio !== 'undefined',
      userInteractionDetected: this.userInteractionDetected,
      isUnlocked: this.isUnlocked,
      currentlyPlaying: !!this.currentAudio?.isPlaying,
      cacheSize: this.audioCache.size
    };
  }

  /**
   * 清理音频缓存
   */
  clearCache() {
    try {
      this.audioCache.forEach((audioInstance) => {
        if (audioInstance.audio) {
          audioInstance.audio.src = '';
          audioInstance.audio.load();
        }
      });
      this.audioCache.clear();
      console.log('音频缓存已清理');
    } catch (error) {
      console.error('清理音频缓存时出错:', error);
    }
  }
}

// 延迟创建全局实例，只在客户端环境创建
let _mobileAudioManager: MobileAudioManager | null = null;

export const getMobileAudioManager = (): MobileAudioManager => {
  if (!_mobileAudioManager) {
    _mobileAudioManager = new MobileAudioManager();
  }
  return _mobileAudioManager;
};

// 为了保持向后兼容性，提供一个getter
export const mobileAudioManager = new Proxy({} as MobileAudioManager, {
  get(_target, prop) {
    const manager = getMobileAudioManager();
    const value = (manager as any)[prop];
    return typeof value === 'function' ? value.bind(manager) : value;
  }
});

// 导出类型
export type { MobileAudioManager };

// 便捷函数
export const playAudioOnMobile = (src: string) => getMobileAudioManager().playAudio(src);
export const preloadAudioOnMobile = (src: string) => getMobileAudioManager().preloadAudio(src);
export const stopAudioOnMobile = () => getMobileAudioManager().stopCurrentAudio();
