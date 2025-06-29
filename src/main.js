// src/main.js

import * as DOM from './domElements.js';
import { getStoredTodos, saveTodos, getStoredCategories, saveCategories, getPreferredTheme, setPreferredTheme } from './utils.js';
import { updateCategorySelects, promptForNewCategory, openManageCategoriesModal } from './categoryManager.js';
import { renderTodos } from './todoRenderer.js';

let customAlertModal; // setupCustomAlertで初期化
let customAlertMessage;
let customAlertOkButton;

// カスタムアラートの実装
function setupCustomAlert() {
    customAlertModal = document.createElement('div');
    customAlertModal.id = 'custom-alert-modal';
    customAlertModal.className = 'modal';
    customAlertModal.innerHTML = `
        <div class="modal-content">
            <span class="close-button" id="custom-alert-close-button">&times;</span>
            <p id="custom-alert-message"></p>
            <button id="custom-alert-ok-button">OK</button>
        </div>
    `;
    document.body.appendChild(customAlertModal);

    customAlertMessage = document.getElementById('custom-alert-message');
    customAlertOkButton = document.getElementById('custom-alert-ok-button');
    const customAlertCloseButton = document.getElementById('custom-alert-close-button');

    customAlertOkButton.addEventListener('click', () => {
        customAlertModal.style.display = 'none';
    });

    customAlertCloseButton.addEventListener('click', () => {
        customAlertModal.style.display = 'none';
    });

    customAlertModal.addEventListener('click', (event) => {
        if (event.target === customAlertModal) {
            customAlertModal.style.display = 'none';
        }
    });
}

function showCustomAlert(message) {
    if (!customAlertModal) {
        setupCustomAlert();
    }
    customAlertMessage.textContent = message;
    customAlertModal.style.display = 'flex';
}

// アプリケーションの状態を管理する変数
let todos = [];
let categories = [];
let currentFilter = 'all';
let currentSort = 'newest';
let currentCategoryFilter = 'all-categories';

// 優先度の順序を定義 (高いほど数値が小さい)
const priorityOrder = {
    'high': 1,
    'medium': 2,
    'low': 3,
    'unset': 4
};


// ===============================================
// メインのアプリケーションロジック
// ===============================================

// アプリケーションの初期化関数
function initializeApp() {
    todos = getStoredTodos();
    categories = getStoredCategories();
    const savedTheme = getPreferredTheme();
    setPreferredTheme(savedTheme, DOM.themeToggleButton);

    updateCategorySelects(categories);
    renderTodos(todos, currentFilter, currentSort, currentCategoryFilter, categories, showCustomAlert, priorityOrder);
}

// TODOを追加する関数
function addTodo() {
    const todoText = DOM.todoInput.value.trim();
    const selectedCategory = DOM.categorySelect.value === 'all' ? '未分類' : DOM.categorySelect.value;
    const selectedPriority = DOM.prioritySelect.value;

    if (todoText === '') {
        showCustomAlert('TODOを入力してください！');
        return;
    }

    if (selectedCategory === 'all') {
        showCustomAlert('カテゴリを選択してください！');
        return;
    }

    if (selectedCategory === 'add-new-category' || selectedCategory === 'manage-categories') {
        showCustomAlert('カテゴリを正しく選択してください。新しいカテゴリを追加する場合は、そのためのオプションを使用してください。');
        return;
    }

    const newTodo = {
        id: Date.now().toString(),
        text: todoText,
        completed: false,
        createdAt: new Date().toISOString(),
        category: selectedCategory,
        priority: selectedPriority
    };

    todos.push(newTodo);
    saveTodos(todos);
    DOM.todoInput.value = '';
    DOM.categorySelect.value = 'all';
    DOM.prioritySelect.value = 'medium';
    renderTodos(todos, currentFilter, currentSort, currentCategoryFilter, categories, showCustomAlert, priorityOrder);
}

