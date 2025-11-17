import express from 'express';
import * as StudentController from '../controllers/StudentController.js';

const router = express.Router();

router.post('/', StudentController.createStudent);
router.get('/:semester', StudentController.getStudentsBySemester);
router.get('/:semester/:studentId', StudentController.getStudentById);
router.put('/:semester/:studentId', StudentController.updateStudent);
router.delete('/:semester/:studentId', StudentController.deleteStudent);

router.post('/upload-csv', StudentController.uploadStudentsCSV);

export default router;