import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Fetch excursions list
 */
export const fetchExcursions = async () => {
  try {
    const { data: response } = await axios.get(`${API_URL}/excursions`, {
      withCredentials: true,
    });

    const { excursions, total_count } = response.data;
    return {
      list: excursions || [],
      total: parseInt(total_count, 10) || 0,
    };
  } catch (err) {
    console.error("API Fetch Error:", err);
    throw new Error("Failed to fetch excursions");
  }
};

/**
 * Fetch registrations - Admin gets all, User gets their own
 * @param {boolean} isAdmin
 * @param {number} userId
 */
export const fetchRegistrations = async (isAdmin, userId) => {
  try {
    const url = isAdmin
      ? `${API_URL}/register` 
      : `${API_URL}/register/${userId}`; 

    const { data: response } = await axios.get(url, {
      withCredentials: true,
    });

    return {
      list: response.data.registrations || [],
      total: response.data.total_count || 0,
    };
  } catch (err) {
    console.error("Fetch Registrations Error:", err);
    throw new Error("Failed to fetch registrations");
  }
};


export const registerForExcursion = async (registrationData) => {
  try {
    await axios.post(`${API_URL}/excursions/register`, registrationData, {
      withCredentials: true,
    });
  } catch (err) {
    console.error("Submission Error:", err);
    throw new Error(err.response?.data?.message || "Error during registration");
  }
};
