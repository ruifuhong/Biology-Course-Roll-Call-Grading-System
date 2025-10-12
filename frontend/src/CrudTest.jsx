import { useEffect, useState } from 'react';

export default function CrudTest() {
  const [items, setItems] = useState([]);
  const [newName, setNewName] = useState('');
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');

  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const fetchItems = async () => {
    const res = await fetch(`${apiBase}/items`);
    setItems(await res.json());
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const createItem = async () => {
    await fetch(`${apiBase}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName }),
    });
    setNewName('');
    fetchItems();
  };

  const updateItem = async (id) => {
    await fetch(`${apiBase}/items/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName }),
    });
    setEditId(null);
    setEditName('');
    fetchItems();
  };

  const deleteItem = async (id) => {
    await fetch(`${apiBase}/items/${id}`, { method: 'DELETE' });
    fetchItems();
  };

  return (
    <div>
      <h2>Test CRUD</h2>
      <input
        value={newName}
        onChange={e => setNewName(e.target.value)}
        placeholder="Enter name"
      />
      <button onClick={createItem}>Submit</button>
      <ul>
        {items && items.map(item => (
          <li key={item.id}>
            {editId === item.id ? (
              <>
                <input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                />
                <button onClick={() => updateItem(item.id)}>Save</button>
                <button onClick={() => { setEditId(null); setEditName(''); }}>Cancel</button>
              </>
            ) : (
              <>
                {item.name}
                <button onClick={() => { setEditId(item.id); setEditName(item.name); }}>Update</button>
                <button onClick={() => deleteItem(item.id)}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}