// Attach the central JSLynk session to authenticated server functions.
import { createMiddleware } from '@tanstack/react-start';
import { jslynkAuth } from '@/integrations/jslynk/client';

export const attachSupabaseAuth = createMiddleware({ type: 'function' }).client(
  async ({ next }) => {
    const { data } = await jslynkAuth.auth.getSession();
    const token = data.session?.access_token;
    return next({
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },
);
