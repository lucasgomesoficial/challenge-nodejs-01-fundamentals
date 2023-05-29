import { randomUUID } from "node:crypto";
import { Database } from "./db.js";
import { buildRoutePath } from "./utils/build-route-path.js";

const database = new Database();

export const routes = [
  {
    method: "GET",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      const { search } = req.query;

      const tasks = database.select(
        "tasks",
        search
          ? {
              title: search,
              description: search,
            }
          : null
      );

      return res.end(JSON.stringify(tasks));
    },
  },
  {
    method: "POST",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      const { title, description } = req.body;

      if (!title) {
        return res
          .writeHead(400)
          .end(JSON.stringify({ message: "title is required" }));
      }

      if (!description) {
        return res
          .writeHead(400)
          .end(JSON.stringify({ message: "description is required" }));
      }

      const task = {
        id: randomUUID(),
        title,
        description,
        completed_at: null,
        created_at: new Date(),
        updated_at: null,
      };

      database.insert("tasks", task);

      return res.writeHead(201).end();
    },
  },
  {
    method: "PUT",
    path: buildRoutePath("/tasks/:id"),
    handler: (req, res) => {
      const { id } = req.params;
      const { title, description } = req.body;

      const rowData = database.validateRow("tasks", id);

      if (!rowData) {
        return res
          .writeHead(404)
          .end(JSON.stringify({ message: "ID not found" }));
      }

      if (!title && !description) {
        return res
          .writeHead(400)
          .end(JSON.stringify({ message: "Title or description are required" }));
      }

      const updatedData = {
        ...rowData,
        title: title || rowData.title,
        description: description || rowData.description,
        updated_at: new Date(),
      };

      database.update("tasks", id, updatedData);

      return res.writeHead(204).end();
    },
  },
  {
    method: "PATCH",
    path: buildRoutePath("/tasks/:id/complete"),
    handler: (req, res) => {
      const { id } = req.params;

      const rowData = database.validateRow("tasks", id);

      if (!rowData) {
        return res
          .writeHead(404)
          .end(JSON.stringify({ message: "ID not found" }));
      }

      const isTaskCompleted = !!rowData.completed_at

      const updatedData = {
        ...rowData,
        completed_at: isTaskCompleted ? null : new Date()
      };

      database.update("tasks", id, updatedData);

      return res.writeHead(204).end();
    },
  },
  {
    method: "DELETE",
    path: buildRoutePath("/tasks/:id"),
    handler: (req, res) => {
      const { id } = req.params;

      const rowData = database.validateRow("tasks", id);

      if (!rowData) {
        return res
          .writeHead(404)
          .end(JSON.stringify({ message: "ID not found" }));
      }

      database.delete("tasks", id);

      return res.writeHead(204).end();
    },
  },
];
