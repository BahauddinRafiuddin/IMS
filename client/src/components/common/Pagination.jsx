const Pagination = ({ page, totalPages, setPage }) => {
  return (
    <div className="flex justify-end items-center gap-2 mt-6">
      <button
        disabled={page === 1}
        onClick={() => setPage(page - 1)}
        className={`px-3 py-1 border rounded 
  ${
    page === 1
      ? "cursor-not-allowed bg-gray-200 text-gray-400"
      : "cursor-pointer hover:bg-gray-100"
  }
  `}
      >
        Prev
      </button>

      <span className="px-3">
        Page {page} of {totalPages}
      </span>

      <button
        disabled={page === totalPages}
        onClick={() => setPage(page + 1)}
        className={`px-3 py-1 border rounded 
  ${
    page === totalPages
      ? "cursor-not-allowed bg-gray-200 text-gray-400"
      : "cursor-pointer hover:bg-gray-100"
  }
  `}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
