import React, { useEffect, useState } from "react";
import styles from "./RecordsTable.module.css";
import Loader from "../../Loader";
import { sortLeadersByScore } from "../../services/leaders";

const RecordsTable = () => {
  const [loading, setLoading] = useState(true);
  const [leaders, setLeaders] = useState([]);

  // const liders = [
  //   { name: "Petro", complexity: "5", score: "171" },
  //   { name: "Slavko", complexity: "3", score: "127" },
  //   { name: "Mykola", complexity: "1", score: "197" },
  //   { name: "Dmytro", complexity: "2", score: "236" },
  //   { name: "Galya", complexity: "3", score: "277" },
  //   { name: "Dmytro", complexity: "1", score: "186" },
  //   { name: "Galya", complexity: "2", score: "159" },
  //   { name: "Maryna", complexity: "5", score: "132" },
  //   { name: "Svitlana", complexity: "2", score: "97" },
  //   { name: "Olena", complexity: "7", score: "163" },
  // ];

  useEffect(() => {
    //localStorage.setItem("leaders", JSON.stringify(liders));
    setLoading(true);
    if (localStorage.getItem("leaders")) {
      setLeaders(JSON.parse(localStorage.getItem("leaders")));
    }

    setLoading(false);
  }, []);

  const sortedLeaders = sortLeadersByScore(leaders, "desc");

  return (
    <div className={styles.RecordsTable}>
      {loading && <Loader />}
      {leaders.length > 0 && (
        <>
          <h2>TOP Rated players of the Game</h2>
          <table>
            <tbody>
              <tr>
                <th></th>
                <th>Nickname</th>
                <th>Complexity</th>
                <th>Total Score</th>
              </tr>
              {sortedLeaders.map((lider, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{lider.name}</td>
                  <td>{lider.complexity}</td>
                  <td>{lider.score} </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default RecordsTable;
