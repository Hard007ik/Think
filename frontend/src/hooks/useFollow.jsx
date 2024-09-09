import { toast } from 'react-hot-toast'
import { useMutation, useQueryClient } from '@tanstack/react-query'

function useFollow() {

    const queryClient = useQueryClient()

    const { mutate: follow, isPending } = useMutation({
        mutationFn: async (userId) => {
            try {
                const res = await fetch('/api/users/follow/'+userId, {
                    method: 'POST',
                })

                const data = await res.json()
                if (!res.ok) {
                    throw new Error(data.error || "Failed to follow");
                }

                return data
            } catch (err) {
                throw new Error(err);
            }
        },
        onSuccess: () => {
            toast.success("followed successfully")
            // invalidate to fetch data
            Promise.all([
				queryClient.invalidateQueries({ queryKey: ["suggestedUsers"] }),
				queryClient.invalidateQueries({ queryKey: ["authUser"] })
			]);
        },
        onError: (err) => {
            toast.error(err)
        }
    })

    return { follow, isPending }
}

export default useFollow