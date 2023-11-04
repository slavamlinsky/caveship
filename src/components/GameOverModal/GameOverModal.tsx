import React, { MouseEvent } from "react";
// import { Link } from "react-router-dom";
import CrossIcon from "../../assets/icons/svg/cross-icon";
import WinnerIcon from "../../assets/icons/svg/winner-icon";
import { GAME_URL } from "../../constants";
import styles from "./GameOverModal.module.css";

interface GameOverModalProps {
  status: string;
  onClose: () => void;
  score: number;
}

const ModalHeader: React.FC<{ onClose: () => void; status: string }> = ({
  onClose,
  status,
}) => (
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
);

const GameOverModal: React.FC<GameOverModalProps> = ({status, onClose, score}) => {

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    const insideModal = (e.target as HTMLElement).closest("[data-id=modalbox]");
    if (insideModal) return;
    onClose();
  }

  return (
    <div className={styles.modal__bg} onClick={handleClick}>
      <div className={styles.modal__box} data-id="modalbox">
        <ModalHeader onClose={onClose} status={status} />

        <div className={styles.modal__body}>
          {status === "win" && <WinnerIcon />} Your final score is {score}.
        </div>

        <div className={styles.modal__buttons}>
          {/* <Link className={styles.modal__again} to={GAME_URL}>
            Try Again
          </Link> */}
          <a className={styles.modal__again} href={GAME_URL}>
            Try Again
          </a>
        </div>
      </div>
    </div>
  );
};

export default GameOverModal;
