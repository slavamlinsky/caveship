import React from "react";
import styles from "./GamePlay.module.css";

interface GameInfoProps {
  name: string;
  complexity: string;
  scoreRef: React.RefObject<HTMLSpanElement>;
}

const GameInfo: React.FC<GameInfoProps> = ({ name, complexity, scoreRef }) => {  
  return (
    <div className={styles.gameInfo}>
      <div>
        <h4>
          Name: <span>{name}</span>
        </h4>
      </div>
      <div>
        <h4>
          Complexity: <span>{complexity}</span>
        </h4>
      </div>
      <div>
        <h4>
          Score: <span ref={scoreRef}>0</span>
        </h4>
      </div>
    </div>
  );
};

export default GameInfo;
