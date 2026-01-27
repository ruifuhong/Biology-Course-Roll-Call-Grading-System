import * as SessionDateModel from '../models/SessionDateModel.js';
import { io } from '../index.js';

export async function setDiscussionDates(req, res) {
  try {
    const { semester, dates } = req.body;

    console.log('設定討論課日期請求 setDiscussionDates request:', { semester, dates });

    if (!semester || !Array.isArray(dates) || dates.length === 0) {
      return res.status(400).json({
        error: '缺少學期或日期陣列 semester and non-empty dates array are required'
      });
    }
    
    if (req.user && req.user.role === 'ta') {
      if (!req.user.assignedSemesters || !req.user.assignedSemesters.includes(semester)) {
        return res.status(403).json({ error: '無權限存取此學期 Access denied for this semester' });
      }
    }

    const createdDates = [];
    for (const date of dates) {
      try {
        console.log(`建立討論課日期 Creating discussion date: semester=${semester}, date=${date}`);
        const result = await SessionDateModel.createDiscussionDate(semester, date);
        createdDates.push(result);
      } catch (createError) {
        console.error(`建立討論課日期失敗 Error creating discussion date ${date}:`, createError);
        if (createError.message.includes('already exists')) {
          return res.status(409).json({
            error: '日期已存在 Date already exists: ' + createError.message
          });
        }
        throw createError;
      }
    }

    console.log(`成功建立討論課日期 Successfully created ${createdDates.length} discussion dates`);

    const allDates = await SessionDateModel.getDiscussionDatesBySemester(semester);
    res.status(201).json(allDates);
  } catch (error) {
    console.error('設定討論課日期失敗 SessionController setDiscussionDates error:', error);
    console.error('錯誤堆疊 Error stack:', error.stack);
    res.status(500).json({
      error: '設定討論課日期失敗 Failed to set discussion dates',
      details: error.message,
      code: error.code
    });
  }
}

export async function setLectureDates(req, res) {
  try {
    const { semester, dates, attendanceRequired } = req.body;
    console.log('設定正課日期請求 setLectureDates request:', { semester, dates, attendanceRequired });
    if (!semester || !Array.isArray(dates) || dates.length === 0) {
      return res.status(400).json({ 
        error: '缺少學期或日期陣列 semester and non-empty dates array are required' 
      });
    }
    if (req.user && req.user.role === 'ta') {
      if (!req.user.assignedSemesters || !req.user.assignedSemesters.includes(semester)) {
        return res.status(403).json({ error: '無權限存取此學期 Access denied for this semester' });
      }
    }
    const createdDates = [];
    for (const date of dates) {
      try {
        console.log(`建立正課日期 Creating lecture date: semester=${semester}, date=${date}`);
        const result = await SessionDateModel.createLectureDate(semester, date, attendanceRequired !== undefined ? attendanceRequired : true);
        createdDates.push(result);
      } catch (createError) {
        console.error(`建立正課日期失敗 Error creating date ${date}:`, createError);
        if (createError.message.includes('already exists')) {
          return res.status(409).json({ 
            error: '日期已存在 Date already exists: ' + createError.message
          });
        }
        throw createError;
      }
    }
    console.log(`成功建立正課日期 Successfully created ${createdDates.length} lecture dates`);
    const allDates = await SessionDateModel.getLectureDatesBySemester(semester);
    res.status(201).json(allDates);
  } catch (error) {
    console.error('設定正課日期失敗 SessionController setLectureDates error:', error);
    console.error('錯誤堆疊 Error stack:', error.stack);
    res.status(500).json({ 
      error: '設定正課日期失敗 Failed to set lecture dates',
      details: error.message,
      code: error.code 
    });
  }
}

export async function setLectureAttendanceRequired(req, res) {
  try {
    const { semester, actualDate } = req.params;
    const { attendanceRequired } = req.body;
    if (typeof attendanceRequired !== 'boolean') {
      return res.status(400).json({ error: 'attendanceRequired must be boolean' });
    }
    if (req.user && req.user.role === 'ta') {
      if (!req.user.assignedSemesters || !req.user.assignedSemesters.includes(semester)) {
        return res.status(403).json({ error: '無權限存取此學期 Access denied for this semester' });
      }
    }
    const updated = await SessionDateModel.setLectureAttendanceRequired(semester, actualDate, attendanceRequired);
    if (!updated) {
      return res.status(404).json({ error: '查無此正課日期 Lecture date not found' });
    }
    res.json(updated);
  } catch (error) {
    console.error('更新正課點名需求失敗 setLectureAttendanceRequired error:', error);
    res.status(500).json({ error: '更新正課點名需求失敗 Failed to update attendance requirement: ' + error.message });
  }
}

