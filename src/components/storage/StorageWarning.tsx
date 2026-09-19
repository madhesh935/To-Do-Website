interface Props {
  blocked: boolean;
  saveFailed: boolean;
  tasksCount: number;
  confirmRecovery: boolean;
  onRequestRecovery: () => void;
  onCancelRecovery: () => void;
  onRecoverStorage: () => void;
}

export function StorageWarning({
  blocked, saveFailed, tasksCount, confirmRecovery,
  onRequestRecovery, onCancelRecovery, onRecoverStorage,
}: Props) {
  if (!blocked && !saveFailed) return null;
  return (
    <section className="storage-warning" aria-label="Storage warning">
      <div>
        <strong>{blocked ? 'Saved data needs attention.' : 'Changes could not be saved.'}</strong>
        <p>
          {blocked
            ? 'Saved tasks could not be read. The original data has not been overwritten.'
            : 'Your tasks are in this session, but may be lost on refresh. Retry after freeing storage.'}
        </p>
      </div>
      {blocked ? (
        confirmRecovery ? (
          <div className="recovery-confirm">
            <p>Replace the original saved data with these {tasksCount} tasks? This cannot be undone.</p>
            <div className="recovery-actions">
              <button className="button primary" type="button" onClick={onRecoverStorage}>Replace and save current tasks</button>
              <button className="button secondary" type="button" onClick={onCancelRecovery}>Keep original</button>
            </div>
          </div>
        ) : (
          <button className="button secondary" type="button" onClick={onRequestRecovery}>Replace saved data</button>
        )
      ) : (
        <button className="button secondary" type="button" onClick={onRecoverStorage}>Retry saving</button>
      )}
    </section>
  );
}
