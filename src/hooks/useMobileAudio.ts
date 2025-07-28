/**
 * 移动端音频播放 React Hook
 * 解决移动端浏览器语音播放概率失败的问题
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { mobileAudioManager } from '@/utils/mobileAudioFix';

interface UseMobileAudioOptions {
  autoPreload?: boolean;
  onPlayStart?: () => void;
  onPlayEnd?: () => void;
  onPlayError?: (error: any) => void;
  retryAttempts?: number;
  retryDelay?: number;
}

interface UseMobileAudioReturn {
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
  playAudio: (src: string) => Promise<boolean>;
  stopAudio: () => void;
  preloadAudio: (src: string) => void;
  retryPlay: () => Promise<boolean>;
  audioSupport: {
    canPlay: boolean;
    formats: string[];
  };
  managerStatus: {
    audioAvailable: boolean;
    userInteractionDetected: boolean;
    isUnlocked: boolean;
    currentlyPlaying: boolean;
    cacheSize: number;
  };
}

export function useMobileAudio(options: UseMobileAudioOptions = {}): UseMobileAudioReturn {
  const {
    autoPreload = false,
    onPlayStart,
    onPlayEnd,
    onPlayError,
    retryAttempts = 3,
    retryDelay = 1000
  } = options;

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioSupport, setAudioSupport] = useState<{ canPlay: boolean; formats: string[] }>({ canPlay: false, formats: [] });
  const [managerStatus, setManagerStatus] = useState(() => {
    // 只在客户端环境获取状态
    if (typeof window !== 'undefined') {
      return mobileAudioManager.getStatus();
    }
    return {
      audioAvailable: false,
      userInteractionDetected: false,
      isUnlocked: false,
      currentlyPlaying: false,
      cacheSize: 0
    };
  });

  const lastAudioSrc = useRef<string>('');
  const retryCount = useRef(0);

  // 更新管理器状态
  const updateManagerStatus = useCallback(() => {
    setManagerStatus(mobileAudioManager.getStatus());
  }, []);

  // 播放音频
  const playAudio = useCallback(async (src: string): Promise<boolean> => {
    if (!src) {
      setError('音频源不能为空');
      return false;
    }

    setIsLoading(true);
    setError(null);
    lastAudioSrc.current = src;
    retryCount.current = 0;

    try {
      onPlayStart?.();
      setIsPlaying(true);
      updateManagerStatus();

      const success = await mobileAudioManager.playAudio(src);

      if (success) {
        setError(null);
        console.log('音频播放完成');
        onPlayEnd?.(); // 只有在成功播放完成时才调用
      } else {
        throw new Error('音频播放失败');
      }

      return success;
    } catch (err: any) {
      const errorMessage = err.message || '音频播放失败';
      setError(errorMessage);
      onPlayError?.(err);
      console.error('音频播放错误:', err);
      return false;
    } finally {
      setIsLoading(false);
      setIsPlaying(false);
      updateManagerStatus();
    }
  }, [onPlayStart, onPlayEnd, onPlayError, updateManagerStatus]);

  // 重试播放
  const retryPlay = useCallback(async (): Promise<boolean> => {
    if (!lastAudioSrc.current) {
      setError('没有可重试的音频');
      return false;
    }

    if (retryCount.current >= retryAttempts) {
      setError(`重试次数已达上限 (${retryAttempts})`);
      return false;
    }

    retryCount.current++;
    console.log(`重试播放音频 (第 ${retryCount.current} 次)`);

    // 延迟重试
    if (retryDelay > 0) {
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }

    return playAudio(lastAudioSrc.current);
  }, [playAudio, retryAttempts, retryDelay]);

  // 停止音频
  const stopAudio = useCallback(() => {
    mobileAudioManager.stopCurrentAudio();
    setIsPlaying(false);
    setIsLoading(false);
    updateManagerStatus();
  }, [updateManagerStatus]);

  // 预加载音频
  const preloadAudio = useCallback((src: string) => {
    if (src) {
      mobileAudioManager.preloadAudio(src);
      updateManagerStatus();
    }
  }, [updateManagerStatus]);

  // 自动预加载
  useEffect(() => {
    if (autoPreload && lastAudioSrc.current) {
      preloadAudio(lastAudioSrc.current);
    }
  }, [autoPreload, preloadAudio]);

  // 初始化音频支持检查
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 异步检查音频支持
      const checkSupport = async () => {
        try {
          const support = await mobileAudioManager.checkAudioSupport();
          setAudioSupport(support);
        } catch (error) {
          console.error('检查音频支持失败:', error);
          setAudioSupport({ canPlay: false, formats: [] });
        }
      };

      checkSupport();
    }
  }, []);

  // 定期更新管理器状态
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const interval = setInterval(updateManagerStatus, 2000);
      return () => clearInterval(interval);
    }
  }, [updateManagerStatus]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, [stopAudio]);

  return {
    isPlaying,
    isLoading,
    error,
    playAudio,
    stopAudio,
    preloadAudio,
    retryPlay,
    audioSupport,
    managerStatus
  };
}

// 便捷的播放函数
export function useSimpleAudioPlay() {
  const { playAudio, isPlaying, error } = useMobileAudio({
    retryAttempts: 2,
    retryDelay: 500
  });

  const playWithRetry = useCallback(async (src: string) => {
    let success = await playAudio(src);
    
    // 如果第一次失败，自动重试一次
    if (!success && error) {
      console.log('第一次播放失败，自动重试...');
      await new Promise(resolve => setTimeout(resolve, 300));
      success = await playAudio(src);
    }
    
    return success;
  }, [playAudio, error]);

  return {
    playAudio: playWithRetry,
    isPlaying,
    error
  };
}
