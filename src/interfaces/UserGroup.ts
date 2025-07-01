import { Permission } from './Permission';

export interface UserGroup {
  id: number;
  nome: string;
  permissions: Permission[];
}