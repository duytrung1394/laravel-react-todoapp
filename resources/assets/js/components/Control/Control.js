import React, { Component } from "react";
import "./Control.css";
class Control extends Component {
    render() {
        return (
            <div className='control row'>
                { this.props.children }
                <div className='col-4'>
                    <button type="button" className="btn btn-info">Thêm công việc</button>
                </div>
            </div>
        );
    }
}
export default Control;