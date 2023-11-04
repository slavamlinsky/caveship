import React from "react";
import { GAMEFIELD_HEIGHT, GAMEFIELD_WIDTH, SHIP_SIZE } from "../../constants";
import styles from "./GamePlay.module.css";

interface GameFieldProps {
  ship: React.RefObject<SVGSVGElement>;
  leftWall: React.RefObject<SVGSVGElement>;
  leftPolygon: React.RefObject<SVGPolygonElement>;
  rightWall: React.RefObject<SVGSVGElement>;    
  rightPolygon: React.RefObject<SVGPolygonElement>;
}



const GameField: React.FC<GameFieldProps> = ({ship,leftWall,leftPolygon,rightWall,rightPolygon}) => {
  return (
    <svg
      className={styles.gameField}
      width={GAMEFIELD_WIDTH}
      height={GAMEFIELD_HEIGHT}
    >
      <svg
        ref={ship}
        height={(SHIP_SIZE * Math.sqrt(3)) / 2}
        width={SHIP_SIZE}
        x={GAMEFIELD_WIDTH / 2 - SHIP_SIZE / 2}
        y="0"
      >
        <polygon
          points={`0,0 ${SHIP_SIZE},0 ${SHIP_SIZE / 2},${
            (SHIP_SIZE * Math.sqrt(3)) / 2
          }`}
          style={{ fill: "#1dc823" }}
        />
      </svg>
      <svg ref={leftWall} width={GAMEFIELD_WIDTH} x="0" y="0">
        <polygon ref={leftPolygon} points="" style={{ fill: "#646464" }} />
      </svg>
      <svg ref={rightWall} width={GAMEFIELD_WIDTH} x="0" y="0">
        <polygon ref={rightPolygon} points="" style={{ fill: "#646464" }} />
      </svg>
    </svg>
  );
};

export default GameField;
