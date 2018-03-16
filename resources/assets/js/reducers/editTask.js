import * as Types from "./../constants/ActionsType";

var initialState = [];

const editTask = (state = initialState, action) => {
    switch(action.type){
        case Types.EDIT_TASK:
            return action.task;
        default:
            return [...state];
    }
}
export default editTask;