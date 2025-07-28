# APNG 动图处理器

这是一个专门用于处理 APNG 动图的 Python 工具，可以：
- 分解 APNG 动图为单独的帧
- 将帧转换为 JPG 格式
- 重新合成为不同格式的动图（GIF、WebP、MP4）
- 大幅压缩文件大小

## 🚀 快速开始

### 1. 安装依赖
```bash
cd apng-processor
pip install -r requirements.txt
```

### 2. 处理 u1.png
```bash
python process_u1.py
```

### 3. 通用处理
```bash
python apng_processor.py input.png -o output_dir --resize 1280x720
```

## 📁 文件结构

```
apng-processor/
├── requirements.txt      # Python 依赖
├── apng_processor.py     # 主处理器
├── process_u1.py         # u1.png 专用脚本
├── README.md            # 说明文档
└── u1_compressed/       # 输出目录（运行后生成）
    ├── frames/          # 原始帧（PNG）
    ├── jpg_frames/      # JPG 帧
    ├── compressed.gif   # GIF 动图
    ├── compressed.webp  # WebP 动图
    ├── compressed.mp4   # MP4 视频
    └── compression_report.txt  # 压缩报告
```

## 🛠️ 功能特性

### 1. 帧提取
- 自动检测 APNG 帧数
- 保存每一帧为 PNG 格式
- 保留帧持续时间信息

### 2. 格式转换
- PNG → JPG 转换
- 透明背景处理（白色背景）
- 可调节 JPG 质量

### 3. 尺寸调整
- 支持任意尺寸调整
- 保持宽高比
- 高质量重采样

### 4. 动图生成
- **GIF**: 兼容性最好，文件较大
- **WebP**: 现代格式，文件最小
- **MP4**: 视频格式，质量最高

## 📊 压缩效果

以 u1_original.png (52.89 MB) 为例：

| 格式 | 分辨率 | 预期大小 | 压缩率 | 兼容性 |
|------|--------|----------|--------|--------|
| GIF  | 1280x720 | 3-8 MB | 85-95% | 最好 |
| WebP | 1280x720 | 2-5 MB | 90-96% | 现代浏览器 |
| MP4  | 1280x720 | 1-3 MB | 94-98% | 需要 video 标签 |

## 🔧 高级用法

### 自定义参数
```bash
python apng_processor.py input.png \
  --output my_output \
  --quality 90 \
  --resize 1920x1080 \
  --gif-fps 15 \
  --webp-fps 20 \
  --mp4-fps 30
```

### 参数说明
- `--quality`: JPG 质量 (1-100)
- `--resize`: 调整大小 (WIDTHxHEIGHT)
- `--gif-fps`: GIF 帧率
- `--webp-fps`: WebP 帧率
- `--mp4-fps`: MP4 帧率

## 📋 处理流程

1. **分析文件**: 检测 APNG 信息
2. **提取帧**: 分解为单独的 PNG 文件
3. **转换格式**: PNG → JPG，处理透明度
4. **调整大小**: 降低分辨率（可选）
5. **生成动图**: 创建 GIF、WebP、MP4
6. **生成报告**: 详细的压缩统计

## 🎯 推荐设置

### 网页使用（推荐）
```bash
python process_u1.py
# 输出: WebP 格式，1280x720，约 2-5 MB
```

### 高质量保存
```bash
python apng_processor.py u1_original.png \
  --quality 95 \
  --resize 1920x1080 \
  --webp-fps 24
```

### 极度压缩
```bash
python apng_processor.py u1_original.png \
  --quality 70 \
  --resize 854x480 \
  --gif-fps 10
```

## 🔍 故障排除

### 依赖安装问题
```bash
# 如果 pip install 失败，尝试：
pip install --upgrade pip
pip install -r requirements.txt --user
```

### 内存不足
```bash
# 对于大文件，先调整大小：
python apng_processor.py input.png --resize 1280x720
```

### OpenCV 安装问题
```bash
# 如果 opencv-python 安装失败：
pip install opencv-python-headless
```

## 💡 使用建议

1. **首次使用**: 运行 `python process_u1.py` 获得最佳默认设置
2. **网页部署**: 使用 WebP 格式，兼顾质量和大小
3. **移动端**: 使用较小分辨率 (854x480 或 1280x720)
4. **桌面端**: 可以使用较高分辨率 (1920x1080)

## 📞 技术支持

如果遇到问题：
1. 检查 Python 版本 (推荐 3.8+)
2. 确保所有依赖正确安装
3. 检查输入文件是否为有效的 APNG
4. 查看生成的错误日志

---

开始压缩您的 APNG 动图吧！ 🎉
