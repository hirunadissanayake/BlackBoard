import React, { useState, useEffect } from 'react';
import Shell from '../components/Layout/Shell';
import { Plus, Clock, Users, MoreHorizontal, Calendar, X, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import './ClassList.css';

// Import images
import mathImg from '../assets/class-math.png';
import physicsImg from '../assets/class-physics.png';
import artImg from '../assets/class-art.png';

// Map subjects to images
const subjectImages = {
    'math': mathImg,
    'physics': physicsImg,
    'art': artImg,
    'other': artImg // Fallback
};

const ClassCard = ({ id, name, count, schedule, lastUpdated, image, onDelete }) => (
    <div className="class-card card">
        <div className="class-image-wrapper">
            <img src={image} alt={name} className="class-image" />
            <div className="overlay-btn">
                <button className="icon-btn-sm text-white" onClick={() => onDelete(id)}>
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
        <div className="class-content">
            <h3 className="class-name">{name}</h3>
            <div className="class-meta">
                <span className="flex items-center gap-1">
                    <Clock size={14} /> {schedule}
                </span>
            </div>

            <div className="class-footer">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Users size={14} /> <span>{count || 0} Students</span>
                </div>
                <span className="time-ago">Updated {lastUpdated}</span>
            </div>
        </div>
    </div>
);

const CreateClassModal = ({ isOpen, onClose, onCreated }) => {
    const [name, setName] = useState('');
    const [schedule, setSchedule] = useState('');
    const [subject, setSubject] = useState('math');
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase.from('classes').insert({
                user_id: user.id,
                name,
                schedule,
                subject
            });
            if (error) throw error;
            onCreated();
            onClose();
            setName('');
            setSchedule('');
        } catch (error) {
            console.error('Error creating class:', error);
            alert('Failed to create class');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Create New Class</h2>
                    <button onClick={onClose}><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label>Class Name</label>
                        <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Advanced Mathematics" required />
                    </div>
                    <div className="form-group">
                        <label>Schedule</label>
                        <input value={schedule} onChange={e => setSchedule(e.target.value)} placeholder="e.g. Mon, Wed 10:00 AM" required />
                    </div>
                    <div className="form-group">
                        <label>Subject (for Cover Image)</label>
                        <select value={subject} onChange={e => setSubject(e.target.value)}>
                            <option value="math">Mathematics</option>
                            <option value="physics">Physics</option>
                            <option value="art">Arts</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Class'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ClassList = () => {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { user } = useAuth();

    const fetchClasses = async () => {
        try {
            const { data, error } = await supabase
                .from('classes')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setClasses(data);
        } catch (error) {
            console.error('Error fetching classes:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchClasses();
    }, [user]);

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this class?')) return;
        try {
            const { error } = await supabase.from('classes').delete().eq('id', id);
            if (error) throw error;
            fetchClasses();
        } catch (error) {
            console.error('Error deleting class:', error);
            alert('Failed to delete class');
        }
    };

    return (
        <Shell
            title="Classes"
            action={
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={18} /> Create Class
                </button>
            }
        >
            {loading ? (
                <div>Loading classes...</div>
            ) : classes.length === 0 ? (
                <div className="empty-state">
                    <p>No classes found. Create your first class!</p>
                </div>
            ) : (
                <div className="classes-grid">
                    {classes.map((cls) => (
                        <ClassCard
                            key={cls.id}
                            id={cls.id}
                            name={cls.name}
                            count={0} // We need to join count later, hardcode for now
                            schedule={cls.schedule}
                            lastUpdated="Just now"
                            image={subjectImages[cls.subject] || artImg}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}

            <CreateClassModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCreated={fetchClasses}
            />
        </Shell>
    );
};

export default ClassList;
