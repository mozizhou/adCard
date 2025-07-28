"use client";
import Image from "next/image";

// 简化的拳击页面组件 - 只显示图片
function BoxingPageComponent() {
  return (
    <div className="w-screen h-screen">
      <Image
        src="/static-image.png"
        alt="拳击图片"
        fill
        style={{ objectFit: "fill" }}
        priority
      />
    </div>
  );
}

// 拳击页面
export default function Boxing() {
  return <BoxingPageComponent />;
}
