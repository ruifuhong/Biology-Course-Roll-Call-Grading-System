import * as SessionDateModel from '../models/SessionDateModel.js';

export async function setDiscussionDates(req, res) {
  try {
    const { semester, dates } = req.body;

    console.log('setDiscussionDates request:', { semester, dates });

    if (!semester || !Array.isArray(dates) || dates.length === 0) {
      return res.status(400).json({
        error: 'semester and non-empty dates array are required'
      });
    }

    const createdDates = [];
    for (const date of dates) {
      try {
        console.log(`Creating discussion date: semester=${semester}, date=${date}`);
        const result = await SessionDateModel.createDiscussionDate(semester, date);
        createdDates.push(result);
      } catch (createError) {
        console.error(`Error creating discussion date ${date}:`, createError);
        if (createError.message.includes('already exists')) {
          return res.status(409).json({
            error: createError.message
          });
        }
        throw createError;
      }
    }

    console.log(`Successfully created ${createdDates.length} discussion dates`);

    const allDates = await SessionDateModel.getDiscussionDatesBySemester(semester);
    res.status(201).json(allDates);
  } catch (error) {
    console.error('SessionController setDiscussionDates error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      error: 'Failed to set discussion dates',
      details: error.message,
      code: error.code
    });
  }
}

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

export async function getDiscussionDates(req, res) {
  try {
    const { semester } = req.params;

    if (!semester) {
      return res.status(400).json({ error: 'semester parameter is required' });
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
    console.error('SessionController getDiscussionDates error:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function getLectureDates(req, res) {
  try {
    const { semester } = req.params;

    
    if (!semester) {
      return res.status(400).json({ error: 'semester parameter is required' });
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
    console.error('SessionController getLectureDates error:', error);
    res.status(500).json({ error: error.message });
  }
}

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

export async function updateDiscussionDate(req, res) {
  try {
    const { semester, oldDate } = req.params;
    const { actualDate } = req.body;

    if (!actualDate) {
      return res.status(400).json({ error: 'actualDate is required' });
    }

    const updatedDate = await SessionDateModel.updateDiscussionDate(semester, oldDate, actualDate);

    if (!updatedDate) {
      return res.status(404).json({ error: 'Discussion date not found' });
    }

    res.json(updatedDate);
  } catch (error) {
    console.error('SessionController updateDiscussionDate error:', error);
    res.status(500).json({ error: error.message });
  }
}

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

export async function deleteDiscussionDate(req, res) {
  try {
    const { semester, actualDate } = req.params;

    const deletedDate = await SessionDateModel.deleteDiscussionDate(semester, actualDate);

    if (!deletedDate) {
      return res.status(404).json({ error: 'Discussion date not found' });
    }

    res.json({ message: 'Discussion date deleted successfully', date: deletedDate });
  } catch (error) {
    console.error('SessionController deleteDiscussionDate error:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function toggleLectureAttendance(req, res) {
  try {
    const { semester, selectedDate } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ error: 'isActive must be a boolean value' });
    }

    const updatedDate = await SessionDateModel.toggleLectureAttendance(
      semester,
      selectedDate,
      isActive
    );

    if (!updatedDate) {
      return res.status(404).json({ error: 'Lecture date not found' });
    }

    res.json(updatedDate);

  } catch (error) {
    console.error("🔥 Controller error:", error);
    res.status(500).json({ error: error.message });
  }
}

export async function toggleDiscussionAttendance(req, res) {
  try {
    const { semester, selectedDate } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ error: 'isActive must be a boolean value' });
    }

    const updatedDate = await SessionDateModel.toggleDiscussionAttendance(semester, selectedDate, isActive);

    if (!updatedDate) {
      return res.status(404).json({ error: 'Discussion date not found' });
    }

    res.json(updatedDate);
  } catch (error) {
    console.error('SessionController toggleDiscussionDate error:', error);
    res.status(500).json({ error: error.message });
  }
}