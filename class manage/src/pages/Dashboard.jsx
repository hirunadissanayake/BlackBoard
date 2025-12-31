import React, { useState, useEffect } from 'react';
import Shell from '../components/Layout/Shell';
import { Users, BookOpen, Calendar, Activity, Clock } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import './Dashboard.css';

const StatCard = ({ icon, label, value, change }) => (
    <div className="stat-card">
        <div className="stat-header">
            <div className="stat-icon-wrapper">
                {icon}
            </div>
            {change && <span className="stat-change">{change}</span>}
        </div>
        <div>
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>
        </div>
    </div>
);

const ActivityItem = ({ title, time, type }) => (
    <div className="activity-item">
        <div className={`activity-dot ${type}`}></div>
        <div className="activity-info">
            <span className="activity-title">{title}</span>
            <span className="activity-time">{time}</span>
        </div>
    </div>
);

const ScheduleItem = ({ time, subject, location }) => (
    <div className="schedule-item">
        <span className="time">{time}</span>
        <span className="subject">{subject}</span>
        <span className="location">{location}</span>
    </div>
);

const Dashboard = () => {
    const [counts, setCounts] = useState({ students: 0, classes: 0, assignments: 0 });
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const [userName, setUserName] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            // Get user email name or metadata
            setUserName(user.email.split('@')[0]);

            try {
                const { count: studentCount } = await supabase.from('students').select('*', { count: 'exact', head: true });
                const { count: classCount } = await supabase.from('classes').select('*', { count: 'exact', head: true });
                const { count: assignmentCount } = await supabase.from('assignments').select('*', { count: 'exact', head: true });

                setCounts({
                    students: studentCount || 0,
                    classes: classCount || 0,
                    assignments: assignmentCount || 0
                });
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    return (
        <Shell title="Dashboard">
            <div className="dashboard-grid">
                {/* Welcome Banner */}
                <div className="welcome-banner">
                    <div className="banner-content">
                        <h2>Welcome Back, {userName}</h2>
                        <p>Here's what's happening in your classes today.</p>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="stats-section">
                    <StatCard
                        icon={<Users size={20} color="white" />}
                        label="Total Students"
                        value={loading ? '-' : counts.students}
                        change="+12% vs last month"
                    />
                    <StatCard
                        icon={<BookOpen size={20} color="white" />}
                        label="Active Classes"
                        value={loading ? '-' : counts.classes}
                        change="Active Now"
                    />
                    <StatCard
                        icon={<Activity size={20} color="white" />}
                        label="Assignments"
                        value={loading ? '-' : counts.assignments}
                        change="Pending Review"
                    />
                    <StatCard
                        icon={<Calendar size={20} color="white" />}
                        label="Upcoming Events"
                        value="3"
                        change="This Week"
                    />
                </div>

                {/* Main Content Grid */}
                <div className="main-grid">
                    {/* Recent Activity */}
                    <div className="card">
                        <h3 className="section-title">Recent Activity</h3>
                        <div className="activity-list">
                            <ActivityItem title="Advanced Math Class Created" time="2 hours ago" type="success" />
                            <ActivityItem title="New Student Registration: Alex J." time="4 hours ago" type="warning" />
                            <ActivityItem title="Physics Assignment Due Tomorrow" time="1 day ago" type="danger" />
                            <ActivityItem title="Attendance Logged for Art Class" time="Yesterday" type="success" />
                        </div>
                    </div>

                    {/* Today's Schedule */}
                    <div className="card">
                        <h3 className="section-title">Today's Schedule</h3>
                        <div className="schedule-list">
                            <ScheduleItem time="09:00 AM - 10:30 AM" subject="Advanced Mathematics" location="Room 304" />
                            <ScheduleItem time="11:00 AM - 12:30 PM" subject="Physics Lab" location="Lab 2" />
                            <ScheduleItem time="02:00 PM - 03:30 PM" subject="Visual Arts" location="Art Studio" />
                        </div>
                    </div>
                </div>
            </div>
        </Shell>
    );
};

export default Dashboard;
