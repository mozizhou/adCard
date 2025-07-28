#!/usr/bin/env python3
"""
检查 APNG 文件的尺寸和宽高比
"""

from PIL import Image
from pathlib import Path

def check_apng_dimensions():
    input_file = "../out/index/images/index/u1_original.png"
    
    if not Path(input_file).exists():
        print(f"❌ 文件不存在: {input_file}")
        return
    
    try:
        with Image.open(input_file) as img:
            width, height = img.size
            aspect_ratio = width / height
            
            print(f"📊 原图信息:")
            print(f"  尺寸: {width} x {height}")
            print(f"  宽高比: {aspect_ratio:.3f}")
            print(f"  是否为动图: {getattr(img, 'is_animated', False)}")
            if hasattr(img, 'n_frames'):
                print(f"  帧数: {img.n_frames}")
            
            # 计算不同目标高度下的宽度（保持宽高比）
            target_heights = [480, 720, 1080, 1440]
            
            print(f"\n🎯 保持宽高比的推荐尺寸:")
            for target_height in target_heights:
                target_width = int(target_height * aspect_ratio)
                # 确保宽度是偶数（视频编码要求）
                if target_width % 2 != 0:
                    target_width += 1
                print(f"  {target_width} x {target_height} ({target_height}p)")
            
            # 计算不同目标宽度下的高度
            target_widths = [854, 1280, 1920, 2560]
            
            print(f"\n🎯 保持宽高比的其他选项:")
            for target_width in target_widths:
                target_height = int(target_width / aspect_ratio)
                # 确保高度是偶数
                if target_height % 2 != 0:
                    target_height += 1
                print(f"  {target_width} x {target_height}")
            
            return width, height, aspect_ratio
            
    except Exception as e:
        print(f"❌ 分析失败: {e}")
        return None

if __name__ == "__main__":
    check_apng_dimensions()
