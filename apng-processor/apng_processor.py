#!/usr/bin/env python3
"""
APNG 动图处理器
功能：
1. 读取 APNG 动图
2. 分解每一帧并保存为图片
3. 转换为 JPG 格式
4. 重新合成为动图（GIF/WebP/MP4）
"""

import os
import sys
from pathlib import Path
import argparse
from typing import List, Tuple, Optional
import time

try:
    from PIL import Image, ImageSequence
    import imageio
    import numpy as np
    from tqdm import tqdm
    import cv2
except ImportError as e:
    print(f"❌ 缺少依赖库: {e}")
    print("请运行: pip install -r requirements.txt")
    sys.exit(1)

class APNGProcessor:
    def __init__(self, input_file: str, output_dir: str = "output"):
        self.input_file = Path(input_file)
        self.output_dir = Path(output_dir)
        self.frames_dir = self.output_dir / "frames"
        self.jpg_frames_dir = self.output_dir / "jpg_frames"
        
        # 创建输出目录
        self.output_dir.mkdir(exist_ok=True)
        self.frames_dir.mkdir(exist_ok=True)
        self.jpg_frames_dir.mkdir(exist_ok=True)
        
        self.frames = []
        self.frame_durations = []
        
    def analyze_apng(self) -> dict:
        """分析 APNG 文件信息"""
        print("🔍 分析 APNG 文件...")
        
        if not self.input_file.exists():
            raise FileNotFoundError(f"文件不存在: {self.input_file}")
        
        try:
            with Image.open(self.input_file) as img:
                info = {
                    'format': img.format,
                    'size': img.size,
                    'mode': img.mode,
                    'is_animated': getattr(img, 'is_animated', False),
                    'n_frames': getattr(img, 'n_frames', 1),
                    'file_size_mb': self.input_file.stat().st_size / (1024 * 1024)
                }
                
                # 获取帧持续时间
                if info['is_animated']:
                    durations = []
                    for frame in ImageSequence.Iterator(img):
                        duration = frame.info.get('duration', 100)  # 默认100ms
                        durations.append(duration)
                    info['frame_durations'] = durations
                    info['total_duration'] = sum(durations)
                    info['fps'] = 1000 / (sum(durations) / len(durations)) if durations else 10
                
                return info
                
        except Exception as e:
            raise Exception(f"无法分析文件: {e}")
    
    def extract_frames(self) -> List[Image.Image]:
        """提取所有帧"""
        print("📸 提取动图帧...")
        
        frames = []
        durations = []
        
        try:
            with Image.open(self.input_file) as img:
                if not getattr(img, 'is_animated', False):
                    print("⚠️  这不是一个动图文件")
                    frames.append(img.copy())
                    durations.append(100)
                else:
                    frame_count = getattr(img, 'n_frames', 1)
                    
                    for i in tqdm(range(frame_count), desc="提取帧"):
                        img.seek(i)
                        frame = img.copy()
                        frames.append(frame)
                        
                        # 获取帧持续时间
                        duration = frame.info.get('duration', 100)
                        durations.append(duration)
                        
                        # 保存原始帧
                        frame_path = self.frames_dir / f"frame_{i:04d}.png"
                        frame.save(frame_path, "PNG")
                
                self.frames = frames
                self.frame_durations = durations
                
                print(f"✅ 提取了 {len(frames)} 帧")
                return frames
                
        except Exception as e:
            raise Exception(f"提取帧失败: {e}")
    
    def convert_to_jpg(self, quality: int = 85, resize: Optional[Tuple[int, int]] = None) -> List[str]:
        """将帧转换为 JPG 格式"""
        print("🖼️  转换为 JPG 格式...")
        
        if not self.frames:
            raise Exception("没有可用的帧，请先提取帧")
        
        jpg_paths = []
        
        for i, frame in enumerate(tqdm(self.frames, desc="转换JPG")):
            # 转换为 RGB 模式（JPG 不支持透明度）
            if frame.mode in ('RGBA', 'LA', 'P'):
                # 创建白色背景
                background = Image.new('RGB', frame.size, (255, 255, 255))
                if frame.mode == 'P':
                    frame = frame.convert('RGBA')
                background.paste(frame, mask=frame.split()[-1] if frame.mode == 'RGBA' else None)
                frame = background
            elif frame.mode != 'RGB':
                frame = frame.convert('RGB')
            
            # 调整大小
            if resize:
                frame = frame.resize(resize, Image.Resampling.LANCZOS)
            
            # 保存为 JPG
            jpg_path = self.jpg_frames_dir / f"frame_{i:04d}.jpg"
            frame.save(jpg_path, "JPEG", quality=quality, optimize=True)
            jpg_paths.append(str(jpg_path))
        
        print(f"✅ 转换了 {len(jpg_paths)} 个 JPG 文件")
        return jpg_paths
    
    def create_gif(self, output_path: str, fps: float = 10, optimize: bool = True) -> str:
        """创建 GIF 动图"""
        print("🎬 创建 GIF 动图...")
        
        if not self.frames:
            raise Exception("没有可用的帧")
        
        # 计算帧间隔（毫秒）
        duration = int(1000 / fps)
        
        # 优化调色板
        frames_for_gif = []
        for frame in self.frames:
            # 确保所有帧都是 RGB 模式
            if frame.mode in ('RGBA', 'LA'):
                # 创建白色背景处理透明度
                background = Image.new('RGB', frame.size, (255, 255, 255))
                if frame.mode == 'RGBA':
                    background.paste(frame, mask=frame.split()[-1])
                else:
                    background.paste(frame)
                frame = background
            elif frame.mode == 'P':
                # 调色板模式直接转换为 RGB
                frame = frame.convert('RGB')
            elif frame.mode != 'RGB':
                frame = frame.convert('RGB')

            # 转换为调色板模式以减小文件大小
            try:
                frame = frame.quantize(colors=256, method=Image.Quantize.MEDIANCUT)
            except Exception:
                # 如果量化失败，保持 RGB 模式
                pass
            frames_for_gif.append(frame)
        
        # 保存 GIF
        frames_for_gif[0].save(
            output_path,
            format='GIF',
            save_all=True,
            append_images=frames_for_gif[1:],
            duration=duration,
            loop=0,
            optimize=optimize
        )
        
        file_size = Path(output_path).stat().st_size / (1024 * 1024)
        print(f"✅ GIF 创建完成: {output_path} ({file_size:.2f} MB)")
        return output_path
    
    def create_webp(self, output_path: str, quality: int = 80, fps: float = 10) -> str:
        """创建 WebP 动图"""
        print("🌐 创建 WebP 动图...")
        
        jpg_paths = list(self.jpg_frames_dir.glob("*.jpg"))
        if not jpg_paths:
            raise Exception("没有找到 JPG 帧文件")
        
        # 按文件名排序
        jpg_paths.sort()
        
        # 读取图片
        images = []
        for jpg_path in tqdm(jpg_paths, desc="读取JPG"):
            img = imageio.imread(jpg_path)
            images.append(img)
        
        # 计算帧间隔（秒）
        duration = 1.0 / fps
        
        # 保存为 WebP
        imageio.mimsave(
            output_path,
            images,
            format='WEBP',
            duration=duration,
            quality=quality,
            loop=0
        )
        
        file_size = Path(output_path).stat().st_size / (1024 * 1024)
        print(f"✅ WebP 创建完成: {output_path} ({file_size:.2f} MB)")
        return output_path
    
    def create_mp4(self, output_path: str, fps: float = 24, crf: int = 23) -> str:
        """创建 MP4 视频"""
        print("🎥 创建 MP4 视频...")
        
        jpg_paths = list(self.jpg_frames_dir.glob("*.jpg"))
        if not jpg_paths:
            raise Exception("没有找到 JPG 帧文件")
        
        # 按文件名排序
        jpg_paths.sort()
        
        # 读取第一张图片获取尺寸
        first_img = cv2.imread(str(jpg_paths[0]))
        height, width, _ = first_img.shape
        
        # 确保尺寸是偶数（MP4 要求）
        if width % 2 != 0:
            width -= 1
        if height % 2 != 0:
            height -= 1
        
        # 创建视频写入器
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
        
        # 写入帧
        for jpg_path in tqdm(jpg_paths, desc="写入MP4"):
            img = cv2.imread(str(jpg_path))
            img = cv2.resize(img, (width, height))
            out.write(img)
        
        out.release()
        
        file_size = Path(output_path).stat().st_size / (1024 * 1024)
        print(f"✅ MP4 创建完成: {output_path} ({file_size:.2f} MB)")
        return output_path
    
    def process_all(self, 
                   jpg_quality: int = 85,
                   resize: Optional[Tuple[int, int]] = None,
                   gif_fps: float = 10,
                   webp_fps: float = 15,
                   mp4_fps: float = 24) -> dict:
        """完整处理流程"""
        print("🚀 开始完整处理流程...")
        start_time = time.time()
        
        results = {}
        
        try:
            # 1. 分析文件
            info = self.analyze_apng()
            results['info'] = info
            print(f"📊 文件信息: {info['n_frames']} 帧, {info['file_size_mb']:.2f} MB")
            
            # 2. 提取帧
            self.extract_frames()
            
            # 3. 转换为 JPG
            jpg_paths = self.convert_to_jpg(quality=jpg_quality, resize=resize)
            results['jpg_frames'] = len(jpg_paths)
            
            # 4. 创建不同格式的动图
            output_files = {}
            
            # GIF
            gif_path = self.output_dir / "compressed.gif"
            output_files['gif'] = self.create_gif(str(gif_path), fps=gif_fps)
            
            # WebP
            webp_path = self.output_dir / "compressed.webp"
            output_files['webp'] = self.create_webp(str(webp_path), fps=webp_fps)
            
            # MP4
            mp4_path = self.output_dir / "compressed.mp4"
            output_files['mp4'] = self.create_mp4(str(mp4_path), fps=mp4_fps)
            
            results['output_files'] = output_files
            
            # 5. 生成报告
            self.generate_report(info, output_files)
            
            elapsed_time = time.time() - start_time
            print(f"✅ 处理完成! 耗时: {elapsed_time:.2f} 秒")
            
            return results
            
        except Exception as e:
            print(f"❌ 处理失败: {e}")
            raise
    
    def generate_report(self, info: dict, output_files: dict):
        """生成处理报告"""
        report_path = self.output_dir / "compression_report.txt"
        
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write("APNG 压缩处理报告\n")
            f.write("=" * 50 + "\n\n")
            
            f.write("原始文件信息:\n")
            f.write(f"  文件: {self.input_file.name}\n")
            f.write(f"  大小: {info['file_size_mb']:.2f} MB\n")
            f.write(f"  尺寸: {info['size'][0]}x{info['size'][1]}\n")
            f.write(f"  帧数: {info['n_frames']}\n")
            f.write(f"  帧率: {info.get('fps', 'N/A'):.1f} fps\n\n")
            
            f.write("输出文件:\n")
            for format_name, file_path in output_files.items():
                if Path(file_path).exists():
                    size_mb = Path(file_path).stat().st_size / (1024 * 1024)
                    compression_ratio = (1 - size_mb / info['file_size_mb']) * 100
                    f.write(f"  {format_name.upper()}: {Path(file_path).name}\n")
                    f.write(f"    大小: {size_mb:.2f} MB\n")
                    f.write(f"    压缩率: {compression_ratio:.1f}%\n\n")
        
        print(f"📋 报告已保存: {report_path}")


