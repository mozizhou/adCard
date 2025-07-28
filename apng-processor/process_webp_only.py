#!/usr/bin/env python3
"""
简化版 APNG 处理器 - 只生成 WebP 和 MP4
跳过有问题的 GIF 生成
"""

import os
import sys
from pathlib import Path
from PIL import Image

# 添加当前目录到 Python 路径
sys.path.insert(0, str(Path(__file__).parent))

from apng_processor import APNGProcessor

def main():
    print("🎬 APNG 处理器 - WebP/MP4 版本")
    print("=" * 35)
    
    # 输入文件路径
    input_file = "../out/index/images/index/u1_original.png"
    
    if not Path(input_file).exists():
        print(f"❌ 文件不存在: {input_file}")
        return 1
    
    # 获取原图尺寸并计算合适的压缩尺寸
    with Image.open(input_file) as img:
        original_width, original_height = img.size
        aspect_ratio = original_width / original_height
        file_size_mb = Path(input_file).stat().st_size / (1024 * 1024)
    
    # 选择合适的目标尺寸（保持宽高比）
    target_height = 720
    target_width = int(target_height * aspect_ratio)
    # 确保宽度是偶数（视频编码要求）
    if target_width % 2 != 0:
        target_width += 1
    
    print(f"📊 原图信息:")
    print(f"  尺寸: {original_width} x {original_height}")
    print(f"  宽高比: {aspect_ratio:.3f}")
    print(f"  文件大小: {file_size_mb:.2f} MB")
    print()
    
    print("🔧 处理配置:")
    print("  - 输出目录: u1_webp_compressed/")
    print("  - JPG 质量: 80")
    print(f"  - 目标尺寸: {target_width}x{target_height} (保持宽高比)")
    print("  - WebP 帧率: 15 fps")
    print("  - MP4 帧率: 24 fps")
    print("  - 跳过 GIF 生成（避免透明度问题）")
    print()
    
    # 创建处理器
    processor = APNGProcessor(input_file, "u1_webp_compressed")
    
    try:
        print("🚀 开始处理...")
        
        # 1. 分析文件
        info = processor.analyze_apng()
        print(f"📊 文件信息: {info['n_frames']} 帧, {info['file_size_mb']:.2f} MB")
        
        # 2. 提取帧
        processor.extract_frames()
        
        # 3. 转换为 JPG
        jpg_paths = processor.convert_to_jpg(
            quality=80, 
            resize=(target_width, target_height)
        )
        
        # 4. 只创建 WebP 和 MP4
        output_files = {}
        
        # WebP
        webp_path = processor.output_dir / "compressed.webp"
        output_files['webp'] = processor.create_webp(str(webp_path), quality=80, fps=15)
        
        # MP4
        mp4_path = processor.output_dir / "compressed.mp4"
        output_files['mp4'] = processor.create_mp4(str(mp4_path), fps=24)
        
        # 5. 生成简化报告
        print(f"\n🎉 处理完成!")
        print(f"\n📊 结果文件:")
        
        total_original_size = file_size_mb
        
        for format_name, file_path in output_files.items():
            if Path(file_path).exists():
                size_mb = Path(file_path).stat().st_size / (1024 * 1024)
                compression_ratio = (1 - size_mb / total_original_size) * 100
                print(f"  {format_name.upper()}: {Path(file_path).name}")
                print(f"    大小: {size_mb:.2f} MB")
                print(f"    压缩率: {compression_ratio:.1f}%")
                print()
        
        print(f"📁 所有文件保存在: {processor.output_dir.absolute()}")
        
        # 推荐最佳文件
        webp_file = processor.output_dir / "compressed.webp"
        if webp_file.exists():
            webp_size = webp_file.stat().st_size / (1024 * 1024)
            webp_compression = (1 - webp_size / total_original_size) * 100
            print(f"\n💡 推荐使用: compressed.webp")
            print(f"   大小: {webp_size:.2f} MB (压缩 {webp_compression:.1f}%)")
            print(f"   WebP 格式质量好，文件小，现代浏览器支持")
        
        # 显示替换建议
        print(f"\n🔄 替换原文件建议:")
        print(f"   1. 备份原文件: cp ../out/index/images/index/u1.png ../out/index/images/index/u1_backup.png")
        print(f"   2. 替换文件: cp u1_webp_compressed/compressed.webp ../out/index/images/index/u1.png")
        print(f"   3. 测试页面加载速度")
        
        return 0
        
    except Exception as e:
        print(f"❌ 处理失败: {e}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == "__main__":
    sys.exit(main())
