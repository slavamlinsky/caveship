import React, { useState } from "react";
import styles from "./WelcomeModal.module.css";
import { CrossIcon } from "../../assets/icons/svg/cross-icon";
import Loader from "../../Loader";
import { getToken, initUser } from "../../services/api";

const WelcomeModal = ({ isOpen, onClose, startGame }) => {
  const [loading, setLoading] = useState(false);

  const [inputName, setInputName] = useState("");
  const [inputComplexity, setInputComplexity] = useState("0");

  function handleClick(e) {
    const insideModal = e.target.closest("[data-id=modalbox]");
    if (insideModal) return;
    if (!loading) {
      onClose();
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);

    try {
      const data = await initUser(inputName, inputComplexity);

      try {
        const token = await getToken(data.id);
        startGame(inputName, inputComplexity, data.id, token);
      } catch (error) {
        console.log(error);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.modal__bg} onClick={handleClick}>
      <div className={styles.modal__box} data-id="modalbox">
        <form onSubmit={handleSubmit}>
          <div className={styles.modal__header}>
            <p>Let's Begin Our Game</p>
            <button
              className={styles.modal__close}
              onClick={onClose}
              type="button"
            >
              <CrossIcon />
            </button>
          </div>
          {loading ? (
            <Loader />
          ) : (
            <div className={styles.modal__body}>
              <label>
                Your Name:
                <input
                  type="text"
                  value={inputName}
                  placeholder="Enter your name"
                  onChange={(e) => setInputName(e.target.value)}
                />
              </label>
              <label>
                Complexity:
                <input
                  type="text"
                  placeholder="From 0 to 10"
                  value={inputComplexity}
                  onChange={(e) => setInputComplexity(e.target.value)}
                />
              </label>
            </div>
          )}
          <div className={styles.modal__buttons}>
            {!loading && (
              <button className={styles.modal__btn} type="submit">
                Start Game
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default WelcomeModal;
