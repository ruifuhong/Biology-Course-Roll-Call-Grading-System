import * as ReviewModel from '../models/ReviewModel.js';
import * as StudentModel from '../models/StudentModel.js';

export async function getReviewInfo(req, res) {
  try {
    const { semester, studentId } = req.params;

    const student = await StudentModel.findStudentById(semester, studentId);
    if (!student) {
      return res.status(404).json({ error: '請確認您輸入的學號是否正確 Please confirm the student ID number entered' });
    }

    let actual_date = new Date().toISOString().split('T')[0];
    const hasAttendance = await ReviewModel.hasDiscussionAttendance(semester, actual_date, studentId);
    if (!hasAttendance) {
      return res.json({
        student,
        noAttendance: true
      });
    }

    const group_name = student.group_name;
    const groupMembers = await StudentModel.findBySemesterAndGroup(semester, group_name);
    
    let groupNum = parseInt(group_name, 10);
    let groupSet = [];
    if (groupNum >= 1 && groupNum <= 5) {
      groupSet = ['1','2','3','4','5'];
    } else if (groupNum >= 6 && groupNum <= 10) {
      groupSet = ['6','7','8','9','10'];
    }
    
    const classGroups = await StudentModel.findGroupsWithMembers(semester, groupSet);

    const groupMemberIds = groupMembers.map(m => m.student_id);
    const attendanceStatusMap = await ReviewModel.getDiscussionAttendanceStatus(semester, actual_date, groupMemberIds);
    const groupMembersWithAttendance = groupMembers.map(m => ({
      ...m,
      attendance_status: attendanceStatusMap[m.student_id] || 'absent'
    }));

    res.json({
      student,
      groupMembers: groupMembersWithAttendance,
      classGroups
    });
  } catch (err) {
    console.error('取得組內與組間互評資訊失敗 Failed to get intra/inter-group review info:', err);
    res.status(500).json({ error: '伺服器錯誤 Server error', details: err.message });
  }
}

export async function submitIntraReviews(req, res) {
  try {
    const { reviews } = req.body;
    if (!Array.isArray(reviews) || reviews.length === 0) {
      return res.status(400).json({ error: 'No reviews provided' });
    }
    const count = await ReviewModel.insertIntraReviews(reviews);
    res.json({ success: true, inserted: count });
  } catch (err) {
    // Check for unique constraint violation (PostgreSQL error code 23505)
    if (err.code === '23505') {
      return res.status(409).json({ error: '您已提交過本次評分 You have already submitted reviews for this session.' });
    }
    console.error('組內互評寫入失敗 Failed to insert intra-group reviews:', err);
    res.status(500).json({ error: '伺服器錯誤 Server error', details: err.message });
  }
}

export async function submitInterReviews(req, res) {
  try {
    const { reviews } = req.body;
    if (!Array.isArray(reviews) || reviews.length === 0) {
      return res.status(400).json({ error: 'No reviews provided' });
    }
    const count = await ReviewModel.insertInterReviews(reviews);
    res.json({ success: true, inserted: count });
  } catch (err) {
    // Check for unique constraint violation (PostgreSQL error code 23505)
    if (err.code === '23505') {
      return res.status(409).json({ error: '您已提交過本次評分 You have already submitted reviews for this session.' });
    }
    console.error('組間互評寫入失敗 Failed to insert inter-group reviews:', err);
    res.status(500).json({ error: '伺服器錯誤 Server error', details: err.message });
  }
}

export async function getIntraReviewSummary(req, res) {
  try {
    const { semester } = req.params;
    const summary = await ReviewModel.getIntraReviewSummary(semester);
    res.json(summary);
  } catch (err) {
    console.error('取得組內互評彙總失敗 Failed to get intra-group review summary:', err);
    res.status(500).json({ error: '伺服器錯誤 Server error', details: err.message });
  }
}

export async function getInterReviewSummary(req, res) {
  try {
    const { semester } = req.params;
    const summary = await ReviewModel.getInterReviewSummary(semester);
    res.json(summary);
  } catch (err) {
    console.error('取得組間互評彙總失敗 Failed to get inter-group review summary:', err);
    res.status(500).json({ error: '伺服器錯誤 Server error', details: err.message });
  }
}

export async function getDenominators(req, res) {
  try {
    const { semester } = req.params;
    const rows = await ReviewModel.getDenominatorsBySemester(semester);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: '取得應出席次數失敗 Failed to fetch denominators', details: err.message });
  }
}

export async function putDenominator(req, res) {
  try {
    const { semester, student_id, denominator } = req.body;
    if (!semester || !student_id || !denominator || denominator < 1) {
      return res.status(400).json({ error: '輸入資料無效 Invalid input' });
    }
    await ReviewModel.upsertDenominator(semester, student_id, denominator);
    res.json({ success: true, message: '應出席次數已更新 Required sessions updated' });
  } catch (err) {
    res.status(500).json({ error: '更新應出席次數失敗 Failed to upsert denominator', details: err.message });
  }
}

export async function checkReviewDuplicate(req, res) {
  const { reviewerId, reviewerGroupId, semester, actualDate } = req.params;
  if (!semester || !actualDate || (!reviewerId && !reviewerGroupId)) {
    return res.status(400).json({ error: '缺少必要參數 Missing required parameters' });
  }
  try {
    const exists = await ReviewModel.checkAnyReviewExists({ reviewerId, reviewerGroupId, semester, actualDate });
    res.json({ exists });
  } catch (err) {
    res.status(500).json({ error: '資料庫錯誤 Database error', details: err.message });
  }
}