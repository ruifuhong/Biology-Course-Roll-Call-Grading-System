export const naturalSort = (a, b) => {
  const groupA = a.group_name || '';
  const groupB = b.group_name || '';
  
  const numA = parseInt(groupA.match(/\d+/)?.[0] || '0');
  const numB = parseInt(groupB.match(/\d+/)?.[0] || '0');
  
  if (groupA.match(/\d+/) && groupB.match(/\d+/)) {
    return numA - numB;
  }
  
  return groupA.localeCompare(groupB);
};