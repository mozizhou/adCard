#!/usr/bin/env python3
"""
专门处理 u1.png 的脚本
"""

import os
import sys
from pathlib import Path

# 添加当前目录到 Python 路径
sys.path.insert(0, str(Path(__file__).parent))

from apng_processor import APNGProcessor

def main():
    print("🎬 u1.png APNG 处理器")
    print("=" * 30)
    
    # 输入文件路径
    input_file = "../out/index/images/index/u1_original.png"
    
    if not Path(input_file).exists():
        print(f"❌ 文件不存在: {input_file}")
        print("请确保 u1_original.png 文件存在")
        return 1
    
    # 创建处理器
    processor = APNGProcessor(input_file, "u1_compressed")
    
    # 获取原图尺寸并计算合适的压缩尺寸
    from PIL import Image
    with Image.open(input_file) as img:
        original_width, original_height = img.size
        aspect_ratio = original_width / original_height

    # 选择合适的目标尺寸（保持宽高比）
    # 原图是 1080x1920，我们压缩到 720p 高度
    target_height = 720
    target_width = int(target_height * aspect_ratio)
    # 确保宽度是偶数（视频编码要求）
    if target_width % 2 != 0:
        target_width += 1

    print("🔧 处理配置:")
    print("  - 输出目录: u1_compressed/")
    print("  - JPG 质量: 80")
    print(f"  - 原始尺寸: {original_width}x{original_height}")
    print(f"  - 目标尺寸: {target_width}x{target_height} (保持宽高比 {aspect_ratio:.3f})")
    print("  - GIF 帧率: 12 fps")
    print("  - WebP 帧率: 15 fps")
    print("  - MP4 帧率: 24 fps")
    print()

    try:
        # 执行处理
        results = processor.process_all(
            jpg_quality=80,
            resize=(target_width, target_height),  # 保持原始宽高比
            gif_fps=12,
            webp_fps=15,
            mp4_fps=24
        )
        
        print("\n🎉 处理完成!")
        print("\n📊 结果文件:")
        
        output_dir = Path("u1_compressed")
        for file_path in output_dir.glob("compressed.*"):
            size_mb = file_path.stat().st_size / (1024 * 1024)
            print(f"  {file_path.name}: {size_mb:.2f} MB")
        
        print(f"\n📁 所有文件保存在: {output_dir.absolute()}")
        print("📋 详细报告: u1_compressed/compression_report.txt")
        
        # 推荐最佳文件
        webp_file = output_dir / "compressed.webp"
        if webp_file.exists():
            webp_size = webp_file.stat().st_size / (1024 * 1024)
            print(f"\n💡 推荐使用: compressed.webp ({webp_size:.2f} MB)")
            print("   WebP 格式在保持质量的同时文件最小")
        
        return 0
        
    except Exception as e:
        print(f"❌ 处理失败: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
