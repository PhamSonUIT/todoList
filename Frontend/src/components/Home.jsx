import React, { useState, useEffect } from "react";
import axios from "axios";
import Calendar from "./Calendar";
import AddTask from "./AddTask";
import Task from "./Task";
import "../css/Home.css";

const API_URL = "http://localhost:3000/api/tasks";

export default function Home() {
  const [now, setNow] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [tasks, setTasks] = useState([]);

  const formatDateToYYYYMMDD = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const extractTimeFromISO = (isoString) => {
    if (!isoString) return "00:00";
    const dateObj = new Date(isoString);
    const hours = String(dateObj.getHours()).padStart(2, "0");
    const minutes = String(dateObj.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const fetchTasksByDate = async (date) => {
    try {
      const dateStr = formatDateToYYYYMMDD(date);
      const response = await axios.get(`${API_URL}?date=${dateStr}`);
      setTasks(response.data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách task từ server:", error);
    }
  };

  useEffect(() => {
    fetchTasksByDate(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleSaveTask = async (taskData) => {
    try {
      if (taskData.id) {
        const response = await axios.put(`${API_URL}/${taskData.id}`, {
          title: taskData.title,
          startAt: taskData.startAt,
          endAt: taskData.endAt,
        });
        setTasks(tasks.map((t) => (t.id === taskData.id ? response.data : t)));
      } else {
        const response = await axios.post(API_URL, {
          title: taskData.title,
          startAt: taskData.startAt,
          endAt: taskData.endAt,
        });
        setTasks([...tasks, response.data]);
      }
    } catch (error) {
      alert(
        "Không thể lưu công việc.",
      );
    }
    setShowAddForm(false);
    setEditingTask(null);
  };

  const handleToggleComplete = async (taskId, e) => {
    e.stopPropagation();
    const targetTask = tasks.find((t) => t.id === taskId);
    if (!targetTask) return;

    try {
      const response = await axios.put(`${API_URL}/${taskId}`, {
        isCompleted: !targetTask.isCompleted,
      });

      setTasks(tasks.map((t) => (t.id === taskId ? response.data : t)));
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái", error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(`${API_URL}/${taskId}`);
      setTasks(tasks.filter((t) => t.id !== taskId));
    } catch (error) {
      console.error("Lỗi khi xóa task:", error);
    }
    setShowAddForm(false);
    setEditingTask(null);
  };

  const handleSelectTaskToEdit = (task) => {
    setEditingTask(task);
    setShowAddForm(true);
  };

  const completedTasks = tasks.filter((t) => t.isCompleted);
  const activeTasks = [];
  const overdueTasks = [];

  tasks.forEach((task) => {
    if (task.isCompleted) return;

    const startTimeStr = task.startTime || extractTimeFromISO(task.startAt);

    const [taskHour, taskMinute] = startTimeStr.split(":").map(Number);

    const taskDateTime = new Date(task.startAt);

    if (taskDateTime < now) {
      overdueTasks.push(task);
    } else {
      activeTasks.push(task);
    }
  });

  return (
    <div className="app_container">
      <div className="main_content_app">
        <h2 className="main_title">
          Công việc ngày {selectedDate.toLocaleDateString("vi-VN")}
        </h2>

        <div className="status_summary_bar">
          <div className="summary_item active_summary">
            Sắp diễn ra ({activeTasks.length})
          </div>
          <div className="summary_item overdue_summary">
            Quá hạn ({overdueTasks.length})
          </div>
          <div className="summary_item completed_summary">
            Đã xong ({completedTasks.length})
          </div>
        </div>

        <div className="task_view_container">
          <Task
            tasks={tasks}
            overdueTasks={overdueTasks}
            selectedDate={selectedDate}
            onTaskClick={handleSelectTaskToEdit}
            onToggleComplete={handleToggleComplete}
          />
        </div>

        {showAddForm && (
          <AddTask
            selectedDate={selectedDate}
            taskToEdit={editingTask}
            onDateChange={(date) => setSelectedDate(date)}
            onSave={handleSaveTask}
            onCancel={() => {
              setShowAddForm(false);
              setEditingTask(null);
            }}
            onDelete={handleDeleteTask}
          />
        )}
      </div>

      <div className="sidebar_right">
        <Calendar
          onDateChange={(date) => setSelectedDate(date)}
          onAddTaskClick={() => {
            setEditingTask(null);
            setShowAddForm(true);
          }}
        />
      </div>
    </div>
  );
}
