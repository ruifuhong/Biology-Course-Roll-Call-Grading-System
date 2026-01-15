import { jest } from '@jest/globals';

const mockQuery = jest.fn();
const mockHash = jest.fn();
const mockCompare = jest.fn();
const mockUuid = jest.fn(() => 'mock-uuid');

jest.unstable_mockModule('../../models/database.js', () => ({
  pool: { query: mockQuery }
}));

jest.unstable_mockModule('bcrypt', () => ({
  default: { hash: mockHash, compare: mockCompare },
  hash: mockHash,
  compare: mockCompare
}));

jest.unstable_mockModule('uuid', () => ({
  v7: mockUuid
}));

const AdminUserModel = await import('../../models/AdminUserModel.js');

describe('AdminUserModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockQuery.mockClear();
    mockHash.mockClear();
    mockCompare.mockClear();
  });

  describe('findUserByUsername', () => {
    it('returns user if found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, username: 'admin' }] });
      const user = await AdminUserModel.findUserByUsername('admin');
      expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM "Roll-Call".admin_users WHERE username = $1', ['admin']);
      expect(user).toEqual({ id: 1, username: 'admin' });
    });

    it('returns undefined if not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });
      const user = await AdminUserModel.findUserByUsername('none');
      expect(user).toBeUndefined();
    });

    it('throws if query fails', async () => {
      mockQuery.mockRejectedValueOnce(new Error('DB error'));
      await expect(AdminUserModel.findUserByUsername('admin')).rejects.toThrow('DB error');
    });
  });

  describe('verifyPassword', () => {
    it('returns true for correct password', async () => {
      mockCompare.mockResolvedValueOnce(true);
      const result = await AdminUserModel.verifyPassword({ password_hash: 'hash' }, 'pw');
      expect(mockCompare).toHaveBeenCalledWith('pw', 'hash');
      expect(result).toBe(true);
    });

    it('returns false for incorrect password', async () => {
      mockCompare.mockResolvedValueOnce(false);
      const result = await AdminUserModel.verifyPassword({ password_hash: 'hash' }, 'wrong');
      expect(result).toBe(false);
    });

    it('throws if compare fails', async () => {
      mockCompare.mockRejectedValueOnce(new Error('bcrypt error'));
      await expect(AdminUserModel.verifyPassword({ password_hash: 'hash' }, 'pw')).rejects.toThrow('bcrypt error');
    });
  });

  describe('getTANameById', () => {
    it('returns TA name if found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ name: 'TA Name' }] });
      const name = await AdminUserModel.getTANameById('ta1');
      expect(mockQuery).toHaveBeenCalledWith('SELECT name FROM "Roll-Call".ta_names WHERE ta_id = $1', ['ta1']);
      expect(name).toBe('TA Name');
    });

    it('returns null if not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });
      const name = await AdminUserModel.getTANameById('ta2');
      expect(name).toBeNull();
    });

    it('throws if query fails', async () => {
      mockQuery.mockRejectedValueOnce(new Error('DB error'));
      await expect(AdminUserModel.getTANameById('ta1')).rejects.toThrow('DB error');
    });
  });

  describe('getTASemesters', () => {
    it('returns semesters array', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ semester: '1131' }, { semester: '1132' }] });
      const semesters = await AdminUserModel.getTASemesters('ta1');
      expect(semesters).toEqual(['1131', '1132']);
    });

    it('returns empty array if none', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });
      const semesters = await AdminUserModel.getTASemesters('ta2');
      expect(semesters).toEqual([]);
    });

    it('throws if query fails', async () => {
      mockQuery.mockRejectedValueOnce(new Error('DB error'));
      await expect(AdminUserModel.getTASemesters('ta1')).rejects.toThrow('DB error');
    });
  });

  describe('getLecturerInfoById', () => {
    it('returns username if found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ username: 'lecturer' }] });
      const info = await AdminUserModel.getLecturerInfoById('id1');
      expect(info).toEqual({ username: 'lecturer' });
    });

    it('returns empty string if not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });
      const info = await AdminUserModel.getLecturerInfoById('id2');
      expect(info).toEqual({ username: '' });
    });

    it('throws if query fails', async () => {
      mockQuery.mockRejectedValueOnce(new Error('DB error'));
      await expect(AdminUserModel.getLecturerInfoById('id1')).rejects.toThrow('DB error');
    });
  });

  describe('getTAInfoById', () => {
    it('returns username and name if found', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ username: 'tauser' }] })
        .mockResolvedValueOnce({ rows: [{ name: 'TA Name' }] });
      const info = await AdminUserModel.getTAInfoById('taid');
      expect(info).toEqual({ username: 'tauser', name: 'TA Name' });
    });

    it('returns username as name if name not found', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ username: 'tauser' }] })
        .mockResolvedValueOnce({ rows: [] });
      const info = await AdminUserModel.getTAInfoById('taid');
      expect(info).toEqual({ username: 'tauser', name: 'tauser' });
    });

    it('throws if query fails', async () => {
      mockQuery.mockRejectedValueOnce(new Error('DB error'));
      await expect(AdminUserModel.getTAInfoById('taid')).rejects.toThrow('DB error');
    });
  });

  describe('findUserById', () => {
    it('returns user if found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, username: 'admin' }] });
      const user = await AdminUserModel.findUserById(1);
      expect(user).toEqual({ id: 1, username: 'admin' });
    });

    it('returns undefined if not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });
      const user = await AdminUserModel.findUserById(2);
      expect(user).toBeUndefined();
    });

    it('throws if query fails', async () => {
      mockQuery.mockRejectedValueOnce(new Error('DB error'));
      await expect(AdminUserModel.findUserById(1)).rejects.toThrow('DB error');
    });
  });

  describe('createUser', () => {
    it('creates and returns new user if username not taken', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });
      mockHash.mockResolvedValueOnce('hashedpw');
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 'mock-uuid', username: 'newuser', password_hash: 'hashedpw', role: 'admin' }] });
      const user = await AdminUserModel.createUser({ username: 'newuser', password: 'pw', role: 'admin' });
      expect(user).toEqual({ id: 'mock-uuid', username: 'newuser', password_hash: 'hashedpw', role: 'admin' });
    });

    it('returns null if username exists', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1 }] });
      const user = await AdminUserModel.createUser({ username: 'exists', password: 'pw', role: 'admin' });
      expect(user).toBeNull();
    });

    it('throws if query or hash fails', async () => {
      mockQuery.mockRejectedValueOnce(new Error('DB error'));
      await expect(AdminUserModel.createUser({ username: 'fail', password: 'pw', role: 'admin' })).rejects.toThrow('DB error');
      mockQuery.mockResolvedValueOnce({ rows: [] });
      mockHash.mockRejectedValueOnce(new Error('hash error'));
      await expect(AdminUserModel.createUser({ username: 'fail2', password: 'pw', role: 'admin' })).rejects.toThrow('hash error');
    });
  });

  describe('addTAName', () => {
    it('inserts TA name', async () => {
      await AdminUserModel.addTAName({ ta_id: 'taid', name: 'TA Name' });
      expect(mockQuery).toHaveBeenCalledWith('INSERT INTO "Roll-Call".ta_names (ta_id, name) VALUES ($1, $2)', ['taid', 'TA Name']);
    });

    it('throws if query fails', async () => {
      mockQuery.mockRejectedValueOnce(new Error('DB error'));
      await expect(AdminUserModel.addTAName({ ta_id: 'taid', name: 'TA Name' })).rejects.toThrow('DB error');
    });
  });

  describe('addTASemester', () => {
    it('inserts TA semester', async () => {
      await AdminUserModel.addTASemester({ ta_id: 'taid', semester: '1131' });
      expect(mockQuery).toHaveBeenCalledWith('INSERT INTO "Roll-Call".ta_semesters (ta_id, semester) VALUES ($1, $2)', ['taid', '1131']);
    });

    it('throws if query fails', async () => {
      mockQuery.mockRejectedValueOnce(new Error('DB error'));
      await expect(AdminUserModel.addTASemester({ ta_id: 'taid', semester: '1131' })).rejects.toThrow('DB error');
    });
  });

  describe('getAllTADetails', () => {
    it('returns TA details', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 'taid', username: 'tauser', name: 'TA Name', semesters: ['1131'] }] });
      const result = await AdminUserModel.getAllTADetails();
      expect(result).toEqual([{ id: 'taid', username: 'tauser', name: 'TA Name', semesters: ['1131'] }]);
    });

    it('throws if query fails', async () => {
      mockQuery.mockRejectedValueOnce(new Error('DB error'));
      await expect(AdminUserModel.getAllTADetails()).rejects.toThrow('DB error');
    });
  });

  describe('getAllUsers', () => {
    it('returns all users', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1 }, { id: 2 }] });
      const users = await AdminUserModel.getAllUsers();
      expect(users).toEqual([{ id: 1 }, { id: 2 }]);
    });

    it('throws if query fails', async () => {
      mockQuery.mockRejectedValueOnce(new Error('DB error'));
      await expect(AdminUserModel.getAllUsers()).rejects.toThrow('DB error');
    });
  });

  describe('deleteUser', () => {
    it('deletes user by id', async () => {
      await AdminUserModel.deleteUser('id1');
      expect(mockQuery).toHaveBeenCalledWith('DELETE FROM "Roll-Call".admin_users WHERE id = $1', ['id1']);
    });

    it('throws if query fails', async () => {
      mockQuery.mockRejectedValueOnce(new Error('DB error'));
      await expect(AdminUserModel.deleteUser('id1')).rejects.toThrow('DB error');
    });
  });

  describe('deleteTANames', () => {
    it('deletes TA names by ta_id', async () => {
      await AdminUserModel.deleteTANames('taid');
      expect(mockQuery).toHaveBeenCalledWith('DELETE FROM "Roll-Call".ta_names WHERE ta_id = $1', ['taid']);
    });

    it('throws if query fails', async () => {
      mockQuery.mockRejectedValueOnce(new Error('DB error'));
      await expect(AdminUserModel.deleteTANames('taid')).rejects.toThrow('DB error');
    });
  });

  describe('deleteTASemesters', () => {
    it('deletes TA semesters by ta_id', async () => {
      await AdminUserModel.deleteTASemesters('taid');
      expect(mockQuery).toHaveBeenCalledWith('DELETE FROM "Roll-Call".ta_semesters WHERE ta_id = $1', ['taid']);
    });

    it('throws if query fails', async () => {
      mockQuery.mockRejectedValueOnce(new Error('DB error'));
      await expect(AdminUserModel.deleteTASemesters('taid')).rejects.toThrow('DB error');
    });
  });

  describe('updateTAName', () => {
    it('updates TA name if different', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ name: 'Old Name' }] });
      await AdminUserModel.updateTAName({ ta_id: 'taid', name: 'New Name' });
      expect(mockQuery).toHaveBeenCalledWith('UPDATE "Roll-Call".ta_names SET name = $1 WHERE ta_id = $2', ['New Name', 'taid']);
    });

    it('does not update if name is the same', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ name: 'Same Name' }] });
      await AdminUserModel.updateTAName({ ta_id: 'taid', name: 'Same Name' });
      expect(mockQuery).not.toHaveBeenCalledWith('UPDATE "Roll-Call".ta_names SET name = $1 WHERE ta_id = $2', expect.anything());
    });

    it('throws if query fails', async () => {
      mockQuery.mockRejectedValueOnce(new Error('DB error'));
      await expect(AdminUserModel.updateTAName({ ta_id: 'taid', name: 'New Name' })).rejects.toThrow('DB error');
    });
  });

  describe('updateTAUsername', () => {
    it('updates TA username', async () => {
      await AdminUserModel.updateTAUsername('id1', 'newuser');
      expect(mockQuery).toHaveBeenCalledWith('UPDATE "Roll-Call".admin_users SET username = $1 WHERE id = $2', ['newuser', 'id1']);
    });

    it('throws if query fails', async () => {
      mockQuery.mockRejectedValueOnce(new Error('DB error'));
      await expect(AdminUserModel.updateTAUsername('id1', 'newuser')).rejects.toThrow('DB error');
    });
  });

  describe('setTASemesters', () => {
    it('updates semesters if different', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ semester: '1131' }] });
      await AdminUserModel.setTASemesters('taid', ['1132']);
      expect(mockQuery).toHaveBeenCalledWith('DELETE FROM "Roll-Call".ta_semesters WHERE ta_id = $1', ['taid']);
      expect(mockQuery).toHaveBeenCalledWith('INSERT INTO "Roll-Call".ta_semesters (ta_id, semester) VALUES ($1, $2)', ['taid', '1132']);
    });
    
    it('does not update if semesters are the same', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ semester: '1131' }] });
      await AdminUserModel.setTASemesters('taid', ['1131']);
      expect(mockQuery).not.toHaveBeenCalledWith('DELETE FROM "Roll-Call".ta_semesters WHERE ta_id = $1', expect.anything());
    });

    it('throws if query fails', async () => {
      mockQuery.mockRejectedValueOnce(new Error('DB error'));
      await expect(AdminUserModel.setTASemesters('taid', ['1132'])).rejects.toThrow('DB error');
    });
  });

  describe('updateUserPassword', () => {
    it('updates user password hash', async () => {
      mockHash.mockResolvedValueOnce('newhash');
      await AdminUserModel.updateUserPassword('id1', 'newpw');
      expect(mockQuery).toHaveBeenCalledWith('UPDATE "Roll-Call".admin_users SET password_hash = $1 WHERE id = $2', ['newhash', 'id1']);
    });

    it('throws if hash or query fails', async () => {
      mockHash.mockRejectedValueOnce(new Error('hash error'));
      await expect(AdminUserModel.updateUserPassword('id1', 'newpw')).rejects.toThrow('hash error');
      mockHash.mockResolvedValueOnce('newhash');
      mockQuery.mockRejectedValueOnce(new Error('DB error'));
      await expect(AdminUserModel.updateUserPassword('id1', 'newpw')).rejects.toThrow('DB error');
    });
  });
});
