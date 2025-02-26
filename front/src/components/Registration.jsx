import React, { useEffect, useContext, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import ExcursionContext from "../contexts/ExcursionContext";
import UserContext from "../contexts/UserContext";
import RegistrationList from "./RegistrationList";

const API_URL = import.meta.env.VITE_API_URL;

const Registration = () => {
  const { excursions, setExcursions, error, setError } =
    useContext(ExcursionContext);
  const { user } = useContext(UserContext);

  const { register, handleSubmit, watch, reset } = useForm();
  const [filteredDates, setFilteredDates] = useState([]);

  const selectedExcursionId = watch("excursion_id");

  useEffect(() => {
    const fetchExcursions = async () => {
      try {
        if (!excursions.list || excursions.list.length === 0) {
          const { data: response } = await axios.get(`${API_URL}/excursions`, {
            withCredentials: true,
          });

          const { excursions: excursionList, total_count } = response.data;

          setExcursions({
            list: excursionList || [],
            total: parseInt(total_count, 10) || 0,
          });
        }
      } catch (err) {
        console.error("API Fetch Error:", err);
        setError("Failed to fetch excursions");
      }
    };

    fetchExcursions();
  }, [excursions, setExcursions, setError]);

  useEffect(() => {
    if (selectedExcursionId) {
      const selectedExcursion = excursions.list?.find(
        (ex) => ex.id === parseInt(selectedExcursionId)
      );
      console.log("Selected Excursion:", selectedExcursion);
      setFilteredDates(selectedExcursion?.dates || []);
    } else {
      setFilteredDates([]);
    }
  }, [selectedExcursionId, excursions]);

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
            {Array.isArray(excursions.list) &&
              excursions.list.length > 0 &&
              excursions.list.map((ex) => (
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
            {Array.isArray(filteredDates) &&
              filteredDates.length > 0 &&
              filteredDates.map((date) => (
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

      <RegistrationList />

      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
};

export default Registration;
