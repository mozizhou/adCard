"use client";

// 酒店房卡页面组件
function HotelCardComponent() {
  return (
    <div className="w-screen h-screen">
      <iframe
        src="/index/index.html"
        className="w-full h-full border-0"
        title="酒店房卡页面"
      />
    </div>
  );
}

// 酒店房卡页面
export default function HotelCard() {
  return <HotelCardComponent />;
}
