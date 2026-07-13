import { useEffect, useState } from "react";
import { api } from "../services/api";

export default function UserManagement() {

  const [users, setUsers] = useState([]);

  useEffect(() => {
    api.get("/users")
      .then(res => setUsers(res.data));
  }, []);

  return (
    <div>
      <h1>Users</h1>

      {users.map((user:any) => (
        <div key={user.id}>
          {user.firstName} {user.lastName}
        </div>
      ))}
    </div>
  );
}