import { App } from "antd";
import MainContent from "@/components/MainContent";
import NavigationToggle from "@/components/NavigationToggle";
import Link from "next/link";

export default function Home() {
  return (
    <App>
      <div className="relative">
        <NavigationToggle MainContentComponent={MainContent} />
      </div>
    </App>
  );
}
