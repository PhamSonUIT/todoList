import React from "react";
import { useState, useEffect } from "react";
import "../css/Calendar.css";

export default function Calendar({ onAddTaskClick, onDateChange }) {
  const [now, setNow] = useState(new Date());
  
  // State 1: Lưu Ngày đang được CLICK CHỌN (Mặc định ban đầu là hôm nay)
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // State 2: Lưu Tháng/Năm đang hiển thị trên giao diện lịch nhỏ (để bấm chuyển tháng)
  const [viewDate, setViewDate] = useState(new Date());

  const getDaysInMonthMatrix = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const startDayOfWeek = firstDayOfMonth.getDay();
    const days = [];

    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({
        dayNumber: prevDate.getDate(),
        date: prevDate,
        isCurrentMonth: false,
      });
    }
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const currentFullDate = new Date(year, month, i);
      days.push({ dayNumber: i, date: currentFullDate, isCurrentMonth: true });
    }
    const remainingSlots = 42 - days.length;
    for (let i = 1; i <= remainingSlots; i++) {
      const nextDate = new Date(year, month + 1, i);
      days.push({ dayNumber: i, date: nextDate, isCurrentMonth: false });
    }
    return days;
  };

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Thay vì dùng `now`, ma trận ngày sẽ tính dựa trên `viewDate` để bấm chuyển tháng được
  const miniCalendarDays = getDaysInMonthMatrix(viewDate);

  const weekdays = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

  // --- Hàm xử lý chuyển đổi tháng ---
  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  // --- Hàm xử lý khi click chọn ngày ---
  const handleDateClick = (clickedDate) => {
    setSelectedDate(clickedDate);
    if (onDateChange) {
      onDateChange(clickedDate); // Gửi ngày được chọn lên App.jsx
    }
  };

  return (
    <div style={{ display: "flex", width: "100vw" }}>
      <div className="calendar">
        <button className="btn_add_task" onClick={onAddTaskClick}>Thêm</button>

        {/* Cụm chuyển tháng chuẩn chỉnh */}
        <div className="mini_cal_header">
          <span className="mini_cal_title">
            Tháng {viewDate.getMonth() + 1}, {viewDate.getFullYear()}
          </span>
          <div className="mini_cal_nav">
            <button type="button" onClick={handlePrevMonth} className="nav_arrow_btn">&lt;</button>
            <button type="button" onClick={handleNextMonth} className="nav_arrow_btn">&gt;</button>
          </div>
        </div>

        <div className="day_of_week">
          {weekdays.map((day, i) => (
            <span key={i}>{day}</span>
          ))}
        </div>

        <div className="day_of_month">
          {miniCalendarDays.map((day, i) => {
            const isToday = day.date.toDateString() === now.toDateString();
            const isSelected = day.date.toDateString() === selectedDate.toDateString();

            return (
              <span
                key={i}
                onClick={() => handleDateClick(day.date)}
                className={`day 
                  ${day.isCurrentMonth ? "current_month" : ""} 
                  ${isToday ? "is_today" : ""}
                  ${isSelected && !isToday ? "is_selected" : ""}
                `}
              >
                {day.dayNumber}
              </span>
            );
          })}
        </div>
      </div>

      <div className="task_list"></div>
    </div>
  );
}