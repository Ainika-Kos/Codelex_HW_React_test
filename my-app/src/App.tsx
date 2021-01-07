import React, { useEffect, useState } from 'react';
import './App.css';
import 'flexboxgrid';
import { v4 as uuidv4 } from 'uuid';

type TaskType = {
  id: string;
  name: string;
  finished: boolean;
  edit: boolean;
  editValue: string;
};

const changeArrProperties = <T extends { [key: string]: unknown }>(
  arr: { [key: string]: unknown }[],
  index: number,
  keysToChange: T
) => {
  const newArr = [...arr];

  Object.entries(keysToChange).forEach(([key, value]) => {
    newArr[index][key] = value;
  });

  return newArr;
};

const TodoApp = () => {
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [inputTask, setInputTask] = useState('');
  const [showTasks, setShowTasks] = useState('all');
  const newTasks = [...tasks];

  useEffect(() => {
    const todoStorage = localStorage.getItem('todoStorage');

    if (todoStorage) {
      setTasks(JSON.parse(todoStorage));
    }
  }, []);

  const inputChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputTask(e.target.value);
  };

  const buttonClickHandler = () => {
    if (inputTask !== '') {
      const newTodos = [
        ...tasks,
        {
          id: uuidv4(),
          name: inputTask,
          finished: false,
          edit: false,
          editValue: '',
        },
      ];

      localStorage.setItem('todoStorage', JSON.stringify(newTodos));
      setTasks(newTodos);
      setInputTask('');
    }
  };

  const finishedChangeHandler = (id: string) => {
    const index = tasks.findIndex((item) => item.id === id);
    const transformedArr = changeArrProperties(tasks, index, {
      finished: !tasks[index].finished,
    }) as TaskType[];

    setTasks(transformedArr);
    localStorage.setItem('todoStorage', JSON.stringify(transformedArr));
  };

  const editHandler = (id: string) => {
    const index = tasks.findIndex((item) => item.id === id);
    newTasks[index].edit = !newTasks[index].edit;
    newTasks[index].editValue = newTasks[index].name;
    setTasks(newTasks);
    localStorage.setItem('todoStorage', JSON.stringify(newTasks));
  };

  const deleteHandler = (id: string) => {
    const index = tasks.findIndex((item) => item.id === id);
    newTasks.splice(index, 1);
    setTasks(newTasks);
    localStorage.setItem('todoStorage', JSON.stringify(newTasks));
  };

  const editInputHandler = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const index = tasks.findIndex((item) => item.id === id);
    newTasks[index].editValue = e.target.value;
    setTasks(newTasks);
    localStorage.setItem('todoStorage', JSON.stringify(newTasks));
  };

  const editCancelHandler = (id: string) => {
    const index = tasks.findIndex((item) => item.id === id);
    newTasks[index].edit = false;
    newTasks[index].editValue = '';
    setTasks(newTasks);
    localStorage.setItem('todoStorage', JSON.stringify(newTasks));
  };

  const editSaveHandler = (id: string) => {
    const index = tasks.findIndex((item) => item.id === id);
    newTasks[index].edit = false;
    newTasks[index].name = newTasks[index].editValue;
    newTasks[index].editValue = '';
    setTasks(newTasks);
    localStorage.setItem('todoStorage', JSON.stringify(newTasks));
  };

  const copyHandler = (id: string) => {
    const index = tasks.findIndex((item) => item.id === id);
    const taskCopy = {
      ...tasks[index],
      id: uuidv4(),
    };

    setTasks([...tasks, taskCopy]);
    localStorage.setItem('todoStorage', JSON.stringify([...tasks, taskCopy]));
  };

  let filteredArr = tasks;
  if (showTasks === 'done') {
    filteredArr = [...tasks].filter(({ finished }) => {
      return finished;
    });
  } else if (showTasks === 'todo') {
    filteredArr = [...tasks].filter(({ finished }) => {
      return !finished;
    });
  }

  return (
    <div className="container">
      <div className="row center-xs">
        <div className="col-xs-12 col-md-9">
          <div className="todo-app">
            <div className="header">
              <h2>Your todo list</h2>
              <h3>You have {tasks.length ? tasks.length : 'no'} tasks in total</h3>
              <div>
                <button
                  type="button"
                  onClick={() => setShowTasks('all')}
                  data-testid="button-All-tasks"
                >
                  All tasks
                </button>
                <button
                  type="button"
                  onClick={() => setShowTasks('todo')}
                  data-testid="button-Active-tasks"
                >
                  Active tasks
                </button>
                <button
                  type="button"
                  onClick={() => setShowTasks('done')}
                  data-testid="button-Completed-tasks"
                >
                  Completed tasks
                </button>
              </div>
            </div>
            <input
              className="todo-app__task-form"
              placeholder="Enter your task..."
              type="text"
              value={inputTask}
              onChange={(e) => inputChangeHandler(e)}
              data-testid="input"
            />
            <button
              type="button"
              className="button-actions"
              onClick={buttonClickHandler}
              data-testid="button-Add"
            >
              Add
            </button>
            <br />
            <br />
            <div>
              {filteredArr.map(({ id, name, finished, edit, editValue }) => {
                return (
                  <div className="todo-app__task" key={id} data-testid="item">
                    {!edit ? (
                      <div className="todo-app__task__actions">
                        <input
                          type="checkbox"
                          className="todo-app__checkbox"
                          checked={finished}
                          onChange={() => finishedChangeHandler(id)}
                          id={`${id}`}
                          data-testid="item-checkbox"
                        />
                        <label
                          htmlFor={`${id}`}
                          data-testid="item-text"
                          className={`todo-app__text ${finished && 'todo-app__text--finished'}`}
                        >
                          {name}
                        </label>
                        <button
                          type="button"
                          className="button-actions button-actions--secondary"
                          onClick={() => editHandler(id)}
                          data-testid="item-edit"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="button-actions button-actions--secondary"
                          onClick={() => deleteHandler(id)}
                          data-testid="item-delete"
                        >
                          Delete
                        </button>
                        <button
                          type="button"
                          className="button-actions button-actions--secondary"
                          onClick={() => copyHandler(id)}
                          data-testid="item-copy"
                        >
                          Copy
                        </button>
                      </div>
                    ) : (
                      <div className="todo-app__task__actions">
                        <div>
                          <input
                            type="text"
                            className="todo-app__task-form todo-app__task--edit"
                            value={editValue}
                            onChange={(e) => editInputHandler(e, id)}
                            data-testid="input-edit"
                          />
                          <button
                            type="button"
                            className="button-actions button-actions--secondary"
                            onClick={() => editSaveHandler(id)}
                            data-testid="item-save"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            className="button-actions button-actions--secondary"
                            onClick={() => editCancelHandler(id)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default TodoApp;
