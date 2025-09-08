import React, { useState, useEffect } from "react";
import api from "../../api/api";
import { useParams } from "react-router-dom";
import { MdHistory, MdWork } from "react-icons/md";
const EmployeeTimesheets = () => {
  const api = api();
  const { employeeId } = useParams();
  const [timesheets, setTimesheets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimesheets();
  }, [employeeId]);

  const fetchTimesheets = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/timesheets/${employeeId}`);
      const sortedTimesheets = response.data.sort(
        (a, b) => new Date(b.submitted_on) - new Date(a.submitted_on)
      );
      setTimesheets(sortedTimesheets);
    } catch (error) {
      console.error("Error fetching employee timesheets:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0D1117] text-gray-200 h-full p-8 font-sans">
      <div className="max-w-7xl mx-auto bg-[#161B22] rounded-2xl p-8 shadow-xl border border-gray-700">
        {/* Header Section */}
        <div className="flex items-center gap-4 mb-6">
          <MdWork className="w-10 h-10 text-[#3B82F6]" />
          <h1 className="text-3xl font-bold text-white">
            Timesheets of User: <span className="text-[#3B82F6]">{employeeId}</span>
          </h1>
        </div>
        <hr className="border-gray-700 mb-8" />

        {/* Timesheet History Table */}
        <div className="bg-[#1f2937] rounded-xl shadow-inner p-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <MdHistory /> Timesheet History
          </h3>
          {loading ? (
            <div className="text-center text-gray-500">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-[#161B22]">
                  <tr>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Week
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Summary
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Submitted On
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Attachment
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {timesheets.length === 0 ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="py-4 px-4 text-center text-gray-500 italic"
                      >
                        No timesheet records found.
                      </td>
                    </tr>
                  ) : (
                    timesheets.map((ts) => (
                      <tr
                        key={ts.id}
                        className="hover:bg-[#252a33] transition-colors"
                      >
                        <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-300">
                          {new Date(ts.week_start).toLocaleDateString()} -{" "}
                          {new Date(ts.week_end).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-400 max-w-lg overflow-hidden text-ellipsis">
                          {ts.task_summary}
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-400">
                          {new Date(ts.submitted_on).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4">
                          {ts.screenshot_path ? (
                            <a
                              href={`http://localhost:8000/${ts.screenshot_path.replace(
                                /\\/g,
                                "/"
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <img
                                src={`http://localhost:8000/${ts.screenshot_path.replace(
                                  /\\/g,
                                  "/"
                                )}`}
                                alt="screenshot"
                                style={{
                                  width: "60px",
                                  height: "40px",
                                  objectFit: "cover",
                                  borderRadius: "6px",
                                  cursor: "pointer",
                                }}
                              />
                            </a>
                          ) : (
                            "No file"
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeTimesheets;
