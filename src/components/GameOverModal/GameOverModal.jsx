import { CrossIcon } from "../../assets/icons/svg/cross-icon";
import WinnerIcon from "../../assets/icons/svg/winner-icon";
import styles from "./GameOverModal.module.css";

const GameOverModal = ({ status, onClose, score }) => {
  function handleClick(e) {
    const insideModal = e.target.closest("[data-id=modalbox]");
    if (insideModal) return;
    onClose();
  }
  return (
    <div className={styles.modal__bg} onClick={handleClick}>
      <div className={styles.modal__box} data-id="modalbox">
        <div className={styles.modal__header}>
          <p>
            {status === "win"
              ? "Congratulations! It was cool :)"
              : "Your drone crashed! Be careful."}
          </p>
          <button
            className={styles.modal__close}
            onClick={onClose}
            type="button"
          >
            <CrossIcon />
          </button>
        </div>

        <div className={styles.modal__body}>
          {status === "win" && <WinnerIcon />} Your final score is {score}.
        </div>

        <div className={styles.modal__buttons}>
          <a className={styles.modal__again} href="/">
            Try Again
          </a>
        </div>
      </div>
    </div>
  );
};

export default GameOverModal;
