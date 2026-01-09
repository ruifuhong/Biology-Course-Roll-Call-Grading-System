import { jest } from '@jest/globals';
import { MongoClient } from 'mongodb';
import * as FeedbackModel from '../../models/FeedbackModel';

jest.mock('mongodb');
MongoClient.connect = jest.fn();

const mockCollection = {
  find: jest.fn(),
  sort: jest.fn(),
  toArray: jest.fn(),
  findOne: jest.fn(),
  insertOne: jest.fn(),
};

const mockDb = {
  collection: jest.fn(() => mockCollection),
};

const mockClient = {
  db: jest.fn(() => mockDb),
};

beforeEach(() => {
  jest.clearAllMocks();
  MongoClient.connect.mockResolvedValue(mockClient);
});

describe('FeedbackModel', () => {
  describe('findAllLectureFeedback', () => {
    it('returns sorted lecture feedback with normalized fields', async () => {
      const fakeData = [
        { _id: { toString: () => 'id1' }, submitted_at: new Date('2023-01-01T10:00:00Z'), foo: 'bar' },
        { _id: { $oid: 'id2', toString: () => 'id2' }, submitted_at: { $date: '2023-01-02T10:00:00Z' }, foo: 'baz' },
      ];
      mockCollection.find.mockReturnValue(mockCollection);
      mockCollection.sort.mockReturnValue(mockCollection);
      mockCollection.toArray.mockResolvedValue(fakeData);

      const result = await FeedbackModel.findAllLectureFeedback();

      expect(result).toEqual([
        { _id: 'id1', submitted_at: '2023-01-01T10:00:00.000Z', foo: 'bar' },
        { _id: 'id2', submitted_at: '2023-01-02T10:00:00.000Z', foo: 'baz' },
      ]);
      expect(mockDb.collection).toHaveBeenCalledWith('lecture-feedback');
    });

    it('returns empty array if no feedbacks', async () => {
      mockCollection.find.mockReturnValue(mockCollection);
      mockCollection.sort.mockReturnValue(mockCollection);
      mockCollection.toArray.mockResolvedValue([]);

      const result = await FeedbackModel.findAllLectureFeedback();

      expect(result).toEqual([]);
    });

    it('throws and logs on db error', async () => {
      mockCollection.find.mockImplementation(() => { throw new Error('fail'); });
      await expect(FeedbackModel.findAllLectureFeedback()).rejects.toThrow('fail');
    });
  });

  describe('findAllDiscussionFeedback', () => {
    it('returns sorted discussion feedback with normalized fields', async () => {
      const fakeData = [
        { _id: { toString: () => 'id1' }, submitted_at: new Date('2023-01-01T10:00:00Z'), foo: 'bar' },
        { _id: { $oid: 'id2', toString: () => 'id2' }, submitted_at: { $date: '2023-01-02T10:00:00Z' }, foo: 'baz' },
      ];

      mockCollection.find.mockReturnValue(mockCollection);
      mockCollection.sort.mockReturnValue(mockCollection);
      mockCollection.toArray.mockResolvedValue(fakeData);

      const result = await FeedbackModel.findAllDiscussionFeedback();

      expect(result).toEqual([
        { _id: 'id1', submitted_at: '2023-01-01T10:00:00.000Z', foo: 'bar' },
        { _id: 'id2', submitted_at: '2023-01-02T10:00:00.000Z', foo: 'baz' },
      ]);
      expect(mockDb.collection).toHaveBeenCalledWith('discussion-feedback');
    });

    it('returns empty array if no feedbacks', async () => {
      mockCollection.find.mockReturnValue(mockCollection);
      mockCollection.sort.mockReturnValue(mockCollection);
      mockCollection.toArray.mockResolvedValue([]);

      const result = await FeedbackModel.findAllDiscussionFeedback();

      expect(result).toEqual([]);
    });

    it('throws and logs on db error', async () => {
      mockCollection.find.mockImplementation(() => { throw new Error('fail'); });
      await expect(FeedbackModel.findAllDiscussionFeedback()).rejects.toThrow('fail');
    });
  });

  describe('createLectureFeedback', () => {
    it('creates new feedback and returns created doc', async () => {
      const input = { studentId: 'B100000001', name: 'John Doe', semester: '1131', actual_date: '2023-01-01', feedback: 'good' };

      mockCollection.findOne.mockResolvedValueOnce(null); // not existing
      mockCollection.insertOne.mockResolvedValue({ insertedId: 'newid' });
      mockCollection.findOne.mockResolvedValueOnce({ ...input, _id: { toString: () => 'newid' }, submitted_at: new Date('2023-01-01T10:00:00Z') });

      const result = await FeedbackModel.createLectureFeedback(input);

      expect(result).toMatchObject({ _id: 'newid', studentId: 'B100000001', name: 'John Doe', semester: '1131', actual_date: '2023-01-01', feedback: 'good' });
      expect(mockDb.collection).toHaveBeenCalledWith('lecture-feedback');
    });

    it('throws if required fields missing', async () => {
      await expect(FeedbackModel.createLectureFeedback({})).rejects.toThrow('All fields are required');
    });

    it('throws if feedback already exists', async () => {
      mockCollection.findOne.mockResolvedValueOnce({ _id: 'exists' });

      const input = { studentId: 'B100000001', name: 'John Doe', semester: '1131', actual_date: '2023-01-01', feedback: 'good' };

      await expect(FeedbackModel.createLectureFeedback(input)).rejects.toThrow('already been submitted');
    });

    it('throws and logs on db error', async () => {
      mockCollection.findOne.mockRejectedValueOnce(new Error('fail'));

      const input = { studentId: 'B100000001', name: 'John Doe', semester: '1131', actual_date: '2023-01-01', feedback: 'good' };

      await expect(FeedbackModel.createLectureFeedback(input)).rejects.toThrow('fail');
    });
  });

  describe('createDiscussionFeedback', () => {
    it('creates new feedback and returns created doc', async () => {
      const input = { studentId: 'B100000002', name: 'Alice Wu', semester: '1131', actual_date: '2023-01-02', feedback: 'ok' };

      mockCollection.findOne.mockResolvedValueOnce(null); // not existing
      mockCollection.insertOne.mockResolvedValue({ insertedId: 'newid2' });
      mockCollection.findOne.mockResolvedValueOnce({ ...input, _id: { toString: () => 'newid2' }, submitted_at: new Date('2023-01-02T10:00:00Z') });

      const result = await FeedbackModel.createDiscussionFeedback(input);

      expect(result).toMatchObject({ _id: 'newid2', studentId: 'B100000002', name: 'Alice Wu', semester: '1131', actual_date: '2023-01-02', feedback: 'ok' });
      expect(mockDb.collection).toHaveBeenCalledWith('discussion-feedback');
    });

    it('throws if required fields missing', async () => {
      await expect(FeedbackModel.createDiscussionFeedback({})).rejects.toThrow('All fields are required');
    });

    it('throws if feedback already exists', async () => {
      mockCollection.findOne.mockResolvedValueOnce({ _id: 'exists' });

      const input = { studentId: 'B100000002', name: 'Alice Wu', semester: '1131', actual_date: '2023-01-02', feedback: 'ok' };

      await expect(FeedbackModel.createDiscussionFeedback(input)).rejects.toThrow('already been submitted');
    });
    
    it('throws and logs on db error', async () => {
      mockCollection.findOne.mockRejectedValueOnce(new Error('fail'));

      const input = { studentId: 'B100000002', name: 'Alice Wu', semester: '1131', actual_date: '2023-01-02', feedback: 'ok' };
      
      await expect(FeedbackModel.createDiscussionFeedback(input)).rejects.toThrow('fail');
    });
  });
});
