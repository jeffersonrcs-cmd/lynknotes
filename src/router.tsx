// Browser guard: TanStack client hydration reads process.env.TSS_ROUTER_BASEPATH.
if (typeof window !== "undefined" && typeof (globalThis as any).process === "undefined") {
  (globalThis as any).process = { env: {} };
}
import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
