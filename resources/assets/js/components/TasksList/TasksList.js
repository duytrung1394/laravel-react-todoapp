import React, { Component } from 'react';
import "./TasksList.css";
class TasksList extends Component {
    render() {
        return (
            <div className="card">
                <h5 className="card-header">Danh sách công việc</h5>
                <div className="card-body">
                    <table className="table">
                        <thead>
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">Tên công việc</th>
                            <th scope="col">Độ khó</th>
                            <th scope="col">Tình trạng</th>
                            <th scope="col">Hành động</th>
                        </tr>
                        </thead>
                        <tbody>
                            { this.props.children }
                            { this.props.children }
                            { this.props.children }
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }
}
export default TasksList;