import { db } from './db/db'

export interface User {
  id: string
  name: string
  email: string
  isAdmin: boolean
}

export async function getUserById(id: string): Promise<User | null> {
  return db.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      isAdmin: true,
    },
  })
}

export async function getUserByEmail(email: string): Promise<User | null> {
  return db.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      isAdmin: true,
    },
  })
}
