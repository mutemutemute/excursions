import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

const fetchExcursions = async (searchTerm = "", date = "", page = 1, limit = 5) => {
  try {
    const params = { page, limit };

    
    if (searchTerm) params.name = searchTerm;
    if (date) params.date = date; 

    const { data: response } = await axios.get(`${API_URL}/excursions`, {
      params,
      withCredentials: true,
    });

    return response;
  } catch (error) {
    return { error: error.message };
  }
};

export default fetchExcursions;
