export async function initUser(name, complexity) {
  const data = { name: name, complexity: complexity };

  const response = await fetch("https://cave-drone-server.shtoa.xyz/init", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  return result;
}

export async function getToken(userId) {
  const chunk1 = await fetch(
    "https://cave-drone-server.shtoa.xyz/token/1?id=" + userId
  );
  const chunk2 = await fetch(
    "https://cave-drone-server.shtoa.xyz/token/2?id=" + userId
  );
  const chunk3 = await fetch(
    "https://cave-drone-server.shtoa.xyz/token/3?id=" + userId
  );
  const chunk4 = await fetch(
    "https://cave-drone-server.shtoa.xyz/token/4?id=" + userId
  );

  let userToken = "";
  try {
    const data = await Promise.all([
      chunk1.json(),
      chunk2.json(),
      chunk3.json(),
      chunk4.json(),
    ]);
    data.forEach((value) => (userToken += value.chunk));

    return userToken;
  } catch (error) {
    console.log(error);
    return "User Not Found";
  }
}
