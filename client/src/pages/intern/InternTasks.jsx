/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { getMyTasks, submitTask } from "../../api/intern.api";
import {
  BookOpen,
  Clock,
  CheckCircle,
  User,
  Calendar,
  AlertCircle,
  MessageSquare,
  Star,
  ArrowUpRight,
} from "lucide-react";
import SubmitTaskModal from "../../components/intern/SubmitTaskModal";
import { toastSuccess, toastError } from "../../utils/toast";
import Loading from "../../components/common/Loading";
import Pagination from "../../components/common/Pagination"; // Import your component

const priorityColors = {
  low: "bg-emerald-50 text-emerald-700 border-emerald-100",
  medium: "bg-amber-50 text-amber-700 border-amber-100",
  high: "bg-rose-50 text-rose-700 border-rose-100",
};

const statusColors = {
  pending: "bg-slate-100 text-slate-600",
  in_progress: "bg-blue-50 text-blue-600 border-blue-100",
  submitted: "bg-indigo-50 text-indigo-700 border-indigo-100",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-rose-100 text-rose-800 font-bold",
};

const InternTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);

  // PAGINATION STATE
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2; // Adjust this number based on card size

  const fetchMyTasks = async () => {
    try {
      const res = await getMyTasks();
      setTasks(res.tasks || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTasks();
  }, []);

  // PAGINATION LOGIC
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTasks = tasks.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(tasks.length / itemsPerPage);

  const handleSubmitTask = async (data) => {
    try {
      await submitTask(selectedTask._id, data);
      toastSuccess("Task submitted successfully");
      setSelectedTask(null);
      fetchMyTasks();
    } catch (err) {
      toastError(err.response?.data?.message || "Submission failed");
    }
  };

  if (loading) return <Loading />;

  if (!tasks.length) return (
    <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[2.5rem] border border-dashed border-slate-200 text-center mx-4">
      <BookOpen className="text-slate-300 mb-4" size={60} />
      <h2 className="text-xl font-bold text-slate-800">No Tasks Assigned</h2>
      <p className="text-slate-500 max-w-xs mt-2 text-sm font-medium italic">Your mentor hasn't released any assignments yet.</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-12 px-4">
      {/* HEADER */}
      <div className="border-b border-slate-200 pb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Assignment Feed</h1>
        <p className="text-slate-500 mt-1 font-medium italic text-sm">Complete tasks and review mentor feedback.</p>
      </div>

      {/* TASK LIST */}
      <div className="space-y-6">
        {currentTasks.map((task) => (
          <div key={task._id} className="group bg-white rounded-4xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-stretch">
              
              {/* STATUS INDICATOR BAR */}
              <div className={`w-full lg:w-2 h-2 lg:h-auto ${
                task.status === 'approved' ? 'bg-emerald-500' : 
                task.status === 'rejected' ? 'bg-rose-500' : 
                task.status === 'submitted' ? 'bg-indigo-500' : 'bg-slate-200'
              }`} />

              <div className="p-6 lg:p-8 flex-1">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                  
                  {/* LEFT: CONTENT */}
                  <div className="space-y-4 max-w-3xl">
                    <div className="flex items-center gap-3">
                       <h2 className="text-xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors">
                          {task.title}
                       </h2>
                       <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${priorityColors[task.priority]}`}>
                          {task.priority}
                       </span>
                    </div>

                    <p className="text-sm text-slate-500 font-medium leading-relaxed italic line-clamp-2">
                      {task.description}
                    </p>

                    {/* METADATA STRIP */}
                    <div className="flex flex-wrap gap-x-6 gap-y-3 pt-2">
                       <MetaPill icon={BookOpen} label="Program" value={task.program?.title} />
                       <MetaPill icon={User} label="Mentor" value={task.mentor?.name} />
                       <MetaPill icon={Calendar} label="Deadline" value={new Date(task.deadline).toDateString()} />
                       <MetaPill icon={Clock} label="Attempts" value={task.attempts} />
                       <MetaPill 
                          icon={AlertCircle} 
                          label="Status" 
                          value={task.status.replace("_", " ")} 
                          colorBadge={statusColors[task.status]} 
                       />
                    </div>

                    {/* MENTOR FEEDBACK SECTION */}
                    {(task.feedback || task.score !== undefined) && (
                      <div className="mt-6 p-5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row gap-6">
                        {task.score !== undefined && (
                          <div className="flex flex-col items-center justify-center sm:border-r border-slate-200 pr-0 sm:pr-6">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 text-center">Score</span>
                            <div className="flex items-center gap-1 text-amber-500">
                               <Star size={14} className="fill-amber-500" />
                               <span className="text-xl font-black text-slate-800">{task.score}<span className="text-xs text-slate-400">/10</span></span>
                            </div>
                          </div>
                        )}
                        {task.feedback && (
                          <div className="flex-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                               <MessageSquare size={12}/> Mentor Feedback
                            </span>
                            <p className="text-sm text-slate-600 font-medium leading-relaxed italic bg-white p-3 rounded-xl border border-slate-50">
                               "{task.feedback}"
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* RIGHT: ACTION BUTTON */}
                  <div className="flex items-center lg:items-start justify-end min-w-35">
                    {(task.status === "pending" || task.status === "rejected" || task.status === "in_progress") ? (
                      <button
                        onClick={() => setSelectedTask(task)}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-black text-white rounded-xl font-black uppercase tracking-widest text-[10px] transition-all shadow-lg shadow-indigo-100 active:scale-95 cursor-pointer"
                      >
                        {task.status === "rejected" ? "Resubmit Work" : "Submit Task"}
                        <ArrowUpRight size={14} />
                      </button>
                    ) : (
                      <div className="text-center px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 min-w-28">
                        <CheckCircle size={20} className="mx-auto text-emerald-500 mb-1" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Locked</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* PAGINATION COMPONENT */}
      <Pagination 
        page={currentPage} 
        totalPages={totalPages} 
        setPage={setCurrentPage} 
      />

      {selectedTask && (
        <SubmitTaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onSubmit={handleSubmitTask}
        />
      )}
    </div>
  );
};

const MetaPill = ({ icon: Icon, label, value, colorBadge }) => (
  <div className="flex items-center gap-2">
    <div className="p-1.5 bg-slate-50 text-slate-400 rounded-lg">
      <Icon size={12} />
    </div>
    <div className="flex flex-col">
       <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none">{label}</span>
       <span className={`text-[11px] font-bold ${colorBadge ? `px-2 py-0.5 rounded-md ${colorBadge} inline-block w-fit mt-0.5 uppercase tracking-tighter` : 'text-slate-700'}`}>
          {value}
       </span>
    </div>
  </div>
);

export default InternTasks;