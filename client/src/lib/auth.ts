import React from 'react';

interface Teacher {
  id: string;
  teacherId: string;
}

interface AuthState {
  isAuthenticated: boolean;
  teacher: Teacher | null;
}

class AuthService {
  private state: AuthState = {
    isAuthenticated: false,
    teacher: null,
  };

  private listeners: ((state: AuthState) => void)[] = [];

  subscribe(listener: (state: AuthState) => void) {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notify() {
    this.listeners.forEach(listener => listener(this.state));
  }

  getState(): AuthState {
    return { ...this.state };
  }

  async login(teacherId: string, password: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ teacherId, password }),
      });

      if (response.ok) {
        const data = await response.json();
        this.state = {
          isAuthenticated: true,
          teacher: data.teacher,
        };
        this.notify();
        return { success: true, message: data.message };
      } else {
        const error = await response.json();
        return { success: false, message: error.message };
      }
    } catch (error) {
      return { success: false, message: 'Erreur de connexion' };
    }
  }

  logout() {
    this.state = {
      isAuthenticated: false,
      teacher: null,
    };
    this.notify();
  }
}

export const authService = new AuthService();

export const useAuth = () => {
  const [state, setState] = React.useState(authService.getState());

  React.useEffect(() => {
    return authService.subscribe(setState);
  }, []);

  return state;
};
