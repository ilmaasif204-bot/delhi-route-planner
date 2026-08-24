import type { RouteOption, WeightParams } from "@/types/route";
import { DEFAULT_WEIGHTS } from "@/config/transport";

/**
 * Weighted Sum Model (WSM) — Multi-criteria decision-making
 *
 * Step 1: Min-max normalize each metric to 0–1
 * Step 2: Compute weighted sum per route
 * Lower balancedScore = better route
 */
export function computeBalancedScores(
  routes: RouteOption[],
  weights: WeightParams = DEFAULT_WEIGHTS
): RouteOption[] {
  if (routes.length === 0) return [];
  if (routes.length === 1) {
    return [{ ...routes[0], balancedScore: 0, rank: 1 }];
  }

  // Extract raw values
  const fares = routes.map((r) => r.fare);
  const times = routes.map((r) => r.time);
  const co2s = routes.map((r) => r.co2);
  const walks = routes.map((r) => r.walkingDistance ?? 0);

  // Min-max normalize helper
  const normalize = (vals: number[]): number[] => {
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    if (max === min) return vals.map(() => 0);
    return vals.map((v) => (v - min) / (max - min));
  };

  // All are cost metrics — lower is better
  const normFare = normalize(fares);
  const normTime = normalize(times);
  const normCO2 = normalize(co2s);
  const normWalk = normalize(walks);

  // Total weight sum (should be 1)
  const wTotal = weights.fare + weights.time + weights.co2 + weights.walking;

  // Compute balanced scores
  const scored = routes.map((route, i) => {
    const balancedScore =
      (weights.fare * normFare[i] +
        weights.time * normTime[i] +
        weights.co2 * normCO2[i] +
        weights.walking * normWalk[i]) / wTotal;

    return { ...route, balancedScore: Math.round(balancedScore * 1000) / 1000 };
  });

  // Sort by balancedScore ascending (lower = better)
  scored.sort((a, b) => (a.balancedScore ?? 0) - (b.balancedScore ?? 0));

  // Assign ranks and badges
  return scored.map((route, i) => {
    const rank = i + 1;
    const badges: string[] = [];

    // Check if this route is the best in each category
    if (route.fare === Math.min(...fares)) badges.push("Cheapest");
    if (route.time === Math.min(...times)) badges.push("Fastest");
    if (route.co2 === Math.min(...co2s)) badges.push("Greenest");
    if (rank === 1) badges.push("Best Overall");

    return { ...route, rank, badges };
  });
}
