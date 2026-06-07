/**
 * Lightweight framer-motion mock for the test environment.
 *
 * It renders `motion.*` elements as their plain DOM equivalents (stripping
 * animation-only props that React would otherwise warn about) and turns
 * `AnimatePresence` into a transparent fragment. This keeps integration tests
 * fast and deterministic — we assert on real DOM/behaviour, not animations.
 */
import {
  createElement,
  forwardRef,
  Fragment,
  type ComponentType,
  type ReactNode,
} from 'react';

// Animation-only props that must not reach the underlying DOM node.
const MOTION_PROPS = new Set([
  'initial',
  'animate',
  'exit',
  'variants',
  'transition',
  'whileHover',
  'whileTap',
  'whileFocus',
  'whileInView',
  'whileDrag',
  'drag',
  'dragConstraints',
  'dragElastic',
  'dragMomentum',
  'layout',
  'layoutId',
  'layoutDependency',
  'layoutScroll',
  'viewport',
  'custom',
  'onAnimationStart',
  'onAnimationComplete',
  'onHoverStart',
  'onHoverEnd',
  'onTap',
  'onTapStart',
  'onTapCancel',
  'onDragStart',
  'onDragEnd',
]);

type AnyProps = Record<string, unknown>;

function stripMotionProps(props: AnyProps): Record<string, unknown> {
  const clean: Record<string, unknown> = {};
  for (const key of Object.keys(props)) {
    if (key !== 'children' && !MOTION_PROPS.has(key)) clean[key] = props[key];
  }
  return clean;
}

const cache = new Map<string, ComponentType<AnyProps>>();

function createMotionComponent(tag: string): ComponentType<AnyProps> {
  const cached = cache.get(tag);
  if (cached) return cached;
  const Component = forwardRef<unknown, AnyProps>((props, ref) =>
    createElement(
      tag,
      { ...stripMotionProps(props), ref },
      props.children as ReactNode,
    ),
  ) as unknown as ComponentType<AnyProps>;
  Component.displayName = `motion.${tag}`;
  cache.set(tag, Component);
  return Component;
}

export const motion = new Proxy({} as Record<string, ComponentType<AnyProps>>, {
  get: (_target, tag: string) => createMotionComponent(tag),
});

export function AnimatePresence({ children }: { children?: ReactNode }) {
  return createElement(Fragment, null, children);
}

// No-op hooks/utilities occasionally imported elsewhere in the app.
export const useReducedMotion = () => false;
export const useInView = () => false;
export const useAnimation = () => ({ start: () => Promise.resolve(), stop: () => undefined });
