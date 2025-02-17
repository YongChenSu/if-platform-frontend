import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { setAuthToken } from "../../utils";
import {
  login as loginAPI,
  register as registerAPI,
  getMe as getMeAPI,
  updateMe as updateMeAPI,
  updatePassword as updatePasswordAPI,
  getUsers as getUsersAPI,
  getUser as getUserAPI,
  updateUser,
} from "../../WebAPI";

const register = async ({
  username,
  password,
  passwordAgain,
  nickname,
  email,
  session,
  contact,
}) => {
  const response = await registerAPI(
    username,
    password,
    passwordAgain,
    nickname,
    email,
    session,
    contact
  );
  if (!response.ok) throw new Error(response.message);
  setAuthToken(response.token);
};

const login = async ({ username, password }) => {
  const response = await loginAPI(username, password);
  if (!response.ok) throw new Error(response.message);
  setAuthToken(response.token);
};
const updateMe = async (data) => {
  const response = await updateMeAPI(data);
  if (!response.ok) throw new Error(response.message);
};

const updatePassword = async ({ oldPassword, newPassword, againPassword }) => {
  const response = await updatePasswordAPI({
    oldPassword,
    newPassword,
    againPassword,
  });
  if (!response.ok) throw new Error(response.message);
};

export const getMe = createAsyncThunk(
  "user/getMe",
  async (data, { rejectWithValue }) => {
    try {
      switch (data.goal) {
        case "register":
          await register(data);
          break;
        case "login":
          await login(data);
          break;
        case "updateMe":
          await updateMe(data);
          break;
        case "updatePassword":
          await updatePassword(data);
          break;
        default:
      }
      const response = await getMeAPI();
      if (!response.ok) throw new Error(response.message);
      return { goal: data.goal, data: response.data.user };
    } catch (error) {
      return rejectWithValue({
        goal: data.goal,
        message: error.message ? error.message : "失敗",
      });
    }
  }
);

export const getUsers = createAsyncThunk(
  "user/getUsers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getUsersAPI();
      if (!response.ok) throw new Error(response.message);
      return response.data.users;
    } catch (error) {
      return rejectWithValue(error.message ? error.message : "失敗");
    }
  }
);

export const getUser = createAsyncThunk(
  "user/getUser",
  async (data, { rejectWithValue }) => {
    try {
      let response = {};
      if (!data.data) response = await getUserAPI(data.id);
      else response = await updateUser(data);
      if (!response.ok) throw new Error(response.message);
      return response.data.user;
    } catch (error) {
      return rejectWithValue(error.message ? error.message : "失敗");
    }
  }
);

export const userReducer = createSlice({
  name: "user",
  initialState: {
    status: {
      getMe: "idle",
      login: "idle",
      register: "idle",
      updateMe: "idle",
      updatePassword: "idle",
      getUsers: "idle",
      getUser: "idle",
    },
    isLoading: false,
    me: null,
    users: [],
    user: null,
    error: null,
  },
  reducers: {},
  extraReducers: {
    [getMe.pending]: (state, action) => {
      state.isLoading = true;
    },
    [getMe.fulfilled]: (state, action) => {
      state.status[action.payload.goal] = "succeeded";
      state.isLoading = false;
      state.me = action.payload.data;
    },
    [getMe.rejected]: (state, action) => {
      state.status[action.payload.goal] = "failed";
      state.isLoading = false;
      state.me = null;
      state.error = action.payload.message;
    },
    [getUsers.pending]: (state, action) => {
      state.isLoading = true;
    },
    [getUsers.fulfilled]: (state, action) => {
      state.status.getUsers = "succeeded";
      state.isLoading = false;
      state.users = action.payload;
    },
    [getUsers.rejected]: (state, action) => {
      state.status.getUsers = "failed";
      state.isLoading = false;
      state.error = action.payload;
    },
    [getUser.pending]: (state, action) => {
      state.isLoading = true;
    },
    [getUser.fulfilled]: (state, action) => {
      state.status.getUser = "succeeded";
      state.isLoading = false;
      state.user = action.payload;
    },
    [getUser.rejected]: (state, action) => {
      state.status.getUser = "failed";
      state.isLoading = false;
      state.error = action.payload;
    },
  },
});

export const selectMe = (store) => store.user.me;
export const selectIsLogin = (store) => (store.user.me ? true : false);
export const selectuser = (store) => store.user.user;
export const selectUsers = (store) => store.user.users;
export const selectUserStatus = (store) => store.user.status;
export const selectUserIsLoading = (store) => store.user.isLoading;
export const selectUserError = (store) => store.user.error;

export default userReducer.reducer;