// フィルタリングボタンのイベントハンドラ
function setFilter(filterType) {
    DOM.filterAllButton.classList.remove('active');
    DOM.filterActiveButton.classList.remove('active');
    DOM.filterCompletedButton.classList.remove('active');

    if (filterType === 'all') {
        DOM.filterAllButton.classList.add('active');
    } else if (filterType === 'active') {
        DOM.filterActiveButton.classList.add('active');
    } else if (filterType === 'completed') {
        DOM.filterCompletedButton.classList.add('active');
    }

    currentFilter = filterType;
    renderTodos(todos, currentFilter, currentSort, currentCategoryFilter, categories, showCustomAlert, priorityOrder);
}

// ソートボタンのイベントハンドラ
function setSort(sortType) {
    DOM.sortNewestButton.classList.remove('active');
    DOM.sortOldestButton.classList.remove('active');
    DOM.sortPriorityButton.classList.remove('active');

    if (sortType === 'newest') {
        DOM.sortNewestButton.classList.add('active');
    } else if (sortType === 'oldest') {
        DOM.sortOldestButton.classList.add('active');
    } else if (sortType === 'priority') {
        DOM.sortPriorityButton.classList.add('active');
    }

    currentSort = sortType;
    renderTodos(todos, currentFilter, currentSort, currentCategoryFilter, categories, showCustomAlert, priorityOrder);
}

// deleteSelectedTodos 関数と関連ロジックは削除


// ===============================================
// イベントリスナーの登録
// ===============================================

DOM.themeToggleButton.addEventListener('click', () => {
    const currentTheme = getPreferredTheme();
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setPreferredTheme(newTheme, DOM.themeToggleButton);
});

DOM.categorySelect.addEventListener('change', async (event) => {
    if (event.target.value === 'add-new-category') {
        const newCat = await promptForNewCategory(categories, showCustomAlert);
        if (newCat) {
            event.target.value = newCat;
        } else {
            event.target.value = 'all';
        }
    } else if (event.target.value === 'manage-categories') {
        DOM.categorySelect.value = 'all';
        openManageCategoriesModal(categories, todos, showCustomAlert, updateCategorySelects, () => renderTodos(todos, currentFilter, currentSort, currentCategoryFilter, categories, showCustomAlert, priorityOrder));
    }
});

DOM.categoryFilterSelect.addEventListener('change', (event) => {
    currentCategoryFilter = event.target.value;
    renderTodos(todos, currentFilter, currentSort, currentCategoryFilter, categories, showCustomAlert, priorityOrder);
});

DOM.filterAllButton.addEventListener('click', () => setFilter('all'));
DOM.filterActiveButton.addEventListener('click', () => setFilter('active'));
DOM.filterCompletedButton.addEventListener('click', () => setFilter('completed'));

DOM.sortNewestButton.addEventListener('click', () => setSort('newest'));
DOM.sortOldestButton.addEventListener('click', () => setSort('oldest'));
DOM.sortPriorityButton.addEventListener('click', () => setSort('priority')); // 優先度ソートボタンのリスナー

DOM.addButton.addEventListener('click', addTodo);

DOM.todoInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        addTodo();
    }
});

DOM.manageCategoriesCloseButton.addEventListener('click', () => {
    DOM.manageCategoriesModal.style.display = 'none';
});

DOM.addCategoryModalButton.addEventListener('click', async () => {
    const newCat = await promptForNewCategory(categories, showCustomAlert);
    if (newCat) {
        renderCategoryListInModal(categories, todos, showCustomAlert, updateCategorySelects, () => renderTodos(todos, currentFilter, currentSort, currentCategoryFilter, categories, showCustomAlert, priorityOrder));
    }
});

window.addEventListener('click', (event) => {
    if (customAlertModal && event.target === customAlertModal) { // nullチェックを追加
        customAlertModal.style.display = 'none';
    }
    if (event.target === DOM.manageCategoriesModal) {
        DOM.manageCategoriesModal.style.display = 'none';
    }
});

document.addEventListener('DOMContentLoaded', initializeApp);