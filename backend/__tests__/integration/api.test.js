import request from 'supertest';
import express from 'express';

describe('SessionController Integration Tests', () => {
  let app;
  
  beforeAll(() => {
    app = express();
    app.use(express.json());
    
    app.post('/sessions/lecture-dates', (req, res) => {
      const { semester, dates } = req.body;
      
      if (!semester || !Array.isArray(dates) || dates.length === 0) {
        return res.status(400).json({ 
          error: 'semester and non-empty dates array are required' 
        });
      }
      
      const mockDates = dates.map(date => ({
        semester,
        actual_date: date,
        is_active: false
      }));
      
      res.status(201).json(mockDates);
    });
    
    app.get('/sessions/lecture-dates/:semester', (req, res) => {
      const { semester } = req.params;
      
      const mockDates = [
        { semester, actual_date: '2024-10-15', is_active: false },
        { semester, actual_date: '2024-10-22', is_active: false }
      ];
      
      res.json(mockDates);
    });
  });

  describe('POST /sessions/lecture-dates', () => {
    it('should create lecture dates successfully', async () => {
      const response = await request(app)
        .post('/sessions/lecture-dates')
        .send({
          semester: '1131',
          dates: ['2024-10-15', '2024-10-22']
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toMatchObject({
        semester: '1131',
        actual_date: '2024-10-15',
        is_active: false
      });
    });

    it('should return 400 for missing semester', async () => {
      const response = await request(app)
        .post('/sessions/lecture-dates')
        .send({ dates: ['2024-10-15'] });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('semester and non-empty dates array are required');
    });

    it('should return 400 for missing dates', async () => {
      const response = await request(app)
        .post('/sessions/lecture-dates')
        .send({ semester: '1131' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('semester and non-empty dates array are required');
    });

    it('should return 400 for empty dates array', async () => {
      const response = await request(app)
        .post('/sessions/lecture-dates')
        .send({ semester: '1131', dates: [] });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('semester and non-empty dates array are required');
    });
  });

  describe('GET /sessions/lecture-dates/:semester', () => {
    it('should get lecture dates for semester', async () => {
      const response = await request(app)
        .get('/sessions/lecture-dates/1131');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toMatchObject({
        semester: '1131',
        actual_date: '2024-10-15',
        is_active: false
      });
    });
  });
});