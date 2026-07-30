import "./ConfirmModal.css";
function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmButtonClass = "confirm-btn",
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="confirm-modal">
        <h2>{title}</h2>

        <p>{message}</p>

        <div className="modal-buttons">
          <button
            className="cancel-btn"
            onClick={onCancel}
          >
            {cancelText}
          </button>

          <button
            className={confirmButtonClass}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;