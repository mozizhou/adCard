#!/usr/bin/env python3
"""
带选项的 APNG 处理脚本
支持不同的压缩级别和尺寸选择
"""

import os
import sys
from pathlib import Path
from PIL import Image

# 添加当前目录到 Python 路径
sys.path.insert(0, str(Path(__file__).parent))

from apng_processor import APNGProcessor

def get_aspect_ratio_sizes(original_width, original_height):
    """计算保持宽高比的不同尺寸选项"""
    aspect_ratio = original_width / original_height
    
    # 定义不同的压缩级别
    options = {
        'ultra': {
            'name': '极度压缩',
            'height': 480,
            'quality': 70,
            'description': '最小文件，适合预览'
        },
        'high': {
            'name': '高度压缩', 
            'height': 720,
            'quality': 75,
            'description': '平衡质量和大小，推荐'
        },
        'medium': {
            'name': '中等压缩',
            'height': 1080,
            'quality': 80,
            'description': '较好质量，文件稍大'
        },
        'low': {
            'name': '轻度压缩',
            'height': 1440,
            'quality': 85,
            'description': '高质量，文件较大'
        }
    }
    
    # 计算每个选项的宽度
    for key, option in options.items():
        width = int(option['height'] * aspect_ratio)
        # 确保宽度是偶数
        if width % 2 != 0:
            width += 1
        option['width'] = width
        option['size'] = f"{width}x{option['height']}"
    
    return options

def main():
    print("🎬 APNG 处理器 - 多选项版本")
    print("=" * 40)
    
    # 输入文件路径
    input_file = "../out/index/images/index/u1_original.png"
    
    if not Path(input_file).exists():
        print(f"❌ 文件不存在: {input_file}")
        return 1
    
    # 获取原图信息
    with Image.open(input_file) as img:
        original_width, original_height = img.size
        aspect_ratio = original_width / original_height
        file_size_mb = Path(input_file).stat().st_size / (1024 * 1024)
    
    print(f"📊 原图信息:")
    print(f"  尺寸: {original_width} x {original_height}")
    print(f"  宽高比: {aspect_ratio:.3f}")
    print(f"  文件大小: {file_size_mb:.2f} MB")
    print()
    
    # 获取压缩选项
    options = get_aspect_ratio_sizes(original_width, original_height)
    
    print("🎯 可用的压缩选项:")
    for i, (key, option) in enumerate(options.items(), 1):
        print(f"  {i}. {option['name']} - {option['size']}")
        print(f"     质量: {option['quality']}, {option['description']}")
    
    print("\n请选择压缩选项 (1-4), 或按 Enter 使用推荐选项 (2): ", end="")
    
    try:
        choice = input().strip()
        if not choice:
            choice = "2"  # 默认选择高度压缩
        
        choice_index = int(choice) - 1
        if choice_index < 0 or choice_index >= len(options):
            print("❌ 无效选择，使用默认选项")
            choice_index = 1
        
        selected_option = list(options.values())[choice_index]
        
    except (ValueError, KeyboardInterrupt):
        print("\n使用默认选项")
        selected_option = options['high']
    
    print(f"\n✅ 选择: {selected_option['name']} - {selected_option['size']}")
    
    # 创建输出目录名
    output_dir = f"u1_compressed_{selected_option['size'].replace('x', '_')}"
    
    # 创建处理器
    processor = APNGProcessor(input_file, output_dir)
    
    print(f"\n🔧 处理配置:")
    print(f"  - 输出目录: {output_dir}/")
    print(f"  - JPG 质量: {selected_option['quality']}")
    print(f"  - 原始尺寸: {original_width}x{original_height}")
    print(f"  - 目标尺寸: {selected_option['size']}")
    print(f"  - 压缩级别: {selected_option['name']}")
    print()
    
    try:
        # 执行处理
        results = processor.process_all(
            jpg_quality=selected_option['quality'],
            resize=(selected_option['width'], selected_option['height']),
            gif_fps=12,
            webp_fps=15,
            mp4_fps=24
        )
        
        print(f"\n🎉 处理完成!")
        print(f"\n📊 结果文件:")
        
        output_path = Path(output_dir)
        total_original_size = file_size_mb
        
        for file_path in output_path.glob("compressed.*"):
            size_mb = file_path.stat().st_size / (1024 * 1024)
            compression_ratio = (1 - size_mb / total_original_size) * 100
            print(f"  {file_path.name}: {size_mb:.2f} MB (压缩 {compression_ratio:.1f}%)")
        
        print(f"\n📁 所有文件保存在: {output_path.absolute()}")
        print(f"📋 详细报告: {output_dir}/compression_report.txt")
        
        # 推荐最佳文件
        webp_file = output_path / "compressed.webp"
        if webp_file.exists():
            webp_size = webp_file.stat().st_size / (1024 * 1024)
            webp_compression = (1 - webp_size / total_original_size) * 100
            print(f"\n💡 推荐使用: compressed.webp")
            print(f"   大小: {webp_size:.2f} MB (压缩 {webp_compression:.1f}%)")
            print(f"   WebP 格式在保持质量的同时文件最小")
        
        # 显示替换建议
        print(f"\n🔄 替换原文件:")
        print(f"   cp {output_dir}/compressed.webp ../out/index/images/index/u1.png")
        print(f"   或使用脚本: bash replace-apng.sh replace {output_dir}/compressed.webp")
        
        return 0
        
    except Exception as e:
        print(f"❌ 处理失败: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
