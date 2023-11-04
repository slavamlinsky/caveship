import React, { useState, MouseEvent, FormEvent } from "react";
import styles from "./WelcomeModal.module.css";
import CrossIcon  from "../../assets/icons/svg/cross-icon";
import Loader from "../../Loader";
import { getToken, initUser } from "../../services/api";

interface ModalHeaderProps {
  onClose: () => void;
}

const ModalHeader: React.FC<ModalHeaderProps> = ({ onClose }) => (
  <div className={styles.modal__header}>
    <p>Let's Begin Our Game</p>
    <button className={styles.modal__close} onClick={onClose} type="button">
      <CrossIcon />
    </button>
  </div>
);

interface NameInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const NameInput: React.FC<NameInputProps> = ({ value, onChange }) => (
  <div className={styles.modal__control}>
    <label>
      Your Name:
      <input
        className={styles.nameInput}
        required
        type="text"
        value={value}
        placeholder="Enter your name"
        onChange={onChange}
      />
    </label>
  </div>
);

interface ComplexityInputProps {
  value: string;
  onMinus: (e: MouseEvent<HTMLButtonElement>) => void;
  onPlus: (e: MouseEvent<HTMLButtonElement>) => void;
}

const ComplexityInput: React.FC<ComplexityInputProps> = ({
  value,
  onMinus,
  onPlus,
}) => (
  <div className={styles.modal__control}>
    <label>Complexity:</label>
    <button
      onClick={onMinus}
      type="button"
      className={styles.complexityButton}
    >
      -
    </button>
    <input
      className={styles.complexityInput}
      readOnly
      type="text"
      placeholder="From 0 to 10"
      value={value}
    />
    <button
      onClick={onPlus}
      type="button"
      className={styles.complexityButton}
    >
      +
    </button>
  </div>
);

interface StartButtonProps {
  onClick: (e: FormEvent) => void;
}

const StartButton: React.FC<StartButtonProps> = ({ onClick }) => (
  <div className={styles.modal__buttons}>
    <button className={styles.modal__btn} onClick={onClick} type="submit">
      Start Game
    </button>
  </div>
);

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  startGame: (
    inputName: string,
    inputComplexity: string,
    userId: string,
    token: string
  ) => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onClose,
  startGame,
}) => {
  const [loading, setLoading] = useState(false);
  const [inputName, setInputName] = useState("");
  const [inputComplexity, setInputComplexity] = useState("0");

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    const insideModal = (e.target as HTMLElement).closest("[data-id=modalbox]");
    if (insideModal) return;
    if (!loading) {
      onClose();
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    if (!inputName) return;
    event.preventDefault();
    setLoading(true);

    try {
      const userId = await initUser(inputName, inputComplexity);

      try {
        const token = await getToken(userId);
        startGame(inputName, inputComplexity, userId, token);
      } catch (error) {
        console.error(error);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  const complexityPlus = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setInputComplexity((prev) => String(Math.min(Number(prev) + 1, 10)));
  };

  const complexityMinus = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setInputComplexity((prev) => String(Math.max(Number(prev) - 1, 0)));
  };

  return (
    <div className={styles.modal__bg} onClick={handleClick}>
      <div className={styles.modal__box} data-id="modalbox">
        <form onSubmit={handleSubmit}>
          <ModalHeader onClose={onClose} />
          {loading ? (
            <Loader />
          ) : (
            <div className={styles.modal__body}>
              <NameInput
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
              />
              <ComplexityInput
                value={inputComplexity}
                onMinus={complexityMinus}
                onPlus={complexityPlus}
              />
            </div>
          )}
          <StartButton onClick={handleSubmit} />
        </form>
      </div>
    </div>
  );
};

export default WelcomeModal;
