import TaskCanvas from "./TaskCanvas";
import TaskForm from "./TaskForm";
import TasksGrid from "./TasksGrid";

export default function TasksCrud() {
    return(
        <>
        <TasksGrid />
        <TaskCanvas />
        {/* <TaskForm /> */}
        </>
    )
}