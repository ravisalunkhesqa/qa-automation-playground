import { useEffect } from "react";
import { api } from "../services/api";

export default function Dashboard() {

  useEffect(() => {
    api.get("/health")
      .then((response) => {
        console.log(response.data);
      });
  }, []);

  return (
    <h1>QA Automation Playground</h1>
  );
}