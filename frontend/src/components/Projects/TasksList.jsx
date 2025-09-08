import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/api";
import { RiEdit2Line } from "react-icons/ri";

export default function ProjectTasksPage() {
  const { id } = useParams();
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks();
  }, [id]);

  const fetchTasks = async () => {
    try {
      const response = await api.get(`/projects/${id}/tasks`);
      setTasks(response.data);
    } catch (err) {
      setError("Failed to load tasks");
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-gray-200 text-gray-800';
      case 'in_progress':
        return 'bg-blue-200 text-blue-800';
      case 'completed':
        return 'bg-green-200 text-green-800';
      case 'blocked':
        return 'bg-red-200 text-red-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold text-white mb-4">Project Tasks</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <button
        onClick={() => navigate(`/projects/${id}`)}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors cursor-pointer"
      >
        Back to Project
      </button>

      {tasks.length === 0 ? (
        <p className="text-white">No tasks found.</p>
      ) : (
        tasks.map((task) => (
          <div key={task.id} className="bg-slate-700 p-4 mb-4 rounded-md shadow-lg flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-white">{task.title}</h3>
              <p className="text-sm text-gray-400 mb-2">{task.description}</p>
              <span className={`inline-block text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor(task.status)}`}>
                {task.status.toUpperCase().replace('_', ' ')}
              </span>
            </div>

            <button
              onClick={() => navigate(`/tasks/${task.id}/edit`)}
              className="p-2 rounded-full hover:bg-gray-700 transition-colors"
              aria-label="Edit Task"
            >
              <RiEdit2Line className="h-5 w-5 text-gray-400 hover:text-white" />
            </button>
          </div>
        ))
      )}
    </div>
  );
}
