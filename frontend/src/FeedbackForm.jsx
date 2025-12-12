// import { useState, useEffect } from 'react';

// export default function FeedbackForm() {
//   const [name, setName] = useState('');
//   const [score, setScore] = useState('');
//   const [feedback, setFeedback] = useState('');
//   const [message, setMessage] = useState('');
//   const [submissions, setSubmissions] = useState([]);
//   const [feedbacks, setFeedbacks] = useState([]);

//   const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';

//   useEffect(() => {
//     fetch(`${apiBase}/submission`)
//       .then(res => res.json())
//       .then(data => setSubmissions(data));

//     fetch(`${apiBase}/nosql-items`)
//       .then(res => res.json())
//       .then(data => setFeedbacks(data))
//       .catch(err => console.error('Failed to fetch nosql-items:', err));
//   }, []);

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     await fetch(`${apiBase}/submission`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ name, score })
//     });

//     await fetch(`${apiBase}/nosql-items`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ name, feedback })
//     });

//     setMessage('Submitted!');
//     setName('');
//     setScore('');
//     setFeedback('');

//     // Refresh data
//     fetch(`${apiBase}/submission`)
//       .then(res => res.json())
//       .then(data => setSubmissions(data));
//     fetch(`${apiBase}/nosql-items`)
//       .then(res => res.json())
//       .then(data => setFeedbacks(data))
//       .catch(err => console.error('Failed to fetch nosql-items:', err));
//   };

//   return (
//     <div>

//     <form onSubmit={handleSubmit}>
//     <div>
//         <label>
//         Name:
//         <input
//             value={name}
//             onChange={e => setName(e.target.value)}
//             placeholder="Name"
//             required
//             style={{ display: 'block', marginBottom: '1em' }}
//         />
//         </label>
//     </div>
//     <div>
//         <label>
//         Score:
//         <select
//             value={score}
//             onChange={e => setScore(e.target.value)}
//             required
//             style={{ display: 'block', marginBottom: '1em' }}
//         >
//             <option value="">Select score</option>
//             <option value="1">1</option>
//             <option value="2">2</option>
//             <option value="3">3</option>
//             <option value="4">4</option>
//             <option value="5">5</option>
//         </select>
//         </label>
//     </div>
//     <div>
//         <label>
//         Feedback:
//         <input
//             value={feedback}
//             onChange={e => setFeedback(e.target.value)}
//             placeholder="Feedback"
//             required
//             style={{ display: 'block', marginBottom: '1em' }}
//         />
//         </label>
//     </div>
//     <button type="submit">Submit</button>
//     </form>

//     <h2>Score Submissions (PostgreSQL)</h2>
//     <ul>
//     {submissions.map(sub => (
//         <li key={sub.id}>
//         {sub.name} - Score: {sub.score} - Submitted at: {sub.submitted_at}
//         </li>
//     ))}
//     </ul>

//       <h2>Feedbacks (MongoDB)</h2>
//       <ul>
//         {feedbacks.map(fb => {
//           const id = fb._id?.$oid ?? fb._id ?? (fb.id ?? Math.random().toString(36).slice(2));
//           // Normalize submitted_at: support ISO string, {$date:...}, or Date-like
//           let submittedAt = '';
//           if (fb.submitted_at) {
//             if (typeof fb.submitted_at === 'string') {
//               submittedAt = new Date(fb.submitted_at).toLocaleString();
//             } else if (fb.submitted_at.$date) {
//               submittedAt = new Date(fb.submitted_at.$date).toLocaleString();
//             } else {
//               submittedAt = String(fb.submitted_at);
//             }
//           }

//           return (
//             <li key={id}>{fb.name} - Feedback: {fb.feedback} - {submittedAt}</li>
//           );
//         })}
//       </ul>
//     </div>
//   );
// }