import asyncHandler from "express-async-handler";
import TaskModel from "../../models/tasks/TaskModel.js";

export const createTask = asyncHandler(async (req, res) => {
  try {
    const { title, description, dueDate, priority, status } = req.body;

    //если нет заголовка или заголовок - это просто пробел
    if (!title || title.trim() === "") {
      return res.status(400).json({ message: "Укажите название задачи" });
    }

    const taskExists = await TaskModel.findOne({ title });

    if (taskExists) {
      return res
        .status(400)
        .json({ message: "Задача с таким названием уже существует" });
    }

    const task = new TaskModel({
      title,
      description,
      dueDate,
      priority,
      status,
      user: req.user._id,
    });

    await task.save();

    return res.status(201).json({ message: "Задача успешно создана", task });
  } catch (error) {
    console.log("Ошибка в создании задачи");
    return res
      .status(500)
      .json({ message: "Не удаётся создать задачу", error });
  }
});

export const getTasks = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;

    if (!userId) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    const tasks = await TaskModel.find({ user: userId });

    return res.status(200).json({
      length: tasks.length,
      tasks,
    });
  } catch (error) {
    console.log("Ошибка получения списка задач", error);
    return res
      .status(500)
      .json({ message: "Ошибка получения списка задач", error: `${error}` });
  }
});

export const getTask = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    if (!userId) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    if (!id) {
      return res.status(404).json({ message: "Ошибка идентификатора задачи" });
    }

    const task = await TaskModel.findById(id);

    if (!task) {
      return res.status(404).json({ message: "Задача не найдена" });
    }
    if (!task.user.equals(userId)) {
      return res.status(401).json({
        message: "Вы не авторизованны",
      });
    }
    return res.status(200).json(task);
  } catch (error) {
    console.log("Ошибка получения задачи", error);
    return res.status(500).json({ message: "Ошибка получения задачи" });
  }
});

export const updateTask = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const task = await TaskModel.findById(id);

    const { title, description, dueDate, priority, status, completed } =
      req.body;

    if (!id) {
      res.status(404).json({ message: "Ошибка идентификатора задачи" });
    }
    if (!task) {
      res.status(404).json({ message: "Задача не найдена" });
    }
    if (!task.user.equals(userId)) {
      res.status(401).json({
        message: "Вы не авторизованны",
      });
    }

    //обновить данные или оставить старые
    task.title = title || task.title;
    task.description = description || task.description;
    task.dueDate = dueDate || task.dueDate;
    task.priority = priority || task.priority;
    task.status = status || task.status;
    task.completed = completed || task.completed;

    await task.save();

    return res.status(200).json(task);
  } catch (error) {
    console.log("Ошибка редактирования задачи", error);
    res
      .status(500)
      .json({ message: "Ошибка редактирования задачи", error: `${error}` });
  }
});

export const deleteTask = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const task = await TaskModel.findById(id);
    if (!id) {
      res.status(404).json({ message: "Ошибка идентификатора задачи" });
    }
    if (!task) {
      res.status(404).json({ message: "Задача не найдена" });
    }
    if (!task.user.equals(userId)) {
      res.status(401).json({
        message: "Вы не авторизованны",
      });
    }

    await TaskModel.findByIdAndDelete(id);

    return res.status(200).json({ message: "Задача успешно удалена" });
  } catch (error) {
    console.log("Ошибка удаления задачи", error);
    res
      .status(500)
      .json({ message: "Ошибка удаления задачи", error: `${error}` });
  }
});

export const deleteAllTasks = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id; // Получаем ID пользователя из токена

    // Находим все задачи для текущего пользователя
    const tasks = await TaskModel.find({ user: userId });

    // Если задачи не найдены
    if (tasks.length === 0) {
      return res.status(404).json({ message: "Задачи не найдены" });
    }

    // Удаляем все задачи текущего пользователя
    await TaskModel.deleteMany({ user: userId });

    return res.status(200).json({ message: "Все задачи успешно удалены" });
  } catch (error) {
    console.log("Ошибка удаления всех задач", error);
    res
      .status(500)
      .json({ message: "Ошибка удаления задач", error: `${error}` });
  }
});
