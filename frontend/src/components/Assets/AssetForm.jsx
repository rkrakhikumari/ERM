import { useState } from "react";
import api from "../../api/api";
import { GoCheckCircleFill } from "react-icons/go";
import { MdOutlineKeyboardReturn } from "react-icons/md";
import { useNavigate } from "react-router-dom";
export default function AssetForm() {
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    serial_number: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [previewImageUrl, setPreviewImageUrl] = useState(null);
  const [status, setStatus] = useState(null); 
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImageUrl(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setPreviewImageUrl(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const assetData = {
        name: formData.name,
        type: formData.type,
        serial_number: formData.serial_number,
      };

      const response = await api.post("/assets/create", assetData);
      
      console.log("Asset created successfully:", response.data);
      setStatus("success");
      
      setFormData({ name: "", type: "", serial_number: "" });
      setImageFile(null);
      setPreviewImageUrl(null);

      setTimeout(() => {
        navigate("/assets");
      }, 2000);

    } catch (err) {
      console.error("Error creating asset:", err);
      setStatus("error");
      
      if (err.response?.data?.detail) {
        console.error("Server error:", err.response.data.detail);
      }
    }
  };

  return (
    <div className="max-w-xl mx-auto p-8 bg-[#0D1117] min-h-screen font-sans text-white">
      <div className="flex justify-between items-center mb-12">
        <h2 className="text-3xl font-bold bg-[#3B82F6] bg-clip-text text-transparent drop-shadow-lg">
          Create New Asset
        </h2>
        <button
          onClick={() => navigate("/assets")}
          className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold bg-[#3B82F6] text-white hover:bg-[#2563EB] transition-all hover:-translate-y-1 shadow-md cursor-pointer"
        >
          <MdOutlineKeyboardReturn className="text-lg" /> Back to Inventory
        </button>
      </div>

      <div className="bg-[#161B22] backdrop-blur-lg border border-white/20 rounded-2xl p-8">
        <p className="text-gray-400 mb-6">
          Fill the form to add a new asset to the inventory.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-400 text-sm font-semibold mb-2">
              Asset Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-[#0D1117] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="type" className="block text-gray-400 text-sm font-semibold mb-2">
              Asset Type
            </label>
            <input
              type="text"
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-[#0D1117] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="serial_number" className="block text-gray-400 text-sm font-semibold mb-2">
              Serial Number
            </label>
            <input
              type="text"
              id="serial_number"
              name="serial_number"
              value={formData.serial_number}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-[#0D1117] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-6 py-3 text-lg font-semibold bg-[#3B82F6] text-white rounded-xl transition-all duration-300 hover:bg-[#2563EB] disabled:bg-gray-600 cursor-pointer"
            disabled={status === "loading"}
          >
            {status === "loading" ? "Creating..." : "Create Asset"}
          </button>
        </form>

        {status === "success" && (
          <div className="mt-6 flex items-center justify-center gap-2 text-green-500 font-semibold">
            <GoCheckCircleFill /> Asset created successfully! Redirecting...
          </div>
        )}
        {status === "error" && (
          <div className="mt-6 text-center text-red-500 font-semibold">
            Failed to create asset. Please check the console for details and try again.
          </div>
        )}
      </div>
    </div>
  );
}