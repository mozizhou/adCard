#!/usr/bin/env python3
"""
测试 APNG 处理器安装
"""

import sys
from pathlib import Path

def test_imports():
    """测试所有必需的库是否正确安装"""
    print("🧪 测试 Python 库安装...")
    
    required_modules = [
        ('PIL', 'Pillow'),
        ('imageio', 'imageio'),
        ('numpy', 'numpy'),
        ('tqdm', 'tqdm'),
        ('cv2', 'opencv-python')
    ]
    
    failed_imports = []
    
    for module_name, package_name in required_modules:
        try:
            __import__(module_name)
            print(f"  ✅ {package_name}")
        except ImportError as e:
            print(f"  ❌ {package_name}: {e}")
            failed_imports.append(package_name)
    
    if failed_imports:
        print(f"\n❌ 缺少依赖: {', '.join(failed_imports)}")
        print("请运行: pip install -r requirements.txt")
        return False
    else:
        print("\n✅ 所有依赖都已正确安装")
        return True

def test_input_file():
    """测试输入文件是否存在"""
    print("\n📁 测试输入文件...")
    
    input_file = Path("../out/index/images/index/u1_original.png")
    
    if input_file.exists():
        size_mb = input_file.stat().st_size / (1024 * 1024)
        print(f"  ✅ 找到输入文件: {input_file}")
        print(f"  📊 文件大小: {size_mb:.2f} MB")
        return True
    else:
        print(f"  ❌ 输入文件不存在: {input_file}")
        print("  请确保 u1_original.png 文件存在")
        return False

def test_output_directory():
    """测试输出目录权限"""
    print("\n📂 测试输出目录...")
    
    try:
        output_dir = Path("test_output")
        output_dir.mkdir(exist_ok=True)
        
        # 测试写入权限
        test_file = output_dir / "test.txt"
        test_file.write_text("test")
        test_file.unlink()
        
        output_dir.rmdir()
        
        print("  ✅ 输出目录权限正常")
        return True
    except Exception as e:
        print(f"  ❌ 输出目录权限问题: {e}")
        return False

def test_processor():
    """测试处理器基本功能"""
    print("\n🔧 测试处理器...")
    
    try:
        from apng_processor import APNGProcessor
        print("  ✅ APNGProcessor 导入成功")
        
        # 测试创建实例
        processor = APNGProcessor("dummy.png", "test_output")
        print("  ✅ APNGProcessor 实例创建成功")
        
        return True
    except Exception as e:
        print(f"  ❌ 处理器测试失败: {e}")
        return False

def main():
    print("🧪 APNG 处理器安装测试")
    print("=" * 30)
    
    tests = [
        ("Python 库", test_imports),
        ("输入文件", test_input_file),
        ("输出目录", test_output_directory),
        ("处理器", test_processor)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n🔍 测试 {test_name}...")
        if test_func():
            passed += 1
    
    print(f"\n📊 测试结果: {passed}/{total} 通过")
    
    if passed == total:
        print("\n🎉 所有测试通过！可以开始处理 APNG 文件了")
        print("\n🚀 运行命令:")
        print("  python process_u1.py")
        print("  或")
        print("  install_and_run.bat (Windows)")
        return 0
    else:
        print("\n❌ 部分测试失败，请检查安装")
        print("\n🔧 解决方案:")
        print("1. 确保 Python 3.8+ 已安装")
        print("2. 运行: pip install -r requirements.txt")
        print("3. 确保 u1_original.png 文件存在")
        return 1

if __name__ == "__main__":
    sys.exit(main())
