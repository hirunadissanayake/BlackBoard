import React, { useState, useEffect } from 'react';
import Shell from '../components/Layout/Shell';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, Plus, X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import './Attendance.css';

const Attendance = () => {
    const [logs, setLogs] = useState([]);
    const [stats, setStats] = useState({ present: 0, absent: 0, late: 0 });
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Modal Data
    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedStudent, setSelectedStudent] = useState('');
    const [status, setStatus] = useState('Present');

    const { user } = useAuth();

    const fetchLogs = async () => {
        try {
            const { data, error } = await supabase
                .from('attendance')
                .select(`
                    *,
                    students ( name ),
                    classes ( name )
                `)
                .order('created_at', { ascending: false })
                .limit(20);

            if (error) throw error;
            setLogs(data);

            // Simple stats calculation from fetched logs (for demo, ideally this is a robust query)
            const newStats = { present: 0, absent: 0, late: 0 };
            data.forEach(log => {
                const s = log.status.toLowerCase();
                if (newStats[s] !== undefined) newStats[s]++;
            });
            setStats(newStats);

        } catch (error) {
            console.error('Error fetching logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMeta = async () => {
        const { data: c } = await supabase.from('classes').select('id, name');
        const { data: s } = await supabase.from('students').select('id, name');
        setClasses(c || []);
        setStudents(s || []);
        if (c && c.length > 0) setSelectedClass(c[0].id);
        if (s && s.length > 0) setSelectedStudent(s[0].id);
    };

    useEffect(() => {
        if (user) {
            fetchLogs();
            fetchMeta();
        }
    }, [user]);

    const handleLog = async (e) => {
        e.preventDefault();
        try {
            const { error } = await supabase.from('attendance').insert({
                user_id: user.id,
                class_id: selectedClass,
                student_id: selectedStudent,
                status: status,
                date: new Date().toISOString().split('T')[0]
            });
            if (error) throw error;
            setIsModalOpen(false);
            fetchLogs();
        } catch (error) {
            console.error('Error logging attendance:', error);
            alert('Failed to log attendance');
        }
    };

    return (
        <Shell
            title="Attendance"
            action={
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={18} /> Log Attendance
                </button>
            }
        >
            <div className="attendance-grid">
                <div className="card overview-card">
                    <h3 className="section-header">Today's Overview</h3>
                    <div className="overview-stats">
                        <div className="stat">
                            <span className="label">Present</span>
                            <span className="value">{stats.present}</span>
                        </div>
                        <div className="stat">
                            <span className="label">Absent</span>
                            <span className="value">{stats.absent}</span>
                        </div>
                        <div className="stat">
                            <span className="label">Late</span>
                            <span className="value">{stats.late}</span>
                        </div>
                    </div>
                </div>

                <div className="card recent-logs">
                    <h3 className="section-header">Recent Logs</h3>
                    <div className="log-list">
                        {loading ? (
                            <div>Loading...</div>
                        ) : logs.length === 0 ? (
                            <div className="text-gray-500">No attendance logs found.</div>
                        ) : (
                            logs.map(log => (
                                <div key={log.id} className="log-item">
                                    <div className="log-info">
                                        <span className="student-name">{log.students?.name || 'Unknown Student'}</span>
                                        <span className="class-name">{log.classes?.name || 'Unknown Class'}</span>
                                    </div>
                                    <div className={`log-status ${log.status.toLowerCase()}`}>
                                        {log.status === 'Present' && <CheckCircle size={14} />}
                                        {log.status === 'Absent' && <XCircle size={14} />}
                                        {log.status === 'Late' && <AlertCircle size={14} />}
                                        {log.status}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Log Attendance</h2>
                            <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleLog} className="modal-form">
                            <div className="form-group">
                                <label>Class</label>
                                <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
                                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Student</label>
                                <select value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)}>
                                    {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Status</label>
                                <select value={status} onChange={e => setStatus(e.target.value)}>
                                    <option value="Present">Present</option>
                                    <option value="Absent">Absent</option>
                                    <option value="Late">Late</option>
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Log</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Shell>
    );
};

export default Attendance;