def main():
    parser = argparse.ArgumentParser(description="APNG 动图处理器")
    parser.add_argument("input", help="输入的 APNG 文件路径")
    parser.add_argument("-o", "--output", default="output", help="输出目录")
    parser.add_argument("-q", "--quality", type=int, default=85, help="JPG 质量 (1-100)")
    parser.add_argument("--resize", help="调整大小 (格式: WIDTHxHEIGHT, 如: 1280x720)")
    parser.add_argument("--gif-fps", type=float, default=10, help="GIF 帧率")
    parser.add_argument("--webp-fps", type=float, default=15, help="WebP 帧率")
    parser.add_argument("--mp4-fps", type=float, default=24, help="MP4 帧率")
    
    args = parser.parse_args()
    
    # 解析调整大小参数
    resize = None
    if args.resize:
        try:
            width, height = map(int, args.resize.split('x'))
            resize = (width, height)
        except ValueError:
            print("❌ 调整大小格式错误，应为 WIDTHxHEIGHT")
            return
    
    # 创建处理器
    processor = APNGProcessor(args.input, args.output)
    
    try:
        # 执行处理
        results = processor.process_all(
            jpg_quality=args.quality,
            resize=resize,
            gif_fps=args.gif_fps,
            webp_fps=args.webp_fps,
            mp4_fps=args.mp4_fps
        )
        
        print("\n🎉 处理完成!")
        print(f"📁 输出目录: {args.output}")
        print("📄 查看详细报告: compression_report.txt")
        
    except Exception as e:
        print(f"❌ 处理失败: {e}")
        return 1
    
    return 0


if __name__ == "__main__":
    sys.exit(main())
