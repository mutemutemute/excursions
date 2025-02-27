import React, { useEffect, useContext, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import ExcursionContext from "../contexts/ExcursionContext";
import UserContext from "../contexts/UserContext";
import RegistrationList from "./RegistrationList";

const API_URL = import.meta.env.VITE_API_URL;

const Registration = () => {
  const { error, setError } = useContext(ExcursionContext);
  const { user } = useContext(UserContext);
  const { register, handleSubmit, watch, reset } = useForm();
  
  // Full list of excursions for dropdown and passing to RegistrationList
  const [allExcursions, setAllExcursions] = useState([]);
  const [filteredDates, setFilteredDates] = useState([]);
  const [refreshRegistrations, setRefreshRegistrations] = useState(false);

  const selectedExcursionId = watch("excursion_id");

  // Fetch all excursions (with dates) irrespective of pagination.
  useEffect(() => {
    const fetchAllExcursions = async () => {
      try {
        const { data: response } = await axios.get(`${API_URL}/excursions`, {
          withCredentials: true,
           
        });
        const excursionsList = response.data.excursions || [];
        setAllExcursions(excursionsList);
      } catch (err) {
        console.error("Error fetching all excursions:", err);
      }
    };

    fetchAllExcursions();
  }, []);

  // Update available dates when a new excursion is selected.
  useEffect(() => {
    if (selectedExcursionId) {
      const selectedExcursion = allExcursions.find(
        (ex) => ex.id === parseInt(selectedExcursionId, 10)
      );
      setFilteredDates(selectedExcursion?.dates || []);
    } else {
      setFilteredDates([]);
    }
  }, [selectedExcursionId, allExcursions]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        user_id: user.id,
        excursion_id: data.excursion_id,
        excursion_date_id: data.excursion_date_id,
        status: "Pending",
      };

      await axios.post(`${API_URL}/excursions/register`, payload, {
        withCredentials: true,
      });

      reset();
      setError("");
      alert("Registration successful!");
      // Trigger a refresh in the RegistrationList component.
      setRefreshRegistrations((prev) => !prev);
    } catch (err) {
      console.error("Submission Error:", err);
      setError(err.response?.data?.message || "Error during registration");
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Register for an Excursion</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Excursion</label>
          <select
            {...register("excursion_id", { required: true })}
            className="w-full border rounded p-2"
          >
            <option value="">Select Excursion</option>
            {allExcursions.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Available Dates</label>
          <select
            {...register("excursion_date_id", { required: true })}
            className="w-full border rounded p-2"
            disabled={!selectedExcursionId}
          >
            <option value="">Select Date</option>
            {filteredDates.map((date) => (
              <option key={date.id} value={date.id}>
                {date.date} at {date.time}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="w-full bg-[#42416f] text-white py-2 rounded hover:bg-[#2d2c4d]"
        >
          Register
        </button>
      </form>
      
      {/* Full list of excursions to RegistrationList */}
      <RegistrationList refresh={refreshRegistrations} allExcursions={allExcursions} />

      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
};

export default Registration;
