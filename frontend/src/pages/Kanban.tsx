import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { FaEdit, FaTrash } from 'react-icons/fa'
import toast from 'react-hot-toast'
import ThreeBackground from '../components/ThreeBackground'
import { socket } from '../socket'
import { Tooltip as ReactTooltip } from 'react-tooltip';

interface Task {
  _id: string
  title: string
  description: string
  status: string
  assignee?: string
  order: number
  dueDate?: string
}

interface Column {
  _id: string
  title: string
  order: number
  tasks: Task[]
}

export default function Kanban() {
  const { id } = useParams()
  const [columns, setColumns] = useState<Column[]>([])
  const [loading, setLoading] = useState(true)
  // const socketRef = useRef<Socket | null>(null) // No longer needed
  // Modal state
  const [showColModal, setShowColModal] = useState(false)
  const [newColTitle, setNewColTitle] = useState('')
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDesc, setNewTaskDesc] = useState('')
  const [taskColId, setTaskColId] = useState<string | null>(null)
  // Add modal state for edit/delete
  const [editColId, setEditColId] = useState<string | null>(null)
  const [editColTitle, setEditColTitle] = useState('')
  const [deleteColId, setDeleteColId] = useState<string | null>(null)
  const [editTaskId, setEditTaskId] = useState<string | null>(null)
  const [editTaskTitle, setEditTaskTitle] = useState('')
  const [editTaskDesc, setEditTaskDesc] = useState('')
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null)
  // Add loading state for async actions
  const [actionLoading, setActionLoading] = useState(false)
  const [newTaskDue, setNewTaskDue] = useState('')
  const [editTaskDue, setEditTaskDue] = useState('');

  useEffect(() => {
    // Join the board room for real-time updates
    if (!id) return;
    socket.emit('joinBoard', id)
    return () => {
      socket.emit('leaveBoard', id)
    }
  }, [id])

  useEffect(() => {
    const fetchColumns = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      const token = localStorage.getItem('token') || ''
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        const res = await fetch(`${apiUrl}/api/boards/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error('Board not found')
        const data = await res.json()
        setColumns(data.columns || [])
      } catch (err) {
        toast.error('Failed to load board')
        setColumns([])
      } finally {
        setLoading(false)
      }
    }
    fetchColumns()
  }, [id])

  // Real-time listeners
  useEffect(() => {
    // Task moved
    socket.on('taskMoved', ({ task, toColumnId, newOrder }: any) => {
      setColumns((prev) => {
        let oldColIdx = -1, taskIdx = -1
        prev.forEach((col, ci) => {
          const idx = col.tasks.findIndex(t => t._id === task._id)
          if (idx !== -1) {
            oldColIdx = ci
            taskIdx = idx
          }
        })
        if (oldColIdx === -1) return prev
        const newCols = [...prev]
        const [movedTask] = newCols[oldColIdx].tasks.splice(taskIdx, 1)
        const toColIdx = newCols.findIndex(col => col._id === toColumnId)
        if (toColIdx === -1) return prev
        newCols[toColIdx].tasks.splice(newOrder, 0, movedTask)
        return newCols
      })
    })
    // Column created
    socket.on('columnCreated', ({ column }) => {
      setColumns(cols => [...cols, column]);
      setShowColModal(false);
      setNewColTitle('');
      setEditColId(null);
      setEditColTitle('');
      toast.success('Column added!');
    });
    // Column updated
    socket.on('columnUpdated', (column) => {
      setColumns(cols => cols.map(col => col._id === column._id ? { ...col, ...column } : col));
      setShowColModal(false);
      setEditColId(null);
      setEditColTitle('');
      toast.success('Column updated!');
    });
    // Column deleted
    socket.on('columnDeleted', ({ columnId }) => {
      setColumns(cols => cols.filter(col => col._id !== columnId));
      setDeleteColId(null);
      toast.success('Column deleted!');
    });
    // Task created
    socket.on('taskCreated', (task) => {
      setColumns(cols => cols.map(col => col._id === task.column ? { ...col, tasks: [task, ...col.tasks] } : col));
      setShowTaskModal(false);
      setNewTaskTitle('');
      setNewTaskDesc('');
      setNewTaskDue('');
      setTaskColId(null);
      toast.success('Task added!');
    });
    // Task updated
    socket.on('taskUpdated', (task) => {
      setColumns(cols => cols.map(col => ({
        ...col,
        tasks: col.tasks.map(t => t._id === task._id ? { ...t, ...task } : t)
      })));
      setShowTaskModal(false);
      setEditTaskId(null);
      setEditTaskTitle('');
      setEditTaskDesc('');
      setEditTaskDue('');
      toast.success('Task updated!');
    });
    // Task deleted
    socket.on('taskDeleted', ({ taskId }) => {
      setColumns(cols => cols.map(col => ({
        ...col,
        tasks: col.tasks.filter(t => t._id !== taskId)
      })));
      setDeleteTaskId(null);
      toast.success('Task deleted!');
    });
    return () => {
      socket.off('taskMoved');
      socket.off('columnCreated');
      socket.off('columnUpdated');
      socket.off('columnDeleted');
      socket.off('taskCreated');
      socket.off('taskUpdated');
      socket.off('taskDeleted');
    }
  }, [])

  // DnD-kit setup
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    let fromColIdx = -1, toColIdx = -1, taskIdx = -1;
    columns.forEach((col, ci) => {
      const idx = col.tasks.findIndex(t => t._id === active.id);
      if (idx !== -1) {
        fromColIdx = ci;
        taskIdx = idx;
      }
      if (col._id === over.data.current?.colId) {
        toColIdx = ci;
      }
    });
    if (fromColIdx === -1 || toColIdx === -1) return;
    const newColumns = [...columns];
    const [task] = newColumns[fromColIdx].tasks.splice(taskIdx, 1);
    newColumns[toColIdx].tasks.splice(over.data.current?.taskIdx ?? 0, 0, task);
    setColumns(newColumns);
    // Update backend
    const token = localStorage.getItem('token') || '';
    const apiUrl = import.meta.env.VITE_API_URL;
    await fetch(`${apiUrl}/api/tasks/${task._id}/move`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ toColumnId: newColumns[toColIdx]._id, newOrder: over.data.current?.taskIdx ?? 0 }),
    });
    // Emit socket event
    socket.emit('taskMoved', {
      task,
      toColumnId: newColumns[toColIdx]._id,
      newOrder: over.data.current?.taskIdx ?? 0,
    });
  };

  // Add column
  const handleAddColumn = async () => {
    if (!newColTitle.trim()) return
    setActionLoading(true)
    const token = localStorage.getItem('token') || ''
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const res = await fetch(`${apiUrl}/api/columns/${id}/columns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: newColTitle, order: columns.length }),
      })
      if (!res.ok) throw new Error('Failed to add column')
      // Do not update state here; wait for real-time event
      // const col = await res.json()
      socket.emit('columnCreated', { boardId: id })
    } catch (err) {
      toast.error('Failed to add column')
      setActionLoading(false)
    }
  }

  // Add task
  const handleAddTask = async () => {
    if (!newTaskTitle.trim() || !taskColId) return
    setActionLoading(true)
    const token = localStorage.getItem('token') || ''
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const res = await fetch(`${apiUrl}/api/tasks/${taskColId}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: newTaskTitle, description: newTaskDesc, order: 0, dueDate: newTaskDue }),
      })
      if (!res.ok) throw new Error('Failed to add task')
      // Do not update state here; wait for real-time event
      // const task = await res.json()
      socket.emit('taskCreated', { colId: taskColId, boardId: id })
    } catch (err) {
      toast.error('Failed to add task')
      setActionLoading(false)
    }
  }

  // Edit column
  const handleEditColumn = async () => {
    if (!editColId || !editColTitle.trim()) return
    setActionLoading(true)
    const token = localStorage.getItem('token') || ''
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const res = await fetch(`${apiUrl}/api/columns/columns/${editColId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: editColTitle }),
      })
      if (!res.ok) throw new Error('Failed to update column')
      // Do not update state here; wait for real-time event
      socket.emit('columnUpdated', { colId: editColId, boardId: id })
    } catch (err) {
      toast.error('Failed to update column')
      setActionLoading(false)
    }
  }
  // Delete column
  const handleDeleteColumn = async () => {
    if (!deleteColId) return
    setActionLoading(true)
    const token = localStorage.getItem('token') || ''
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const res = await fetch(`${apiUrl}/api/columns/columns/${deleteColId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Failed to delete column')
      // Do not update state here; wait for real-time event
      socket.emit('columnDeleted', { colId: deleteColId, boardId: id })
    } catch (err) {
      toast.error('Failed to delete column')
      setActionLoading(false)
    }
  }
  // Edit task
  const handleEditTask = async () => {
    if (!editTaskId || !editTaskTitle.trim()) return
    setActionLoading(true)
    const token = localStorage.getItem('token') || ''
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const res = await fetch(`${apiUrl}/api/tasks/tasks/${editTaskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: editTaskTitle, description: editTaskDesc, dueDate: editTaskDue }),
      })
      if (!res.ok) throw new Error('Failed to update task')
      // Do not update state here; wait for real-time event
      socket.emit('taskUpdated', { taskId: editTaskId, boardId: id })
    } catch (err) {
      toast.error('Failed to update task')
      setActionLoading(false)
    }
  }
  // Delete task
  const handleDeleteTask = async () => {
    if (!deleteTaskId) return
    setActionLoading(true)
    const token = localStorage.getItem('token') || ''
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const res = await fetch(`${apiUrl}/api/tasks/tasks/${deleteTaskId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Failed to delete task')
      // Do not update state here; wait for real-time event
      socket.emit('taskDeleted', { taskId: deleteTaskId, boardId: id })
    } catch (err) {
      toast.error('Failed to delete task')
      setActionLoading(false)
    }
  }

  // useEffect(() => {
  //   if (!socketRef.current) return;
  //   const socket = socketRef.current;
  //   socket.on('columnCreated', ({ column }) => {
  //     setColumns(cols => [...cols, column]);
  //   });
  //   return () => {
  //     socket.off('columnCreated');
  //   };
  // }, []);

  if (loading) return <div style={{background:'#fff',color:'#111',fontSize:'2rem',padding:'2rem',borderRadius:'1rem'}} >Loading Kanban board...</div>;
  if (!id) return <div style={{background:'#fff',color:'#111',fontSize:'2rem',padding:'2rem',borderRadius:'1rem'}} >No board selected. (Debug: missing board id)</div>;
  if (!columns || !Array.isArray(columns)) return <div style={{background:'#fff',color:'#111',fontSize:'2rem',padding:'2rem',borderRadius:'1rem'}} >No columns data. (Debug: columns={JSON.stringify(columns)})</div>;

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-x-auto pt-16 flex flex-col items-center">
      <ThreeBackground />
      <div className="w-full max-w-7xl px-2 sm:px-4 lg:px-8">
        <header className="flex flex-col sm:flex-row items-center justify-between py-6 gap-4 sm:gap-0">
          <motion.h1
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl sm:text-3xl font-bold text-white text-left w-full sm:w-auto"
          >
            Kanban Board
          </motion.h1>
          {/* Add any board-level actions here if needed */}
        </header>
        {/* Columns Grid */}
        <main className="pb-12">
          <div className="w-full overflow-x-auto">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <div className="flex gap-4 md:gap-8 min-w-[320px]">
                {columns.length === 0 ? (
                  <div className="bg-gray-800 rounded-2xl p-8 min-w-[300px] max-w-xs w-full shadow-lg flex flex-col items-center justify-center text-white text-lg">
                    No columns found for this board.<br />
                    <button
                      className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold shadow"
                      onClick={() => setShowColModal(true)}
                    >
                      + Add Column
                    </button>
                  </div>
                ) : (
                  columns.filter(Boolean).map((col, colIdx) => {
                    const safeCol = {
                      ...col,
                      title: col?.title || '(Untitled Column)',
                      tasks: Array.isArray(col?.tasks) ? col.tasks : [],
                    };
                    return (
                      <motion.div
                        key={safeCol._id || colIdx}
                        className="bg-gray-800 rounded-2xl p-4 min-w-[260px] max-w-xs w-full shadow-lg flex-shrink-0 flex flex-col hover:shadow-2xl transition-all duration-200 group"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * colIdx }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h2 className="text-lg font-bold text-white truncate max-w-[180px]" title={safeCol.title}>{safeCol.title}</h2>
                          <div className="flex gap-2">
                            <button
                              className="text-xs text-blue-400 hover:underline"
                              data-tooltip-id={`edit-col-${col._id}`}
                              onClick={() => { console.log('Edit Column', col._id); setEditColId(col._id); setEditColTitle(col.title); setShowColModal(true) }}
                            >
                              <FaEdit />
                            </button>
                            <ReactTooltip id={`edit-col-${col._id}`} place="top" content="Edit Column" />
                            <button
                              className="text-xs text-red-400 hover:underline"
                              data-tooltip-id={`delete-col-${col._id}`}
                              onClick={() => { console.log('Delete Column', col._id); setDeleteColId(col._id); setShowColModal(true) }}
                            >
                              <FaTrash />
                            </button>
                            <ReactTooltip id={`delete-col-${col._id}`} place="top" content="Delete Column" />
                          </div>
                        </div>
                        <div className="flex flex-col gap-4">
                          {safeCol.tasks.length === 0 && (
                            <div className="text-gray-400 text-center py-4">No tasks yet</div>
                          )}
                          {safeCol.tasks.map((task, taskIdx) => (
                            <motion.div
                              key={task._id || taskIdx}
                              whileHover={{ scale: 1.03 }}
                              className="bg-gray-900 rounded-xl p-4 shadow text-white cursor-grab hover:shadow-xl transition-all duration-200 group"
                              id={task._id}
                              data-col-id={col._id}
                              data-task-idx={taskIdx}
                              style={{ touchAction: 'none' }}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold truncate" title={task.title}>{task.title}</span>
                                {task.status && (
                                  <span className={`ml-2 px-2 py-1 text-xs rounded ${task.status === 'Done' ? 'bg-green-600' : task.status === 'In Progress' ? 'bg-yellow-500' : 'bg-blue-600'} text-white`}>{task.status}</span>
                                )}
                              </div>
                              {task.dueDate && (
                                <div className="text-xs text-gray-400 mb-1">Due: {new Date(task.dueDate).toLocaleDateString()}</div>
                              )}
                              <div className="text-sm text-gray-400">{task.description}</div>
                              <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                                <div className="flex gap-2">
                                  <button
                                    className="text-xs text-blue-400 hover:underline"
                                    data-tooltip-id={`edit-task-${task._id}`}
                                    onClick={() => { console.log('Edit Task', task._id); setEditTaskId(task._id); setEditTaskTitle(task.title); setEditTaskDesc(task.description); setEditTaskDue(task.dueDate || ''); setShowTaskModal(true) }}
                                  >
                                    <FaEdit />
                                  </button>
                                  <ReactTooltip id={`edit-task-${task._id}`} place="top" content="Edit Task" />
                                  <button
                                    className="text-xs text-red-400 hover:underline"
                                    data-tooltip-id={`delete-task-${task._id}`}
                                    onClick={() => { console.log('Delete Task', task._id); setDeleteTaskId(task._id); setShowTaskModal(true) }}
                                  >
                                    <FaTrash />
                                  </button>
                                  <ReactTooltip id={`delete-task-${task._id}`} place="top" content="Delete Task" />
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                        <button
                          className="text-xs text-blue-400 hover:underline ml-2 mt-4"
                          onClick={() => { console.log('Add Task', col._id); setTaskColId(col._id); setShowTaskModal(true) }}
                        >
                          + Add Task
                        </button>
                      </motion.div>
                    );
                  })
                )}
                {/* Add Column Button (if columns exist) */}
                {columns.length > 0 && (
                  <motion.div
                    whileHover={{ scale: 1.04 }}
                    className="bg-gray-800/60 rounded-2xl shadow-xl p-4 min-w-[300px] flex flex-col items-center justify-center cursor-pointer border-2 border-dashed border-blue-500 text-blue-400 hover:bg-gray-700/80 transition-all duration-200"
                    onClick={() => setShowColModal(true)}
                  >
                    <span className="text-lg font-bold">+ Add Column</span>
                  </motion.div>
                )}
              </div>
            </DndContext>
          </div>
        </main>
      </div>
      {/* Add Column Modal */}
      <AnimatePresence>
        {showColModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-2xl p-8 shadow-2xl w-full max-w-md flex flex-col items-center"
            >
              <h3 className="text-xl font-bold text-white mb-4">
                {editColId ? 'Edit Column' : 'Add Column'}
              </h3>
              <input
                className="w-full rounded-md bg-gray-800 text-white border border-gray-700 p-2 mb-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Column Title"
                value={editColId ? editColTitle : newColTitle}
                onChange={e => editColId ? setEditColTitle(e.target.value) : setNewColTitle(e.target.value)}
              />
              <div className="flex gap-4 w-full">
                <button
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold"
                  onClick={editColId ? handleEditColumn : handleAddColumn}
                >
                  {actionLoading ? <div className="text-white">Loading...</div> : (editColId ? 'Save Changes' : 'Add')}
                </button>
                <button
                  className="flex-1 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-md"
                  onClick={() => setShowColModal(false)}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Add Task Modal */}
      <AnimatePresence>
        {showTaskModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-2xl p-8 shadow-2xl w-full max-w-md flex flex-col items-center"
            >
              <h3 className="text-xl font-bold text-white mb-4">
                {editTaskId ? 'Edit Task' : 'Add Task'}
              </h3>
              <input
                className="w-full rounded-md bg-gray-800 text-white border border-gray-700 p-2 mb-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Task Title"
                value={editTaskId ? editTaskTitle : newTaskTitle}
                onChange={e => editTaskId ? setEditTaskTitle(e.target.value) : setNewTaskTitle(e.target.value)}
              />
              <textarea
                className="w-full rounded-md bg-gray-800 text-white border border-gray-700 p-2 mb-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Task Description"
                value={editTaskId ? editTaskDesc : newTaskDesc}
                onChange={e => editTaskId ? setEditTaskDesc(e.target.value) : setNewTaskDesc(e.target.value)}
              />
              <input
                type="date"
                className="w-full rounded-md bg-gray-800 text-white border border-gray-700 p-2 mb-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Due Date"
                value={editTaskId ? editTaskDue : newTaskDue}
                onChange={e => editTaskId ? setEditTaskDue(e.target.value) : setNewTaskDue(e.target.value)}
                disabled={!editTaskId && !taskColId}
              />
              <div className="flex gap-4 w-full">
                <button
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold"
                  onClick={editTaskId ? handleEditTask : handleAddTask}
                >
                  {actionLoading ? <div className="text-white">Loading...</div> : (editTaskId ? 'Save Changes' : 'Add')}
                </button>
                <button
                  className="flex-1 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-md"
                  onClick={() => setShowTaskModal(false)}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Delete Column Confirmation Modal */}
      <AnimatePresence>
        {deleteColId && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-2xl p-8 shadow-2xl w-full max-w-md flex flex-col items-center"
            >
              <h3 className="text-xl font-bold text-white mb-4">Confirm Deletion</h3>
              <p className="text-white mb-4">Are you sure you want to delete this column?</p>
              <div className="flex gap-4 w-full">
                <button
                  className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-semibold"
                  onClick={handleDeleteColumn}
                >
                  Delete
                </button>
                <button
                  className="flex-1 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-md"
                  onClick={() => setDeleteColId(null)}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Delete Task Confirmation Modal */}
      <AnimatePresence>
        {deleteTaskId && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-2xl p-8 shadow-2xl w-full max-w-md flex flex-col items-center"
            >
              <h3 className="text-xl font-bold text-white mb-4">Confirm Deletion</h3>
              <p className="text-white mb-4">Are you sure you want to delete this task?</p>
              <div className="flex gap-4 w-full">
                <button
                  className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-semibold"
                  onClick={handleDeleteTask}
                >
                  Delete
                </button>
                <button
                  className="flex-1 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-md"
                  onClick={() => setDeleteTaskId(null)}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 