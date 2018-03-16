import React, { Component } from "react";
import { Link } from "react-router-dom";
import "./Control.css";
class Control extends Component {
    render() {
        return (
            <div className='control row'>
                { this.props.children }
                <div className='col-4'>
                    <Link to='/tasks/add' exact='false' className="btn btn-info button">Thêm công việc</Link>
                </div>
            </div>
        );
    }
}
export default Control;