const express = require('express');
const router = express.Router();
const { 
  add, 
  index, 
  view, 
  deleteData, 
  deleteMany 
} = require('../../controllers/meeting/meeting');

router.get('/', index);

router.get('/view/:id', view);

router.post('/add', add);

router.delete('/delete/:id', deleteData);

router.post('/deleteMany', deleteMany);

module.exports = router;