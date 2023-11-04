import React from 'react'
import styles from "./GamePlay.module.css";

interface GameSpeedProps {
  hSpeedRef: React.RefObject<HTMLSpanElement>;
  posRef: React.RefObject<HTMLSpanElement>;
  vSpeedRef: React.RefObject<HTMLSpanElement>;
}

const GameSpeed: React.FC<GameSpeedProps>  = ({hSpeedRef,posRef,vSpeedRef}) => {
  return (
    <div className={styles.gameSpeed}>
            <div>
              <h3>
                Horizontal Speed
                <br />
                <label>
                  <span ref={hSpeedRef}>0</span>
                  km/h
                </label>
              </h3>
            </div>
            <div>
              <span ref={posRef}>(x,y)</span> <br />
            </div>
            <div>
              <h3>
                Vertical Speed
                <br />
                <label>
                  <span ref={vSpeedRef}>0</span>km/h
                </label>
              </h3>
            </div>
          </div>
  );
};

export default GameSpeed