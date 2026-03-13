/* eslint-disable no-unused-vars */
import { useEffect, useState, useMemo } from "react";
import { getCompanyReviews } from "../../api/admin.api";
import { toastError } from "../../utils/toast";
import { Star } from "lucide-react";

import Pagination from "../../components/common/Pagination";
import TableExportButtons from "../../components/common/TableExportButtons";

const CompanyReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // pagination
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await getCompanyReviews();
      setReviews(res.reviews || []);
    } catch (error) {
      toastError("Failed to fetch reviews");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchReviews();
  }, []);

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={16}
        className={
          i < rating
            ? "text-yellow-400 fill-yellow-400"
            : "text-gray-300"
        }
      />
    ));
  };

  // ================= PAGINATION =================
  const totalPages = Math.ceil(reviews.length / ITEMS_PER_PAGE);

  const paginatedReviews = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return reviews.slice(start, start + ITEMS_PER_PAGE);
  }, [reviews, page]);

  // ================= EXPORT DATA =================
  const exportData = useMemo(() => {
    return reviews.map((r) => ({
      Intern: r.intern?.name || "-",
      Program: r.program?.title || "-",
      Rating: r.rating,
      Comment: r.comment || "-",
      Date: new Date(r.createdAt).toLocaleDateString(),
    }));
  }, [reviews]);

  const columns = ["Intern", "Program", "Rating", "Comment", "Date"];

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Company Reviews
          </h1>
          <p className="text-gray-500 text-sm">
            Feedback shared by interns after completing internships
          </p>
        </div>

        {/* DOWNLOAD BUTTONS */}
        <TableExportButtons
          data={exportData}
          columns={columns}
          fileName="company-reviews"
        />

      </div>

      {/* REVIEWS GRID */}
      {loading ? (
        <div className="text-center text-gray-500 p-10">
          Loading reviews...
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center text-gray-500 p-10">
          No reviews yet
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">

            {paginatedReviews.map((review) => (
              <div
                key={review._id}
                className="bg-white border rounded-2xl shadow-sm p-5 space-y-4 hover:shadow-md transition"
              >
                
                {/* INTERN */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-800">
                      {review.intern?.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {review.program?.title}
                    </p>
                  </div>

                  <div className="flex gap-1">
                    {renderStars(review.rating)}
                  </div>
                </div>

                {/* COMMENT */}
                {review.comment && (
                  <p className="text-sm text-gray-600 leading-relaxed">
                    "{review.comment}"
                  </p>
                )}

                {/* DATE */}
                <div className="text-xs text-gray-400">
                  {new Date(review.createdAt).toLocaleDateString()}
                </div>

              </div>
            ))}

          </div>

          {/* PAGINATION */}
          <Pagination
            page={page}
            totalPages={totalPages}
            setPage={setPage}
          />
        </>
      )}
    </div>
  );
};

export default CompanyReviews;