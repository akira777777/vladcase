'use client';
import { useEffect, useRef, type ReactNode } from 'react';

export default function Dialog({
  label,
  onClose,
  children,
  className,
}: {
  label: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const dialog = ref.current!;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
      if (previous?.isConnected) previous.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      aria-label={label}
      onCancel={(event) => {
        event.preventDefault();
        close.current();
      }}
      className={`m-0 h-full max-h-none w-full max-w-none overflow-y-auto bg-transparent p-0 text-white backdrop:bg-black/80 ${className ?? ''}`}
    >
      <div className="flex min-h-full items-center justify-center p-4">
        {children}
      </div>
    </dialog>
  );
}
