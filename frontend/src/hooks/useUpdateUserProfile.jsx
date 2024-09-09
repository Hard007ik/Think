import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";


export default function useUpdateUserProfile() {

    const queryClient = useQueryClient()

    const { mutateAsync: updateProfile, isPending: isUpdatingProfile } = useMutation({
        mutationFn: async (formData) =>{
            try {
                const res = await fetch('/api/users/update', {
                    method: 'POST',
                    headers: {
                        'Content-Type' : 'application/json'
                    },
                    body: JSON.stringify(formData)
                })

                const data = await res.json()

                if (!res.ok) {
                    throw new Error( data.message || "Failed to update your Profile");
                }
                return data
            } catch (err) {
                throw new Error( err.message );
            }
        },
        onSuccess: () => {
            toast.success('Profile updated successfully')
            Promise.all([
                queryClient.invalidateQueries({queryKey: ['authUser']}),
                queryClient.invalidateQueries({queryKey: ['userProfile']}),
            ])
        },
        onError: (err)=>{
            toast.error(err)
        }
    })
  return {updateProfile, isUpdatingProfile}
}
