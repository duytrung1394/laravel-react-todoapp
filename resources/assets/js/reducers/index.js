import { combineReducers } from 'redux';
import tasks from './tasks';
import editTask from './editTask';
import txtSearch from './searchTask';
import sortTask from './sortTask';

const appReducers = combineReducers({
    tasks,
    editTask,
    txtSearch,
    sortTask
});
export default appReducers;