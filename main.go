package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"gopkg.in/olahol/melody.v1"
)

//-------Message 實作
type Message struct {
	//事件
	Event string `json:"event"`
	//User name
	Name string `json:"name"`
	//user content
	Content string `json:"content"`
	//now time
	TimeStamp time.Time `json:"timestamp"`
}

//create web message
func NewMessage(event, name, content string) *Message {
	return &Message{
		Event: event, Name: name, Content: content, TimeStamp: time.Now(),
	}
}

//web message to byte
func (m *Message) GetByteMessage() []byte {
	result, _ := json.Marshal(m)
	return result
}

//-----------------
const (
	HTML_INDEX      = "index.html"
	HTML_DIR_PATH   = "./template/"
	HTML_HTML_DIR   = HTML_DIR_PATH + "html/*"
	HTML_ASSETS_DIR = HTML_DIR_PATH + "assets"
	WB_PORT         = ":7777"
)

const (
	WEB_OTHER_EVENT   = "other"
	WEB_JOIN_CONTENT  = "Join Chat"
	WEB_LEAVE_CONTENT = "Leave Chat"
)

func main() {
	//gin ginServer
	ginServer := gin.Default()
	ginServer.LoadHTMLGlob(HTML_HTML_DIR)
	ginServer.Static("/assets", HTML_ASSETS_DIR)
	ginServer.GET("/", func(c *gin.Context) {
		fmt.Println("Html loading success")
		c.HTML(http.StatusOK, HTML_INDEX, nil)
	})

	//websocket melody server
	websocketServer := melody.New()
	ginServer.GET("/ws", func(c *gin.Context) {
		// websocket handle
		websocketServer.HandleRequest(c.Writer, c.Request)
	})
	websocketServer.HandleMessage(func(s *melody.Session, b []byte) {
		websocketServer.Broadcast(b)
	})
	websocketServer.HandleConnect(func(s *melody.Session) {
		fmt.Println(WEB_JOIN_CONTENT)
		id := s.Request.URL.Query().Get("id")
		websocketServer.Broadcast(NewMessage(WEB_OTHER_EVENT, id, WEB_JOIN_CONTENT).GetByteMessage())
	})

	websocketServer.HandleClose(func(s1 *melody.Session, i int, s2 string) error {
		fmt.Println(WEB_LEAVE_CONTENT)
		id := s1.Request.URL.Query().Get("id")
		websocketServer.Broadcast(NewMessage(WEB_OTHER_EVENT, id, WEB_LEAVE_CONTENT).GetByteMessage())
		return nil
	})
	ginServer.Run(WB_PORT)
}

func init() {
	fmt.Println("main go running")
}
