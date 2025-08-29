import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { message } from 'antd';
import { authAPI } from '../../services/authAPI';

// 异步action：登录
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      console.log('调用真实API登录:', credentials);
      const response = await authAPI.login(credentials);
      console.log('API登录响应:', response);
      
      // 保存token到localStorage
      localStorage.setItem('token', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      return response;
    } catch (error) {
      console.error('API登录错误:', error);
      return rejectWithValue(error.response?.data?.message || '登录失败');
    }
  }
);

// 异步action：登出
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authAPI.logout();
      // 清除localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return null;
    } catch (error) {
      // 即使API调用失败，也要清除本地存储
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return rejectWithValue(error.response?.data?.message || '登出失败');
    }
  }
);

// 异步action：获取当前用户信息
export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.getCurrentUser();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || '获取用户信息失败');
    }
  }
);

const initialState = {
  isAuthenticated: !!localStorage.getItem('token'),
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null,
  token: localStorage.getItem('token'),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // 登录
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.access_token;
        console.log('Redux - 登录成功，状态更新:', {
          isAuthenticated: state.isAuthenticated,
          user: state.user,
          token: state.token
        });
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // 登出
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        message.success('已退出登录');
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        message.error(action.payload);
      })
      // 获取当前用户
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        // 清除无效的token
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      });
  },
});

export const { clearError, setLoading } = authSlice.actions;
export default authSlice.reducer; 