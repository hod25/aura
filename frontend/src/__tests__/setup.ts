import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach } from 'vitest';

// Ensure a clean DOM and storage between every test for full isolation.
afterEach(() => {
  cleanup();
});

beforeEach(() => {
  localStorage.clear();
});

// jsdom does not implement matchMedia / scrollTo — stub them for components
// (e.g. Navbar, ScrollToTop) that touch the browser APIs on mount.
if (!window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    addListener: () => undefined,
    removeListener: () => undefined,
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

window.scrollTo = (() => undefined) as typeof window.scrollTo;
