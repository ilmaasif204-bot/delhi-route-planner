declare module "density-clustering" {
  class DBSCAN {
    constructor(epsilon?: number, minPoints?: number, distanceFunction?: string);
    run(points: number[][], epsilon?: number, minPoints?: number): number[][];
  }
  export { DBSCAN };
}
