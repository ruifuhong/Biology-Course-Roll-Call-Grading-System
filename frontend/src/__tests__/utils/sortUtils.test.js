import { describe, it, expect } from 'vitest';
import { naturalSort } from '../../utils/sortUtils.js';

describe('naturalSort', () => {
  it('sorts student objects by group_name naturally (1, 2, 10 instead of 1, 10, 2)', () => {
    const students = [
      { group_name: '10', name: 'John' },
      { group_name: '2', name: 'Jane' },
      { group_name: '1', name: 'Bob' },
      { group_name: '20', name: 'Alice' },
      { group_name: '3', name: 'Charlie' }
    ];
    
    const sorted = students.sort(naturalSort);
    expect(sorted.map(s => s.group_name)).toEqual(['1', '2', '3', '10', '20']);
  });

  it('handles pure numeric group names correctly', () => {
    const students = [
      { group_name: '100', name: 'John' },
      { group_name: '20', name: 'Jane' },
      { group_name: '3', name: 'Bob' },
      { group_name: '1', name: 'Alice' },
      { group_name: '50', name: 'Charlie' }
    ];
    
    const sorted = students.sort(naturalSort);
    expect(sorted.map(s => s.group_name)).toEqual(['1', '3', '20', '50', '100']);
  });

  it('handles complex real-world group names like class sections', () => {
    const students = [
      { group_name: '20', name: 'John' },
      { group_name: 'B', name: 'Jane' },
      { group_name: 'A', name: 'Bob' },
      { group_name: '1', name: 'Alice' },
      { group_name: '2', name: 'Charlie' },
      { group_name: '10', name: 'David' }
    ];
    
    const sorted = students.sort(naturalSort);
    const groupNames = sorted.map(s => s.group_name);
    
    expect(groupNames).toEqual(['1', '2', '10', '20', 'A', 'B']);
  });
});