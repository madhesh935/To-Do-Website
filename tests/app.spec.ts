import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { TASKS_KEY, THEME_KEY, type Priority, type Task } from '../src/utils/tasks';

const rows = (page: Page) => page.locator('.task-item');
const rowByTitle = (page: Page, title: string) => rows(page).filter({ has: page.locator('.task-title', { hasText: title }) });

async function add(page: Page, title: string, priority: Priority = 'Medium', enter = false) {
  await page.locator('#task-title').fill(title);
  await page.getByLabel('Priority', { exact: true }).selectOption(priority);
  if (enter) await page.locator('#task-title').press('Enter');
  else await page.getByRole('button', { name: 'Add Task', exact: true }).click();
}

async function savedTasks(page: Page): Promise<Task[]> {
  return page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? '[]'), TASKS_KEY);
}

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('/');
  await expect(page).toHaveTitle('FocusList — Daily Task Manager');
  Reflect.set(page, 'applicationErrors', errors);
});

test.afterEach(async ({ page }) => {
  expect(Reflect.get(page, 'applicationErrors')).toEqual([]);
});

test('starts empty, validates blank titles, and creates each priority using button and Enter', async ({ page }) => {
  await expect(page.getByText('A fresh start. Add your first task.')).toBeVisible();
  await expect(page.getByRole('progressbar', { name: 'Task completion' })).toHaveAttribute('value', '0');
  await expect(page.getByLabel('Priority', { exact: true })).toHaveValue('Medium');
  await page.getByRole('button', { name: 'Add Task', exact: true }).click();
  await expect(page.getByText('Please enter a task title.')).toBeVisible();
  await expect(page.locator('#task-title')).toHaveAttribute('aria-describedby', 'title-error');
  await page.locator('#task-title').fill('     ');
  await page.locator('#task-title').press('Enter');
  await expect(rows(page)).toHaveCount(0);
  await expect(page.locator('#task-title')).toBeFocused();
  await add(page, '  Plan the week  ', 'High');
  await expect(page.locator('.notification')).toHaveText('Task added.');
  await expect(page.locator('#task-title')).toHaveValue('');
  await expect(page.locator('#task-title')).toBeFocused();
  await add(page, 'Make some space', 'Medium', true);
  await add(page, 'Read a chapter', 'Low');
  await expect(rows(page)).toHaveCount(3);
  for (const priority of ['High', 'Medium', 'Low']) await expect(page.locator('.priority-badge', { hasText: priority })).toBeVisible();
  const tasks = await savedTasks(page);
  expect(tasks[0].title).toBe('Plan the week');
  expect(new Set(tasks.map((task) => task.id)).size).toBe(3);
  expect(tasks.every((task) => !task.completed && task.createdAt > 0)).toBe(true);
});

test('duplicate titles retain independent IDs through toggle, edit, and delete', async ({ page }) => {
  await add(page, 'Same title', 'High');
  await add(page, 'Same title', 'Low');
  const original = await savedTasks(page);
  const lowRow = page.locator(`[data-task-id="${original[1].id}"]`);
  await lowRow.getByRole('checkbox').check();
  await expect(page.getByTestId('completed-count')).toHaveText('1');
  await lowRow.getByRole('button', { name: 'Edit Same title' }).click();
  await lowRow.getByLabel('Task title').fill('Updated duplicate');
  await lowRow.getByRole('button', { name: 'Save Changes' }).click();
  await rowByTitle(page, 'Same title').getByRole('button', { name: 'Delete Same title' }).click();
  expect(await savedTasks(page)).toEqual([{ ...original[1], title: 'Updated duplicate', completed: true }]);
});

test('completion and reactivation update global statistics and persist after reload', async ({ page }) => {
  await add(page, 'Finish proposal');
  await page.getByRole('checkbox').check();
  await expect(page.getByTestId('completed-count')).toHaveText('1');
  await expect(page.getByTestId('pending-count')).toHaveText('0');
  await expect(page.getByRole('progressbar')).toHaveAttribute('value', '100');
  await expect(page.locator('.task-title')).toHaveCSS('text-decoration-line', 'line-through');
  await page.reload();
  await expect(page.getByRole('checkbox')).toBeChecked();
  await page.getByRole('checkbox').uncheck();
  await expect(page.getByTestId('pending-count')).toHaveText('1');
  await expect(page.getByRole('progressbar')).toHaveAttribute('value', '0');
  await page.reload();
  await expect(page.getByRole('checkbox')).not.toBeChecked();
});

