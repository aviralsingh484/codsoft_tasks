import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { api, fmt } from '../lib/api';

export default function Attendance({ user }) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [students, setStudents] = useState([]);
  const [status, setStatus] = useState({}); // studentId -> PRESENT / ABSENT
  const [records, setRecords] = useState([]); // used in student view
  const isStaff = user && user.role !== 'STUDENT';

  useEffect(() => {
    if (!user) return;
    if (!isStaff) { api('/attendance').then(setRecords); return; }
    Promise.all([api('/students'), api('/attendance?date=' + date)]).then(([sts, att]) => {
      const s = {};
      sts.forEach((x) => (s[x.id] = 'PRESENT')); // default is present
      att.forEach((a) => (s[a.studentId] = a.status));
      setStudents(sts); setStatus(s);
    });
  }, [user, date]);

  async function save() {
    await api('/attendance', 'POST', { date, records: students.map((s) => ({ studentId: s.id, status: status[s.id] })) });
    alert('Attendance saved');
  }

  const present = records.filter((r) => r.status === 'PRESENT').length;

  return (
    <Layout title="Attendance" user={user}>
      {isStaff ? (
        <>
          <div className="card">
            Date: <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            <button onClick={save}>Save attendance</button>
          </div>
          <table>
            <thead><tr><th>Roll No</th><th>Name</th><th>Status</th></tr></thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id}>
                  <td>{s.rollNo}</td><td>{s.user.name}</td>
                  <td>
                    <select value={status[s.id]} onChange={(e) => setStatus({ ...status, [s.id]: e.target.value })}>
                      <option>PRESENT</option><option>ABSENT</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <>
          <div className="card">Attendance: <b>{records.length ? Math.round((present / records.length) * 100) : 0}%</b> ({present} of {records.length} days present)</div>
          <table>
            <thead><tr><th>Date</th><th>Status</th></tr></thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id}><td>{fmt(r.date)}</td><td className={r.status === 'PRESENT' ? 'green' : 'red'}>{r.status}</td></tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </Layout>
  );
}
