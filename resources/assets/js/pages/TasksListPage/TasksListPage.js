import React, { Component } from 'react';
import Control from './../../components/Control/Control';
import Search from './../../components/Search/Search';
import Sort from './../../components/Sort/Sort';
import TasksList from './../../components/TasksList/TasksList';
import TaskItem from './../../components/TaskItem/TaskItem';
class TasksListPage extends Component{
    render(){
        return (
            <React.Fragment>
                <Control>
                    <Search></Search>
                    <Sort></Sort>
                </Control>
                <TasksList>
                    <TaskItem>
                    </TaskItem>
                </TasksList>
            </React.Fragment>
        )
    }
}

export default TasksListPage;