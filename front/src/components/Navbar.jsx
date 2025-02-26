import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router";
import axios from "axios";
import UserContext from "../contexts/UserContext";
import { HiOutlineLogout } from "react-icons/hi";

const API_URL = import.meta.env.VITE_API_URL;

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const { user, setUser, setError } = useContext(UserContext);

  const logout = async () => {
    try {
      await axios.get(`${API_URL}/users/logout`, { withCredentials: true });
      setUser(null);
      navigate("/");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          setError(
            error.response.data.message ||
              "An error occurred, please try again."
          );
        } else if (error.request) {
          setError("No response from server. Check internet connection.");
        } else {
          setError("Something went wrong. Please try again.");
        }
      } else {
        setError("An unexpected error occurred.");
      }
    }
  };

  return (
    <div className="flex justify-between items-center p-3 bg-[#42416f] text-white">
      <h1 className="text-xl lg:text-3xl text-center">Vivid Excursions</h1>
      <div>{user && <Link to="/register">Registration</Link>}</div>
      <div className="flex items-center ">
        {!user ? (
          <>
            <Link to="/login">
              <button className="mx-2 btn bg-blue-300 border-blue-300 hover:bg-blue-400 hover:border-blue-400 transition duration-500">
                Login
              </button>
            </Link>
            <Link to="/signup">
              <button className="mx-2 btn bg-blue-300 border-blue-300 hover:bg-blue-400 hover:border-blue-400 transition duration-500">
                Signup
              </button>
            </Link>
          </>
        ) : (
          <div className="relative" onBlur={() => setIsDropdownOpen(false)}>
            <div
              className="flex items-center justify-center w-10 h-10 cursor-pointer"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <HiOutlineLogout className="text-3xl" />
            </div>

            {isDropdownOpen && (
              <div className="absolute right-0 top-12 w-32 bg-white shadow-lg rounded-lg overflow-hidden">
                <button
                  className="flex items-center px-4 py-2 w-full text-left text-gray-700 hover:bg-gray-200"
                  onClick={logout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
