import { User } from '../models';
import { db } from './database.service';
import { UserRole } from '../models/User';

export class AuthService {
  private currentUser: User | null = null;

  async login(email: string, password: string): Promise<User> {
    const user = db.getUserByEmail(email);

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    if (user.password !== password) {
      throw new Error('Senha incorreta');
    }

    this.currentUser = user;
    return user;
  }

  async register(name: string, email: string, password: string): Promise<User> {
    // Verificar se email já existe
    const existingUser = db.getUserByEmail(email);
    if (existingUser) {
      throw new Error('Este e-mail já está cadastrado');
    }

    // Validações básicas
    if (!name.trim()) {
      throw new Error('Nome é obrigatório');
    }

    if (!email.trim() || !email.includes('@')) {
      throw new Error('E-mail inválido');
    }

    if (password.length < 6) {
      throw new Error('A senha deve ter pelo menos 6 caracteres');
    }

    // Criar novo usuário
    const newUser: User = {
      id: Date.now().toString(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: UserRole.CUSTOMER,
      createdAt: new Date(),
    };

    const createdUser = db.createUser(newUser);
    this.currentUser = createdUser;
    return createdUser;
  }

  logout(): void {
    this.currentUser = null;
  }

  setCurrentUser(user: User | null): void {
    this.currentUser = user;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  isAdmin(): boolean {
    return this.currentUser?.role === 'ADMIN';
  }

  isCustomer(): boolean {
    return this.currentUser?.role === 'CUSTOMER';
  }
}

export const authService = new AuthService();
