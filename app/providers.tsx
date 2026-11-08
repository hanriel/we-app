'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@/lib/api-client"; // конфиг baseUrl для сгенерированного клиента

export function Providers({ children }: { children: ReactNode }) {

  // ленивая инициализация, чтобы QueryClient не пересоздавался на рендерах
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, retry: 1 },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>{children}</SessionProvider>
    </QueryClientProvider>
  );
}