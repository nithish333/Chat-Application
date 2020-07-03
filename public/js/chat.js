const socket = io();

//Elements
const totalForm = document.getElementById("form");
const sendBtn = document.getElementById("btn");
const msgBox = document.getElementById("text");
const shareBtn = document.getElementById("share");
const messages = document.getElementById("messages");
const sidebar = document.getElementById("sidebar");
//Templates
const messageTemplate = document.getElementById("message-template").innerHTML;
const locationTemplate = document.getElementById("location-template").innerHTML;
const sidebarTemplate = document.getElementById("sidebar-template").innerHTML;
//Options
//Creates an object for parsing
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});
const autoscroll = () => {
  //New message element
  const newMessage = messages.lastElementChild;

  //Get the heigth of the new message
  const newMessageStyles = getComputedStyle(newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newmessageHeight = newMessage.offsetHeight + newMessageMargin;

  //Visible height

  const visibleHeight = messages.offsetHeight;

  //Height of messages container

  const containerHeigth = messages.scrollHeight;

  //How far we scrolled

  const scrollOffset = messages.scrollTop + visibleHeight;

  if (containerHeigth - newmessageHeight <= scrollOffset) {
    messages.scrollTop = messages.scrollHeight;
  }
};
socket.on("message", (serverMsg) => {
  console.log(serverMsg);
  const html = Mustache.render(messageTemplate, {
    username: serverMsg.username,
    message: serverMsg.text,
    createdAt: moment(serverMsg.createdAt).format("h : mm a"),
  });
  messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

totalForm.addEventListener("submit", (e) => {
  e.preventDefault();
  sendBtn.setAttribute("disabled", "disabled");

  const msgBoxValue = document.getElementById("text").value;

  //To acknowledge the user that the msg was sent we add an callback after the message is sent i.e., after user emitted the message
  socket.emit("userMsg", msgBoxValue, (error) => {
    msgBox.value = "";
    msgBox.focus();
    if (error) {
      return console.log(error);
    }
    console.log("Message sent");
    sendBtn.removeAttribute("disabled");
  });
});

shareBtn.addEventListener("click", () => {
  shareBtn.setAttribute("disabled", "disabled");
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported");
  }
  //To fetch location
  const options = { enableHighAccuracy: true };
  navigator.geolocation.getCurrentPosition(
    (position) => {
      //console.log(position.coords.longitude);

      socket.emit(
        "userLocation",
        position.coords.latitude,
        position.coords.longitude,
        () => {
          console.log("Location shared..");
          shareBtn.removeAttribute("disabled");
        }
      );
    },
    undefined,
    options
  );
});
socket.on("locationEvent", (locationUrl) => {
  console.log(locationUrl);
  const html = Mustache.render(locationTemplate, {
    username: locationUrl.username,
    locationUrl: locationUrl.url,
    createdAt: moment(locationUrl.createdAt).format("h : mm a"),
  });
  messages.insertAdjacentHTML("beforeend", html);
});

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
//Roomdata event

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });
  sidebar.innerHTML = html;
});
//Since we included the socketio script file,this file has some new features which makes us connect to the client side socket

//Below is the client accepting the data that the server sends
// socket.on("countUpdated", (count) => {
//   console.log("Count has been updated ", count);
// });

//We first create a template inside html file and div to render the template as mmany times we caleed
//We get the elements and templates by their id's in the js file
//We need to which template to render first using mustache
//Mustache.render(template)
//Next we insert the template into the html div using insertadjacentHTML
//We calls the template each time we sends a new mesage
//To inject dynamic message the syntax {{dynamicName}}
//we send this dynamicmsg from the Mustache.render as a object

// const incBtn = document.querySelector("#btn");
// incBtn.addEventListener("click", () => {
//   console.log("Clicked");
//   socket.emit("increment");
// });
