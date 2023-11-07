import React, { useState, useEffect } from "react";
import { Button, Navbar, Nav, InputGroup, Form } from "react-bootstrap";
import "./ChatRoom.css";
import { FaSmile, FaUsers } from "react-icons/fa";
import io from "socket.io-client";
import ScrollableFeed from "react-scrollable-feed";
import Messages from "./Messages";

const socket = io();

const Chatroom = ({ user, setAuth }) => {
  const [messages, setMessages] = useState([]);
  const [msgInput, setMsgInput] = useState("");
  const [users, setUsers] = useState([]);
  const [channel, setChannel] = useState("general");
  const [channels, setChannels] = useState([
    "general",
    "funstuff",
    "sports",
    "checking-in",
    "dog-lover",
  ]);

  const handleClick = async (e, msgInput) => {
    e.preventDefault();
    if (!msgInput) return;

    try {
      const message = msgInput;
      const config = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${JSON.parse(
            localStorage.getItem("accessToken")
          )}`,
        },
        body: JSON.stringify({ user, message, channel }),
      };
      const response = await fetch("/users/post", config);
      const msgData = await response.json();

      if (response.ok) {
        console.log("response from a server =", msgData);
      }
    } catch (error) {
      console.log(error);
    }

    setMsgInput("");
  };

  const setLoggedOut = async () => {
    try {
      const config = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: user.name }),
      };

      const response = await fetch("/users/logout", config);

      if (response.ok) {
        setAuth(false);
        localStorage.removeItem("accessToken");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleChannels = async () => {
    const response = await fetch(`/users/channel/:${channel}`);
    const data = await response.json();
    setMessages(data);
  };

  useEffect(() => {
    handleChannels();
  }, [channel]);

  useEffect(() => {
    fetch("/users/getActiveUsers")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data.rows);
      });

    socket.on("message", (msg) => {
      setMessages((messages) => [...messages, msg]);
    });

    socket.on("new-login", ({ activeUsers }) => {
      setUsers(activeUsers);
    });

    socket.on("user-leave", ({ activeUsers }) => {
      setUsers(activeUsers);
    });
  }, []);

  const displayMessages = (
    <Messages
      key={Date.now()}
      messages={messages}
      currentUser={user.name}
      currentChannel={channel}
    />
  );

  const displayActiveUsers =
    users.length >= 1
      ? users.map((u, index) => {
          return user.name === u.name ? (
            <li key={index} className="font-weight-bold">
              {u.name}
            </li>
          ) : (
            <li key={index}> {u.name}</li>
          );
        })
      : null;

  const displayButtons = channels.map((c, index) => {
    return c === channel ? (
      <Button
        key={index + 1000}
        onClick={() => setChannel(c)}
        className="mr-1 mb-1"
        variant="outline-primary"
      >
        {c}
      </Button>
    ) : (
      <Button
        key={index + 2000}
        onClick={() => setChannel(c)}
        className="mr-1 mb-1"
        variant="primary"
      >
        {c}
      </Button>
    );
  });

  return (
    <>
      <div className="chat-container mx-auto mt-5">
        <div className="header">
          <Navbar>
            <Navbar.Brand>
              <FaSmile />
            </Navbar.Brand>

            <Nav className="ml-auto">
              <Button onClick={() => setLoggedOut()} variant="outline-light">
                Log out
              </Button>
            </Nav>
          </Navbar>
        </div>

        <div className="main d-flex">
          <div className="chat-sidebar">
            <div className="mt-2">Channels</div>
            <ul className="px-4 py-2">{displayButtons}</ul>

            <div>
              <FaUsers /> Active Users
            </div>
            <ul>{displayActiveUsers}</ul>
          </div>

          <div className="chat-area">
            <div className="channel-name">
              <div>{channel}</div>
            </div>

            <div className="chat-main">
              <ScrollableFeed>{displayMessages}</ScrollableFeed>
            </div>
          </div>
        </div>

        <Form className="input-msg" onSubmit={() => handleClick(e, msgInput)}>
          <InputGroup className="py-2 px-5">
            <Form.Control
              placeholder="Write a message..."
              onChange={(e) => setMsgInput(e.target.value)}
              value={msgInput}
            />
            <InputGroup.Append>
              <Button variant="outline-light">Send</Button>
            </InputGroup.Append>
          </InputGroup>
        </Form>
      </div>
    </>
  );
};

export default Chatroom;
