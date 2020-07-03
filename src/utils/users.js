const users = [];

//adduser removeuser getuser getuserinromm

const addUser = ({ id, username, room }) => {
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  if (!username || !room) {
    return {
      error: "Username and room is required!!!",
    };
  }

  //Check for existing user

  const existingUser = users.find((user) => {
    return user.room === room && user.username === username;
  });

  //Vlaidate existing usr
  if (existingUser) {
    return {
      error: "Username already taken",
    };
  }
  //Store the user
  const user = { id, username, room };
  users.push(user);
  return { user };
};

//Remove the user
const removeUser = (id) => {
  const index = users.findIndex((user) => {
    return user.id === id;
  });
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};
addUser({
  id: 22,
  username: "onemptie",
  room: "one",
});
const re = addUser({
  id: 222,
  username: "onemptiepie",
  room: "one",
});

//Get user

const getUser = (id) => {
  return users.find((user) => user.id === id);
};

//get users in room

const getUsersinRoom = (room) => {
  room = room.trim().toLowerCase();
  return users.filter((user) => {
    return user.room === room;
  });
};

const ul = getUsersinRoom("one");
//console.log(users.length);

// console.log(ul);

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersinRoom,
};