export async function getDiscussionDates(req, res) {
  try {
    const { semester } = req.params;

    if (!semester) {
      return res.status(400).json({ error: '缺少學期參數 semester parameter is required' });
    }
    
    if (req.user && req.user.role === 'ta') {
      if (!req.user.assignedSemesters || !req.user.assignedSemesters.includes(semester)) {
        return res.status(403).json({ error: '無權限存取此學期 Access denied for this semester' });
      }
    }

    const dates = await SessionDateModel.getDiscussionDatesBySemester(semester);

    const datesWithOrder = dates
      .sort((a, b) => new Date(a.actual_date) - new Date(b.actual_date))
      .map((date, index) => ({
        ...date,
        session_order: index + 1
      }));

    res.json(datesWithOrder);
  } catch (error) {
    console.error('取得討論課日期失敗 SessionController getDiscussionDates error:', error);
    res.status(500).json({ error: '取得討論課日期失敗 Failed to get discussion dates: ' + error.message });
  }
}

export async function getLectureDates(req, res) {
  try {
    const { semester } = req.params;
    
    if (!semester) {
      return res.status(400).json({ error: '缺少學期參數 semester parameter is required' });
    }
    
    if (req.user && req.user.role === 'ta') {
      if (!req.user.assignedSemesters || !req.user.assignedSemesters.includes(semester)) {
        return res.status(403).json({ error: '無權限存取此學期 Access denied for this semester' });
      }
    }
    
    const dates = await SessionDateModel.getLectureDatesBySemester(semester);
    
    const datesWithOrder = dates
      .sort((a, b) => new Date(a.actual_date) - new Date(b.actual_date))
      .map((date, index) => ({
        ...date,
        session_order: index + 1
      }));
    
    res.json(datesWithOrder);
  } catch (error) {
    console.error('取得正課日期失敗 SessionController getLectureDates error:', error);
    res.status(500).json({ error: '取得正課日期失敗 Failed to get lecture dates: ' + error.message });
  }
}

export async function updateLectureDate(req, res) {
  try {
    const { semester, oldDate } = req.params;
    const { actualDate } = req.body;
    
    if (req.user && req.user.role === 'ta') {
      if (!req.user.assignedSemesters || !req.user.assignedSemesters.includes(semester)) {
        return res.status(403).json({ error: '無權限存取此學期 Access denied for this semester' });
      }
    }
    if (!actualDate) {
      return res.status(400).json({ error: '缺少日期 actualDate is required' });
    }
    
    const updatedDate = await SessionDateModel.updateLectureDate(semester, oldDate, actualDate);
    
    if (!updatedDate) {
      return res.status(404).json({ error: '查無此正課日期 Lecture date not found' });
    }
    
    res.json(updatedDate);
  } catch (error) {
    console.error('更新正課日期失敗 SessionController updateLectureDate error:', error);
    res.status(500).json({ error: '更新正課日期失敗 Failed to update lecture date: ' + error.message });
  }
}

export async function updateDiscussionDate(req, res) {
  try {
    const { semester, oldDate } = req.params;
    const { actualDate } = req.body;
    
    if (req.user && req.user.role === 'ta') {
      if (!req.user.assignedSemesters || !req.user.assignedSemesters.includes(semester)) {
        return res.status(403).json({ error: '無權限存取此學期 Access denied for this semester' });
      }
    }
    if (!actualDate) {
      return res.status(400).json({ error: '缺少日期 actualDate is required' });
    }

    const updatedDate = await SessionDateModel.updateDiscussionDate(semester, oldDate, actualDate);

    if (!updatedDate) {
      return res.status(404).json({ error: '查無此討論課日期 Discussion date not found' });
    }

    res.json(updatedDate);
  } catch (error) {
    console.error('更新討論課日期失敗 SessionController updateDiscussionDate error:', error);
    res.status(500).json({ error: '更新討論課日期失敗 Failed to update discussion date: ' + error.message });
  }
}

