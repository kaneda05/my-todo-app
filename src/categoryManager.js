// src/categoryManager.js

import { categorySelect, categoryFilterSelect, manageCategoriesModal, categoryListContainer, addCategoryModalButton } from './domElements.js';
import { saveCategories, saveTodos } from './utils.js';

export function updateCategorySelects(categories) {
    categorySelect.innerHTML = '<option value="all">カテゴリを選択</option>';
    
    const addNewCategoryOption = document.createElement('option');
    addNewCategoryOption.value = 'add-new-category';
    addNewCategoryOption.textContent = '新しいカテゴリを追加...';
    categorySelect.appendChild(addNewCategoryOption);

    const manageCategoryOption = document.createElement('option');
    manageCategoryOption.value = 'manage-categories';
    manageCategoryOption.textContent = 'カテゴリを管理...';
    manageCategoryOption.style.fontWeight = 'bold';
    categorySelect.appendChild(manageCategoryOption);

    const uniqueCategories = [...new Set(categories)].sort((a, b) => {
        if (a === '未分類') return -1;
        if (b === '未分類') return 1;
        return a.localeCompare(b);
    });

    uniqueCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.insertBefore(option, addNewCategoryOption);
    });

    categoryFilterSelect.innerHTML = '<option value="all-categories">全てのカテゴリ</option>';
    uniqueCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilterSelect.appendChild(option);
    });
}

export async function promptForNewCategory(categoriesRef, showCustomAlertFunc) {
    const newCategoryName = prompt('新しいカテゴリ名を入力してください:');
    if (newCategoryName && newCategoryName.trim() !== '') {
        const trimmedCategory = newCategoryName.trim();
        if (!categoriesRef.includes(trimmedCategory)) {
            categoriesRef.push(trimmedCategory);
            saveCategories(categoriesRef);
            updateCategorySelects(categoriesRef);
            return trimmedCategory;
        } else {
            showCustomAlertFunc('そのカテゴリはすでに存在します！');
            return null;
        }
    } else if (newCategoryName !== null) {
        showCustomAlertFunc('カテゴリ名を入力してください。');
        return null;
    }
    return null;
}

export function openManageCategoriesModal(categoriesRef, todosRef, showCustomAlertFunc, updateCategorySelectsFunc, renderTodosFunc) {
    manageCategoriesModal.style.display = 'flex';
    renderCategoryListInModal(categoriesRef, todosRef, showCustomAlertFunc, updateCategorySelectsFunc, renderTodosFunc); 

    addCategoryModalButton.onclick = async () => {
        const newCat = await promptForNewCategory(categoriesRef, showCustomAlertFunc);
        if (newCat) {
            renderCategoryListInModal(categoriesRef, todosRef, showCustomAlertFunc, updateCategorySelectsFunc, renderTodosFunc);
        }
    };
}

export function renderCategoryListInModal(categoriesRef, todosRef, showCustomAlertFunc, updateCategorySelectsFunc, renderTodosFunc) {
    categoryListContainer.innerHTML = '';

    const ul = document.createElement('ul');
    const uniqueCategories = [...new Set(categoriesRef)].sort((a, b) => {
        if (a === '未分類') return -1;
        if (b === '未分類') return 1;
        return a.localeCompare(b);
    });

    uniqueCategories.forEach(category => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${category}</span>`;
        if (category === '未分類') {
            li.classList.add('uncategorized');
        }

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'x';
        deleteButton.className = 'delete-category-button';
        deleteButton.setAttribute('aria-label', `${category} カテゴリを削除`);
        
        if (category === '未分類') {
            deleteButton.disabled = true;
        } else {
            deleteButton.addEventListener('click', async () => {
                const associatedTodosCount = todosRef.filter(todo => todo.category === category).length;
                let confirmMessage = `カテゴリ「${category}」を削除します。`;
                if (associatedTodosCount > 0) {
                    confirmMessage += `このカテゴリに属する${associatedTodosCount}個のTODOは「未分類」に変更されます。`;
                }
                confirmMessage += `本当によろしいですか？`;

                const confirmDelete = confirm(confirmMessage);
                if (confirmDelete) {
                    categoriesRef = categoriesRef.filter(cat => cat !== category);
                    saveCategories(categoriesRef);

                    todosRef.forEach(todo => {
                        if (todo.category === category) {
                            todo.category = '未分類';
                        }
                    });
                    saveTodos(todosRef);

                    updateCategorySelectsFunc(categoriesRef);
                    renderTodosFunc();
                    renderCategoryListInModal(categoriesRef, todosRef, showCustomAlertFunc, updateCategorySelectsFunc, renderTodosFunc);

                    showCustomAlertFunc(`カテゴリ「${category}」を削除しました。関連するTODOは「未分類」に変更されました。`);
                }
            });
        }
        li.appendChild(deleteButton);
        ul.appendChild(li);
    });
    categoryListContainer.appendChild(ul);
}