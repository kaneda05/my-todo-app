// src/domElements.js

export const todoInput = document.getElementById('todo-input');
export const addButton = document.getElementById('add-button');
export const todoList = document.getElementById('todo-list');

export const filterAllButton = document.getElementById('filter-all');
export const filterActiveButton = document.getElementById('filter-active');
export const filterCompletedButton = document.getElementById('filter-completed');

export const sortNewestButton = document.getElementById('sort-newest');
export const sortOldestButton = document.getElementById('sort-oldest');
export const sortPriorityButton = document.getElementById('sort-priority'); // 優先度並び替えボタン

export const categorySelect = document.getElementById('category-select');
export const categoryFilterSelect = document.getElementById('category-filter-select');
export const prioritySelect = document.getElementById('priority-select'); // 優先度選択ドロップダウン

export const themeToggleButton = document.getElementById('theme-toggle-button');

export const manageCategoriesModal = document.getElementById('manage-categories-modal');
export const manageCategoriesCloseButton = document.getElementById('manage-categories-close-button');
export const categoryListContainer = document.getElementById('category-list-container');
export const addCategoryModalButton = document.getElementById('add-category-modal-button');

// export const deleteSelectedButton = document.getElementById('delete-selected-button'); // 削除