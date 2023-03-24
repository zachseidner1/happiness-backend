import { createContext, useContext, useState, useEffect } from "react";
import { useApi } from "./ApiProvider";
import { Keys } from "../keys";
import { useQuery } from "react-query";
import { UserState } from "../models/UserState";

const UserContext = createContext();

/**
 * The UserProvider context provides functionality for getting the user
 * for all child components. The main point of the context is to allow child
 * components to access the state of the current user object, but this also
 * has functionality for the core user methods, such as logging in,
 * deleting the user, logging out, and registering a user.
 */
export default function UserProvider({ children }) {
  const [user, setUser] = useState(UserState.loading());
  const api = useApi();
  const authorizationHeader = {
    headers: {
      Authorization: `Bearer ${localStorage.getItem(Keys.TOKEN)}`,
    },
  };
  const loginHeader = (username, password) => {
    return {
      headers: {
        Authorization:
          "Basic" + Buffer.from(`${username}:${password}`).toString("base64"),
      },
    };
  };

  // This works only **theoretically**
  // On initialization:
  useEffect(() => {
    (async () => {
      if (localStorage.getItem(Keys.TOKEN) != null) {
        GetUserFromToken();
      }
    })();
  }, [api]);

  /**
   * Precondition: the user is logged in.
   */
  function Logout() {
    const { isLoading, error, data } = useQuery(
      `${localStorage.getItem(Keys.TOKEN)} logout`,
      () => api.delete("/token/").then((res) => res)
    );
    if (error) {
      return;
    }
    if (isLoading) {
      setUser(UserState.loading());
      return;
    }
    localStorage.setItem(Keys.TOKEN, "");
    setUser(UserState.error());
  }

  function Login(username, password) {
    const { isLoading, error, data } = useQuery(
      `${localStorage.getItem(Keys.TOKEN)} login`,
      () =>
        api
          .get("/token/", loginHeader(username, password))
          .then((res) => res.data)
    );

    if (error) {
      setUser(UserState.error());
      return;
    }
    if (isLoading) {
      setUser(UserState.loading());
      return;
    }
    localStorage.setItem(Keys.TOKEN, data);
    GetUserFromToken();
  }

  /**
   * Precondition: the lcoal storage must have a valid token.
   * Postcondition: the user object is either null, or has data.
   */
  function GetUserFromToken() {
    const { isLoading, error, data } = useQuery(
      `${localStorage.getItem(Keys.TOKEN)}`,
      () => api.get("/user/self/", authorizationHeader).then((res) => res.data)
    );

    if (error) {
      setUser(UserState.error());
      return;
    }
    if (isLoading) {
      setUser(UserState.loading());
      return;
    }
    setUser(UserState.success(data));
  }

  function CreateUser(email, username, password) {
    const { isLoading, error, data } = useQuery(`${username} CREATE`, () =>
      api
        .post("/user/", {
          email: email,
          username: username,
          password: password,
        })
        .then((res) => res.data)
    );
    if (isLoading) {
      setUser(UserState.loading());
      return;
    }
    if (error) {
      setUser(UserState.error());
    }
    localStorage.setItem(Keys.TOKEN, data);
    Login(username, password);
  }

  function DeleteUser() {
    const { isLoading, error, data } = useQuery(
      `${localStorage.getItem(Keys.TOKEN)} DELETE`,
      api.delete("/user/", authorizationHeader).then((res) => res.data)
    );

    if (error) {
      return;
    }

    if (isLoading) {
      setUser(UserState.loading());
    }

    // This if statement should ensure that the user was properly deleted
    // But this comparison is very precarious.
    // TODO test this!
    if (data === user) {
      setUser(UserState.error());
    }
  }

  return (
    <UserContext.Provider value={{ user, setUser, Login, Logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
