import UserContext from "./UserContext";
import axios from "axios";
import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL;

const UserContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: response } = await axios.get(`${API_URL}/users/me`, {
          withCredentials: true,
        });

        if (response && response.data) {
          setUser(response.data);
        } else {
          setError("Failed to fetch user data");
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, error, setError }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContextProvider;
