import React, { useState, useEffect } from 'react';
import Shell from '../components/Layout/Shell';
import { Search, Filter, MoreHorizontal, Plus, X, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import './Students.css';

// Import avatars
import avatar1 from '../assets/avatar-1.png';
import avatar2 from '../assets/avatar-2.png';

const avatars = [avatar1, avatar2];

const StudentRow = ({ id, name, grade, email, status, onDelete }) => {
    // Simple random avatar selection based on name length for consistency
    const avatar = avatars[name.length % 2];

    return (
        <tr className="student-row">
            <td className="col-id">{id.slice(0, 8)}...</td>
            <td className="col-name">
                <img src={avatar} alt={name} className="student-avatar" />
                <div className="flex flex-col">
                    <span>{name}</span>
                    <span className="text-xs text-gray-500">{email}</span>
                </div>
            </td>
            <td className="col-grade">{grade}</td>
            <td className="col-attendance">
                {/* Mock attendance data for now as we don't have aggregation yet */}
                <div className="progress-bar">
                    <div className="progress" style={{ width: '100%' }}></div>
                </div>
                <span className="attendance-val">N/A</span>
            </td>
            <td className="col-status">
                <span className={`status-badge active`}>{status || 'Active'}</span>
            </td>
            <td className="col-action">
                <button className="icon-btn-sm" onClick={() => onDelete(id)} title="Delete Student">
                    <Trash2 size={16} />
                </button>
            </td>
        </tr>
    );
};

const CreateStudentModal = ({ isOpen, onClose, onCreated }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [grade, setGrade] = useState('');
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase.from('students').insert({
                user_id: user.id,
                name,
                email,
                grade
            });
            if (error) throw error;
            onCreated();
            onClose();
            setName('');
            setEmail('');
            setGrade('');
        } catch (error) {
            console.error('Error creating student:', error);
            alert('Failed to create student');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Add New Student</h2>
                    <button onClick={onClose}><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label>Full Name</label>
                        <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Alex Johnson" required />
                    </div>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="e.g. alex@example.com" />
                    </div>
                    <div className="form-group">
                        <label>Grade / Year</label>
                        <input value={grade} onChange={e => setGrade(e.target.value)} placeholder="e.g. 10th Grade" required />
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Adding...' : 'Add Student'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const Students = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');

    const fetchStudents = async () => {
        try {
            const { data, error } = await supabase
                .from('students')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setStudents(data);
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchStudents();
    }, [user]);

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this student?')) return;
        try {
            const { error } = await supabase.from('students').delete().eq('id', id);
            if (error) throw error;
            fetchStudents();
        } catch (error) {
            console.error('Error deleting student:', error);
            alert('Failed to delete student');
        }
    };

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.email && student.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <Shell
            title="Students"
            action={
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={18} /> Add Student
                </button>
            }
        >
            <div className="table-container card">
                <div className="table-controls">
                    <div className="search-wrapper">
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search students..."
                            className="search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="btn btn-outline btn-sm">
                        <Filter size={16} /> Filter
                    </button>
                </div>

                {loading ? (
                    <div className="p-6 text-center text-gray-500">Loading students...</div>
                ) : filteredStudents.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        {searchTerm ? 'No students match your search.' : 'No students found. Add one to get started.'}
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Grade</th>
                                    <th>Attendance</th>
                                    <th>Status</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.map(student => (
                                    <StudentRow
                                        key={student.id}
                                        {...student}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <CreateStudentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCreated={fetchStudents}
            />
        </Shell>
    );
};

export default Students;
