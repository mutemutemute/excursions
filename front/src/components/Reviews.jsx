import React, { useContext } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import ExcursionContext from "../contexts/ExcursionContext";

const API_URL = import.meta.env.VITE_API_URL;

const Reviews = ({ registration, onReviewSubmitted }) => {
  const { setError } = useContext(ExcursionContext);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (formData) => {

    const ratingNumber = parseInt(formData.rating, 10);
    // formData now contains: { name, rating, comment }

    const reviewData = {
      excursion_id: registration.excursion_id,
      name: formData.name, // user-provided name, matching your DB column
      rating: ratingNumber,
      comment: formData.comment,
    };
console.log(reviewData)
    try {
      const response = await axios.post(`${API_URL}/excursions/review`, reviewData, {
        withCredentials: true,
      });
      alert("Review submitted successfully!");
      onReviewSubmitted(response.data.data);
    } catch (error) {
      console.error("Review submission error:", error);
      setError(error.response?.data?.message || "Error submitting review");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-2 p-2 border rounded">
      <h3 className="text-lg font-bold">Leave a Review</h3>

      {/* Name Field */}
      <div className="mt-2">
        <label htmlFor="name" className="block text-sm font-medium">
          Your Name
        </label>
        <input
          type="text"
          id="name"
          className="mt-1 block w-full border p-1"
          {...register("name", { required: "Name is required" })}
        />
        {errors.name && (
          <span className="text-red-500">{errors.name.message}</span>
        )}
      </div>

      {/* Rating Field */}
      <div className="mt-2">
        <label htmlFor="rating" className="block text-sm font-medium">
          Rating
        </label>
        <select
          id="rating"
          className="mt-1 block w-full border p-1"
          {...register("rating", { valueAsNumber: true, required: "Rating is required" })}
        >
          <option value="">Select rating</option>
          <option value="1">1 - Poor</option>
          <option value="2">2 - Fair</option>
          <option value="3">3 - Good</option>
          <option value="4">4 - Very Good</option>
          <option value="5">5 - Excellent</option>
        </select>
        {errors.rating && (
          <span className="text-red-500">{errors.rating.message}</span>
        )}
      </div>

      {/* Comment Field */}
      <div className="mt-2">
        <label htmlFor="comment" className="block text-sm font-medium">
          Comment (optional)
        </label>
        <textarea
          id="comment"
          className="mt-1 block w-full border p-1"
          rows="3"
          {...register("comment")}
        ></textarea>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="mt-2 bg-[#42416f] text-white py-1 px-3 rounded"
      >
        Submit Review
      </button>
    </form>
  );
};

export default Reviews;
