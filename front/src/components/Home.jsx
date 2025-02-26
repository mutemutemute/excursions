import Navbar from "./Navbar";
import Excursions from "./Excursions";
import Pagination from "./Pagination";
import AddExcursion from "./AddExcursion";
import UserContext from "../contexts/UserContext";
import { useContext } from "react";
import ExcursionContext from "../contexts/ExcursionContext";
import { FaPlus } from "react-icons/fa";
import SearchBar from "./SearchBar";

const Home = () => {
  const { user } = useContext(UserContext);
  const { showForm, setShowForm } = useContext(ExcursionContext);
  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center justify-center mt-6">
        {user?.role === "admin" && (
          <>
            <button
              onClick={() => setShowForm((prev) => !prev)}
              className="bg-[#42416f] text-white flex justify-center items-center px-6 py-1.5 rounded-md shadow-md w-80 md:w-1/2"
            >
              <FaPlus /> Add Excursion
            </button>
            {showForm && (
              <div className="mt-6 p-6 bg-white rounded-lg shadow-lg w-80 md:w-1/2">
                <AddExcursion />
              </div>
            )}
          </>
        )}
<div><SearchBar /></div>
        <div className="pt-5">
          <Excursions />
        </div>
        <div className="pt-10">
          <Pagination />
        </div>
      </div>
    </>
  );
};

export default Home;
