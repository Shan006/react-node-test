const express = require('express');
const router = express.Router();
const { 
  add, 
  index, 
  view, 
  deleteData, 
  deleteMany 
} = require('../../controllers/meeting/meeting');

// GET all meetings with optional filtering
router.get('/', index);

// GET single meeting by ID
router.get('/view/:id', view);

// POST create new meeting
router.post('/add', add);

// DELETE single meeting (soft delete)
router.delete('/delete/:id', deleteData);

// DELETE multiple meetings (soft delete)
router.post('/deleteMany', deleteMany);

module.exports = router;