test('inline editor validates, cancels with button and Escape, saves via Enter, and preserves metadata', async ({ page }) => {
  await add(page, 'Original', 'High');
  await page.getByRole('checkbox').check();
  const original = (await savedTasks(page))[0];
  const editButton = () => page.getByRole('button', { name: 'Edit Original', exact: true });
  await editButton().click();
  let editor = page.locator('.task-editor');
  await expect(editor.getByLabel('Task title')).toBeFocused();
  await editor.getByLabel('Task title').fill('   ');
  await editor.getByRole('button', { name: 'Save Changes' }).click();
  await expect(editor.getByText('Please enter a task title.')).toBeVisible();
  await editor.getByLabel('Task title').fill('Discard this');
  await editor.getByLabel('Priority').selectOption('Low');
  await editor.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(editButton()).toBeFocused();
  expect((await savedTasks(page))[0]).toEqual(original);
  await editButton().click();
  editor = page.locator('.task-editor');
  await editor.getByLabel('Task title').fill('Discard with Escape');
  await editor.getByLabel('Task title').press('Escape');
  expect((await savedTasks(page))[0]).toEqual(original);
  await editButton().click();
  editor = page.locator('.task-editor');
  await editor.getByLabel('Task title').fill('  Revised plan  ');
  await editor.getByLabel('Priority').selectOption('Low');
  await editor.getByLabel('Task title').press('Enter');
  await expect(page.locator('.notification')).toHaveText('Changes saved.');
  await expect(page.getByRole('button', { name: 'Edit Revised plan' })).toBeFocused();
  expect((await savedTasks(page))[0]).toEqual({ ...original, title: 'Revised plan', priority: 'Low' });
  await page.reload();
  await expect(page.locator('.task-title')).toHaveText('Revised plan');
  await expect(page.locator('.priority-badge')).toHaveText('Low');
  await expect(page.getByRole('checkbox')).toBeChecked();
});

test('search AND status AND priority combine; counts stay global and search retains focus', async ({ page }) => {
  await add(page, 'Review design', 'High');
  await add(page, 'Review notes', 'Low');
  await add(page, 'Write design', 'High');
  await rowByTitle(page, 'Review design').getByRole('checkbox').check();
  await page.getByLabel('Search tasks', { exact: true }).fill('REVIEW');
  await expect(page.getByLabel('Search tasks', { exact: true })).toBeFocused();
  await expect(rows(page)).toHaveCount(2);
  await page.getByRole('button', { name: 'Completed 1', exact: true }).click();
  await page.getByLabel('Filter by priority').selectOption('High');
  await expect(page.locator('.task-title')).toHaveText('Review design');
  await expect(page.getByText('Showing 1 of 3 tasks')).toBeVisible();
  await expect(page.getByTestId('total-count')).toHaveText('3');
  await expect(page.getByTestId('completed-count')).toHaveText('1');
  await expect(page.getByTestId('pending-count')).toHaveText('2');
  await expect(page.getByRole('progressbar')).toHaveAttribute('value', '33');
  await page.getByLabel('Filter by priority').selectOption('Low');
  await expect(page.getByText('No tasks match your search or filters.')).toBeVisible();
  await page.locator('.empty-state').getByRole('button', { name: 'Clear filters' }).click();
  await expect(rows(page)).toHaveCount(3);
  await expect(page.getByLabel('Search tasks', { exact: true })).toHaveValue('');
  await expect(page.getByLabel('Filter by priority')).toHaveValue('All');
  await expect(page.getByRole('button', { name: 'All 3', exact: true })).toHaveAttribute('aria-pressed', 'true');
});

test('saving re-applies filters and restores focus when the edited task disappears', async ({ page }) => {
  await add(page, 'Visible task', 'High');
  await page.getByLabel('Filter by priority').selectOption('High');
  await page.getByRole('button', { name: 'Edit Visible task' }).click();
  await page.locator('.task-editor').getByLabel('Priority').selectOption('Low');
  await page.getByRole('button', { name: 'Save Changes' }).click();
  await expect(rows(page)).toHaveCount(0);
  await expect(page.getByLabel('Search tasks', { exact: true })).toBeFocused();
  await expect(page.getByTestId('total-count')).toHaveText('1');
});

