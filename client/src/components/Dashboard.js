import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL

const Dashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [editingTask, setEditingTask] = useState(null);

    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState("Medium");
    const [startDate, setStartDate] = useState("");


    // load tasks
    /*
    useEffect(() => {
        axios.get(`${API_URL}/api/tasks`, { withCredentials: true })
            .then(res => setTasks(res.data))
            .catch(err => console.error("error fetching tasks:", err));
    }, []);
     */

    useEffect(() => {
        console.log("Fetching tasks from:", `${API_URL}/api/tasks`);

        axios.get(`${API_URL}/api/tasks`, {
            withCredentials: true,
            headers: { "Content-Type": "application/json" }
        })
            .then(res => {
                console.log("Received tasks:", res.data);
                if (Array.isArray(res.data)) {
                    setTasks(res.data);
                } else {
                    console.error("Unexpected response format:", res.data);
                    setTasks([]);
                }
            })
            .catch(err => {
                console.error("Error fetching tasks:", err.response ? err.response.data : err.message);
                setTasks([]);
            });
    }, []);


    // handle edit button click
    const handleEditClick = (task) => {
        console.log("Edit button clicked for task:", task);

        if (!task || !task.startDate) {
            console.error("Invalid task object for editing:", task);
            return;
        }
        setEditingTask(task._id);
        setDescription(task.description || "");
        setPriority(task.priority || "Medium");
        setStartDate(task.startDate ? task.startDate.split("T")[0] : "");
    };



    // handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingTask) {
                // Update task
                await axios.put(`${API_URL}/api/tasks/${editingTask}`, { description, priority, startDate }, { withCredentials: true });
                setTasks(tasks.map(task => task._id === editingTask ? { ...task, description, priority, startDate } : task));
            } else {
                // Add new task
                const res = await axios.post(`${API_URL}/api/tasks`, { description, priority, startDate }, { withCredentials: true });
                setTasks([...tasks, res.data]);
            }
            // Reset form after submission
            setEditingTask(null);
            setDescription("");
            setPriority("Medium");
            setStartDate("");
        } catch (err) {
            console.error("error saving task:", err);
        }
    };

    // handle task deletion
    const handleDeleteTask = async (id) => {
        if (!id) {
            console.error("Task ID is undefined. Cannot delete.");
            return;
        }

        try {
            await axios.delete(`${API_URL}/api/tasks/${id}`, { withCredentials: true });
            setTasks(tasks.filter(task => task._id !== id));
        } catch (err) {
            console.error("Error deleting task:", err.response ? err.response.data : err.message);
        }
    };

    const handleUpdateTask = async (e) => {
        e.preventDefault();
        console.log("Attempting to update task:", editingTask, { description, priority, startDate });

        if (!editingTask) {
            console.error("No task selected for updating.");
            return;
        }

        try {
            const res = await axios.put(`${API_URL}/api/tasks/${editingTask}`,
                { description, priority, startDate },
                { withCredentials: true }
            );

            console.log("Update successful. Updated task data:", res.data);

            setTasks(tasks.map(task => task._id === editingTask ? res.data : task));
            setEditingTask(null);
            setDescription("");
            setPriority("Medium");
            setStartDate("");
        } catch (err) {
            console.error("Error updating task:", err.response ? err.response.data : err.message);
        }
    };




    // handle logout
    const handleLogout = async () => {
        try {
            console.log("Logging out from:", `${API_URL}/api/auth/logout`);
            await axios.get(`${API_URL}/api/auth/logout`, { withCredentials: true });
            window.location.href = "/";
        } catch (err) {
            console.error("Logout failed:", err.response ? err.response.data : err.message);
        }
    };


    return (
        <div className="container mt-4">
            <h2>Dashboard</h2>
            <button onClick={handleLogout} className="btn btn-outline-secondary">Logout</button>
            <hr />

            <div className="card mb-4">
                <div className="card-body">
                    <h4 className="card-title">{editingTask ? "Edit Task" : "Add New Task"}</h4>
                    <form onSubmit={editingTask ? handleUpdateTask : handleSubmit}>
                        <input type="text" value={description} onChange={(e) => setDescription(e.target.value)}
                               required/>
                        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                        </select>
                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required/>
                        <button type="submit" onClick={() => console.log("Update button clicked")}>
                            {editingTask ? "Update Task" : "Add Task"}
                        </button>
                        {}
                        {editingTask && <button type="button"
                                                onClick={() => setEditingTask(null)}>Cancel</button>}
                    </form>
                </div>
            </div>
            <h3>Your Tasks</h3>
            {tasks && tasks.length > 0 ? (
                <ul>
                    {tasks.map(task => (
                        <li key={task._id}>
                            {task.description} - {task.priority} - Deadline: {new Date(task.deadline).toLocaleDateString()}
                            <button onClick={() => handleEditClick(task)}>Edit</button>
                            <button onClick={() => handleDeleteTask(task._id)}>Delete</button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No tasks found.</p>
            )}

        </div>
    );
};

export default Dashboard;
