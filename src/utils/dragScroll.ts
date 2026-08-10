import { useEffect, useRef } from 'react';

/**
 * Hook to attach mouse drag scrolling to a specific ref container
 */
export function useDragScroll<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let isDown = false;
    let startX = 0;
    let startY = 0;
    let scrollLeft = 0;
    let scrollTop = 0;
    let hasMoved = false;

    const onMouseDown = (e: MouseEvent) => {
      // Ignore right click or non-left click
      if (e.button !== 0) return;

      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      isDown = true;
      hasMoved = false;
      startX = e.clientX;
      startY = e.clientY;
      scrollLeft = el.scrollLeft;
      scrollTop = el.scrollTop;
      el.style.cursor = 'grabbing';
      el.style.userSelect = 'none';
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        hasMoved = true;
      }

      if (hasMoved) {
        e.preventDefault();
        el.scrollLeft = scrollLeft - dx;
        el.scrollTop = scrollTop - dy;
      }
    };

    const onMouseUp = (e: MouseEvent) => {
      if (!isDown) return;
      isDown = false;
      el.style.cursor = '';
      el.style.removeProperty('user-select');

      if (hasMoved) {
        const preventClick = (clickEvent: MouseEvent) => {
          clickEvent.stopPropagation();
          clickEvent.preventDefault();
        };
        el.addEventListener('click', preventClick, { capture: true, once: true });
      }
    };

    const onMouseLeave = () => {
      if (isDown) {
        isDown = false;
        el.style.cursor = '';
        el.style.removeProperty('user-select');
      }
    };

    el.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    el.addEventListener('mouseleave', onMouseLeave);

    return () => {
      el.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      el.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  return ref;
}

/**
 * Global Drag-to-Scroll Initializer
 * Enables mouse drag scrolling on any overflow scrollable container across the app.
 */
export function initGlobalDragScroll() {
  if (typeof window === 'undefined') return;

  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let initialScrollLeft = 0;
  let initialScrollTop = 0;
  let currentContainer: HTMLElement | null = null;
  let draggedFar = false;

  const findScrollContainer = (target: HTMLElement | null): HTMLElement | null => {
    let curr = target;
    while (curr && curr !== document.body && curr !== document.documentElement) {
      if (
        curr.hasAttribute('data-drag-scroll') ||
        curr.classList.contains('overflow-x-auto') ||
        curr.classList.contains('overflow-y-auto') ||
        curr.classList.contains('overflow-auto') ||
        curr.classList.contains('scrollable-drag')
      ) {
        const style = window.getComputedStyle(curr);
        const overflowX = style.overflowX;
        const overflowY = style.overflowY;
        const canScrollX = curr.scrollWidth > curr.clientWidth && (overflowX === 'auto' || overflowX === 'scroll');
        const canScrollY = curr.scrollHeight > curr.clientHeight && (overflowY === 'auto' || overflowY === 'scroll');

        if (canScrollX || canScrollY || curr.hasAttribute('data-drag-scroll')) {
          return curr;
        }
      }
      curr = curr.parentElement;
    }
    return null;
  };

  const handleMouseDown = (e: MouseEvent) => {
    if (e.button !== 0) return; // Primary mouse button only

    const target = e.target as HTMLElement | null;
    if (!target) return;

    // Skip interactive text inputs
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.tagName === 'SELECT' ||
      target.isContentEditable ||
      target.closest('[data-no-drag]')
    ) {
      return;
    }

    const container = findScrollContainer(target);
    if (!container) return;

    isDragging = true;
    draggedFar = false;
    currentContainer = container;
    startX = e.clientX;
    startY = e.clientY;
    initialScrollLeft = container.scrollLeft;
    initialScrollTop = container.scrollTop;
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !currentContainer) return;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      draggedFar = true;
    }

    if (draggedFar) {
      e.preventDefault();
      currentContainer.scrollLeft = initialScrollLeft - dx;
      currentContainer.scrollTop = initialScrollTop - dy;
      document.body.style.cursor = 'grabbing';
    }
  };

  const handleMouseUp = (e: MouseEvent) => {
    if (isDragging) {
      if (draggedFar && currentContainer) {
        // Prevent click if user dragged
        const preventClickOnce = (clickEvent: MouseEvent) => {
          clickEvent.stopPropagation();
          clickEvent.preventDefault();
        };
        window.addEventListener('click', preventClickOnce, { capture: true, once: true });
      }
      isDragging = false;
      currentContainer = null;
      document.body.style.cursor = '';
    }
  };

  window.addEventListener('mousedown', handleMouseDown, { capture: true });
  window.addEventListener('mousemove', handleMouseMove, { capture: true });
  window.addEventListener('mouseup', handleMouseUp, { capture: true });
}