test('delete targets the correct ID in a filtered and sorted view; undo restores metadata once', async ({ page }) => {
  await add(page, 'Keep this', 'Low');
  await add(page, 'Delete this', 'High');
  await add(page, 'Also keep this', 'Medium');
  const original = await savedTasks(page);
  await page.getByLabel('Sort by').selectOption('priority');
  await page.getByLabel('Filter by priority').selectOption('High');
  await page.getByRole('button', { name: 'Delete Delete this' }).click();
  await expect(page.locator('.notification')).toHaveText('Task deleted.');
  expect(await savedTasks(page)).toEqual([original[0], original[2]]);
  await page.getByRole('button', { name: 'Undo deletion' }).click();
  expect((await savedTasks(page)).find((task) => task.id === original[1].id)).toEqual(original[1]);
  await expect(page.getByTestId('total-count')).toHaveText('3');
  await expect(page.getByRole('button', { name: 'Undo deletion' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Delete Delete this' }).click();
  await page.reload();
  expect(await savedTasks(page)).toEqual([original[0], original[2]]);
});

test('deleting the entire collection stays empty after reload with 0% progress', async ({ page }) => {
  await add(page, 'Temporary task');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Delete Temporary task' }).click();
  await expect(page.getByRole('progressbar')).toHaveAttribute('value', '0');
  await page.reload();
  await expect(page.getByText('A fresh start. Add your first task.')).toBeVisible();
  expect(await savedTasks(page)).toEqual([]);
});

test('long HTML-like titles render as plain text without running scripts', async ({ page }) => {
  const unsafeTitle = '<img src=x onerror="window.executed=true"><script>alert(1)</script>';
  await add(page, unsafeTitle, 'High');
  await add(page, 'A'.repeat(600), 'Low');
  await expect(page.locator('.task-title').filter({ hasText: unsafeTitle })).toHaveText(unsafeTitle);
  await expect(page.locator('.task-copy img, .task-copy script')).toHaveCount(0);
  expect(await page.evaluate(() => Reflect.get(window, 'executed'))).toBeUndefined();
  await page.setViewportSize({ width: 320, height: 800 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.reload();
  await expect(rows(page)).toHaveCount(2);
});

test('keyboard flow, visible focus, checkbox and edit cancellation work without a mouse', async ({ page }) => {
  await page.keyboard.press('Tab');
  await expect(page.getByText('Skip to main content')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Switch to dark theme' })).toBeFocused();
  const outline = await page.getByRole('button', { name: 'Switch to dark theme' }).evaluate((element) => getComputedStyle(element).outlineWidth);
  expect(parseFloat(outline)).toBeGreaterThanOrEqual(2);
  await page.keyboard.press('Tab');
  await expect(page.locator('#task-title')).toBeFocused();
  await page.keyboard.type('Keyboard task');
  await page.keyboard.press('Enter');
  await expect(page.locator('#task-title')).toBeFocused();
  await page.getByRole('checkbox').focus();
  await page.keyboard.press('Space');
  await expect(page.getByRole('checkbox')).toBeChecked();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Edit Keyboard task' })).toBeFocused();
  await page.keyboard.press('Enter');
  await page.keyboard.type('Changed');
  await page.keyboard.press('Escape');
  await expect(page.locator('.task-title')).toHaveText('Keyboard task');
  await expect(page.getByRole('button', { name: 'Edit Keyboard task' })).toBeFocused();
});

test('sort controls and theme preference work and theme persists independently', async ({ page }) => {
  await add(page, 'First task', 'Low');
  await add(page, 'Second task', 'High');
  await add(page, 'Third task', 'Medium');
  await expect(page.locator('.task-title')).toHaveText(['Third task', 'Second task', 'First task']);
  await page.getByLabel('Sort by').selectOption('oldest');
  await expect(page.locator('.task-title')).toHaveText(['First task', 'Second task', 'Third task']);
  await page.getByLabel('Sort by').selectOption('priority');
  await expect(page.locator('.task-title')).toHaveText(['Second task', 'Third task', 'First task']);
  await page.getByRole('button', { name: 'Switch to dark theme' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(rows(page)).toHaveCount(3);
  expect(await page.evaluate((key) => localStorage.getItem(key), THEME_KEY)).toBe('dark');
  await page.getByRole('button', { name: 'Switch to light theme' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

const badData = [
  { name: 'malformed JSON', raw: '{broken' },
  { name: 'invalid record', raw: JSON.stringify([{ id: 'bad', title: '   ', priority: 'Urgent' }]) },
  { name: 'wrong root shape', raw: '{}' },
  { name: 'duplicate IDs', raw: JSON.stringify(Array(2).fill({ id: 'same', title: 'Valid title', priority: 'Low', completed: false, createdAt: 1 })) },
];

for (const { name, raw } of badData) {
  test(`${name} is never silently overwritten; explicit recovery saves session tasks`, async ({ page }) => {
    await page.evaluate(({ key, raw }) => localStorage.setItem(key, raw), { key: TASKS_KEY, raw });
    await page.reload();
    await expect(page.getByText('Your saved data needs attention.')).toBeVisible();
    expect(await page.evaluate((key) => localStorage.getItem(key), TASKS_KEY)).toBe(raw);
    await add(page, 'Session work');
    expect(await page.evaluate((key) => localStorage.getItem(key), TASKS_KEY)).toBe(raw);
    await expect(page.locator('.notification')).toContainText('session only');
    await page.getByRole('button', { name: 'Replace saved data', exact: true }).click();
    await page.getByRole('button', { name: 'Keep original' }).click();
    expect(await page.evaluate((key) => localStorage.getItem(key), TASKS_KEY)).toBe(raw);
    await page.getByRole('button', { name: 'Replace saved data', exact: true }).click();
    await page.getByRole('button', { name: 'Replace and save current tasks' }).click();
    await expect(page.getByText('Your saved data needs attention.')).toHaveCount(0);
    await page.reload();
    await expect(page.locator('.task-title')).toHaveText('Session work');
  });
}

test('failed writes preserve session data, avoid success feedback, and support retry', async ({ page }) => {
  await page.evaluate(() => {
    Reflect.set(window, 'originalSetItem', Storage.prototype.setItem);
    Storage.prototype.setItem = () => { throw new DOMException('Full', 'QuotaExceededError'); };
  });
  await add(page, 'Unsaved work');
  await expect(page.getByRole('region', { name: 'Storage warning' })).toBeVisible();
  await expect(page.locator('.notification')).toContainText('could not be saved');
  await expect(page.locator('.task-title')).toHaveText('Unsaved work');
  await page.getByRole('button', { name: 'Edit Unsaved work' }).click();
  await page.locator('.task-editor').getByLabel('Task title').fill('Still here');
  await page.getByRole('button', { name: 'Save Changes' }).click();
  await expect(page.locator('.notification')).not.toHaveText('Changes saved.');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Delete Still here' }).click();
  await page.getByRole('button', { name: 'Undo deletion' }).click();
  await page.getByRole('button', { name: 'Retry saving' }).click();
  await expect(page.getByRole('region', { name: 'Storage warning' })).toBeVisible();
  await page.evaluate(() => { Storage.prototype.setItem = Reflect.get(window, 'originalSetItem'); });
  await page.getByRole('button', { name: 'Retry saving' }).click();
  await expect(page.getByRole('region', { name: 'Storage warning' })).toHaveCount(0);
  await page.reload();
  await expect(page.locator('.task-title')).toHaveText('Still here');
  await expect(page.getByRole('checkbox')).toBeChecked();
});

test('blocked storage reads and theme writes fail gracefully without application errors', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new DOMException('Denied', 'SecurityError'); };
    Storage.prototype.setItem = () => { throw new DOMException('Denied', 'SecurityError'); };
  });
  await page.reload();
  await expect(page.getByText('Your saved data needs attention.')).toBeVisible();
  await add(page, 'Work without storage');
  await expect(page.locator('.task-title')).toHaveText('Work without storage');
  await page.getByRole('button', { name: 'Switch to dark theme' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.getByText('Theme preference could not be saved.')).toBeVisible();
});

for (const width of [320, 375, 768, 1440]) {
  test(`responsive layout and visible controls at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 1000 });
    await expect(page.locator('header time')).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath(`empty-${width}.png`), fullPage: true, animations: 'disabled' });
    await add(page, 'Review the project brief and make room for a thoughtful first draft', 'High');
    await add(page, 'Make time for a little reading', 'Medium');
    await add(page, 'Take a well-earned break', 'Low');
    await rowByTitle(page, 'Make time').getByRole('checkbox').check();
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: testInfo.outputPath(`tasks-${width}.png`), fullPage: true, animations: 'disabled' });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    for (const button of await page.locator('.task-actions button').all()) {
      const box = await button.boundingBox();
      expect(box?.width).toBeGreaterThanOrEqual(44);
      expect(box?.height).toBeGreaterThanOrEqual(44);
      expect(box!.x + box!.width).toBeLessThanOrEqual(width);
    }
    await rows(page).first().getByRole('button', { name: /^Edit / }).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: testInfo.outputPath(`editing-${width}.png`), fullPage: true, animations: 'disabled' });
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
    await page.getByRole('button', { name: 'Switch to dark theme' }).click();
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: testInfo.outputPath(`dark-${width}.png`), fullPage: true, animations: 'disabled' });
  });
}

for (const theme of ['light', 'dark']) {
  test(`${theme} theme passes automated accessibility checks in empty, populated, and edit states`, async ({ page }) => {
    if (theme === 'dark') await page.getByRole('button', { name: 'Switch to dark theme' }).click();
    expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
    await add(page, 'High priority', 'High');
    await add(page, 'Medium priority', 'Medium');
    await add(page, 'Low priority', 'Low');
    await rowByTitle(page, 'Medium priority').getByRole('checkbox').check();
    expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
    await rows(page).first().getByRole('button', { name: /^Edit / }).click();
    expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
  });
}

test('reduced motion removes transitions and landscape layout stays within the viewport', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 812, height: 375 });
  await add(page, 'Landscape task', 'High');
  expect(await page.locator('.task-item').evaluate((element) => getComputedStyle(element).transitionDuration)).toBe('0s');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
