const express = require('express');
const router = express.Router();
const PostController = require('../controllers/PostController');
const { uploadPostPhoto, handleMulterError } = require('../middleware/uploadPost');

// GET Routes
router.get('/', PostController.getAllPosts);
router.get('/user', PostController.getPostsByUserId); // Query: ?user_id=123
router.get('/:id', PostController.getPostById);

// POST Routes (with file upload)
router.post('/', uploadPostPhoto, handleMulterError, PostController.createPost);

// PUT Routes (with optional file upload)
router.put('/:id', uploadPostPhoto, handleMulterError, PostController.updatePost);

// DELETE Routes
router.delete('/:id', PostController.deletePost);

module.exports = router;