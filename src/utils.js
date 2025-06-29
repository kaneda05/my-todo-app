// src/utils.js

export const getStoredTodos = () => {
    const storedTodos = JSON.parse(localStorage.getItem('todos')) || [];
    // 既存のTODOデータに priority プロパティがない場合にデフォルト値を設定
    return storedTodos.map(todo => ({
        id: todo.id,
        text: todo.text,
        completed: todo.completed,
        createdAt: todo.createdAt,
        category: todo.category || '未分類',
        priority: todo.priority || 'medium' // priority がない場合は 'medium' をデフォルトに設定
    }));
};

export const saveTodos = (todos) => {
    localStorage.setItem('todos', JSON.stringify(todos));
};

export const getStoredCategories = () => {
    return JSON.parse(localStorage.getItem('categories')) || ['未分類', '仕事', 'プライベート', '買い物'];
};

export const saveCategories = (categories) => {
    localStorage.setItem('categories', JSON.stringify(categories));
};

export const getPreferredTheme = () => {
    return localStorage.getItem('theme') || 'light';
};

export const setPreferredTheme = (theme, themeToggleButton) => {
    localStorage.setItem('theme', theme);
    document.body.classList.toggle('dark-mode', theme === 'dark');
    themeToggleButton.textContent = theme === 'dark' ? '☀️' : '🌙';
    themeToggleButton.setAttribute('aria-label', theme === 'dark' ? 'ライトモードに切り替える' : 'ダークモードに切り替える');
};