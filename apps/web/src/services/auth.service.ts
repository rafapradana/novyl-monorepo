import { api } from "@/lib/api-client";
import { AuthResponse, User, APIResponse } from "@/types/user";

interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface UpdateProfileInput {
  name: string;
  avatar_path?: string | null;
}

interface ChangePasswordInput {
  old_password: string;
  new_password: string;
}

export const authService = {
  async register(input: RegisterInput): Promise<APIResponse<AuthResponse>> {
    return api.post<AuthResponse>("/auth/register", input);
  },

  async login(input: LoginInput): Promise<APIResponse<AuthResponse>> {
    return api.post<AuthResponse>("/auth/login", input);
  },

  async getMe(): Promise<APIResponse<User>> {
    return api.get<User>("/auth/me");
  },

  async updateProfile(
    input: UpdateProfileInput
  ): Promise<APIResponse<User>> {
    return api.put<User>("/auth/profile", input);
  },

  async changePassword(
    input: ChangePasswordInput
  ): Promise<APIResponse<null>> {
    return api.put<null>("/auth/password", input);
  },

  async refreshToken(
    refreshToken: string
  ): Promise<APIResponse<{ access_token: string }>> {
    return api.post<{ access_token: string }>("/auth/refresh", {
      refresh_token: refreshToken,
    });
  },

  async logout(refreshToken: string): Promise<APIResponse<null>> {
    return api.post<null>("/auth/logout", {
      refresh_token: refreshToken,
    });
  },
};
