import React from 'react';
import Enzyme, { shallow} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { v4 as uuidv4 } from 'uuid';
import TodoApp from './App';

Enzyme.configure({ adapter: new Adapter() });

// @ts-ignore
const addItem = (wrapper: any, content: string): Promise<any> => {
  return new Promise((resolve) => {
    const input = wrapper.find('[data-testid="input"]');

    input.simulate('change', {
      target: { id: uuidv4(), value: content },
    });

    resolve(wrapper.find('[data-testid="input"]'));

    const button = wrapper.find('[data-testid="button-Add"]');

    button.simulate('click');
  });
};

const addFullItem = (
  wrapper: any,
  id: string,
  name: string,
  finished: boolean,
  edit: boolean,
  editValue: string
): Promise<any> => {
  return new Promise((resolve) => {
    const input = wrapper.find('[data-testid="input"]');

    input.simulate('change', {
      target: {
        id,
        value: name,
      },
    });

    resolve(wrapper.find('[data-testid="input"]'));

    const button = wrapper.find('[data-testid="button-Add"]');

    button.simulate('click');
  });
};

const editFullItem = (
  wrapper: any,
  id: string,
  name: string,
  finished: boolean,
  edit: boolean,
  editValue: string
): Promise<any> => {
  return new Promise((resolve) => {
    const editButton = wrapper.find('[data-testid="item-edit"]');

    editButton.simulate('click');

    const saveButton = wrapper.find('[data-testid="item-save"]');

    saveButton.simulate('click');

    const itemText = wrapper.find('[data-testid="item-text"]');

    itemText.simulate('change', {
      target: {
        id,
        value: name,
      },
    });

    resolve(wrapper.find('[data-testid="item-text"]'));
  });
};

