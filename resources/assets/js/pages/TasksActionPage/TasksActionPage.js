import React, { Component } from 'react';
import "./TasksActionPage.css";
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { actAddTaskApi, actEditTaskApi, actUpdateTaskApi } from '../../actions';
import PropTypes from 'prop-types';

class TasksActionPage extends Component {
    constructor(props){
        super(props);
        this.state = {
            isEdit : false,
            name : "",
            content : "",
            level : 0,
            status: 0
        }
    }
    handleChange = (e) => {
        let target = e.target;
        let name = target.name;
        let value = target.type === "checkbox" ? target.checked : target.value;

        this.setState({
            [name] : value
        })
    }

    onSave = (e) => {
        e.preventDefault();
        let { name, level, content, id, status } = this.state;
        let { onAddTask, history, match, onUpdateTask } = this.props;
        let task = {
            id : id,
            name : name,
            content : content,
            status : +status,
            level : +level
        } 
        if(!match){
            onAddTask(task);
        }else{
            onUpdateTask(task);
        }
        history.goBack();
    }
    componentDidMount(){
        let { match } = this.props;
        if(match){
            this.props.onEditTask(match.params.id);
            this.setState({
                isEdit : true
            })
        }
    }
    componentWillReceiveProps(nextProps){
        let { editTask } = nextProps;
        this.setState({
            id : editTask.id,
            name : editTask.name,
            content : editTask.content,
            level : editTask.level,
            status : editTask.status
        });
    }

    render() {
        let elmStatus = null;
        if(this.state.isEdit === true) {
            elmStatus = <div className="form-group">
                        <label>Tình trạng</label>
                        <select className="form-control" 
                                name="status"
                                value={this.state.status}
                                onChange={this.handleChange}
                                >
                            <option value={0}>Chưa xong</option>
                            <option value={1}>Đã xong</option>
                        </select>
                    </div>;
        }

        return (
            <div>
                <form className='action-form' onSubmit={this.onSave} >
                    <h4>Thêm công việc</h4>
                    <div className="form-group">
                        <label htmlFor="name">Tên công việc</label>
                        <input type="text" className="form-control" id="name"  placeholder="Nhập tên công việc..." 
                                name="name"
                                value={this.state.name}
                                onChange={this.handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="content">Nội dung công việc</label>
                        <textarea className="form-control" id="content" rows={3}
                            name="content"
                            value={this.state.content}
                            onChange={this.handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Mức độ</label>
                        <select className="form-control" 
                                name="level"
                                value={this.state.level}
                                onChange={this.handleChange}
                                >
                            <option value={0}>Small</option>
                            <option value={1}>Medium</option>
                            <option value={2}>Hard</option>
                        </select>
                    </div>   
                    { elmStatus }
                    <button type="submit" className="btn btn-primary mr-1">Lưu lại</button>
                    <Link type="submit" to="/tasks-list" className="btn btn-secondary">Trở lại</Link>
                </form>
            </div>
        )
    }
}
TasksActionPage.propTypes = {
    editTask : PropTypes.arrayOf(
        PropTypes.shape({
            id : PropTypes.number.isRequired,
            name : PropTypes.string.isRequired,
            content : PropTypes.string.isRequired,
            level :PropTypes.number.isRequired,
            status : PropTypes.number.isRequired
        })
    ).isRequired,
    onAddTask : PropTypes.func.isRequired,
    onEditTask : PropTypes.func.isRequired,
    onUpdateTask : PropTypes.func.isRequired
}


const mapStateToProps = (state) => {
    return {
        editTask : state.editTask
    }
}
const mapDispatchToProps = (dispatch, props) => {
    return {
        onAddTask : (task) => {
            dispatch(actAddTaskApi(task))
        },
        onEditTask : (id) => {
            dispatch(actEditTaskApi(id))
        },
        onUpdateTask : (task) => {
            dispatch(actUpdateTaskApi(task))
        }
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(TasksActionPage);