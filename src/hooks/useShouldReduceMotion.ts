import { useReducedMotion } from 'framer-motion';

export function useShouldReduceMotion() {
  const prefersReducedMotion = useReducedMotion();
  return prefersReducedMotion;
}
