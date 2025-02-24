import { useState, useEffect, useContext } from "react";
import { FaStar } from "react-icons/fa";
import ExcursionContext from "../contexts/ExcursionContext";
import UserContext from "../contexts/UserContext";
import {Link} from "react-router";
import axios from "axios";
import { FaEdit } from "react-icons/fa";
import { FaRegTrashCan } from "react-icons/fa6";

const API_URL = import.meta.env.VITE_API_URL;

const ExcursionCard = ({ excursion }) => {
  const { user } = useContext(UserContext);
  const {setError, setExcursions, update} = useContext(ExcursionContext);
  const {
    id,
    name,
    image_url,
    duration,
    price,
    user_rating,
    category_name,
    description,
    dates = [],
    reviews = [],
  } = excursion;

  const [showModal, setShowModal] = useState(false);

  const displayedReviews = Array.isArray(reviews) ? reviews.slice(0, 3) : [];

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showModal]);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this excursion?"
    );
  
    if (!confirmed) return; 
  
    try {
      await axios.delete(`${API_URL}/excursions/${id}`, {
        withCredentials: true,
      });
  
      
      setExcursions((prev) => ({
        ...prev,
        list: prev.list.filter((excursion) => excursion.id !== id),
      }));
  
      window.alert("Excursion deleted successfully!");
      update();
    } catch (error) {
      setError(error.message);
    }
  };
  


  return (
    <div className="border border-gray-200 p-4 rounded shadow-md">
      <h2 className="text-xl font-bold">{name}</h2>
      <img src={image_url} alt={name} className="my-2 w-70 h-50 lg:w-100 lg:h-70 object-cover" />
      
      <p><span className="font-semibold">Duration:</span> {duration}</p>
      <p><span className="font-semibold">Price:</span> ${price}</p>
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            size={18}
            color={user_rating >= star ? "#ffc107" : "#e4e5e9"}
          />
        ))}{<p>({user_rating})</p>}
      </div>
      <p><span className="font-semibold">Category:</span> {category_name}</p>

      <div className="mt-4">
        <h3 className="font-semibold">Available Dates:</h3>
        {Array.isArray(dates) && dates.length > 0 ? (
          <ul className="list-disc pl-5">
            {dates.map((dateItem) => (
              <li key={dateItem.id}>
                {dateItem.date} at {dateItem.time}
              </li>
            ))}
          </ul>
        ) : (
          <p>No available dates</p>
        )}
      </div>
      <div>
        <h3 className="font-semibold">Description:</h3>
        <p>{description}</p>
      </div>
      

      <div className="mt-4">
        <h3 className="font-semibold">Reviews:</h3>
        {Array.isArray(displayedReviews) && displayedReviews.length > 0 ? (
          <ul className="list-disc pl-5">
            {displayedReviews.map((review) => (
              <li key={review.id}>
                <strong>{review.name}</strong> ({review.rating}⭐):{" "}
                {review.comment}
              </li>
            ))}
          </ul>
        ) : (
          <p>No reviews yet</p>
        )}

        {Array.isArray(reviews) && reviews.length > 3 && (
          <button
            className="mt-2 text-[#42416f] underline"
            onClick={() => setShowModal(true)}
          >
            View All Reviews ({reviews.length})
          </button>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-200 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg max-h-[80vh] shadow-lg relative">
            <h2 className="text-xl font-bold mb-4 text-center">All Reviews</h2>

            <div className="overflow-y-auto max-h-[60vh] pr-2">
              <ul>
                {Array.isArray(reviews) &&
                  reviews.map((review) => (
                    <li key={review.id} className="mb-4 border-b pb-2">
                      <strong>{review.name || "Anonymous"}</strong> (
                      {review.rating} ⭐): {review.comment || "No comment"}
                      <br />
                      <small>
                        {new Date(review.created_at).toLocaleDateString()}
                      </small>
                    </li>
                  ))}
              </ul>
            </div>

            <button
              className="mt-4 px-4 py-2 bg-[#42416f] text-white rounded hover:bg-[#323259] w-full"
              onClick={() => setShowModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

{user?.role === "admin" &&(
      <div className="pt-2"><button
          onClick={handleDelete}
          className="text-[#42416f] border border-[#42416f] rounded-sm p-1"
        >
          <FaRegTrashCan size={22} />
        </button></div>)}
    </div>
  );
};

export default ExcursionCard;
