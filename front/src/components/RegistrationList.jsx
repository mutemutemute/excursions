import React, { useEffect, useContext, useState } from "react";
import axios from "axios";
import { FaRegTrashCan } from "react-icons/fa6";
import ExcursionContext from "../contexts/ExcursionContext";
import UserContext from "../contexts/UserContext";
import Reviews from "./Reviews";

const API_URL = import.meta.env.VITE_API_URL;

const RegistrationList = ({ allExcursions, refresh }) => {
  const { setError } = useContext(ExcursionContext);
  const { user } = useContext(UserContext);

  const [registrations, setRegistrations] = useState({ list: [], total: 0 });
  const [openReviewId, setOpenReviewId] = useState(null);
  const isAdmin = user?.role === "admin";

  // Fetch registrations on mount and when refresh changes
  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        if (user) {
          const url = isAdmin
            ? `${API_URL}/excursions/register`
            : `${API_URL}/excursions/users/${user.id}/registrations`;

          const { data: response } = await axios.get(url, {
            withCredentials: true,
          });

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
  }, [user, isAdmin, refresh, setError]);

  // delete registration
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this registration?"
    );
    if (!confirmed) return;
    try {
      // DELETE endpoint for a specific registration remains the same
      await axios.delete(`${API_URL}/excursions/register/${id}`, {
        withCredentials: true,
      });

      // Re-fetch registrations after deletion
      const updatedUrl = isAdmin
        ? `${API_URL}/excursions/register`
        : `${API_URL}/excursions/users/${user.id}/registrations`;

      const { data: updatedResponse } = await axios.get(updatedUrl, {
        withCredentials: true,
      });

      setRegistrations({
        list: updatedResponse.data.registrations || [],
        total: updatedResponse.data.total_count || 0,
      });

      alert("Deletion successful!");
    } catch (err) {
      console.error("Delete Error:", err);
      setError(err.response?.data?.message || "Error deleting registration");
    }
  };

  const handleUpdate = async (id, updates) => {
    try {
      await axios.put(`${API_URL}/excursions/register/${id}`, updates, {
        withCredentials: true,
      });

      // Re-fetch registrations after update.
      const updatedUrl = isAdmin
        ? `${API_URL}/excursions/register`
        : `${API_URL}/excursions/users/${user.id}/registrations`;

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
          {registrations.list.map((reg) => {
            // Look up the full excursion details (with dates) using the passed allExcursions list.
            const excursion = allExcursions.find(
              (ex) => ex.id === reg.excursion_id
            );

            // define canLeaveReview based on the registration date.
            const registrationDate = new Date(reg.date);
            const now = new Date();
            const canLeaveReview = registrationDate < now;

            return (
              <div key={reg.id} className="border p-2 mt-2 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{reg.excursion_name}</span>
                  <button
                    onClick={() => handleDelete(reg.id)}
                    className="text-[#42416f] border border-[#42416f] rounded-sm p-1"
                  >
                    <FaRegTrashCan size={22} />
                  </button>
                </div>
                <div>
                  {new Date(reg.date).toLocaleDateString("en-US")} at {reg.time}
                </div>
                {!isAdmin ? (
                  <select
                    className="border p-1"
                    value={reg.excursion_date_id}
                    onChange={(e) =>
                      handleUpdate(reg.id, {
                        excursion_date_id: e.target.value,
                      })
                    }
                  >
                    {excursion &&
                    excursion.dates &&
                    excursion.dates.length > 0 ? (
                      excursion.dates.map((date) => (
                        <option key={date.id} value={date.id}>
                          {new Date(date.date).toLocaleDateString("en-US")}
                        </option>
                      ))
                    ) : (
                      <option>No dates available</option>
                    )}
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
                {canLeaveReview && (
                  <div>
                    {openReviewId === reg.id ? (
                      <div>
                        <Reviews
                          registration={reg}
                          onReviewSubmitted={() => setOpenReviewId(null)}
                        />
                        <button
                          onClick={() => setOpenReviewId(null)}
                          className="mt-2 bg-gray-500 text-white py-1 px-3 rounded"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setOpenReviewId(reg.id)}
                        className="mt-2 bg-[#42416f] text-white py-1 px-3 rounded"
                      >
                        Leave Review
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-gray-500">No registrations found.</p>
      )}
    </div>
  );
};

export default RegistrationList;
