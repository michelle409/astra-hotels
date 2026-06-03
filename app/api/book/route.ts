import { NextRequest, NextResponse } from "next/server"
import { generateBookingRef } from "@/lib/utils"
import { PROPERTIES, ROOMS } from "@/lib/data"

interface BookingPayload {
  propertyId: string
  roomType: string
  checkIn: string
  checkOut: string
  guests: number
  name: string
  phone: string
  email: string
  specialRequests?: string
  totalPrice?: number
}

export async function POST(request: NextRequest) {
  let body: BookingPayload

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 })
  }

  const { propertyId, roomType, checkIn, checkOut, guests, name, phone, email } = body

  // Server-side validation
  if (!propertyId || !PROPERTIES.find((p) => p.id === propertyId)) {
    return NextResponse.json({ success: false, error: "Invalid property" }, { status: 400 })
  }

  if (!roomType || !ROOMS.find((r) => r.id === roomType)) {
    return NextResponse.json({ success: false, error: "Invalid room type" }, { status: 400 })
  }

  if (!checkIn || !checkOut) {
    return NextResponse.json({ success: false, error: "Check-in and check-out dates are required" }, { status: 400 })
  }

  const checkInDate = new Date(checkIn)
  const checkOutDate = new Date(checkOut)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (checkInDate < today) {
    return NextResponse.json({ success: false, error: "Check-in date cannot be in the past" }, { status: 400 })
  }

  if (checkOutDate <= checkInDate) {
    return NextResponse.json({ success: false, error: "Check-out must be after check-in" }, { status: 400 })
  }

  if (!guests || guests < 1 || guests > 8) {
    return NextResponse.json({ success: false, error: "Guests must be between 1 and 8" }, { status: 400 })
  }

  const room = ROOMS.find((r) => r.id === roomType)!
  if (guests > room.maxGuests) {
    return NextResponse.json(
      { success: false, error: `This room type accommodates a maximum of ${room.maxGuests} guests` },
      { status: 400 }
    )
  }

  if (!name || name.trim().length < 2) {
    return NextResponse.json({ success: false, error: "Name must be at least 2 characters" }, { status: 400 })
  }

  const phoneRegex = /^[6-9]\d{9}$/
  if (!phone || !phoneRegex.test(phone.replace(/\s+/g, ""))) {
    return NextResponse.json({ success: false, error: "Please enter a valid 10-digit Indian mobile number" }, { status: 400 })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email || !emailRegex.test(email)) {
    return NextResponse.json({ success: false, error: "Please enter a valid email address" }, { status: 400 })
  }

  // Calculate price
  const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
  const guestSurcharge = guests > 2 ? (guests - 2) * 500 : 0
  const roomPrice = room.basePrice + guestSurcharge
  const subtotal = roomPrice * nights
  const taxes = Math.round(subtotal * 0.12)
  const total = subtotal + taxes

  const bookingRef = generateBookingRef()

  return NextResponse.json({
    success: true,
    bookingRef,
    summary: {
      bookingRef,
      propertyName: PROPERTIES.find((p) => p.id === propertyId)?.name,
      propertyLocation: PROPERTIES.find((p) => p.id === propertyId)?.location,
      roomName: room.name,
      checkIn,
      checkOut,
      nights,
      guests,
      name,
      email,
      phone,
      roomPrice,
      subtotal,
      taxes,
      total,
    },
  })
}
