/**
 * 移动端友好的音频播放组件
 * 解决移动端浏览器语音播放概率失败的问题
 */

"use client";

import React, { useState, useEffect } from 'react';
import { Button, Alert, Progress, Space, Typography, Card } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, ReloadOutlined, SoundOutlined } from '@ant-design/icons';
import { useMobileAudio } from '@/hooks/useMobileAudio';

const { Text, Title } = Typography;

interface MobileAudioPlayerProps {
  audioSrc?: string;
  onPlaySuccess?: () => void;
  onPlayError?: (error: any) => void;
  showDebugInfo?: boolean;
  autoRetry?: boolean;
}

export function MobileAudioPlayer({
  audioSrc = '',
  onPlaySuccess,
  onPlayError,
  showDebugInfo = false,
  autoRetry = true
}: MobileAudioPlayerProps) {
  const [currentSrc, setCurrentSrc] = useState(audioSrc);
  const [playAttempts, setPlayAttempts] = useState(0);

  const {
    isPlaying,
    isLoading,
    error,
    playAudio,
    stopAudio,
    retryPlay,
    preloadAudio,
    audioSupport,
    managerStatus
  } = useMobileAudio({
    autoPreload: true,
    retryAttempts: autoRetry ? 3 : 1,
    retryDelay: 800,
    onPlayStart: () => {
      setPlayAttempts(prev => prev + 1);
      console.log('开始播放音频');
    },
    onPlayEnd: () => {
      console.log('音频播放结束');
      onPlaySuccess?.();
    },
    onPlayError: (err) => {
      console.error('音频播放错误:', err);
      onPlayError?.(err);
    }
  });

  // 处理播放按钮点击
  const handlePlay = async () => {
    if (!currentSrc) {
      alert('请先设置音频源');
      return;
    }

    if (isPlaying) {
      stopAudio();
      return;
    }

    const success = await playAudio(currentSrc);
    
    // 如果播放失败且启用自动重试
    if (!success && autoRetry && error) {
      console.log('播放失败，准备自动重试...');
      setTimeout(() => {
        retryPlay();
      }, 1000);
    }
  };

  // 手动重试
  const handleRetry = async () => {
    await retryPlay();
  };

  // 预加载音频
  const handlePreload = () => {
    if (currentSrc) {
      preloadAudio(currentSrc);
    }
  };

  // 更新音频源时自动预加载
  useEffect(() => {
    if (currentSrc) {
      preloadAudio(currentSrc);
    }
  }, [currentSrc, preloadAudio]);

  // 获取状态颜色
  const getStatusColor = () => {
    if (error) return 'error';
    if (isPlaying) return 'processing';
    if (isLoading) return 'active';
    return 'normal';
  };

  // 获取用户交互提示
  const getUserInteractionTip = () => {
    if (!managerStatus.userInteractionDetected) {
      return (
        <Alert
          message="需要用户交互"
          description="移动端浏览器需要用户交互后才能播放音频，请点击任意按钮激活音频功能。"
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      );
    }
    return null;
  };

  return (
    <Card title="移动端音频播放器" style={{ maxWidth: 500 }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        {/* 用户交互提示 */}
        {getUserInteractionTip()}

        {/* 音频源输入 */}
        <div>
          <Text strong>音频源:</Text>
          <input
            type="text"
            value={currentSrc}
            onChange={(e) => setCurrentSrc(e.target.value)}
            placeholder="输入音频 URL"
            style={{
              width: '100%',
              padding: '8px',
              marginTop: '8px',
              border: '1px solid #d9d9d9',
              borderRadius: '6px'
            }}
          />
        </div>

        {/* 播放控制 */}
        <Space>
          <Button
            type="primary"
            icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
            loading={isLoading}
            onClick={handlePlay}
            disabled={!currentSrc}
          >
            {isPlaying ? '停止' : '播放'}
          </Button>

          <Button
            icon={<ReloadOutlined />}
            onClick={handleRetry}
            disabled={!error || isLoading}
          >
            重试
          </Button>

          <Button
            icon={<SoundOutlined />}
            onClick={handlePreload}
            disabled={!currentSrc}
          >
            预加载
          </Button>
        </Space>

        {/* 播放状态 */}
        <div>
          <Text>播放状态: </Text>
          <Text type={getStatusColor() === 'error' ? 'danger' : 'success'}>
            {isLoading ? '加载中...' : isPlaying ? '播放中' : '已停止'}
          </Text>
          {playAttempts > 0 && (
            <Text type="secondary"> (尝试次数: {playAttempts})</Text>
          )}
        </div>

        {/* 错误信息 */}
        {error && (
          <Alert
            message="播放失败"
            description={error}
            type="error"
            showIcon
            action={
              <Button size="small" onClick={handleRetry}>
                重试
              </Button>
            }
          />
        )}

        {/* 浏览器支持信息 */}
        <div>
          <Text>浏览器支持: </Text>
          <Text type={audioSupport.canPlay ? 'success' : 'danger'}>
            {audioSupport.canPlay ? '支持' : '不支持'}
          </Text>
          {audioSupport.formats.length > 0 && (
            <Text type="secondary"> ({audioSupport.formats.join(', ')})</Text>
          )}
        </div>

        {/* 调试信息 */}
        {showDebugInfo && (
          <Card size="small" title="调试信息" style={{ marginTop: 16 }}>
            <Space direction="vertical" size="small">
              <Text>音频 API 可用: {managerStatus.audioAvailable ? '是' : '否'}</Text>
              <Text>用户交互检测: {managerStatus.userInteractionDetected ? '是' : '否'}</Text>
              <Text>音频权限已解锁: {managerStatus.isUnlocked ? '是' : '否'}</Text>
              <Text>当前播放: {managerStatus.currentlyPlaying ? '是' : '否'}</Text>
              <Text>缓存大小: {managerStatus.cacheSize}</Text>
            </Space>
          </Card>
        )}

        {/* 使用提示 */}
        <Alert
          message="移动端播放提示"
          description={
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li>首次使用需要用户交互激活音频功能</li>
              <li>播放失败时会自动重试</li>
              <li>建议使用 HTTPS 协议</li>
              <li>支持预加载提高播放成功率</li>
            </ul>
          }
          type="info"
          showIcon
        />
      </Space>
    </Card>
  );
}

// 简化版本的音频播放按钮
export function SimpleAudioButton({
  audioSrc,
  children = '播放',
  onSuccess,
  onError
}: {
  audioSrc: string;
  children?: React.ReactNode;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}) {
  const { playAudio, isPlaying, error } = useMobileAudio({
    onPlayEnd: onSuccess,
    onPlayError: onError,
    retryAttempts: 2
  });

  const handleClick = async () => {
    if (!audioSrc) return;
    
    const success = await playAudio(audioSrc);
    if (!success && error) {
      // 自动重试一次
      setTimeout(() => playAudio(audioSrc), 500);
    }
  };

  return (
    <Button
      type="primary"
      icon={<SoundOutlined />}
      loading={isPlaying}
      onClick={handleClick}
      disabled={!audioSrc}
    >
      {children}
    </Button>
  );
}
