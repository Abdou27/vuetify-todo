import Vue from 'vue';
import Vuex from 'vuex';
import Localbase from 'localbase';

let db = new Localbase('vuetify-todo');
db.config.debug = false;
let TASKS = 'tasks';

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        appTitle: process.env.VUE_APP_TITLE,
        search: null,
        tasks: [],
        snackbar: {
            show: false,
            text: ""
        },
        sorting: false
    },
    mutations: {
        setSearch(state, value) {
            state.search = value;
        },
        addNewTask(state, newTask) {
            state.tasks.push(newTask);
        },
        toggleTaskDone(state, id) {
            let task = state.tasks.filter((task) => task.id === id)[0];
            task.done = ! task.done;
        },
        setTasks(state, tasks) {
            state.tasks = tasks;
        },
        updateTask(state, payload) {
            let task = state.tasks.filter((task) => task.id === payload.id)[0];
            task.title = payload.title;
            task.done = payload.done;
            task.dueDate = payload.dueDate;
        },
        deleteTask(state, id) {
            state.tasks = state.tasks.filter((task) => task.id !== id);
        },
        showSnackbarWithText(state, text) {
            let timeout = 0;
            if (state.snackbar.show) {
                state.snackbar.show = false;
                timeout = 300;
            }
            setTimeout(() => {
                state.snackbar.text = text;
                state.snackbar.show = true;
            }, timeout);
        },
        hideSnackbar(state) {
            state.snackbar.show = false;
            state.snackbar.text = "";
        },
        toggleSorting(state) {
            state.sorting = !state.sorting;
        }
    },
    actions: {
        getTasks(context) {
            db.collection(TASKS).get().then(tasks => {
                context.commit('setTasks', tasks);
            });
        },
        addNewTask(context, newTaskTitle) {
            let id;
            if (context.state.tasks.length > 0) {
                id = context.state.tasks[context.state.tasks.length - 1].id + 1;
            } else {
                id = 1;
            }
            let newTask = {
                id: id,
                title: newTaskTitle,
                done: false,
                dueDate: null
            };
            db.collection(TASKS).add(newTask).then(() => {
                context.commit('addNewTask', newTask);
                context.commit('showSnackbarWithText', "Task Added !");
            });
        },
        toggleTaskDone(context, id) {
            let task = context.state.tasks.filter((task) => task.id === id)[0];
            db.collection(TASKS).doc({id: task.id}).update({
                done: ! task.done
            }).then(() => {
                context.commit('toggleTaskDone', id);
                context.commit("showSnackbarWithText", "Task Toggled !");
            });
        },
        setTasks(context, tasks) {
            db.collection(TASKS).set(tasks);
            context.commit('setTasks', tasks);
        },
        updateTask(context, payload) {
            let task = context.state.tasks.filter((task) => task.id === payload.id)[0];
            db.collection(TASKS).doc({id: task.id}).update({title: payload.title, done: payload.done, dueDate: payload.dueDate}).then(() => {
                context.commit("updateTask", payload);
                context.commit("showSnackbarWithText", "Task Updated !");
            });
        },
        deleteTask(context, id) {
            let task = context.state.tasks.filter((task) => task.id === id)[0];
            db.collection(TASKS).doc({id: task.id}).delete().then(() => {
                context.commit('deleteTask', id);
                context.commit('showSnackbarWithText', "Task Deleted !");
            });
        }
    },
    getters: {
        tasksFiltered(state) {
            if (!state.search) {
                return state.tasks;
            }
            return state.tasks.filter(task => task.title.toLowerCase().includes(state.search.toLowerCase()));
        }
    }
})
