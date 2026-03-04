const express = require('express');
const router = express.Router();

const { createMood, getMoods, deleteMood } = require('../controllers/moodController');

router.post('/', createMood);         
router.get('/:userId', getMoods);       
router.delete('/:id', deleteMood);      

module.exports = router;