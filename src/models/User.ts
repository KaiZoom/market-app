export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN',
}

export interface UserAddress {
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface UserPaymentCard {
  number: string;
  name: string;
  expMonth: string;
  expYear: string;
  cpf: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  marketId?: string; // Só para admins
  createdAt: Date;
  // Dados pessoais adicionais
  cpf?: string;
  phone?: string;
  // Endereço padrão
  address?: UserAddress;
  // Cartão de pagamento padrão
  paymentCard?: UserPaymentCard;
}
