import React, { useCallback, useEffect, useRef, useState } from "react";
import styles from "./GamePlay.module.css";
import dronLogo from "./../../assets/images/dron-logo.png";
import RecordsTable from "../RecordsTable/RecordsTable";
import WelcomeModal from "../WelcomeModal/WelcomeModal";
import GameOverModal from "../GameOverModal/GameOverModal";
import { makePolygonString } from "../../services/walls";
import { addLeader } from "../../services/leaders";
import {
  GAMEFIELD_HEIGHT,
  GAMEFIELD_WIDTH,
  MAX_HORIZONTAL_SPEED,
  MAX_VERTICAL_SPEED,
  SCORE_MULTIPLIER,
  SHIP_SIZE,
  WALL_HEIGHT,
} from "../../constants";

const GamePlay = () => {
  const [showModal, setShowModal] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);

  const [gameInfo, setGameInfo] = useState({
    playerName: "",
    userId: "",
    gameComplexity: "",
    gameToken: "",
    gameStatus: "lose",
  });

  // const [playerName, setPlayerName] = useState("");
  // const [userId, setUserId] = useState("");

  // const [gameComplexity, setGameComplexity] = useState("");
  // const [gameToken, setGameToken] = useState("");
  const [gameStatus, setGameStatus] = useState("lose");

  const shipRef = useRef();
  const hSpeedRef = useRef();
  const vSpeedRef = useRef();

  const scoreRef = useRef(0);
  const posRef = useRef();
  // const wallYRef = useRef();
  // const wallSegmentRef = useRef();
  // const wallHeightRef = useRef();

  const leftWallRef = useRef();
  const rightWallRef = useRef();
  const leftPolygonRef = useRef();
  const rightPolygonRef = useRef();

  function showModalHandler() {
    setShowModal((prev) => !prev);
  }

  function showGameOverHandler() {
    setShowGameOver((prev) => !prev);
  }

  const newGameHandler = (event) => {
    event.preventDefault();
    setShowModal(true);
  };

  async function initGameHandler(name, complexity, id, token) {
    //setPlayerName(name);
    //setGameComplexity(complexity);
    //setGameToken(token);
    //setUserId(id);
    setGameInfo({
      ...gameInfo,
      playerName: name,
      gameComplexity: complexity,
      gameToken: token,
      userId: id,
    });
    // setGameInfo({ ...gameInfo, gameComplexity: complexity });
    // setGameInfo({ ...gameInfo, gameToken: token });
    // setGameInfo({ ...gameInfo, userId: id });

    setShowModal(false);
  }

  const handleKeyStroke = useCallback((e) => {
    switch (e.keyCode) {
      // ARROW LEFT
      case 37:
        animationState.current.hSpeed = Math.max(
          animationState.current.hSpeed - 1,
          -MAX_HORIZONTAL_SPEED
        );
        break;
      // ARROW RIGHT
      case 39:
        animationState.current.hSpeed = Math.min(
          animationState.current.hSpeed + 1,
          MAX_HORIZONTAL_SPEED
        );
        break;
      // ARROW UP
      case 38:
        animationState.current.vSpeed = Math.max(
          animationState.current.vSpeed - 1,
          0
        );
        break;
      // ARROW DOWN
      case 40:
        animationState.current.vSpeed = Math.min(
          animationState.current.vSpeed + 1,
          MAX_VERTICAL_SPEED
        );
        break;
      default:
        break;
    }
  }, []);

  const getWallPoints = useCallback((id, token) => {
    const leftWallPoints = [];
    const rightWallPoints = [];

    const ws = new WebSocket("wss://cave-drone-server.shtoa.xyz/cave");

    if (id && token) {
      ws.onopen = function () {
        ws.send(`player:${id}-${token}`);
      };
    }

    ws.onmessage = function (event) {
      try {
        if (event.data !== "finished") {
          const points = event.data?.split(",");
          leftWallPoints.push(250 + Number(points[0]));
          rightWallPoints.push(250 + Number(points[1]));

          leftWallRef.current?.setAttribute(
            "height",
            leftWallPoints.length * WALL_HEIGHT
          );
          leftPolygonRef.current?.setAttribute(
            "points",
            makePolygonString(leftWallPoints, WALL_HEIGHT, 0)
          );

          rightWallRef.current?.setAttribute(
            "height",
            rightWallPoints.length * WALL_HEIGHT
          );
          rightPolygonRef.current?.setAttribute(
            "points",
            makePolygonString(rightWallPoints, WALL_HEIGHT, 500)
          );
        }
      } catch (err) {
        console.log(err);
      }
    };

    ws.onerror = function (event) {
      console.log(event.err);
    };

    return () => {
      ws.close();
    };
  }, []);

  function checkLeftWallCrash() {
    const leftPoints = leftPolygonRef.current
      ?.getAttribute("points")
      ?.split(" ");

    const leftWallPos = leftPoints.slice(2)[animationState.current.wallSegment];

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
      rightPoints.slice(2)[animationState.current.wallSegment];

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
  const animationState = useRef({
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

    let animationId;

    function step() {
      if (ship) {
        hSpeedRef.current.textContent = animationState.current.hSpeed;
        vSpeedRef.current.textContent = animationState.current.vSpeed;
        posRef.current.textContent =
          "(x,y) = " +
          animationState.current.shipX +
          "," +
          animationState.current.shipY;

        animationState.current.shipX = Math.round(
          animationState.current.shipX + animationState.current.hSpeed
        );

        ship.setAttribute("x", animationState.current.shipX);

        animationState.current.wallY =
          +leftWallRef.current.getAttribute("y") -
          animationState.current.vSpeed;

        if (
          Math.ceil((animationState.current.wallY / 10) * -1) >
          animationState.current.wallSegment
        ) {
          animationState.current.score += Math.round(
            SCORE_MULTIPLIER *
              (animationState.current.vSpeed + gameInfo.gameComplexity)
          );
          scoreRef.current.textContent = animationState.current.score;
        }

        animationState.current.wallSegment = Math.ceil(
          (animationState.current.wallY / 10) * -1
        );

        if (
          animationState.current.wallY !== 0 &&
          animationState.current.wallY * -1 >
            +leftWallRef.current.getAttribute("height") - WALL_HEIGHT
        ) {
          setGameStatus("win");

          const newLeader = {
            name: gameInfo.playerName,
            complexity: gameInfo.gameComplexity,
            score: scoreRef.current.textContent,
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

        leftWallRef.current.setAttribute("y", animationState.current.wallY);
        rightWallRef.current.setAttribute("y", animationState.current.wallY);
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
          <div className={styles.gameInfo}>
            <div>
              <h4>
                Name: <span>{gameInfo.playerName}</span>
              </h4>
            </div>
            <div>
              <h4>
                Complexity: <span>{gameInfo.gameComplexity}</span>
              </h4>
            </div>
            <div>
              <h4>
                Score: <span ref={scoreRef}>0</span>
              </h4>
            </div>
          </div>

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
              <label ref={posRef}>(x,y)</label> <br />
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

          <svg
            className={styles.gameField}
            width={GAMEFIELD_WIDTH}
            height={GAMEFIELD_HEIGHT}
          >
            <svg
              ref={shipRef}
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
            <svg ref={leftWallRef} width={GAMEFIELD_WIDTH} x="0" y="0">
              <polygon
                ref={leftPolygonRef}
                points=""
                style={{ fill: "#646464" }}
              />
            </svg>
            <svg ref={rightWallRef} width={GAMEFIELD_WIDTH} x="0" y="0">
              <polygon
                ref={rightPolygonRef}
                points=""
                style={{ fill: "#646464" }}
              />
            </svg>
          </svg>
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
