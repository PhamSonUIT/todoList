import React, { useState, useEffect } from "react";
import "../css/AddTask.css";

export default function AddTask({ selectedDate, taskToEdit, onSave, onCancel, onDelete }) {
  const [title, setTitle] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");

  // Hàm định dạng đối tượng Date thành chuỗi "YYYY-MM-DDTHH:MM" cho input datetime-local
  const formatToDatetimeLocal = (dateString) => {
    const d = dateString ? new Date(dateString) : new Date();
    const pad = (num) => String(num).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setStartAt(formatToDatetimeLocal(taskToEdit.startAt));
      setEndAt(formatToDatetimeLocal(taskToEdit.endAt));
    } else {
      setTitle("");
      // Mặc định lấy ngày đang chọn trên lịch nhỏ làm mốc thời gian bắt đầu
      const defaultStart = new Date(selectedDate);
      defaultStart.setHours(8, 0, 0, 0);
      const defaultEnd = new Date(selectedDate);
      defaultEnd.setHours(9, 0, 0, 0);

      setStartAt(formatToDatetimeLocal(defaultStart));
      setEndAt(formatToDatetimeLocal(defaultEnd));
    }
  }, [taskToEdit, selectedDate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return alert("Vui lòng nhập tiêu đề công việc!");

    const startSec = new Date(startAt).getTime();
    const endSec = new Date(endAt).getTime();

    // Logic kiểm tra chuẩn xác bằng Timestamp (mili-giây)
    if (endSec <= startSec) {
      return alert("Thời gian kết thúc phải lớn hơn thời gian bắt đầu!");
    }

    onSave({
      id: taskToEdit?.id,
      title,
      startAt,
      endAt,
    });
  };

  return (
    <div className="add_task_modal_overlay">
      <div className="add_task_modal">
        <h3>{taskToEdit ? "Chỉnh sửa công việc" : "Thêm công việc mới"}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form_group">
            <label>Tiêu đề</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tên công việc..."
            />
          </div>

          <div className="form_group_row">
            <div className="form_group" style={{ flex: 1 }}>
              <label>Bắt đầu (Ngày & Giờ)</label>
              <input
                type="datetime-local"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
              />
            </div>

            <div className="form_group" style={{ flex: 1 }}>
              <label>Kết thúc (Ngày & Giờ)</label>
              <input
                type="datetime-local"
                value={endAt}
                onChange={(e) => setEndAt(e.target.value)}
              />
            </div>
          </div>

          <div className="form_actions">
            {taskToEdit && (
              <button type="button" className="btn_delete" onClick={() => onDelete(taskToEdit.id)}>
                Xóa
              </button>
            )}
            <button type="button" className="btn_cancel" onClick={onCancel}>
              Hủy
            </button>
            <button type="submit" className="btn_save">
              Lưu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}