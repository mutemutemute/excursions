import { useContext } from "react";
import ExcursionContext from "../contexts/ExcursionContext";

const SearchBar = () => {
  const { searchTerm, setSearchTerm, setCurrentPage } =
    useContext(ExcursionContext);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(0);
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Search by name or date"
        value={searchTerm}
        onChange={handleSearch}
        className="border p-2 rounded w-full"
      />
    </div>
  );
};

export default SearchBar;
