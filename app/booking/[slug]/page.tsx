import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { PROPERTIES, ROOMS } from "@/lib/data"
import { BookingFlowClient } from "@/components/BookingFlowClient"

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ room?: string; checkIn?: string; checkOut?: string; rooms?: string; adults?: string }>
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params
  const { room: roomId = "" } = await searchParams
  const property = PROPERTIES.find(p => p.id === slug)
  const room = ROOMS.find(r => r.id === roomId)
  if (!property) return { title: "Booking — Astra Hotels" }
  return {
    title: `Your Details — Booking at ${property.name}, ${property.location} — Astra Hotels`,
    description: `Complete your booking${room ? ` for ${room.name}` : ""} at ${property.name} in ${property.location}.`,
  }
}

export default async function BookingPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { room: roomId = "", checkIn, checkOut, rooms, adults } = await searchParams

  const property = PROPERTIES.find(p => p.id === slug)
  const room = ROOMS.find(r => r.id === roomId)

  if (!property || !room) notFound()

  return (
    <BookingFlowClient
      propertyId={slug}
      roomId={roomId}
      initialCheckIn={checkIn}
      initialCheckOut={checkOut}
      initialRooms={rooms ? parseInt(rooms, 10) : undefined}
      initialAdults={adults ? parseInt(adults, 10) : undefined}
    />
  )
}
