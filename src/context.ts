import { PrismaClient } from '@prisma/client'//'./generated/client'
import { PubSub } from 'apollo-server'


const prisma = new PrismaClient();
const pubsub = new PubSub()

export interface Context {
  prisma: PrismaClient
  pubsub: PubSub
}

export function createContext(): Context {
  return { prisma, pubsub }
}
