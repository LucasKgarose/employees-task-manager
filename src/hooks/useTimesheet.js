import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs,
  addDoc,
  updateDoc,
  doc,
  Timestamp 
} from 'firebase/firestore';

export function useTimesheet(employeeId, weekStart) {
  const [timesheet, setTimesheet] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!employeeId || !weekStart) return;

    const fetchTimesheet = async () => {
      try {
        setLoading(true);
        
        // Get timesheet for this week
        const timesheetQuery = query(
          collection(db, 'timesheets'),
          where('employeeId', '==', employeeId),
          where('weekStart', '==', weekStart)
        );
        const timesheetSnapshot = await getDocs(timesheetQuery);
        
        if (!timesheetSnapshot.empty) {
          const timesheetDoc = timesheetSnapshot.docs[0];
          setTimesheet({ id: timesheetDoc.id, ...timesheetDoc.data() });
        } else {
          setTimesheet(null);
        }

        // Get all tasks for this employee (client-side filtering to avoid composite index)
        const weekEnd = getWeekEnd(weekStart);
        const tasksQuery = query(
          collection(db, 'tasks')
        );
        const tasksSnapshot = await getDocs(tasksQuery);
        
        // Filter tasks client-side
        const tasksData = tasksSnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          .filter(task => {
            // Match assignee - normalize both values for comparison
            const taskAssignee = (task.assignee || '').toLowerCase().trim();
            const empId = (employeeId || '').toLowerCase().trim();
            
            const assigneeMatch = taskAssignee === empId || 
                                  taskAssignee.includes(empId) ||
                                  empId.includes(taskAssignee);
            
            // Match date range (tasks with due date in this week)
            const taskDate = task.dueDate;
            const dateMatch = taskDate && taskDate >= weekStart && taskDate <= weekEnd;
            
            return assigneeMatch && dateMatch;
          });
        
        console.log(`Found ${tasksData.length} tasks for ${employeeId} in week ${weekStart}`);
        setTasks(tasksData);

        setError(null);
      } catch (err) {
        console.error('Error fetching timesheet:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTimesheet();
  }, [employeeId, weekStart]);

  const submitTimesheet = async (lunchHours = 0) => {
    try {
      const weekEnd = getWeekEnd(weekStart);
      
      if (timesheet?.id) {
        // Update existing
        await updateDoc(doc(db, 'timesheets', timesheet.id), {
          updatedAt: new Date().toISOString(),
          tasks: tasks.map(t => t.id),
          lunchHours: Number(lunchHours) || 0
        });
      } else {
        // Create new
        await addDoc(collection(db, 'timesheets'), {
          employeeId,
          weekStart,
          weekEnd,
          tasks: tasks.map(t => t.id),
          lunchHours: Number(lunchHours) || 0,
          approved: false,
          comments: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error('Error submitting timesheet:', err);
      throw err;
    }
  };

  const approveTimesheet = async (approverId, comments) => {
    if (!timesheet?.id) throw new Error('No timesheet to approve');
    
    try {
      await updateDoc(doc(db, 'timesheets', timesheet.id), {
        approved: true,
        approvedBy: approverId,
        approvedAt: new Date().toISOString(),
        comments: comments || timesheet.comments
      });
    } catch (err) {
      console.error('Error approving timesheet:', err);
      throw err;
    }
  };

  return {
    timesheet,
    tasks,
    loading,
    error,
    submitTimesheet,
    approveTimesheet
  };
}

// Helper to calculate week end date
function getWeekEnd(weekStart) {
  const date = new Date(weekStart);
  date.setDate(date.getDate() + 6);
  return date.toISOString().split('T')[0];
}

// Helper to get current week start (Monday)
export function getCurrentWeekStart() {
  const today = new Date();
  const day = today.getDay();
  const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
  const monday = new Date(today.setDate(diff));
  return monday.toISOString().split('T')[0];
}
