import React from "react";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  fullScreen?: boolean;
  height?: string;
  maxHeight?: string;
}

export default function BottomSheet({
  isOpen,
  onClose,
  children,
  fullScreen = false,
  height,
  maxHeight,
}: BottomSheetProps) {
  if (!isOpen) return null;

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col animate-fade-in">
        {children}
      </div>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className="fixed inset-x-0 bottom-0 popup-container border-t rounded-t-2xl z-50 animate-slide-up flex flex-col"
        style={{ height, maxHeight }}
      >
        {children}
      </div>
    </>
  );
}