describe('<TodoApp />', () => {
  let wrapper = shallow(<TodoApp />);

  afterEach(() => {
    wrapper = shallow(<TodoApp />);
  });

  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => null),
        setItem: jest.fn(() => null),
      },
      writable: true,
    });
  });

  it('Renders <TodoApp /> component', () => {
    const wrapper = shallow(<TodoApp />);
    expect(wrapper).toHaveLength(1);
  });

  it('Finds button "Add"', () => {
    const button = wrapper.find('[data-testid="button-Add"]');
    expect(button.text()).toEqual('Add');
  });

  it('Finds button "All tasks"', () => {
    const button = wrapper.find('[data-testid="button-All-tasks"]');
    expect(button.text()).toBe('All tasks');
  });

  it('Finds button "Active tasks"', () => {
    const button = wrapper.find('[data-testid="button-Active-tasks"]');
    expect(button.text()).toBe('Active tasks');
  });

  it('Finds button "Completed tasks"', () => {
    const button = wrapper.find('[data-testid="button-Completed-tasks"]');
    expect(button.text()).toBe('Completed tasks');
  });

  it('Does not add empty task', () => {
    const button = wrapper.find('[data-testid="button-Add"]');
    button.simulate('click');
    const items = wrapper.find('[data-testid="item"]');
    expect(items).toHaveLength(0);
  });

  it('Adds one task', async () => {
    let input = await addItem(wrapper, 'Buy Milk');
    expect(input.props().value).toEqual('Buy Milk');

    const button = wrapper.find('[data-testid="button-Add"]');
    expect(button.text()).toEqual('Add');

    const items = wrapper.find('[data-testid="item"]');
    expect(items).toHaveLength(1);

    const taskText = items.find('[data-testid="item-text"]').text();
    expect(taskText).toBe('Buy Milk');

    input = wrapper.find('[data-testid="input"]');
    expect(input.props().value).toEqual('');

    const deleteButton = wrapper.find('[data-testid="item-delete"]');
    expect(deleteButton).toHaveLength(1);
    expect(deleteButton.text()).toEqual('Delete');
  });

  it('Removes one task', () => {
    addItem(wrapper, 'Buy Milk');

    const deleteButton = wrapper.find('[data-testid="item-delete"]');
    deleteButton.simulate('click');

    const items = wrapper.find('[data-testid="item"]');
    expect(items).toHaveLength(0);
  });

  it('Adds four tasks and remove third task', () => {
    const tasks = ['Wash car', 'Clean home', 'Have fun', 'Feel happy'];

    for (let i = 0; i < tasks.length; i++) {
      addItem(wrapper, tasks[i]);
    }

    let items = wrapper.find('[data-testid="item"]');
    expect(items).toHaveLength(tasks.length);

    items.forEach((item, i) => {
      const taskText = item.find('[data-testid="item-text"]').text();
      expect(taskText).toEqual(tasks[i]);
    });

    const deleteButton = items.at(2).find('[data-testid="item-delete"]');
    deleteButton.simulate('click');

    items = wrapper.find('[data-testid="item"]');
    expect(items).toHaveLength(tasks.length - 1);

    expect(wrapper.text().includes('Have fun')).toBe(false);
  });

  it('Adds data into local storage', () => {
    addItem(wrapper, 'Buy Milk');
    expect(window.localStorage.setItem).toHaveBeenCalledTimes(1);
  });

  it('Adds one task with all properties', async () => {
    addFullItem(wrapper, '1', 'Wash car', false, false, '');

    // console.log(wrapper.debug());

    let items = wrapper.find('[data-testid="item"]');
    expect(items).toHaveLength(1);

    const taskText = items.find('[data-testid="item-text"]').text();
    expect(taskText).toBe('Wash car');

    const input = wrapper.find('[data-testid="input"]');
    expect(input.props().value).toEqual('');

    const checkbox = wrapper.find('[data-testid="item-checkbox"]');
    expect(checkbox.props().checked).toBe(false);

    const editButton = wrapper.find('[data-testid="item-edit"]');
    expect(editButton).toHaveLength(1);
    expect(editButton.text()).toEqual('Edit');

    const deleteButton = wrapper.find('[data-testid="item-delete"]');
    expect(deleteButton).toHaveLength(1);
    expect(deleteButton.text()).toEqual('Delete');

    const copyButton = wrapper.find('[data-testid="item-copy"]');
    expect(copyButton).toHaveLength(1);
    expect(copyButton.text()).toEqual('Copy');
  });

  it('Adds five tasks with all properties and deletes 3nd and 4th task', async () => {
    const tasks = [
      { id: '1', name: 'Wash car', finished: false, edit: false, editValue: '' },
      { id: '2', name: 'Clean home', finished: false, edit: false, editValue: '' },
      { id: '3', name: 'Have fun', finished: false, edit: false, editValue: '' },
      { id: '4', name: 'Smile', finished: false, edit: false, editValue: '' },
      { id: '5', name: 'Feel happy', finished: false, edit: false, editValue: '' },
    ];

    for (let i = 0; i < tasks.length; i++) {
      addFullItem(
        wrapper,
        tasks[i].id,
        tasks[i].name,
        tasks[i].finished,
        tasks[i].edit,
        tasks[i].editValue
      );
    }

    // console.log(wrapper.debug());

    let items = wrapper.find('[data-testid="item"]');
    expect(items).toHaveLength(tasks.length);

    items.forEach((item, i) => {
      const taskText = item.find('[data-testid="item-text"]').text();
      expect(taskText).toBe(tasks[i].name);
    });

    let deleteButton = items.at(2).find('[data-testid="item-delete"]');
    deleteButton.simulate('click');

    items = wrapper.find('[data-testid="item"]');
    expect(items).toHaveLength(tasks.length - 1);

    expect(wrapper.text().includes('Have fun')).toBe(false);

    deleteButton = items.at(2).find('[data-testid="item-delete"]'); // items #2 now is Smile
    deleteButton.simulate('click');

    items = wrapper.find('[data-testid="item"]');
    expect(items).toHaveLength(tasks.length - 2);

    expect(wrapper.text().includes('Smile')).toBe(false);
  });

  it('Adds one task and changes checked status', async () => {
    addFullItem(wrapper, '1', 'Wash car', false, false, '');

    let items = wrapper.find('[data-testid="item"]');
    expect(items).toHaveLength(1);

    let checkbox = wrapper.find('[data-testid="item-checkbox"]');
    expect(checkbox.props().checked).toBe(false);

    checkbox.simulate('change', { target: { name: 'checked', value: true } });

    checkbox = wrapper.find('[data-testid="item-checkbox"]');
    expect(checkbox.props().checked).toBe(true);
  });

  it('Adds one task with all properties and makes copy', async () => {
    addFullItem(wrapper, '1', 'Wash car', false, false, '');

    // console.log(wrapper.debug());

    let items = wrapper.find('[data-testid="item"]');
    expect(items).toHaveLength(1);

    const taskText = items.find('[data-testid="item-text"]').text();
    expect(taskText).toBe('Wash car');

    const input = wrapper.find('[data-testid="input"]');
    expect(input.props().value).toEqual('');

    const copyButton = wrapper.find('[data-testid="item-copy"]');

    copyButton.simulate('click');

    items = wrapper.find('[data-testid="item"]');
    expect(items).toHaveLength(2);

    const taskText2 = items.at(1).find('[data-testid="item-text"]').text();
    expect(taskText2).toBe('Wash car');
  });

  it('Adds one task with all properties, makes and saves changes', async () => {
    addFullItem(wrapper, '1', 'Wash car', false, false, '');

  //   // console.log(wrapper.debug());

  //   let items = wrapper.find('[data-testid="item"]');
  //   expect(items).toHaveLength(1);

  //   let taskText = items.find('[data-testid="item-text"]').text();
  //   expect(taskText).toBe('Wash car');

  //   const input = wrapper.find('[data-testid="input"]');
  //   expect(input.props().value).toEqual('');

  //   editFullItem(wrapper, '1', 'Wash car twice', false, false, '');

  //   items = wrapper.find('[data-testid="item"]');
  //   expect(items).toHaveLength(1);

  //   console.log(wrapper.debug());

  //   taskText = items.find('[data-testid="item-text"]').text();
  //   expect(taskText).toBe('Wash car twice');
  });
});
