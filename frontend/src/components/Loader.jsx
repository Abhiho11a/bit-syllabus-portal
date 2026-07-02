import React from "react";
import { Loader2 } from "lucide-react";

export default function Loader({ message = "Loading...", fullScreen = false }) {
  const content = (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="relative flex items-center justify-center w-16 h-16 mb-4">
        <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
        <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
        <Loader2 className="absolute text-blue-600 animate-pulse" size={24} />
      </div>
      <p className="text-sm font-extrabold text-slate-600 tracking-wider uppercase animate-pulse">
        {message}
      </p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return (
    <div className="w-full flex items-center justify-center min-h-[300px]">
      {content}
    </div>
  );
}
