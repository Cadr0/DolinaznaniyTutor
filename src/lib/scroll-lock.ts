const APP_SCROLL_SELECTOR = "[data-app-scroll-container]";

export function lockPageScroll() {
  const scrollContainer = document.querySelector(APP_SCROLL_SELECTOR);
  const previous = {
    bodyOverflow: document.body.style.overflow,
    htmlOverflow: document.documentElement.style.overflow,
    containerOverflow:
      scrollContainer instanceof HTMLElement ? scrollContainer.style.overflow : null,
  };

  document.body.style.overflow = "hidden";
  document.documentElement.style.overflow = "hidden";

  if (scrollContainer instanceof HTMLElement) {
    scrollContainer.style.overflow = "hidden";
  }

  return () => {
    document.body.style.overflow = previous.bodyOverflow;
    document.documentElement.style.overflow = previous.htmlOverflow;

    if (scrollContainer instanceof HTMLElement && previous.containerOverflow !== null) {
      scrollContainer.style.overflow = previous.containerOverflow;
    }
  };
}
