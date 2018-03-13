import React, { Component } from 'react';

class TaskItem extends Component {
    render() {
        return ( 
            <tr>
                <th scope="row">1</th>
                <td>Mark</td>
                <td>Otto</td>
                <td>Otto</td>
                <td> 
                    <button type="button" className="btn btn-warning btn-sm mr-1">Sửa</button>
                    <button type="button" className="btn btn-danger btn-sm">Xóa</button>
                </td>
            </tr>
        )
    }
}
export default TaskItem;