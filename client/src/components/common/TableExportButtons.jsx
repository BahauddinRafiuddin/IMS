import { FileDown } from "lucide-react";
import { exportToExcel } from "../../utils/exportExcel";
import { exportToPDF } from "../../utils/exportPDF";
import { toastError } from "../../utils/toast";

const TableExportButtons = ({ data, columns, fileName }) => {
  const handleExcel = () => {
    if (!data || data.length === 0) {
      toastError("No data to download");
      return;
    }
    exportToExcel(data, fileName);
  };

  const handlePDF = () => {
    if (!data || data.length === 0) {
      toastError("No data to download");
      return;
    }
    const rows = data.map((obj) => Object.values(obj));
    exportToPDF(columns, rows, fileName);
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleExcel}
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm cursor-pointer"
      >
        Excel
      </button>

      <button
        onClick={handlePDF}
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm cursor-pointer"
      >
        PDF
      </button>
    </div>
  );
};

export default TableExportButtons;
