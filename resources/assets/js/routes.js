import HomePage from "./pages/HomePage/HomePage";
import TasksListPage from "./pages/TasksListPage/TasksListPage";

const routes = [
    {
        path  : "/",
        exact : true,
        main : () => <HomePage />
    },
    {
        path : "/tasks-list",
        exact : false,
        main : () => <TasksListPage />
    }
];
export default routes;