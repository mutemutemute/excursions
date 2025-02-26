import { useContext, useState, useEffect } from "react";
import ExcursionContext from "./ExcursionContext";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const ExcursionContextProvider = ({ children }) => {
  const [excursions, setExcursions] = useState({ list: [], total: 0 });
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchExcursions = async (search = "", date = "") => {
      try {
        const params = {
          page: currentPage + 1,
          limit: itemsPerPage,
        };

        const trimmedSearch = searchTerm.trim();

        //full date (`YYYY-MM-DD`)
        const isFullDate = /^\d{4}-\d{2}-\d{2}$/.test(trimmedSearch);

        // partial date (`YYYY-MM` or `YYYY-`)
        const isYearMonthDayIncomplete = /^\d{4}-\d{2}-\d{0,2}$/.test(
          trimmedSearch
        ); // `YYYY-MM-`
        const isYearOnlyOrYearMonth = /^\d{4}-\d{0,2}$/.test(trimmedSearch); // `YYYY-` or `YYYY-MM`

        // Check if input is ONLY numbers (Year, Month, or Day)
        const isOnlyNumbers = /^\d+$/.test(trimmedSearch);

        if (isFullDate) {
          params.date = trimmedSearch; // Send as `date`
        } else if (isYearMonthDayIncomplete) {
          params.date = `${trimmedSearch}%`; // Convert `YYYY-MM-` to `YYYY-MM-%`
        } else if (isYearOnlyOrYearMonth) {
          params.date = `${trimmedSearch}%`; // Convert `YYYY-` to `YYYY-%`
        } else if (isOnlyNumbers) {
          params.date = `${trimmedSearch}%`; // Convert `YYYY` to `YYYY-%`
        } else {
          params.name = `%${trimmedSearch}%`; // Send as `name`
        }

        const { data: response } = await axios.get(`${API_URL}/excursions`, {
          params,
          withCredentials: true,
        });

        const excursionsArray = response?.data?.excursions || [];
        const totalCount = Number(response?.data?.total_count) || 0;

        if (Array.isArray(excursionsArray)) {
          setExcursions({
            list: excursionsArray,
            total: totalCount,
          });
        } else {
          setError("Error fetching excursions");
        }
      } catch (err) {
        setError(err.message || "Error fetching excursions");
      }
    };

    fetchExcursions(searchTerm);
  }, [searchTerm, currentPage, itemsPerPage]);

  const update = () => {
    window.location.reload();
  };

  return (
    <ExcursionContext.Provider
      value={{
        excursions,
        setExcursions,
        error,
        setError,
        searchTerm,
        setSearchTerm,
        currentPage,
        setCurrentPage,
        itemsPerPage,
        setItemsPerPage,
        showForm,
        setShowForm,
        update,
      }}
    >
      {children}
    </ExcursionContext.Provider>
  );
};

export default ExcursionContextProvider;
