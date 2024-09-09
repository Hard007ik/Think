import { useState } from "react";
import { Link } from "react-router-dom";

import XSvg from "../../../components/svgs/X";

import { FaUser } from "react-icons/fa";
import { MdPassword } from "react-icons/md";

import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from "react-hot-toast";

const LoginPage = () => {
	const [formData, setFormData] = useState({
		username: "",
		password: "",
	});

	const queryClient = useQueryClient()

	const { mutate:loginMutation, isPending, isError, error } = useMutation({
		mutationFn: async ({ username, password }) => {
			try {
				const res = await fetch("/api/auth/login", {
					method: "POST",
					headers: { "Content-Type": 'application/json' },
					body: JSON.stringify({ username, password })
				})
				const data = await res.json()
				if (!res.ok) {
					throw new Error(data.error || "Failed to Login")
				}
			} catch (err) {
				throw new Error(err);

			}
		},
		onSuccess: ()=>{
			toast.success("Login success!")
			// refetch the authUser
			queryClient.invalidateQueries({queryKey:['authUser']})
		}
	})

	const handleSubmit = (e) => {
		e.preventDefault();
		// console.log(formData);
		loginMutation(formData)
	};

	const handleInputChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};


	return (
		<div className='max-w-screen-xl mx-auto flex h-screen'>
			<div className='flex-1 hidden lg:flex items-center  justify-center'>
				{/* <XSvg className='lg:w-2/3 fill-white' /> */}
				<img src="Think.png" className='lg:w-2/3' alt="" />
			</div>
			<div className='flex-1 flex flex-col justify-center items-center'>
				<form className='flex gap-4 flex-col' onSubmit={handleSubmit}>
					{/* <XSvg className='w-24 lg:hidden fill-white' /> */}
					<img src="Think.png" className="w-24 lg:hidden" alt="" />
					<h1 className='text-4xl font-extrabold text-sky-500'>Let's go.</h1>
					<label className='input input-bordered rounded flex items-center gap-2'>
						<FaUser />
						<input
							type='text'
							className='grow'
							placeholder='username'
							name='username'
							onChange={handleInputChange}
							value={formData.username}
						/>
					</label>

					<label className='input input-bordered rounded flex items-center gap-2'>
						<MdPassword />
						<input
							type='password'
							className='grow'
							placeholder='Password'
							name='password'
							onChange={handleInputChange}
							value={formData.password}
						/>
					</label>
					<button className='btn rounded-full btn-primary text-black hover:text-white'>
						{isPending? "Loading...": 'Login'}
					</button>
					{isError && <p className='w-72 text-red-600'>
						{error.message}
					</p>}
				</form>
				<div className='flex flex-col gap-2 mt-4'>
					<p className='text-lime-600 text-lg'>{"Don't"} have an account?</p>
					<Link to='/signup'>
						<button className='btn rounded-full btn-primary btn-outline w-full'>Sign up</button>
					</Link>
				</div>
			</div>
		</div>
	);
};
export default LoginPage;