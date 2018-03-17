import React, { Component } from "react";
import "./Sort.css";
class Sort extends Component {   
    handleSort = (by, dir) => {
        this.props.onSort({
            by : by,
            dir : dir
        })
    }
    render() {
        let { sort } = this.props;
        let sortBy = sort.by === 'name' ? 'name' : 'level';
        let sortDir = sort.dir === 1 ? 'ASC' : 'DESC';
        let elmSortTitle = sortBy.toUpperCase()+'-'+sortDir.toUpperCase();
        
        return (
            <div className='col-3'>
                <div className="input-group mb-3">
                    <div className="dropdown show">
                        <a className="btn btn-info dropdown-toggle" href="#" role="button" id="dropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        Sắp xếp
                        </a>
                        <div className="dropdown-menu" aria-labelledby="dropdownMenuLink">
                            <button className="dropdown-item" onClick={() => this.handleSort('name',1)}>A-Z</button>
                            <button className="dropdown-item" onClick={() => this.handleSort('name',-1)}>Z-A</button>
                            <button className="dropdown-item" onClick={() => this.handleSort('level',1)}>Level tăng dần</button>
                            <button className="dropdown-item" onClick={() => this.handleSort('level',-1)}>Level giảm dần</button>
                        </div>
                    </div>
                    <span className='sort-title'>{ elmSortTitle }</span>
                </div>
            </div>
        );
    }
}
export default Sort;