import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { MiddleSection } from "@/components/layout/MiddleSection";
import { MainContent } from "@/components/layout/MainContent";

const Index = () => {
  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap"
      />
      <div className="flex w-full h-screen bg-white max-md:flex-col">
        <Sidebar />
        <MiddleSection />
        <MainContent />
      </div>
    </>
  );
};

export default Index;
