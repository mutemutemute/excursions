import { useForm } from "react-hook-form";
import axios from "axios";
import UserContext from "../contexts/UserContext";
import { useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router";

const API_URL = import.meta.env.VITE_API_URL;

function LoginForm() {
  const { user, setUser, error, setError } = useContext(UserContext);

  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (formdata) => {
    try {
      const { data: response } = await axios.post(
        `${API_URL}/users/login`,
        formdata,
        { withCredentials: true }
      );
      setUser(response.data);
      
      navigate("/");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          setError(
            error.response?.data?.message ||
              "An error occurres, please try again"
          );
        } else if (error.request) {
          setError("No response from server. Check interner connection");
        } else {
          setError("Something went wrong. Please try again");
        }
      } else {
        setError("An unexpected error occurred");
      }
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 w-[19rem] md:w-[25rem] lg:w-[30rem] bg-[#42416f] px-8 p-16 rounded-lg"
      >
        <div className="text-blue-300 font-bold text-bold text-2xl">Login</div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-white">Email</label>
          <input
            type="email"
            {...register("email", {
              required: "Can't be empty",
              pattern: {
                value:
                  /^[\w-]+(\.[\w-]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/,
                message: "Invalid email address",
              },
            })}
            className="mt-1 lg:w-100 input input-bordered"
            onInput={() => setError("")}
          />
          <div className="relative">
            <p className="text-red-500 text-sm absolute top-[-0.4rem]">
              {errors?.email?.message}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-white">
            Password
          </label>
          <input
            type="password"
            {...register("password", {
              required: "Can't be empty",
            })}
            className="mt-1 lg:w-100 input input-bordered"
            onInput={() => setError("")}
          />
          <div className="relative">
            <p className="text-red-500 text-sm absolute top-[-0.4rem]">
              {errors?.password?.message}
            </p>
          </div>
        </div>
        <div className="relative">
          <div className="text-red-500 absolute top-[-1.5rem]">{error}</div>
        </div>

        <button
          type="submit"
          className="btn bg-blue-300 border-blue-300 hover:bg-blue-400 hover:border-blue-400 transition duration-500 mt-2"
        >
          Login
        </button>
        <p className="text-white text-center">
          Don't have an account?{" "}
          <Link to="/signup" className="text-blue-300">
            Signup
          </Link>
        </p>
      </form>
    </div>
  );
}

export default LoginForm;