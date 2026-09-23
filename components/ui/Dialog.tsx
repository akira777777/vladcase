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

    const focusable = dialog.querySelector<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (focusable) {
      focusable.focus();
    } else {
      dialog.focus();
    }

    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
      if (previous?.isConnected) previous.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      tabIndex={-1}
      aria-label={label}
      onKeyDown={(e) => {
        if (e.key === 'Tab') {
          const dialog = ref.current;
          if (!dialog) return;
          const focusable = Array.from(
            dialog.querySelectorAll<HTMLElement>(
              'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
            )
          );
          if (focusable.length === 0) {
            e.preventDefault();
            dialog.focus();
            return;
          }
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (e.shiftKey) {
            if (document.activeElement === first || !dialog.contains(document.activeElement)) {
              e.preventDefault();
              last.focus();
            }
          } else {
            if (document.activeElement === last || !dialog.contains(document.activeElement)) {
              e.preventDefault();
              first.focus();
            }
          }
        }
      }}
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
