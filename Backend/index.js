const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/api/tasks", async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ error: "Tham số 'date' là bắt buộc." });
    }

    const startOfDay = new Date(`${date}T00:00:00.000Z`);
    const endOfDay = new Date(`${date}T23:59:59.999Z`);

    const tasks = await prisma.task.findMany({
      where: {
        OR: [
          { startAt: { gte: startOfDay, lte: endOfDay } },
          { endAt: { gte: startOfDay, lte: endOfDay } },
          { startAt: { lte: startOfDay }, endAt: { gte: endOfDay } },
        ],
      },
      orderBy: { startAt: "asc" },
    });

    res.json(tasks);
  } catch (error) {
    console.error(error.message);
    res.status(500);
  }
});

app.post("/api/tasks", async (req, res) => {
  try {
    const { title, startAt, endAt } = req.body;

    if (!title || !startAt || !endAt) {
      return res.status(400).json({
        error: "Vui lòng nhập đầy đủ tiêu đề, thời gian bắt đầu và kết thúc.",
      });
    }

    const startDate = new Date(startAt);
    const endDate = new Date(endAt);

    if (endDate.getTime() <= startDate.getTime()) {
      return res
        .status(400)
        .json({ error: "Thời gian kết thúc phải lớn hơn thời gian bắt đầu." });
    }

    const newTask = await prisma.task.create({
      data: {
        title,
        startAt: startDate,
        endAt: endDate,
      },
    });

    res.status(201).json(newTask);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error });
  }
});

app.put("/api/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, startAt, endAt, isCompleted } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (isCompleted !== undefined) updateData.isCompleted = isCompleted;

    if (startAt !== undefined) updateData.startAt = new Date(startAt);
    if (endAt !== undefined) updateData.endAt = new Date(endAt);

    if (updateData.startAt && updateData.endAt) {
      if (updateData.endAt.getTime() <= updateData.startAt.getTime()) {
        return res.status(400).json({
          error: "Thời gian kết thúc mới phải lớn hơn thời gian bắt đầu.",
        });
      }
    }

    const updatedTask = await prisma.task.update({
      where: { id: Number(id) },
      data: updateData,
    });

    res.json(updatedTask);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Không thể cập nhật thông tin công việc." });
  }
});

app.delete("/api/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.task.delete({
      where: { id: Number(id) },
    });

    res.json({ message: "Xóa công việc thành công" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Không thể thực hiện xóa công việc này." });
  }
});

app.listen(PORT, () => {
  console.log(`Server đang chạy tại port: ${PORT}`);
});
