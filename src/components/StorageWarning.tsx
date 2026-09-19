interface Props {
  blocked: boolean;
  saveFailed: boolean;
  tasksCount: number;
  confirmRecovery: boolean;
  onRequestRecovery: () => void;
  onCancelRecovery: () => void;
  onRecoverStorage: () => void;
}

export function StorageWarning({ blocked, saveFailed, tasksCount, confirmRecovery, onRequestRecovery, onCancelRecovery, onRecoverStorage }: Props) {
  if (!blocked && !saveFailed) return null;
  return <section className="storage-warning" aria-label="Storage warning">
    <div><strong>{blocked ? 'Your saved data needs attention.' : 'Changes could not be saved.'}</strong><p>{blocked ? 'Saved tasks could not be read. The original data has not been overwritten. You can keep working in this session, or replace it with your current tasks.' : 'Your tasks are safe in this session, but may be lost on refresh. Storage may be full or unavailable. Free some space or allow browser storage, then try again.'}</p></div>
    {blocked ? (confirmRecovery ? <div className="recovery-confirm"><p>Replace the original saved data with these {tasksCount} tasks? This cannot be undone.</p><div className="recovery-actions"><button className="button primary" onClick={onRecoverStorage}>Replace and save current tasks</button><button className="button secondary" onClick={onCancelRecovery}>Keep original</button></div></div> : <button className="button secondary" onClick={onRequestRecovery}>Replace saved data</button>) : <button className="button secondary" onClick={onRecoverStorage}>Retry saving</button>}
  </section>;
}
