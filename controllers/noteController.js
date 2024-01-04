import Note from "../models/Note.js";
import jwt from "jsonwebtoken";
import getTokenFrom from "../utils/getTokenFrom.js";
import config from "../utils/config.js";
import User from "../models/User.js";
import uploadFile from "../utils/uploadFile.js";
import { deleteObject, ref } from "firebase/storage";
import storage from "../utils/firebaseConfig.js";

async function getNotesInfo(_, res, next) {
  try {
    const notes = await Note.find({});
    const notesCount = await notes.length;
    return res.send(`<p>Notes App have ${notesCount} notes</p>`);
  } catch (error) {
    next(error);
  }
}

async function getNotes(req, res, next) {
  try {
    const decodedToken = jwt.verify(getTokenFrom(req), config.JWT_SECRET);

    const notes = await Note.find({ userId: decodedToken.id }).populate(
      "userId",
      {
        username: 1,
        name: 1,
      }
    );
    return res.json(notes);
  } catch (error) {
    next(error);
  }
}

async function getNote(req, res, next) {
  const id = req.params.id;

  try {
    const note = await Note.findById(id);
    if (!note) return res.status(404).json({ message: "Note not found!" });
    return res.json(note);
  } catch (error) {
    next(error);
  }
}

async function deleteNote(req, res, next) {
  const id = req.params.id;
  const decodedToken = jwt.verify(getTokenFrom(req), config.JWT_SECRET);

  try {
    const user = await User.findById(decodedToken.id);
    const note = await Note.findByIdAndDelete(id);

    // Delete photo from Firebase Storage
    const photoRef = ref(storage, note.photoInfo.filename);
    await deleteObject(photoRef);

    user.notes = user.notes.filter(
      (noteId) => noteId.toString() !== note._id.toString()
    );
    await user.save();

    return res.status(204).end();
  } catch (error) {
    next(error);
  }
}

async function createNote(req, res, next) {
  const body = req.body;
  const file = req.file;

  try {
    const decodedToken = jwt.verify(getTokenFrom(req), config.JWT_SECRET);

    if (!decodedToken.id) {
      return res.status(401).json({ error: "token invalid" });
    }

    const user = await User.findById(decodedToken.id);

    if (!body.content) {
      return res.status(400).json({ error: "content missing" });
    }

    const photoInfo = await uploadFile(file);

    const note = new Note({
      content: body.content,
      important: body.important || false,
      userId: user.id,
      photoInfo,
    });

    const savedNote = await note.save().then((result) => result);

    user.notes = user.notes.concat(savedNote._id);
    await user.save();

    return res.status(201).json(savedNote);
  } catch (error) {
    next(error);
  }
}

async function updateNote(req, res, next) {
  const id = req.params.id;
  const { content, important } = req.body;
  const note = {
    content,
    important,
  };

  try {
    const updatedNote = await Note.findByIdAndUpdate(id, note, {
      new: true,
      runValidators: true,
      context: "query",
    });

    if (!updatedNote) return res.status(404).send({ error: "Note not found!" });

    return res.status(200).json(updatedNote);
  } catch (error) {
    next(error);
  }
}

export default {
  getNotesInfo,
  getNotes,
  getNote,
  deleteNote,
  createNote,
  updateNote,
};
