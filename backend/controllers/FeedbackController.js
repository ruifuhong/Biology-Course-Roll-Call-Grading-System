import * as FeedbackModel from '../models/FeedbackModel.js';

function canAccessSemester(user, semester) {
  if (!user || user.role !== 'ta') return true;
  return user.assignedSemesters && user.assignedSemesters.includes(semester);
}


export async function getAllLectureFeedback(req, res) {
  try {
    const { semester } = req.params;
    if (!semester) {
      return res.status(400).json({ error: '缺少學期參數 semester parameter is required' });
    }
    if (!canAccessSemester(req.user, semester)) {
      return res.status(403).json({ error: '無權限存取此學期 Access denied for this semester' });
    }
    const feedbackItems = await FeedbackModel.findLectureFeedbackBySemester(semester);
    res.json(feedbackItems);
  } catch (error) {
    console.error('取得正課回饋失敗 FeedbackController getAllLectureFeedback error:', error);
    res.status(500).json({ error: '取得正課回饋失敗 Failed to get lecture feedback: ' + error.message });
  }
}

export async function createLectureFeedback(req, res) {
  try {
    const { studentId, name, semester, actual_date, feedback } = req.body;
    console.log('建立正課回饋 Creating feedback:', { studentId, name, semester, actual_date, feedback });

    if (!studentId || !name || !semester || !actual_date) {
      return res.status(400).json({ error: '缺少必要欄位（學號、姓名、學期、日期）All fields are required: studentId, name, semester, actual_date' });
    }
    if (typeof studentId !== 'string' || studentId.trim().length === 0) {
      return res.status(400).json({ error: '學號不得為空 studentId must be a non-empty string' });
    }
    if (typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: '姓名不得為空 name must be a non-empty string' });
    }
    if (typeof semester !== 'string' || semester.trim().length === 0) {
      return res.status(400).json({ error: '學期不得為空 semester must be a non-empty string' });
    }
    if (typeof actual_date !== 'string' || actual_date.trim().length === 0) {
      return res.status(400).json({ error: '日期不得為空 actual_date must be a non-empty string' });
    }

    const newFeedback = await FeedbackModel.createLectureFeedback({
      studentId: studentId.trim(),
      name: name.trim(),
      semester: semester.trim(),
      actual_date: actual_date.trim(),
      feedback: feedback.trim()
    });

    res.status(201).json(newFeedback);
  } catch (error) {
    console.error('新增正課回饋失敗 FeedbackController createFeedback error:', error);
    res.status(500).json({ error: '新增正課回饋失敗 Failed to create lecture feedback: ' + error.message });
  }
}

export async function getAllDiscussionFeedback(req, res) {
  try {
    const { semester } = req.params;
    if (!semester) {
      return res.status(400).json({ error: '缺少學期參數 semester parameter is required' });
    }
    if (!canAccessSemester(req.user, semester)) {
      return res.status(403).json({ error: '無權限存取此學期 Access denied for this semester' });
    }
    const feedbackItems = await FeedbackModel.findDiscussionFeedbackBySemester(semester);
    res.json(feedbackItems);
  } catch (error) {
    console.error('取得討論課回饋失敗 FeedbackController getAllDiscussionFeedback error:', error);
    res.status(500).json({ error: '取得討論課回饋失敗 Failed to get discussion feedback: ' + error.message });
  }
}

export async function createDiscussionFeedback(req, res) {
  try {
    const { studentId, name, semester, actual_date, feedback } = req.body;
    console.log('建立討論課回饋 Creating discussion feedback:', { studentId, name, semester, actual_date, feedback });

    if (!studentId || !name || !semester || !actual_date) {
      return res.status(400).json({ error: '缺少必要欄位（學號、姓名、學期、日期）All fields are required: studentId, name, semester, actual_date' });
    }
    if (typeof studentId !== 'string' || studentId.trim().length === 0) {
      return res.status(400).json({ error: '學號不得為空 studentId must be a non-empty string' });
    }
    if (typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: '姓名不得為空 name must be a non-empty string' });
    }
    if (typeof semester !== 'string' || semester.trim().length === 0) {
      return res.status(400).json({ error: '學期不得為空 semester must be a non-empty string' });
    }
    if (typeof actual_date !== 'string' || actual_date.trim().length === 0) {
      return res.status(400).json({ error: '日期不得為空 actual_date must be a non-empty string' });
    }

    const newFeedback = await FeedbackModel.createDiscussionFeedback({
      studentId: studentId.trim(),
      name: name.trim(),
      semester: semester.trim(),
      actual_date: actual_date.trim(),
      feedback: feedback.trim()
    });

    res.status(201).json(newFeedback);
  } catch (error) {
    console.error('新增討論課回饋失敗 FeedbackController createDiscussionFeedback error:', error);
    res.status(500).json({ error: '新增討論課回饋失敗 Failed to create discussion feedback: ' + error.message });
  }
}