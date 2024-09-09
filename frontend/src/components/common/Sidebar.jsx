import XSvg from "../svgs/X";

import { MdHomeFilled } from "react-icons/md";
import { IoNotifications } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import { Link } from "react-router-dom";
import { BiLogOut } from "react-icons/bi";

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'


const Sidebar = () => {

	const queryClient = useQueryClient()

	const { mutate: logoutMutation } = useMutation({
		mutationFn: async () => {
			try {
				const res = await fetch('/api/auth/logout', {
					method: "POST"
				})
				const data = await res.json()
				if (!res.ok) {
					throw new Error(data.error || "Failed to logout");
				}
			} catch (err) {
				throw new Error(err);
			}
		},
		onSuccess: () => {
			toast.success('Log out successfully')
			queryClient.invalidateQueries({queryKey: ['authUser']})
		},
		onError: ()=>{
			toast.error('Logout failed')
		}
	})

	// dummy data
	// const data = {
	// 	fullName: "John Doe",
	// 	username: "johndoe",
	// 	profileImg: "/avatars/boy1.png",
	// };

	// actual data
	const {data} = useQuery({queryKey: ['authUser']})

	return (
		<div className='md:flex-[2_2_0] w-18 max-w-52'>
			<div className='sticky top-0 left-0 h-screen flex flex-col border-r border-gray-700 w-20 md:w-full'>
				<Link to='/' className='flex justify-center md:justify-start'>
					{/* <XSvg className='px-2 w-12 h-12 rounded-full fill-white hover:bg-stone-900' /> */}
					<img src="Think.png" className="px-2 w-14 h-12 rounded-full" alt="" />
				</Link>
				<ul className='flex flex-col gap-3 mt-4'>
					<li className='flex justify-center md:justify-start'>
						<Link
							to='/'
							className='flex gap-3 items-center hover:bg-blue-300 hover:text-white transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer'
						>
							<MdHomeFilled className='w-8 h-8' />
							<span className='text-lg hidden md:block'>Home</span>
						</Link>
					</li>
					<li className='flex justify-center md:justify-start'>
						<Link
							to='/notifications'
							className='flex gap-3 items-center hover:bg-blue-300 hover:text-white transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer'
						>
							<IoNotifications className='w-6 h-6' />
							<span className='text-lg hidden md:block'>Notifications</span>
						</Link>
					</li>

					<li className='flex justify-center md:justify-start'>
						<Link
							to={`/profile/${data?.username}`}
							className='flex gap-3 items-center hover:bg-blue-300 hover:text-white transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer'
						>
							<FaUser className='w-6 h-6' />
							<span className='text-lg hidden md:block'>Profile</span>
						</Link>
					</li>
				</ul>
				{data && (
					<Link
						to={`/profile/${data.username}`}
						className='mt-auto mb-10 flex gap-2 items-start transition-all duration-300 text-black hover:bg-blue-300 py-2 px-4 rounded-full'
					>
						<div className='avatar hidden md:inline-flex'>
							<div className='w-8 rounded-full'>
								<img src={data?.profileImg || "/avatar-placeholder.png"} />
							</div>
						</div>
						<div className='flex justify-between flex-1'>
							<div className='hidden md:block'>
								<p className=' font-bold text-sm w-20 truncate'>{data?.fullname}</p>
								<p className='text-slate-500 text-sm'>@{data?.username}</p>
							</div>
							<BiLogOut className='w-5 h-5 hover:text-red-700 cursor-pointer' onClick={(e)=>{
								e.preventDefault()
								logoutMutation()
							}} />
						</div>
					</Link>
				)}
			</div>
		</div>
	);
};
export default Sidebar;