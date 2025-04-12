import { PrismaClient } from "@prisma/client"

const prismaClientInstance = new PrismaClient()

export const db = prismaClientInstance

const _getBooking = () => prismaClientInstance.booking.findFirstOrThrow({include: {user: true}})
export type Booking = Awaited<ReturnType<typeof _getBooking>>

const _getUser = () => prismaClientInstance.user.findFirstOrThrow()
export type User = Awaited<ReturnType<typeof _getUser>>
