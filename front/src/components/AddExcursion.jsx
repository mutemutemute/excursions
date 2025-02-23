import { useForm, useFieldArray } from "react-hook-form";
import axios from "axios";
import { useContext } from "react";
import ExcursionContext from "../contexts/ExcursionContext";
import UserContext from "../contexts/UserContext";
import { FaPlus } from "react-icons/fa";
import { FaRegTrashCan } from "react-icons/fa6";

const API_URL = import.meta.env.VITE_API_URL;

const AddExcursion = () => {
  const { error, setError, setShowForm, setExcursions, update } =
    useContext(ExcursionContext);
  const { user } = useContext(UserContext);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      dates: [{ date: "", time: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "dates",
  });

  const onSubmit = async (formdata) => {
    try {
      const payload = {
        name: formdata.name,
        image_url: formdata.image_url,
        duration:
          formdata.duration.length === 5
            ? `${formdata.duration}:00`
            : formdata.duration,
        price: parseFloat(formdata.price),
        description: formdata.description.trim(),
        category_id: parseInt(formdata.category_id, 10),
        dates: formdata.dates.map((d) => ({
          date: d.date,
          time: d.time.length === 5 ? `${d.time}:00` : d.time,
        })),
      };
      console.log(payload);
      const response = await axios.post(`${API_URL}/excursions`, payload, {
        withCredentials: true,
      });

      const newExcursion = response.data?.data || response.data || response;

      setExcursions((prev) => ({
        ...prev,
        list: [...prev.list, newExcursion],
      }));
      reset();
      window.alert("Excursion added successfully!");

      setShowForm(false);
      update();
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4 flex flex-col space-y-1">
          <label htmlFor="name" className="text-sm ">
            Excursion Name
          </label>
          <input
            {...register("name", {
              required: "Excursion name is required",
            })}
            type="text"
            placeholder="Excursion Name"
            className="input input-bordered mt-1 p-2  rounded-md w-full flex-1"
          />

          {errors.name && (
            <div className="relative">
              <p className="text-red-500 text-sm absolute whitespace-nowrap top-[-0.2rem]">
                {errors.name.message}
              </p>
            </div>
          )}
        </div>

        <div className="mb-4 flex flex-col space-y-1">
          <label htmlFor="image_url" className="text-sm ">
            Image URL
          </label>
          <input
            {...register("image_url", {
              required: "Image URL is required",
              pattern: {
                value:
                  /^https?:\/\/.*\.(?:png|jpg|jpeg|gif|bmp|svg|webp|tiff)(\?.*)?$/i,
                message: "Please enter a valid image URL (jpg, png, gif, etc.)",
              },
            })}
            type="text"
            placeholder="Image URL"
            className="input input-bordered mt-1 p-2  rounded-md w-full flex-1"
          />
          {errors.image_url && (
            <div className="relative">
              <p className="text-red-500 text-sm absolute whitespace-nowrap top-[-0.2rem]">
                {errors.image_url.message}
              </p>
            </div>
          )}
        </div>

        <div className="mb-4 flex flex-col space-y-1">
          <label htmlFor="duration" className="block text-sm">
            Duration
          </label>
          <input
            {...register("duration", {
              required: "Duration is required",
              pattern: {
                value: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/,
                message: "Please use HH:MM:SS format",
              },
            })}
            type="text"
            inputMode="numeric"
            placeholder="HH:MM:SS"
            className="mt-1 p-2 rounded-md w-full input input-bordered"
          />
          {errors.duration && (
            <div className="relative">
              <p className="text-red-500 text-sm absolute whitespace-nowrap top-[-0.2rem]">
                {errors.duration.message}
              </p>
            </div>
          )}
        </div>

        <div className="mb-4 flex flex-col space-y-1">
          <label htmlFor="price" className="text-sm">
            Price
          </label>
          <input
            {...register("price", {
              required: "Price is required",
              valueAsNumber: true, //input value as number
              min: {
                value: 0,
                message: "Price must be greater than 0",
              },
            })}
            type="number"
            placeholder="Price"
            min="0"
            step="1" //"0.01" if decimals allowed
            className="mt-1 p-2 input input-bordered rounded-md w-full "
          />
          {errors.price && (
            <div className="relative">
              <p className="text-red-500 text-sm absolute whitespace-nowrap top-[-0.2rem]">
                {errors.price.message}
              </p>
            </div>
          )}
        </div>

        <div className="mb-4 flex flex-col space-y-1">
          <label htmlFor="category_id" className="text-sm">
            Category
          </label>
          <select
            {...register("category_id", {
              required: "Category is required",
            })}
            className="input input-bordered mt-1 p-2 rounded-md w-full"
          >
            <option value="">Select Category</option>
            <option value="1">Single</option>
            <option value="2">Group</option>
          </select>
          {errors.category_id && (
            <div className="relative">
              <p className="text-red-500 text-sm absolute whitespace-nowrap top-[-0.2rem]">
                {errors.category_id.message}
              </p>
            </div>
          )}
        </div>

        <div className="mb-4 flex flex-col space-y-1">
          <label htmlFor="description" className="block text-sm mt-2">
            Description
          </label>
          <textarea
            {...register("description")}
            placeholder="Excursion Description"
            className="input input-bordered mt-1 p-2 rounded-md w-full h-32 flex-1"
          />
          {errors.description && (
            <div className="relative">
              <p className="text-red-500 text-sm absolute whitespace-nowrap top-[-0.2rem]">
                {errors.description.message}
              </p>
            </div>
          )}
        </div>

        <div className="mb-4 flex flex-col space-y-1">
          <label className="block text-sm">Excursion Dates</label>
          {fields.map((item, index) => (
            <div
              key={item.id}
              className="flex flex-col md:flex-row items-center gap-2 mb-2"
            >
              <input
                {...register(`dates.${index}.date`, {
                  required: "Date is required",
                })}
                type="date"
                className="input input-bordered p-2"
              />
              <input
                {...register(`dates.${index}.time`, {
                  required: "Time is required",
                })}
                type="time"
                className="input input-bordered p-2"
              />
              {fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="btn bg-red-900 text-white"
                >
                  <FaRegTrashCan size={16} />
                </button>
              )}
            </div>
          ))}
          <div className="flex justify-end pt-8">
            <button
              type="button"
              onClick={() => append({ date: "", time: "" })}
              className="btn bg-green-900 text-white flex justify-center items-center"
            >
              <FaPlus size={16} className="mr-1" /> Add Date
            </button>
          </div>
          {errors.dates && (
            <div className="relative">
              <p className="text-red-500 text-sm absolute whitespace-nowrap bottom-[3.9rem]">
                Please fill all date fields
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2 pt-2 pb-2">
          <button
            type="submit"
            className="btn px-4 py-2 bg-[#42416f] text-white "
          >
            Add Excursion
          </button>
        </div>
        {error && <p className="text-red-500">{error}</p>}
      </form>
    </>
  );
};

export default AddExcursion;
