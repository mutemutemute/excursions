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
          page: currentPage +1,  
          limit: itemsPerPage 
        };

        if (search) params.name = search;
        if (date) params.date = date;

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
        update
      }}
    >
      {children}
    </ExcursionContext.Provider>
  );
};

export default ExcursionContextProvider;

