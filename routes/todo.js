const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Todo = require('../models/ToDoModel');

// Create a new to-do item
router.post('/', auth, async (req, res) => {
  try {
    const newTodo = new Todo({
      user: req.user.id,
      title: req.body.title,
    });

    const todo = await newTodo.save();
    res.json(todo);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get all to-do items for the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const todos = await Todo.find({ user: req.user.id });
    res.json(todos);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Update a to-do item
router.put('/:id', auth, async (req, res) => {
  const { title, completed } = req.body;

  try {
    let todo = await Todo.findById(req.params.id);

    if (!todo) {
      return res.status(404).json({ msg: 'To-do item not found' });
    }

    // Check if the user owns the to-do item
    if (todo.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    todo = await Todo.findByIdAndUpdate(
      req.params.id,
      { $set: { title, completed } },
      { new: true }
    );

    res.json(todo);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Delete a to-do item
router.delete('/:id', auth, async (req, res) => {
  try {
    let todo = await Todo.findById(req.params.id);

    if (!todo) {
      return res.status(404).json({ msg: 'To-do item not found' });
    }

    // Check if the user owns the to-do item
    if (todo.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await Todo.findByIdAndDelete(req.params.id);

    res.json({ msg: 'To-do item removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
