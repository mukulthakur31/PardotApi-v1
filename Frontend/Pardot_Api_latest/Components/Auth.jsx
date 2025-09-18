import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Callback() {
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code) {
      axios
        .get(`http://localhost:4001/callback?code=${code}`)
        .then((res) => {
          localStorage.setItem("access_token", res.data.access_token);
          navigate("/dashboard");
        })
        .catch((err) => {
          console.error("Error getting access token:", err);
        });
    } else {
      console.error("No code found in query params");
    }
  }, [navigate]);

  return <div>Authorizing...</div>;
}
