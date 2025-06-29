// src/todoRenderer.js

import { todoList } from './domElements.js';
import { saveTodos, saveCategories } from './utils.js';
import { updateCategorySelects, promptForNewCategory, openManageCategoriesModal } from './categoryManager.js';

function createTodoListItemElement(todoItem, todosRef, categoriesRef, showCustomAlertFunc, renderTodosFunc, priorityOrder) {
    const listItem = document.createElement('li');
    listItem.dataset.id = todoItem.id;
    listItem.dataset.createdAt = todoItem.createdAt;
    listItem.dataset.category = todoItem.category || '未分類';
    listItem.dataset.priority = todoItem.priority || 'unset'; // 優先度データ属性

    if (todoItem.completed) {
        listItem.classList.add('completed');
    }

    // 選択用チェックボックスの生成ロジックは削除済み
    /*
    const selectCheckbox = document.createElement('input'); // タスク選択用チェックボックス (常に表示)
    selectCheckbox.type = 'checkbox';
    selectCheckbox.className = 'select-task-checkbox';
    selectCheckbox.checked = false;
    selectCheckbox.addEventListener('change', () => {
        listItem.classList.toggle('selected', selectCheckbox.checked);
    });
    listItem.prepend(selectCheckbox); // listItem の一番最初に挿入
    */

    const leftContent = document.createElement('div');
    leftContent.className = 'todo-left-content';

    const checkbox = document.createElement('input'); // 完了用チェックボックス
    checkbox.type = 'checkbox';
    checkbox.checked = todoItem.completed;
    checkbox.addEventListener('change', () => {
        const index = todosRef.findIndex(t => t.id === todoItem.id);
        if (index !== -1) {
            todosRef[index].completed = checkbox.checked;
            saveTodos(todosRef);
            renderTodosFunc();
        }
    });

    const todoTextSpan = document.createElement('span');
    todoTextSpan.textContent = todoItem.text;
    todoTextSpan.className = 'todo-text';

    const categorySpan = document.createElement('span');
    categorySpan.textContent = todoItem.category || '未分類';
    categorySpan.className = 'todo-category';

    const prioritySpan = document.createElement('span'); // 優先度表示要素
    prioritySpan.className = `todo-priority priority-${todoItem.priority || 'unset'}`;
    const priorityTextMap = {
        'high': '高',
        'medium': '中',
        'low': '低',
        'unset': '未設定'
    };
    prioritySpan.textContent = priorityTextMap[todoItem.priority] || priorityTextMap['unset'];


    todoTextSpan.addEventListener('dblclick', async (event) => {
        event.stopPropagation();

        if (listItem.querySelector('.edit-input')) {
            return;
        }

        const inputField = document.createElement('input');
        inputField.type = 'text';
        inputField.value = todoTextSpan.textContent;
        inputField.className = 'edit-input';

        const editCategorySelect = document.createElement('select');
        editCategorySelect.className = 'edit-category-select';
        
        const uniqueCategoriesForEdit = [...new Set(categoriesRef)].sort((a, b) => {
            if (a === '未分類') return -1;
            if (b === '未分類') return 1;
            return a.localeCompare(b);
        });
        uniqueCategoriesForEdit.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            editCategorySelect.appendChild(option);
        });
        const addNewCategoryOptionForEdit = document.createElement('option');
        addNewCategoryOptionForEdit.value = 'add-new-category';
        addNewCategoryOptionForEdit.textContent = '新しいカテゴリを追加...';
        addNewCategoryOptionForEdit.style.fontWeight = 'bold';
        editCategorySelect.appendChild(addNewCategoryOptionForEdit);


        editCategorySelect.value = todoItem.category || '未分類';

        editCategorySelect.addEventListener('change', async () => {
            if (editCategorySelect.value === 'add-new-category') {
                const newCat = await promptForNewCategory(categoriesRef, showCustomAlertFunc);
                if (newCat) {
                    editCategorySelect.value = newCat;
                } else {
                    editCategorySelect.value = todoItem.category || '未分類';
                }
            }
            else if (editCategorySelect.value === 'manage-categories') {
                openManageCategoriesModal(categoriesRef, todosRef, showCustomAlertFunc, updateCategorySelects, renderTodosFunc);
                editCategorySelect.value = todoItem.category || '未分類';
            }
        });

        const editPrioritySelect = document.createElement('select'); // 編集時の優先度選択ドロップダウン
        editPrioritySelect.className = 'edit-priority-select';
        const priorities = [
            { value: 'high', text: '優先度: 高' },
            { value: 'medium', text: '優先度: 中' },
            { value: 'low', text: '優先度: 低' },
            { value: 'unset', text: '優先度: 未設定' }
        ];
        priorities.forEach(p => {
            const option = document.createElement('option');
            option.value = p.value;
            option.textContent = p.text;
            editPrioritySelect.appendChild(option);
        });
        editPrioritySelect.value = todoItem.priority || 'unset';


        const originalLeftContentDisplay = leftContent.style.display;
        leftContent.style.display = 'none';
        listItem.prepend(editPrioritySelect);
        listItem.prepend(editCategorySelect);
        listItem.prepend(inputField);

        inputField.focus();

        let isEditing = true;

        const handleEditEnd = () => {
            if (!isEditing) return;

            const newText = inputField.value.trim();
            const newCategory = editCategorySelect.value;
            const newPriority = editPrioritySelect.value;

            if (newCategory === 'add-new-category') {
                showCustomAlertFunc('カテゴリを選択するか、新しいカテゴリを追加してください。');
                inputField.focus();
                return;
            }
            if (newCategory === 'manage-categories') {
                showCustomAlertFunc('「カテゴリを管理」オプションはカテゴリの変更には使用できません。');
                inputField.focus();
                return;
            }

            if (newText === '') {
                showCustomAlertFunc('TODOは空にできません！');
                listItem.removeChild(inputField);
                listItem.removeChild(editCategorySelect);
                listItem.removeChild(editPrioritySelect); // 優先度選択も削除
                leftContent.style.display = originalLeftContentDisplay;
                isEditing = false;
                document.removeEventListener('click', handleClickOutside);
                return;
            }

            const index = todosRef.findIndex(t => t.id === todoItem.id);
            if (index !== -1) {
                todosRef[index].text = newText;
                todosRef[index].category = newCategory;
                todosRef[index].priority = newPriority;
                
                if (newCategory && newCategory !== '未分類' && !categoriesRef.includes(newCategory)) {
                    categoriesRef.push(newCategory);
                    saveCategories(categoriesRef);
                    updateCategorySelects(categoriesRef);
                }
                saveTodos(todosRef);
                renderTodosFunc();
            }
            isEditing = false;
            document.removeEventListener('click', handleClickOutside);
        };

        inputField.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                handleEditEnd();
            }
        });

        const handleClickOutside = (e) => {
            if (!listItem.contains(e.target) && isEditing) {
                handleEditEnd();
            }
        };

        document.addEventListener('click', handleClickOutside);
    });

    // selectCheckbox は削除済み
    leftContent.appendChild(checkbox);
    leftContent.appendChild(todoTextSpan);
    leftContent.appendChild(categorySpan);
    leftContent.appendChild(prioritySpan); // 優先度表示要素を追加
    listItem.appendChild(leftContent);

    const deleteButton = document.createElement('button');
    deleteButton.textContent = '削除';
    deleteButton.addEventListener('click', () => {
        const confirmDelete = confirm(`「${todoItem.text}」を削除してもよろしいですか？`);
        if (confirmDelete) {
            const index = todosRef.findIndex(t => t.id === todoItem.id);
            if (index !== -1) {
                todosRef.splice(index, 1);
                saveTodos(todosRef);
                renderTodosFunc();
                showCustomAlertFunc(`「${todoItem.text}」を削除しました。`);
            }
        } else {
            showCustomAlertFunc('削除をキャンセルしました。');
        }
    });

    listItem.appendChild(deleteButton);
    return listItem;
}

