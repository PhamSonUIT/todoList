import React from "react";
import "../css/Task.css";

export default function Task({ tasks, overdueTasks, selectedDate, onTaskClick, onToggleComplete }) {
  
  const hoursTimeline = Array.from({ length: 24 }, (_, i) => {
    return String(i).padStart(2, "0") + ":00";
  });

  const extractTimeFromISO = (isoString) => {
    if (!isoString) return "00:00";
    const dateObj = new Date(isoString);
    const hours = String(dateObj.getHours()).padStart(2, "0");
    const minutes = String(dateObj.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  // 1. Hàm tính toán vị trí Top và Height (Trả về mốc phút tuyệt đối trong ngày để thuật toán so sánh)
  const calculatePositionValues = (task) => {
    const startObj = new Date(task.startAt);
    const endObj = new Date(task.endAt);
    
    const formatDate = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const viewingDateStr = formatDate(new Date(selectedDate));
    const taskStartDateStr = formatDate(startObj);
    const taskEndDateStr = formatDate(endObj);

    let startHour = startObj.getHours();
    let startMinute = startObj.getMinutes();
    let endHour = endObj.getHours();
    let endMinute = endObj.getMinutes();

    if (viewingDateStr === taskEndDateStr && viewingDateStr !== taskStartDateStr) {
      startHour = 0; startMinute = 0;
    }
    if (viewingDateStr === taskStartDateStr && viewingDateStr !== taskEndDateStr) {
      endHour = 24; endMinute = 0;
    }
    if (viewingDateStr !== taskStartDateStr && viewingDateStr !== taskEndDateStr) {
      startHour = 0; startMinute = 0; endHour = 24; endMinute = 0;
    }

    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    
    return {
      startMinutes,
      endMinutes,
      top: (startMinutes / 60) * 60,
      height: ((endMinutes - startMinutes) / 60) * 60,
      startTimeStr: extractTimeFromISO(task.startAt),
      endTimeStr: extractTimeFromISO(task.endAt)
    };
  };

  // 2. THUẬT TOÁN PHÂN CHIA CỘT KHI TRÙNG GIỜ (GOOGLE CALENDAR LOGIC)
  const renderPositionedTasks = () => {
    // Bước A: Tính toán mốc phút cho toàn bộ các task hiện tại
    const positionedTasks = tasks.map(task => ({
      ...task,
      ...calculatePositionValues(task),
      column: 0,
      totalColumns: 1
    }));

    // Sắp xếp các task theo thời gian bắt đầu tăng dần
    positionedTasks.sort((a, b) => a.startMinutes - b.startMinutes);

    // Bước B: Gom cụm các nhóm task va chạm (giao nhau)
    let group = [];
    let maxEndMinutes = 0;

    const applyColumnsToGroup = (currentGroup) => {
      if (currentGroup.length === 0) return;
      
      // Tính toán số cột và phân chia vị trí không đè lên nhau trong nhóm
      const columns = [];
      
      currentGroup.forEach(task => {
        let colIndex = 0;
        // Tìm cột đầu tiên trống (không trùng khung giờ với task trước đó trong cột đó)
        while (columns[colIndex] && columns[colIndex].some(tIndex => {
          const t = currentGroup.find(item => item.id === tIndex);
          return !(task.startMinutes >= t.endMinutes || task.endMinutes <= t.startMinutes);
        })) {
          colIndex++;
        }

        if (!columns[colIndex]) columns[colIndex] = [];
        columns[colIndex].push(task.id);
        task.column = colIndex;
      });

      // Gán tổng số cột cho tất cả các task trong cụm va chạm này
      currentGroup.forEach(task => {
        task.totalColumns = columns.length;
      });
    };

    positionedTasks.forEach(task => {
      // Nếu task mới bắt đầu sau khi tất cả các task trước đó đã kết thúc -> Hết một cụm va chạm cũ
      if (group.length > 0 && task.startMinutes >= maxEndMinutes) {
        applyColumnsToGroup(group);
        group = [];
        maxEndMinutes = 0;
      }
      group.push(task);
      maxEndMinutes = Math.max(maxEndMinutes, task.endMinutes);
    });
    
    // Áp dụng nốt cho cụm cuối cùng
    applyColumnsToGroup(group);

    // Bước C: Vẽ giao diện HTML với width động
    return positionedTasks.map((task) => {
      const isOverdue = overdueTasks.some((o) => o.id === task.id);
      const statusClass = task.isCompleted ? "task_done" : isOverdue ? "task_overdue" : "";

      // Thuật toán chia cột phần trăm chiều rộng (%)
      const widthPercent = 100 / task.totalColumns;
      const leftPercent = task.column * widthPercent;

      return (
        <div
          key={task.id}
          className={`calendar_task_block ${statusClass}`}
          style={{
            position: "absolute",
            top: `${task.top}px`,
            height: `${task.height}px`,
            // Đổi từ giá trị px tĩnh sang chia tỷ lệ % linh hoạt
            left: `calc(${leftPercent}% + 4px)`,
            width: `calc(${widthPercent}% - 8px)`,
            zIndex: 10 + task.column,
            pointerEvents: "auto",
          }}
          onClick={() => onTaskClick(task)}
        >
          <div 
            className={`task_checkbox ${task.isCompleted ? "checked" : ""}`}
            onClick={(e) => onToggleComplete(task.id, e)}
          >
            {task.isCompleted && "✓"}
          </div>

          <div className="task_info_wrapper">
            <span className="task_block_title">{task.title}</span>
            <span className="task_block_time">
              {task.startTimeStr} - {task.endTimeStr}
            </span>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="calendar_time_view" style={{ position: "relative", width: "100%", boxSizing: "border-box" }}>
      {/* LAYER 1: KHUNG NỀN */}
      <div className="timeline_lines_background">
        {hoursTimeline.map((hour) => (
          <div key={hour} className="time_row">
            <span className="time_label">{hour}</span>
            <div className="grid_line_cell"></div>
          </div>
        ))}
      </div>

      {/* LAYER 2: CÁC KHỐI LAYER TASK TỰ ĐỘNG CHIA CỘT */}
      <div
        className="timeline_tasks_layer"
        style={{
          position: "absolute",
          top: "16px",
          left: "81px",
          right: "16px",
          height: "1440px",
          pointerEvents: "none",
        }}
      >
        {renderPositionedTasks()}
      </div>
    </div>
  );
}