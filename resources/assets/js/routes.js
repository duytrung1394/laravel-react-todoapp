import React from 'react';
import HomePage from "./pages/HomePage/HomePage";
import TasksListPage from "./pages/TasksListPage/TasksListPage";
import TasksActionPage from "./pages/TasksActionPage/TasksActionPage";
import NotFoundPage from './pages/NotFoundPage/NotFoundPage';

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
    },
    {
        path : "/tasks/add",
        exact : false,
        main : ({ history }) => <TasksActionPage history={ history }/>
    },
    {
        path : "/tasks/:id/edit",
        exact : false,
        main : ({ history, match }) => <TasksActionPage history={ history } match={ match }/>
    },
    {
        path : "",
        exact : false,
        main : () => <NotFoundPage />
    }
];
export default routes;