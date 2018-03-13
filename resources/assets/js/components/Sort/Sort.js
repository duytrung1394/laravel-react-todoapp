import React, { Component } from "react";
import "./Sort.css";
class Sort extends Component {
    render() {
        return (
            <div className='col-3'>
                <div className="input-group mb-3">
                    <div className="dropdown show">
                        <a className="btn btn-info dropdown-toggle" href="#" role="button" id="dropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        Dropdown link
                        </a>
                        <div className="dropdown-menu" aria-labelledby="dropdownMenuLink">
                            <a className="dropdown-item" href="#">Action</a>
                            <a className="dropdown-item" href="#">Another action</a>
                            <a className="dropdown-item" href="#">Something else here</a>
                        </div>
                    </div>
                    <span className='sort-title'>Mới nhất</span>
                </div>
            </div>
        );
    }
}
export default Sort;