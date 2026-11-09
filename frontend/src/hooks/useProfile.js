import { useMutation, useQueryClient } from '@tanstack/react-query'
import { profileApi } from '@/api/endpoints'

/**
 * Profile changes through /api/profile. Every answer is { user } (the shape GET /api/auth/me
 * returns), and it replaces the shared user query ['session', 'me'], the one source of truth
 * for the signed-in user: the navbar avatar and name and this page all update together, with
 * no second copy of the user or the picture anywhere.
 *   update   PUT    /api/profile          { name?, phone?, address? }
 *   upload   PUT    /api/profile/avatar   the image itself
 *   remove   DELETE /api/profile/avatar
 */
export function useProfileActions() {
  const queryClient = useQueryClient()
  const store = ({ user }) => {
    queryClient.setQueryData(['session', 'me'], { authenticated: true, user })
    // checkout fills its form from the account when nothing was saved there yet
    queryClient.invalidateQueries({ queryKey: ['session', 'checkout'] })
  }
  const onError = (failure) => {
    if (failure.status === 401) queryClient.invalidateQueries({ queryKey: ['session'] })
  }
  return {
    update: useMutation({ mutationFn: profileApi.update, onSuccess: store, onError }),
    upload: useMutation({ mutationFn: profileApi.uploadAvatar, onSuccess: store, onError }),
    remove: useMutation({ mutationFn: profileApi.removeAvatar, onSuccess: store, onError }),
  }
}