export function renderTodos(todosRef, currentFilterRef, currentSortRef, currentCategoryFilterRef, categoriesRef, showCustomAlertFunc, priorityOrder) {
    while (todoList.firstChild) {
        todoList.removeChild(todoList.firstChild);
    }

    let filteredByCategoryTodos = todosRef.filter(todo => {
        if (currentCategoryFilterRef === 'all-categories') {
            return true;
        }
        if (currentCategoryFilterRef === 'uncategorized') {
            return !todo.category || todo.category === '未分類';
        }
        return todo.category === currentCategoryFilterRef;
    });

    let filteredTodos = filteredByCategoryTodos.filter(todo => {
        switch (currentFilterRef) {
            case 'all':
                return true;
            case 'active':
                return !todo.completed;
            case 'completed':
                return todo.completed;
            default:
                return true;
        }
    });

    filteredTodos.sort((a, b) => {
        // 完了済みタスクは常に下部に表示
        if (a.completed && !b.completed) {
            return 1;
        }
        if (!a.completed && b.completed) {
            return -1;
        }

        // 優先度による並び替え
        if (currentSortRef === 'priority') {
            const priorityA = priorityOrder[a.priority] || priorityOrder['unset'];
            const priorityB = priorityOrder[b.priority] || priorityOrder['unset'];
            
            // 優先度が同じ場合は作成日時で並び替え（新しい順）
            if (priorityA === priorityB) {
                const dateA = new Date(a.createdAt);
                const dateB = new Date(b.createdAt);
                return dateB - dateA;
            }
            return priorityB - priorityA; // 高優先度から低優先度へ
        }

        // 既存の作成日時による並び替え
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);

        if (currentSortRef === 'newest') {
            return dateB - dateA;
        } else { // 'oldest'
            return dateA - dateB;
        }
    });

    filteredTodos.forEach(todoItem => {
        const listItem = createTodoListItemElement(todoItem, todosRef, categoriesRef, showCustomAlertFunc, () => renderTodos(todosRef, currentFilterRef, currentSortRef, currentCategoryFilterRef, categoriesRef, showCustomAlertFunc, priorityOrder), priorityOrder);
        todoList.appendChild(listItem);
    });
}