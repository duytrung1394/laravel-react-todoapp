import * as Types from "./../constants/ActionsType";

var initialState = [];

var findIndex = (state, id) => {
    let result = -1;
    if(state.length > 0){
        state.forEach((value, index) =>{
            if(value.id === id){
                result = index;
            }
        })
    }
    return result;
}
const tasks = (state = initialState, action) => {
    switch(action.type){
        case Types.FETCH_ALL:
            return action.tasks;
        case Types.ADD_TASK:
            state.push(action.task);
            return [...state]; 
        case Types.UPDATE_TASK:
            let idEdit = action.task.id;
            let indexEdit = findIndex(state, idEdit);
            if(index !== -1){
                state[indexEdit] = action.task;
            }
            return [...state];
        case Types.DEL_TASK: 
            let id = action.id;
            let index = findIndex(state, id);
            if(index !== -1){
                state.splice(index, 1);
            }
            return [...state];
        default:
            return [...state];
    }
}
export default tasks;