import React, { useCallback, useEffect, useRef, useState } from "react";
import styles from "./GamePlay.module.css";
import dronLogo from "./../../assets/images/dron-logo.png";
import RecordsTable from "../RecordsTable/RecordsTable";
import WelcomeModal from "../WelcomeModal/WelcomeModal";
import GameOverModal from "../GameOverModal/GameOverModal";
import { makePolygonString } from "../../services/walls";
import { addLeader } from "../../services/leaders";

const GamePlay = () => {
  const SHIP_SIZE = 20;
  const MAX_HORIZONTAL_SPEED = 3;
  const MAX_VERTICAL_SPEED = 5;
  const WALL_HEIGHT = 10;

  const [showModal, setShowModal] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);

  const [playerName, setPlayerName] = useState("");
  const [userId, setUserId] = useState("");
  const [gameComplexity, setGameComplexity] = useState("");
  const [gameToken, setGameToken] = useState("");
  const [gameStatus, setGameStatus] = useState("");

  const scoreMultiplier = 0.75;

  const shipRef = useRef();
  const hSpeedRef = useRef();
  const vSpeedRef = useRef();

  const scoreRef = useRef(0);
  const posRef = useRef();
  const wallYRef = useRef();
  const wallSegmentRef = useRef();
  const wallHeightRef = useRef();

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
    setPlayerName(name);
    setGameComplexity(complexity);
    setGameToken(token);
    setUserId(id);

    setShowModal(false);
  }

  const handleKeyStroke = useCallback((e) => {
    const h = +hSpeedRef.current?.textContent;
    const v = +vSpeedRef.current?.textContent;

    switch (e.keyCode) {
      // SPACE
      case 32:
        alert(
          "Current array index is: " +
            Math.ceil((wallYRef.current.textContent / 10) * -1)
        );
        break;
      // ARROW LEFT
      case 37:
        if (h > -MAX_HORIZONTAL_SPEED) {
          hSpeedRef.current.textContent = Number(h - 1);
        }
        break;
      // ARROW RIGHT
      case 39:
        if (h < MAX_HORIZONTAL_SPEED) {
          hSpeedRef.current.textContent = Number(h + 1);
        }
        break;
      // ARROW UP
      case 38:
        if (v > 0) {
          vSpeedRef.current.textContent = v - 1;
        }
        break;
      // ARROW DOWN
      case 40:
        if (v < MAX_VERTICAL_SPEED) {
          vSpeedRef.current.textContent = v + 1;
        }
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
          const points = event.data.split(",");
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
  }, []);

  function checkLeftWallCrash() {
    const leftPoints = leftPolygonRef.current
      ?.getAttribute("points")
      .split(" ");

    const leftWallPos =
      leftPoints.slice(2)[Number(wallSegmentRef.current.textContent)];

    if (
      Number(shipRef.current.getAttribute("x")) <=
      Number(leftWallPos.split(",")[0])
    ) {
      setGameStatus("lose");
      setShowGameOver(true);

      return true;
    }
  }

  function checkRightWallCrash() {
    const rightPoints = rightPolygonRef.current
      ?.getAttribute("points")
      .split(" ");

    const rightWallPos =
      rightPoints.slice(2)[Number(wallSegmentRef.current.textContent)];

    if (
      Number(shipRef.current.getAttribute("x")) + SHIP_SIZE >=
      Number(rightWallPos.split(",")[0])
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

  useEffect(() => {
    getWallPoints(userId, gameToken);

    let dx = 0;
    let dy = 0;
    const ship = shipRef.current;
    let play = true;

    let animationId;

    function step() {
      dx = Number(hSpeedRef.current.textContent);
      dy = Number(vSpeedRef.current.textContent);

      let x;
      let y;

      if (ship) {
        x = Number(ship.getAttribute("x"));
        y = Number(ship.getAttribute("y"));

        posRef.current.textContent = "(x,y) = " + x + "," + y;
        let new_x = Math.round(x + dx);

        ship.setAttribute("x", new_x);
        ship.setAttribute("y", 0);

        let new_WallY = +leftWallRef.current.getAttribute("y") - dy;

        if (
          Math.ceil((wallYRef.current.textContent / 10) * -1) >
          Number(wallSegmentRef.current.textContent)
        ) {
          scoreRef.current.textContent =
            +scoreRef.current.textContent +
            Math.round(scoreMultiplier * (dy + gameComplexity));
        }

        wallSegmentRef.current.textContent = Math.ceil(
          (wallYRef.current.textContent / 10) * -1
        );

        if (
          +wallYRef.current.textContent !== 0 &&
          +wallYRef.current.textContent * -1 >
            +wallHeightRef.current.textContent - WALL_HEIGHT
        ) {
          setGameStatus("win");

          const newLeader = {
            name: playerName,
            complexity: gameComplexity,
            score: scoreRef.current.textContent,
          };

          addLeader(newLeader);

          setShowGameOver(true);
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

        leftWallRef.current.setAttribute("y", new_WallY);
        rightWallRef.current.setAttribute("y", new_WallY);
        wallYRef.current.textContent = leftWallRef.current.getAttribute("y");

        wallHeightRef.current.textContent =
          leftWallRef.current.getAttribute("height");
      }

      if (play) animationId = requestAnimationFrame(step);
    }

    function startAnimation() {
      requestAnimationFrame(step);
    }

    // Loading points by WebSocket and start animation with little delay.
    if (shipRef.current) {
      setTimeout(() => {
        startAnimation();
      }, 500);
    }
  }, [
    gameToken,
    handleKeyStroke,
    gameComplexity,
    userId,
    getWallPoints,
    playerName,
  ]);

  return (
    <div className={styles.gamePlay}>
      <img src={dronLogo} width="185" height="105" alt="Dron" />
      <h1 className={styles.gameTitle}>Escape from the Cave</h1>
      {gameToken ? (
        <>
          <div className={styles.gameInfo}>
            <div>
              <h4>
                Name: <span>{playerName}</span>
              </h4>
            </div>
            <div>
              <h4>
                Complexity: <span>{gameComplexity}</span>
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
                  <span ref={hSpeedRef}>0</span>km/h
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

          <svg className={styles.gameField} width="500" height="300">
            <svg
              ref={shipRef}
              height={(SHIP_SIZE * Math.sqrt(3)) / 2}
              width={SHIP_SIZE}
              x={250 - SHIP_SIZE / 2}
              y="0"
            >
              <polygon
                points={`0,0 ${SHIP_SIZE},0 ${SHIP_SIZE / 2},${
                  (SHIP_SIZE * Math.sqrt(3)) / 2
                }`}
                style={{ fill: "#1dc823" }}
              />
            </svg>
            <svg ref={leftWallRef} width="500" height="1000" x="0" y="0">
              <polygon
                ref={leftPolygonRef}
                points=""
                style={{ fill: "#646464" }}
              />
            </svg>
            <svg ref={rightWallRef} width="500" height="1000" x="0" y="0">
              <polygon
                ref={rightPolygonRef}
                points=""
                style={{ fill: "#646464" }}
              />
            </svg>
          </svg>
          <div className={styles.gameSpeed}>
            <div>
              WallHeight <br />
              <label ref={wallHeightRef}>0</label> <br />
            </div>
            <div>
              wallYRef
              <br />
              <label ref={wallYRef}>0</label> <br />
            </div>
            <div>
              currentSegment
              <br />
              <label ref={wallSegmentRef}>0</label> <br />
            </div>
          </div>
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
          score={+scoreRef.current.textContent}
        />
      )}
    </div>
  );
};

export default GamePlay;
