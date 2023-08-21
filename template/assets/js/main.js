
//使用者亂數頭貼
var personImg = Define.USER_PHOTO[getRandomNum(0, Define.USER_PHOTO.length - 1)];
//使用者亂數名
var personName = "Guest" + Math.floor(Math.random() * 1000);
var name = "Guest" + Math.floor(Math.random() * 1000);
var chatroom = document.getElementsByClassName("msger-chat")
var text = document.getElementById("msg");
var send = document.getElementById("send")


//web socket url
var url = "ws://" + window.location.host + "/ws?id=" + personName;
//web socket
var ws = new WebSocket(url);
ws.onopen = function(msg)
{
    console.log("ws onopen go", msg)
}
ws.onerror = function(e)
{
    console.error("ws error", e)
}

//websocket on close
ws.onclose = function (e) 
{
    console.log("webSocket on close", e)
}

//websocket receive message
ws.onmessage = function (e)
{
    var m = JSON.parse(e.data)
    var msg = ""
    console.log("on message->", m)
    switch (m.event) 
    {
        case Define.EVENT.MESSAGE:
            msg = getMessage(m.name,
                m.photo,
                    m.name == personName?Define.RIGHT:Define.LEFT ,
                        m.content);
            break;
        case Define.EVENT.OTHER:
            if (m.name != personName)
            {
                msg = getEventMessage(m.name + " " + m.content)
            } 
            else 
            {
                msg = getDateMessage(formatDate(m.timestamp))
                msg += getEventMessage("您已" + m.content)
            }
            break;
    }
    insertMsg(msg, chatroom[0]);
};

function formatTime(d) {
    return d.toLocaleString('zh-TW', {
        timeZone: 'Asia/Taipei',
        hour12: true,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    }).replaceAll("/", "-");
}

function getMessage(name, img, side, text) {
    const d = new Date();
    //   Simple solution for small apps
    var msg = `
    <div class="msg ${side}-msg">
      <div class="msg-img" style="background-image: url(${img})"></div>

      <div class="msg-bubble">
        <div class="msg-info">
          <div class="msg-info-name">${name}</div>
          <div class="msg-info-time">${formatTime(d)}</div>
        </div>

        <div class="msg-text">${text}</div>
      </div>
    </div>
  `
    return msg;
}

//send message onclick
send.onclick = function (e) 
{
    console.log("send click")
    handleMessageEvent()
}
//receive text keydown
text.onkeydown = function (e) {
    if (e.keyCode === 13 && text.value !== "") 
    {
        handleMessageEvent()
    }
};
/**
 * 取得亂數
 * @param {*} min 設定最小亂數 
 * @param {*} max 設定最大亂數
 * @returns number
 */
function getRandomNum(min, max)
{
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function handleMessageEvent()
 {
    // encode html tag
    content = text.value.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    if (text.value != "") 
    {
        console.log("ws", ws)
        ws.send(JSON.stringify(
            {
            "event": "message",
            "photo": personImg,
            "name": personName,
            "content": content,
        }));
    }
    text.value = "";
}


function getEventMessage(msg)
{
    var msg = `<div class="msg-notify">${msg}</div>`
    return msg
}

function getDateMessage(msg) 
{
    var msg = `<div class="msg-date"><span class="time-tag">${msg}</span></div>`
    return msg
}

function formatDate(d)
{
    return d.split('T')[0];
}

function insertMsg(msg, domObj) {
    console.log("insertMsg", msg)
    domObj.insertAdjacentHTML("beforeend", msg);
    domObj.scrollTop += 500;
}