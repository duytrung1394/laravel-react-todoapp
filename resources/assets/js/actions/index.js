import * as Types from "./../constants/ActionsType";
import callApi from './../utils/callApi';

export const actFetchAllApi = () => {
    return (dispatch) => {
        callApi("/", "get", null).then(res => {
            dispatch(actFetchAll(res.data));
        })
    }
}
export const actFetchAll = (tasks) => {
    return {
        type : Types.FETCH_ALL,
        tasks
    }
}
export const actAddTaskApi = (task) => {
    return (dispatch) => {
        callApi("/", "post", task).then(res =>{
            dispatch(actAddTask(res.data.task))
        })
    }
}
export const actAddTask = (task) => {
    return {
        type : Types.ADD_TASK,
        task
    }
}

export const actDelTaskApi = (id) => {
    return (dispatch) => {
        callApi("/"+id, "DELETE", null).then(res => {
            if(res.data === 'success'){
                dispatch(actDelTask(id))
            }
        })
    }
}
export const actDelTask = (id) => {
    return {
        type : Types.DEL_TASK,
        id
    }
}
export const actEditTaskApi = (id) => {
    return (dispatch) => {
        callApi("/"+id+"/edit", "GET", null).then(res => {
            dispatch(actEditTask(res.data))
        })
    }
}
export const actEditTask = (task) => {
    return {
        type : Types.EDIT_TASK,
        task
    }
}
export const actUpdateTaskApi = (task) => {
    return (dispatch) => {
        callApi("/"+task.id, "PUT", task).then(res=>{
            if(res.data.messages === "success"){
                dispatch(actUpdateTask(res.data.task))
            }
        })
    }
}
export const actUpdateTask = (task) => {
    return {
        type : Types.UPDATE_TASK,
        task
    }
}

export const actSearchTask = (txtSearch) => {
    return {
        type : Types.SEARCH_TASK,
        txtSearch
    }
}
