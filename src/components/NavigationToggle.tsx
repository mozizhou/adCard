"use client";

import { useState } from "react";
import Image from "next/image";
import Navigation from "./Navigation";

interface NavigationToggleProps {
  MainContentComponent: React.ComponentType;
}

export default function NavigationToggle({
  MainContentComponent,
}: NavigationToggleProps) {
  const [showNavigation, setShowNavigation] = useState(false);

  const handleMenuClick = () => {
    setShowNavigation(!showNavigation);
  };

  const handleNavigationClose = () => {
    setShowNavigation(false);
  };

  return (
    <div className="h-screen lg:pt-0 pt-10  relative flex">
      <div className="lg:hidden fixed top-0 left-0 h-10 w-full flex justify-start items-center bg-white border-b border-gray-200">
        <Image
          alt="mobile menu"
          className="ml-3 cursor-pointer"
          width={18}
          height={18}
          src="/mobile_menu.png"
          onClick={handleMenuClick}
        />
      </div>
      <div
        className={`h-full  layout ${
          showNavigation ? "translate-x-0" : "-translate-x-full"
        } lg:block fixed top-0 left-0 bottom-0 z-50 bg-white w-2/3 transition-transform duration-300 ease-in-out`}
      >
        <Navigation onClose={handleNavigationClose} />
      </div>
      <div className="h-full layout hidden lg:block">
        <Navigation onClose={handleNavigationClose}></Navigation>
      </div>
      <MainContentComponent />
    </div>
  );
}
