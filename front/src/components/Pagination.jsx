import { useContext, useEffect, useState } from "react";
import ReactPaginate from "react-paginate";
import ExcursionContext from "../contexts/ExcursionContext";

const Pagination = () => {
  const {
    excursions,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
  } = useContext(ExcursionContext);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const newTotalPages = Math.max(
      1,
      Math.ceil((excursions?.total || 0) / itemsPerPage)
    );

    if (currentPage >= newTotalPages) {
      setCurrentPage(0); 
    }

    setTotalPages(newTotalPages);
  }, [excursions, itemsPerPage, currentPage, setCurrentPage]);

  const handlePageClick = (event) => {
    setCurrentPage(event.selected);
  };

  const handleItemsPerPageChange = (event) => {
    setItemsPerPage(Number(event.target.value));
    setCurrentPage(0);
  };

  return (
    <div className="flex flex-col items-center space-y-4 pb-3">
      <div className="flex items-center space-x-2 pb-3">
        <label htmlFor="itemsPerPage" className="text-gray-700">
          Items per page:
        </label>
        <select
          id="itemsPerPage"
          value={itemsPerPage}
          onChange={handleItemsPerPageChange}
          className="border rounded p-2"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>

      <ReactPaginate
        previousLabel="«"
        nextLabel="»"
        breakLabel="..."
        pageCount={totalPages}
        marginPagesDisplayed={1}
        pageRangeDisplayed={3}
        onPageChange={handlePageClick}
        forcePage={Math.min(currentPage, totalPages - 1)} 
        containerClassName="flex space-x-2"
        pageClassName="group"
        pageLinkClassName="px-3 py-2 border rounded-md bg-white hover:bg-gray-200 cursor-pointer transition-all"
        activeClassName="bg-gray-300 font-bold"
        previousClassName="group "
        previousLinkClassName="px-3 py-2 border rounded-md bg-white hover:bg-gray-200 cursor-pointer transition-all"
        nextClassName="group"
        nextLinkClassName="px-3 py-2 border rounded-md bg-white hover:bg-gray-200 cursor-pointer transition-all"
        breakClassName="group"
        breakLinkClassName="px-3 py-2 border rounded-md bg-white hover:bg-gray-200 cursor-pointer transition-all"
      />
    </div>
  );
};

export default Pagination;
