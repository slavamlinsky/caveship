import React, {
  MouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import styles from "./GamePlay.module.css";
import dronLogo from "./../../assets/images/dron-logo.png";
import RecordsTable from "../RecordsTable/RecordsTable";
import WelcomeModal from "../WelcomeModal/WelcomeModal";
import GameOverModal from "../GameOverModal/GameOverModal";
import { makePolygonString } from "../../services/walls";
import { addLeader } from "../../services/leaders";
import {
  MAX_HORIZONTAL_SPEED,
  MAX_VERTICAL_SPEED,
  SCORE_MULTIPLIER,
  SHIP_SIZE,
  WALL_HEIGHT,
  WS_URL,
} from "../../constants";
import GameInfo from "./GameInfo";
import GameSpeed from "./GameSpeed";
import GameField from "./GameField";

interface GamePlayProps {}

const GamePlay: React.FC<GamePlayProps> = () => {
  const [showModal, setShowModal] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);

  const [gameInfo, setGameInfo] = useState({
    playerName: "",
    userId: "",
    gameComplexity: "",
    gameToken: "",
    gameStatus: "lose",
  });

  const [gameStatus, setGameStatus] = useState("lose");

  const shipRef = useRef<SVGSVGElement | null>(null);
  const hSpeedRef = useRef<HTMLSpanElement>(null);
  const vSpeedRef = useRef<HTMLSpanElement>(null);
  const scoreRef = useRef<HTMLSpanElement>(null);
  const posRef = useRef<HTMLSpanElement>(null);
  const leftWallRef = useRef<SVGSVGElement | null>(null);
  const rightWallRef = useRef<SVGSVGElement | null>(null);
  const leftPolygonRef = useRef<SVGPolygonElement>(null);
  const rightPolygonRef = useRef<SVGPolygonElement>(null);

  function showModalHandler() {
    setShowModal((prev) => !prev);
  }

  function showGameOverHandler() {
    setShowGameOver((prev) => !prev);
  }

  const newGameHandler = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setShowModal(true);
  };

  async function initGameHandler(
    name: string,
    complexity: string,
    id: string,
    token: string
  ) {
    setGameInfo({
      ...gameInfo,
      playerName: name,
      gameComplexity: complexity,
      gameToken: token,
      userId: id,
    });

    setShowModal(false);
  }

  const handleWebSocketMessage = (
    event: MessageEvent,
    leftWallPoints: number[],
    rightWallPoints: number[]
  ) => {
    try {
      if (event.data !== "finished") {
        const points = event.data?.split(",");
        const leftPoint = 250 + Number(points[0]);
        const rightPoint = 250 + Number(points[1]);

        leftWallPoints.push(leftPoint);
        rightWallPoints.push(rightPoint);

        leftWallRef.current?.setAttribute(
          "height",
          (leftWallPoints.length * WALL_HEIGHT).toString()
        );
        leftPolygonRef.current?.setAttribute(
          "points",
          makePolygonString(leftWallPoints, WALL_HEIGHT, 0)
        );

        rightWallRef.current?.setAttribute(
          "height",
          (rightWallPoints.length * WALL_HEIGHT).toString()
        );
        rightPolygonRef.current?.setAttribute(
          "points",
          makePolygonString(rightWallPoints, WALL_HEIGHT, 500)
        );
      }
    } catch (err) {
      console.error("Error handling WebSocket message:", err);
    }
  };

  const handleKeyStroke = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      // ARROW LEFT
      case "ArrowLeft":
        animationState.current.hSpeed = Math.max(
          animationState.current.hSpeed - 1,
          -MAX_HORIZONTAL_SPEED
        );
        break;
      // ARROW RIGHT
      case "ArrowRight":
        animationState.current.hSpeed = Math.min(
          animationState.current.hSpeed + 1,
          MAX_HORIZONTAL_SPEED
        );
        break;
      // ARROW UP
      case "ArrowUp":
        animationState.current.vSpeed = Math.max(
          animationState.current.vSpeed - 1,
          0
        );
        break;
      // ARROW DOWN
      case "ArrowDown":
        animationState.current.vSpeed = Math.min(
          animationState.current.vSpeed + 1,
          MAX_VERTICAL_SPEED
        );
        break;
      default:
        break;
    }
  }, []);

  const getWallPoints = useCallback((id: string, token: string) => {
    const leftWallPoints: number[] = [];
    const rightWallPoints: number[] = [];

    try {
      const ws = new WebSocket(WS_URL);

      if (id && token) {
        ws.onopen = function () {
          ws.send(`player:${id}-${token}`);
        };
      }

      ws.onmessage = function (event: MessageEvent) {
        handleWebSocketMessage(event, leftWallPoints, rightWallPoints);
      };

      ws.onerror = function (event: Event) {
        console.error("WebSocket error:", event);
      };

      return () => {
        ws.close();
      };
    } catch (err) {
      console.error("Error creating WebSocket:", err);
    }
  }, []);

  function checkLeftWallCrash() {
    const leftPoints = leftPolygonRef.current
      ?.getAttribute("points")
      ?.split(" ");

    const leftWallPos =
      leftPoints?.slice(2)[animationState.current.wallSegment];

    if (animationState.current.shipX <= Number(leftWallPos?.split(",")[0])) {
      setGameStatus("lose");
      setShowGameOver(true);

      return true;
    }
  }

  function checkRightWallCrash() {
    const rightPoints = rightPolygonRef.current
      ?.getAttribute("points")
      ?.split(" ");

    const rightWallPos =
      rightPoints?.slice(2)[animationState.current.wallSegment];

    if (
      animationState.current.shipX + SHIP_SIZE >=
      Number(rightWallPos?.split(",")[0])
    ) {
      setGameStatus("lose");
      setShowGameOver(true);
      return true;
    }
  }

  useEffect(() => {
    document.addEventListener("keydown", handleKeyStroke);

    // CleanUp function to romeve listener
    return () => {
      document.removeEventListener("keydown", handleKeyStroke);
    };
  }, [handleKeyStroke]);

  // This won't cause a re-render
  interface AnimationState {
    shipX: number;
    shipY: number;
    wallY: number;
    wallSegment: number;
    hSpeed: number;
    vSpeed: number;
    score: number;
  }

  const animationState = useRef<AnimationState>({
    shipX: 240,
    shipY: 0,
    wallY: 0,
    wallSegment: 0,
    hSpeed: 0,
    vSpeed: 0,
    score: 0,
  });

  useEffect(() => {
    getWallPoints(gameInfo.userId, gameInfo.gameToken);

    const ship = shipRef.current;
    let play = true;

    let animationId: number;

    function step() {
      if (ship) {
        hSpeedRef.current &&
          (hSpeedRef.current.textContent =
            animationState.current.hSpeed.toString());
        vSpeedRef.current &&
          (vSpeedRef.current.textContent =
            animationState.current.vSpeed.toString());
        posRef.current &&
          (posRef.current.textContent =
            "(x,y) = " +
            animationState.current.shipX +
            "," +
            animationState.current.shipY);

        animationState.current.shipX = Math.round(
          animationState.current.shipX + animationState.current.hSpeed
        );

        ship.setAttribute("x", animationState.current.shipX.toString());

        leftWallRef.current &&
          (animationState.current.wallY =
            Number(leftWallRef.current.getAttribute("y")) -
            Number(animationState.current.vSpeed));

        if (
          Math.ceil((animationState.current.wallY / 10) * -1) >
          animationState.current.wallSegment
        ) {
          animationState.current.score += Math.round(
            SCORE_MULTIPLIER *
              (animationState.current.vSpeed + Number(gameInfo.gameComplexity))
          );
          scoreRef.current &&
            (scoreRef.current.textContent =
              animationState.current.score.toString());
        }

        animationState.current.wallSegment = Math.ceil(
          (animationState.current.wallY / 10) * -1
        );

        let leftWallHeight: number = 1;

        leftWallRef.current &&
          (leftWallHeight = Number(leftWallRef.current.getAttribute("height")));

        if (
          animationState.current.wallY !== 0 &&
          animationState.current.wallY * -1 > leftWallHeight - WALL_HEIGHT
        ) {
          setGameStatus("win");

          type NewLeader = {
            name: string;
            complexity: string;
            score: string | null | undefined;
          };

          const newLeader: NewLeader = {
            name: gameInfo.playerName,
            complexity: gameInfo.gameComplexity,
            score: scoreRef.current?.textContent,
          };

          addLeader(newLeader);

          setShowGameOver(true);
          cancelAnimationFrame(animationId);
          play = false;
        } else {
          if (checkLeftWallCrash()) {
            cancelAnimationFrame(animationId);
            play = false;
          }
          if (checkRightWallCrash()) {
            cancelAnimationFrame(animationId);
            play = false;
          }
        }

        leftWallRef.current &&
          leftWallRef.current.setAttribute(
            "y",
            animationState.current.wallY.toString()
          );
        rightWallRef.current &&
          rightWallRef.current.setAttribute(
            "y",
            animationState.current.wallY.toString()
          );
      }

      if (play) animationId = requestAnimationFrame(step);
    }

    function startAnimation() {
      requestAnimationFrame(step);
    }

    if (shipRef.current) {
      setTimeout(() => {
        startAnimation();
      }, 250);
    }
  }, [gameInfo, handleKeyStroke, getWallPoints]);

  return (
    <div className={styles.gamePlay}>
      <img src={dronLogo} width="185" height="105" alt="Dron" />
      <h1 className={styles.gameTitle}>Escape from the Cave</h1>
      {gameInfo.gameToken ? (
        <>
          <GameInfo 
            name={gameInfo.playerName}
            complexity={gameInfo.gameComplexity}
            scoreRef={scoreRef}
          />
          <GameSpeed
            hSpeedRef={hSpeedRef}
            posRef={posRef}
            vSpeedRef={vSpeedRef}
          />
          <GameField
            ship={shipRef}
            leftWall={leftWallRef}
            leftPolygon={leftPolygonRef}
            rightWall={rightWallRef}
            rightPolygon={rightPolygonRef}
          />
        </>
      ) : (
        <>
          <button onClick={newGameHandler} className={styles.startGame}>
            Start New Game
          </button>
          <RecordsTable />
        </>
      )}
      {showModal && (
        <WelcomeModal
          isOpen={showModal}
          onClose={showModalHandler}
          startGame={initGameHandler}
        />
      )}
      {showGameOver && (
        <GameOverModal
          status={gameStatus}
          onClose={showGameOverHandler}
          score={animationState.current.score}
        />
      )}
    </div>
  );
};

export default GamePlay;
