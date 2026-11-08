import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router'
import SmoothScroll from '@/animations/SmoothScroll'
import { router } from './router'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SmoothScroll>
        <RouterProvider router={router} />
      </SmoothScroll>
    </QueryClientProvider>
  )
}
