import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Укажите название задачи"],
      unique: true,
    },

    description: {
      type: String,
      default: "Задача создана без описания",
    },

    dueDate: {
      type: Date,
      default: Date.now(),
    },

    status: {
      type: String,
      enum: ["активна", "неактивна"],
      default: "активна",
    },

    completed: {
      type: Boolean,
      default: false,
    },

    priority: {
      type: String,
      enum: ["низкий", "средний", "высокий"],
      default: "низкий",
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      requierd: true,
    },
  },
  {
    timestamps: true,
  }
);

const TaskModel = mongoose.model("Task", TaskSchema);

export default TaskModel;
