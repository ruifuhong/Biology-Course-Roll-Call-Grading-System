import * as SessionDateModel from '../models/SessionDateModel.js';

export async function setLectureDates(req, res) {
  try {
    const { semester, dates } = req.body;
    
    console.log('setLectureDates request:', { semester, dates });
    
    if (!semester || !Array.isArray(dates) || dates.length === 0) {
      return res.status(400).json({ 
        error: 'semester and non-empty dates array are required' 
      });
    }
    
    const createdDates = [];
    for (const date of dates) {
      try {
        console.log(`Creating lecture date: semester=${semester}, date=${date}`);
        const result = await SessionDateModel.createLectureDate(semester, date);
        createdDates.push(result);
      } catch (createError) {
        console.error(`Error creating date ${date}:`, createError);
        
        if (createError.message.includes('already exists')) {
          return res.status(409).json({ 
            error: createError.message
          });
        }
        throw createError;
      }
    }
    
    console.log(`Successfully created ${createdDates.length} lecture dates`);
    
    const allDates = await SessionDateModel.getLectureDatesBySemester(semester);
    res.status(201).json(allDates);
  } catch (error) {
    console.error('SessionController setLectureDates error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to set lecture dates',
      details: error.message,
      code: error.code 
    });
  }
}

// REMOVED - Discussion functionality temporarily disabled
// Focus on lectures only for now

export async function getLectureDates(req, res) {
  try {
    const { semester } = req.params;
    
    const dates = await SessionDateModel.getLectureDatesBySemester(semester);
    
    // Add session_order based on chronological order
    const datesWithOrder = dates
      .sort((a, b) => new Date(a.actual_date) - new Date(b.actual_date))
      .map((date, index) => ({
        ...date,
        session_order: index + 1
      }));
    
    res.json(datesWithOrder);
  } catch (error) {
    console.error('SessionController getLectureDates error:', error);
    res.status(500).json({ error: error.message });
  }
}

// REMOVED - getDiscussionDates functionality temporarily disabled

export async function updateLectureDate(req, res) {
  try {
    const { semester, oldDate } = req.params;
    const { actualDate } = req.body;
    
    if (!actualDate) {
      return res.status(400).json({ error: 'actualDate is required' });
    }
    
    const updatedDate = await SessionDateModel.updateLectureDate(semester, oldDate, actualDate);
    
    if (!updatedDate) {
      return res.status(404).json({ error: 'Lecture date not found' });
    }
    
    res.json(updatedDate);
  } catch (error) {
    console.error('SessionController updateLectureDate error:', error);
    res.status(500).json({ error: error.message });
  }
}

// REMOVED - updateDiscussionDate functionality temporarily disabled

export async function deleteLectureDate(req, res) {
  try {
    const { semester, actualDate } = req.params;
    
    const deletedDate = await SessionDateModel.deleteLectureDate(semester, actualDate);
    
    if (!deletedDate) {
      return res.status(404).json({ error: 'Lecture date not found' });
    }
    
    res.json({ message: 'Lecture date deleted successfully', date: deletedDate });
  } catch (error) {
    console.error('SessionController deleteLectureDate error:', error);
    res.status(500).json({ error: error.message });
  }
}

// REMOVED - deleteDiscussionDate functionality temporarily disabled

// STILL COMMENTED OUT - TOGGLE OPERATIONS
/*
export async function toggleLectureAttendance(req, res) {
  try {
    const { semester, sessionOrder } = req.params;
    const { isActive } = req.body;
    
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ error: 'isActive must be a boolean value' });
    }
    
    const updatedDate = await SessionDateModel.toggleLectureAttendance(semester, parseInt(sessionOrder), isActive);
    
    if (!updatedDate) {
      return res.status(404).json({ error: 'Lecture date not found' });
    }
    
    res.json(updatedDate);
  } catch (error) {
    console.error('SessionController toggleLectureAttendance error:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function toggleDiscussionAttendance(req, res) {
  try {
    const { semester, sessionOrder } = req.params;
    const { isActive } = req.body;
    
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ error: 'isActive must be a boolean value' });
    }
    
    const updatedDate = await SessionDateModel.toggleDiscussionAttendance(semester, parseInt(sessionOrder), isActive);
    
    if (!updatedDate) {
      return res.status(404).json({ error: 'Discussion date not found' });
    }
    
    res.json(updatedDate);
  } catch (error) {
    console.error('SessionController toggleDiscussionDate error:', error);
    res.status(500).json({ error: error.message });
  }
}
*/