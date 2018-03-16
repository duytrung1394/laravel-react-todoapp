import React, { Component } from 'react';
import { Link } from 'react-router-dom';
 
class TaskItem extends Component {

    handleDel = (id) => {
        let conf = confirm("Bạn chắc chắn xóa dữ liệu này?");
        if(conf){
            this.props.onDelItem(id);
        }
    }
    changeStatus = (task) => {
        this.props.onUpdateTask(task);
    }
    render() {
        let { task, index } = this.props;
        let elmStatusTitle = task.status === 0 ? "Chưa xong" : "Đã xong";
        let elmStatusClass = task.status === 0 ? "primary" : "success";
        return ( 
            <tr>
                <th scope="row">{ index + 1}</th>
                <td>{ task.name }</td>
                <td>{ this.showLevel(task.level) }</td>
                <td>
                    <span className={`badge badge-${elmStatusClass}`} onClick={() => this.changeStatus(task)}>{elmStatusTitle}</span>
                </td>
                <td>
                    <Link to={`tasks/${task.id}/edit`} type="button" className="btn btn-warning btn-sm mr-1" >Sửa</Link>
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => this.handleDel(task.id)}>Xóa</button>
                </td>
            </tr>
        )
    }
    showLevel = (level) => {
        switch(level){
            case 0:
                return <span className="badge badge-secondary">Small</span>
            case 1:
                return <span className="badge badge-warning">Medium</span>
            case 2:
                return <span className="badge badge-danger">Hard</span>
            default:
                return <span className="badge badge-secondary">Small</span>
        }
    }
}
export default TaskItem;