export async function deleteLectureDate(req, res) {
  try {
    const { semester, actualDate } = req.params;
    
    if (req.user && req.user.role === 'ta') {
      if (!req.user.assignedSemesters || !req.user.assignedSemesters.includes(semester)) {
        return res.status(403).json({ error: '無權限存取此學期 Access denied for this semester' });
      }
    }
    const deletedDate = await SessionDateModel.deleteLectureDate(semester, actualDate);
    if (!deletedDate) {
      return res.status(404).json({ error: '查無此正課日期 Lecture date not found' });
    }
    res.json({ message: '正課日期刪除成功 Lecture date deleted successfully', date: deletedDate });
  } catch (error) {
    console.error('刪除正課日期失敗 SessionController deleteLectureDate error:', error);
    res.status(500).json({ error: '刪除正課日期失敗 Failed to delete lecture date: ' + error.message });
  }
}

export async function deleteDiscussionDate(req, res) {
  try {
    const { semester, actualDate } = req.params;
    
    if (req.user && req.user.role === 'ta') {
      if (!req.user.assignedSemesters || !req.user.assignedSemesters.includes(semester)) {
        return res.status(403).json({ error: 'Access denied for this semester' });
      }
    }
    const deletedDate = await SessionDateModel.deleteDiscussionDate(semester, actualDate);
    if (!deletedDate) {
      return res.status(404).json({ error: '查無此討論課日期 Discussion date not found' });
    }
    res.json({ message: '討論課日期刪除成功 Discussion date deleted successfully', date: deletedDate });
  } catch (error) {
    console.error('刪除討論課日期失敗 SessionController deleteDiscussionDate error:', error);
    res.status(500).json({ error: '刪除討論課日期失敗 Failed to delete discussion date: ' + error.message });
  }
}

export async function toggleLectureAttendance(req, res) {
  try {
    const { semester, selectedDate } = req.params;
    const { status } = req.body;

    if (req.user && req.user.role === 'ta') {
      if (!req.user.assignedSemesters || !req.user.assignedSemesters.includes(semester)) {
        return res.status(403).json({ error: '無權限存取此學期 Access denied for this semester' });
      }
    }
    if (!['open', 'closed'].includes(status)) {
      return res.status(400).json({ error: "status 必須為 'open' 或 'closed' status must be 'open' or 'closed'" });
    }
    const updatedDate = await SessionDateModel.toggleLectureAttendance(
      semester,
      selectedDate,
      status
    );
    if (!updatedDate) {
      return res.status(404).json({ error: '查無此正課日期 Lecture date not found' });
    }

    console.log('Emitting rollcallState:', {
      type: 'lecture',
      semester,
      actualDate: selectedDate,
      status: updatedDate.status
    });
    io.emit('rollcallState', {
      type: 'lecture',
      semester,
      actualDate: selectedDate,
      status: updatedDate.status
    });
    res.json(updatedDate);

  } catch (error) {
    console.error("🔥 控制器錯誤 Controller error:", error);
    res.status(500).json({ error: '切換正課點名狀態失敗 Failed to toggle lecture attendance: ' + error.message });
  }
}

export async function toggleDiscussionAttendance(req, res) {
  try {
    const { semester, selectedDate } = req.params;
    const { status } = req.body;

    if (req.user && req.user.role === 'ta') {
      if (!req.user.assignedSemesters || !req.user.assignedSemesters.includes(semester)) {
        return res.status(403).json({ error: '無權限存取此學期 Access denied for this semester' });
      }
    }
    if (!['open', 'late', 'closed'].includes(status)) {
      return res.status(400).json({ error: "status 必須為 'open', 'late', 或 'closed' status must be 'open', 'late', or 'closed'" });
    }
    const updatedDate = await SessionDateModel.toggleDiscussionAttendance(semester, selectedDate, status);
    if (!updatedDate) {
      return res.status(404).json({ error: '查無此討論課日期 Discussion date not found' });
    }

    io.emit('rollcallState', {
      type: 'discussion',
      semester,
      actualDate: selectedDate,
      status: updatedDate.status
    });

    res.json(updatedDate);
  } catch (error) {
    console.error('切換討論課點名狀態失敗 SessionController toggleDiscussionDate error:', error);
    res.status(500).json({ error: '切換討論課點名狀態失敗 Failed to toggle discussion attendance: ' + error.message });
  }
}