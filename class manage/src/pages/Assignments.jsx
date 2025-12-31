import React, { useState, useEffect } from 'react';
import Shell from '../components/Layout/Shell';
import { Plus, Clock, FileText, Trash2, X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import './Assignments.css';

const Wrapper = ({ children }) => <div className="assignments-grid">{children}</div>;

const AssignmentCard = ({ id, title, className, dueDate, submissions, status, onDelete }) => (
    <div className="assignment-card card">
        <div className="assignment-header">
            <div className="icon-box">
                <FileText size={20} />
            </div>
            <div className="header-info">
                <h3 className="assignment-title">{title}</h3>
                <span className="course-name">{className}</span>
            </div>
        </div>

        <div className="assignment-stats">
            <div className="a-stat">
                <Clock size={16} />
                <span>Due: {dueDate ? new Date(dueDate).toLocaleDateString() : 'No date'}</span>
            </div>
            <div className="a-stat">
                <span className={`status-badge ${status === 'Active' ? 'active' : 'inactive'}`}>
                    {status}
                </span>
            </div>
        </div>

        <div className="assignment-footer flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
            <span className="text-xs text-gray-500">{submissions} Submissions</span>
            <button className="icon-btn-sm text-red-500 hover:text-red-700" onClick={() => onDelete(id)}>
                <Trash2 size={16} />
            </button>
        </div>
    </div>
);

const CreateAssignmentModal = ({ isOpen, onClose, onCreated, classes }) => {
    const [title, setTitle] = useState('');
    const [classId, setClassId] = useState('');
    const [dueDate, setDueDate] = useState('');
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (classes.length > 0 && !classId) {
            setClassId(classes[0].id);
        }
    }, [classes]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase.from('assignments').insert({
                user_id: user.id,
                class_id: classId,
                title,
                due_date: dueDate,
                status: 'Active'
            });
            if (error) throw error;
            onCreated();
            onClose();
            setTitle('');
            setDueDate('');
        } catch (error) {
            console.error('Error creating assignment:', error);
            alert('Failed to create assignment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Create Assignment</h2>
                    <button onClick={onClose}><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label>Assignment Title</label>
                        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Algebra Homework #1" required />
                    </div>
                    <div className="form-group">
                        <label>Class</label>
                        <select value={classId} onChange={e => setClassId(e.target.value)} required>
                            {classes.map(cls => (
                                <option key={cls.id} value={cls.id}>{cls.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Due Date</label>
                        <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required />
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Assignment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const Assignments = () => {
    const [assignments, setAssignments] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { user } = useAuth();

    const fetchData = async () => {
        try {
            // Fetch classes first for the dropdown and mapping
            const { data: classesData, error: classesError } = await supabase
                .from('classes')
                .select('id, name');
            if (classesError) throw classesError;
            setClasses(classesData);

            // Fetch assignments
            const { data: assignmentsData, error: assignmentsError } = await supabase
                .from('assignments')
                .select(`
                    *,
                    classes ( name )
                `)
                .order('created_at', { ascending: false });

            if (assignmentsError) throw assignmentsError;
            setAssignments(assignmentsData);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchData();
    }, [user]);

    const handleDelete = async (id) => {
        if (!confirm('Delete this assignment?')) return;
        try {
            const { error } = await supabase.from('assignments').delete().eq('id', id);
            if (error) throw error;
            fetchData();
        } catch (error) {
            console.error('Error deleting assignment:', error);
        }
    };

    return (
        <Shell
            title="Assignments"
            action={
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={18} /> Create Assignment
                </button>
            }
        >
            {loading ? (
                <div>Loading assignments...</div>
            ) : assignments.length === 0 ? (
                <div className="empty-state p-12 text-center text-gray-500 border border-dashed border-gray-300 rounded-lg">
                    <p>No assignments found. create one!</p>
                </div>
            ) : (
                <Wrapper>
                    {assignments.map(a => (
                        <AssignmentCard
                            key={a.id}
                            id={a.id}
                            title={a.title}
                            className={a.classes?.name || 'Unknown Class'}
                            dueDate={a.due_date}
                            submissions={a.total_submissions}
                            status={a.status}
                            onDelete={handleDelete}
                        />
                    ))}
                </Wrapper>
            )}

            <CreateAssignmentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                classes={classes}
                onCreated={fetchData}
            />
        </Shell>
    );
};

export default Assignments;
