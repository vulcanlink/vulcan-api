import { PrismaClient } from '@prisma/client'//'./generated/client'
import { PubSub } from 'apollo-server'

const prisma = new PrismaClient();
const pubsub = new PubSub()
//@ts-ignore
pubsub.ee.setMaxListeners(100); //Max 100

export interface Context {
    prisma: PrismaClient
    pubsub: PubSub
}

export function createContext(): Context {
    return { prisma, pubsub }
}
