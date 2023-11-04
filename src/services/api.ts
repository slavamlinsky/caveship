import { INIT_URL, TOKEN_URL } from "../constants";

export async function initUser(name:string, complexity:string) {
  const data = { name: name, complexity: complexity };

  try {
    const response = await fetch(INIT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();        
    return result.id;

  } catch (error) {
    console.error("Error initializing user:", error);
    throw error;
  }
}

export async function getToken(userId:string) {  
  try {
    const [chunk1, chunk2, chunk3, chunk4] = await Promise.all([
      fetch(`${TOKEN_URL}1?id=${userId}`).then(response => response.json()),
      fetch(`${TOKEN_URL}2?id=${userId}`).then(response => response.json()),
      fetch(`${TOKEN_URL}3?id=${userId}`).then(response => response.json()),
      fetch(`${TOKEN_URL}4?id=${userId}`).then(response => response.json()),
    ]);

    return chunk1.chunk + chunk2.chunk + chunk3.chunk + chunk4.chunk;
  } catch (error) {
    console.error("Error getting user token:", error);
    throw error;
  }
}