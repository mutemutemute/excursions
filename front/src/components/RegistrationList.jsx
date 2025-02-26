import React, { useEffect, useContext, useState } from "react";
import axios from "axios";
import ExcursionContext from "../contexts/ExcursionContext";
import UserContext from "../contexts/UserContext";

const API_URL = import.meta.env.VITE_API_URL;

const RegistrationList = () => {
  const { excursions, setError } = useContext(ExcursionContext);
  const { user } = useContext(UserContext);

  const [registrations, setRegistrations] = useState({ list: [], total: 0 });
  

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        if (user) {
          const url = isAdmin
            ? `${API_URL}/excursions/register`
            : `${API_URL}/excursions/register/${user.id}`;

          const { data: response } = await axios.get(url, {
            withCredentials: true,
          });

          console.log("Registrations Data from API:", response);

          setRegistrations({
            list: response.data.registrations || [],
            total: response.data.total_count || 0,
          });
        }
      } catch (err) {
        console.error("Fetch Registrations Error:", err);
        setError("Failed to fetch registrations");
      }
    };

    fetchRegistrations();
  }, [user, isAdmin]);

  const handleUpdate = async (id, updateData) => {
    try {
      await axios.put(`${API_URL}/excursions/register/${id}`, updateData, {
        withCredentials: true,
      });

      const updatedUrl = isAdmin
        ? `${API_URL}/excursions/register`
        : `${API_URL}/excursions/register/${user.id}`;

      const { data: updatedResponse } = await axios.get(updatedUrl, {
        withCredentials: true,
      });

      setRegistrations({
        list: updatedResponse.data.registrations || [],
        total: updatedResponse.data.total_count || 0,
      });

      alert("Update successful!");
    } catch (err) {
      console.error("Update Error:", err);
      setError(err.response?.data?.message || "Error updating registration");
    }
  };

  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold">
        {isAdmin ? "All Registrations" : "Your Registrations"}
      </h2>
      {registrations.list.length > 0 ? (
        <div className="mt-2">
          {registrations.list.map((reg) => (
            <div key={reg.id} className="border p-2 mt-2">
              <div>{reg.excursion_name}</div>
              <div>
                {new Date(reg.date).toLocaleDateString("en-US")} at {reg.time}
              </div>

              {!isAdmin ? (
                <select
                  className="border p-1"
                  value={reg.excursion_date_id}
                  onChange={(e) =>
                    handleUpdate(reg.id, { excursion_date_id: e.target.value })
                  }
                >
                  {excursions.list
                    .find((ex) => ex.id === reg.excursion_id)
                    ?.dates.map((date) => (
                      <option key={date.id} value={date.id}>
                        {new Date(date.date).toLocaleDateString("en-US")}
                      </option>
                    ))}
                </select>
              ) : (
                <select
                  className="border p-1"
                  value={reg.status}
                  onChange={(e) =>
                    handleUpdate(reg.id, { status: e.target.value })
                  }
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Canceled">Cancelled</option>
                  <option value="Closed">Closed</option>
                </select>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No registrations found.</p>
      )}
    </div>
  );
};

export default RegistrationList;
