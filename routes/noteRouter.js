import express from "express";
import noteController from "../controllers/noteController.js";

const noteRouter = express.Router();

noteRouter.get("/info", noteController.getNotesInfo);
noteRouter.get("/", noteController.getNotes);
noteRouter.get("/:id", noteController.getNote);
noteRouter.delete("/:id", noteController.deleteNote);
noteRouter.post("/", noteController.createNote);
noteRouter.put("/:id", noteController.updateNote);

export default noteRouter;
