import React, { Component } from 'react';
import Control from './../../components/Control/Control';
import Search from './../../components/Search/Search';
import Sort from './../../components/Sort/Sort';
import TasksList from './../../components/TasksList/TasksList';
import TaskItem from './../../components/TaskItem/TaskItem';
import { connect } from 'react-redux';
import { actFetchAllApi, actDelTaskApi, actEditTaskApi, actUpdateTaskApi, actSearchTask, actSortTask } from './../../actions/index';
import PropTypes from 'prop-types';

class TasksListPage extends Component{

    componentDidMount()
    {
        this.props.onFetchAll();
    }

    onDelItem = (id) => {
        this.props.onDelItem(id);
    }
    onUpdateTask = (task) => {
        // change status
        if(task.status === 0){
            task.status = 1;
        }else{
            task.status = 0;
        }
        // call props update task
        this.props.onUpdateTask(task);
    }

    onSearh = (txtSearch) => {
        this.props.onSearchTask(txtSearch);
    }
    onSort = (sort) => {
        this.props.onSortTask(sort);
    }
    render(){
        let { tasks, txtSearch, sort } = this.props;
        console.log(sort);
        // console.log(tasks);
        if(txtSearch){
            tasks = tasks.filter((task, index) => {
                return task.name.toLowerCase().indexOf(txtSearch.toLowerCase()) !== -1;
            })
        }
        this.funcSort(tasks, sort);
        return (
            <React.Fragment>
                <Control>
                    <Search onSearch={ this.onSearh }></Search>
                    <Sort onSort={ this.onSort } sort={sort}></Sort>
                </Control>
                <TasksList>
                    { this.showTasks(tasks) }
                </TasksList>
            </React.Fragment>
        )
    }
    showTasks = (tasks) => {
        let result = [];
        if(tasks.length > 0){
            result = tasks.map((task, index) => {
                return <TaskItem key={index}
                                task={task}
                                index= {index}
                                onDelItem={this.onDelItem}
                                onUpdateTask={this.onUpdateTask}
                        />
            })
        }
        return result;
    }
    funcSort = (tasks, sort) => {
        if(tasks.length > 0){
            if(sort.by === 'name'){
                tasks = tasks.sort((a, b) => {
                    if(a.name > b.name) return sort.dir;
                    else if(a.name < b.name) return -sort.dir;
                    else return 0;
                })
            }
            if(sort.by === 'level'){
                tasks = tasks.sort((a, b) => {
                    if(a.level > b.level) return sort.dir;
                    else if(a.level < b.level) return -sort.dir;
                    else return 0;
                })
            }
        }
        return tasks;
    } 
}
TasksListPage.propTypes = {
    tasks : PropTypes.arrayOf(
        PropTypes.shape({
            id : PropTypes.number.isRequired,
            name : PropTypes.string.isRequired,
            content : PropTypes.string.isRequired,
            level :PropTypes.number.isRequired,
            status : PropTypes.number.isRequired
        })
    ).isRequired,
    onFetchAll : PropTypes.func.isRequired,
    onDelItem : PropTypes.func.isRequired,
    onUpdateTask : PropTypes.func.isRequired,
}

const mapStateToProps = state => {
    return {
        tasks : state.tasks,
        txtSearch : state.txtSearch,
        sort : state.sortTask
    }
}
const mapDispatchToProps = (dispatch, props) => {
    return {
        onFetchAll : () => {
            dispatch(actFetchAllApi());
        },
        onDelItem : (id) => {
            dispatch(actDelTaskApi(id))
        },
        onUpdateTask : (task) => {
            dispatch(actUpdateTaskApi(task))
        },
        onSearchTask : (txtSearch) => {
            dispatch(actSearchTask(txtSearch))
        },
        onSortTask : (sort) => {
            dispatch(actSortTask(sort))
        }
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(TasksListPage);