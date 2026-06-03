import { NextRequest, NextResponse } from "next/server"
import { PROPERTIES } from "@/lib/data"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const originLat = searchParams.get("originLat")
  const originLng = searchParams.get("originLng")

  if (!originLat || !originLng) {
    return NextResponse.json({ error: "Missing origin coordinates" }, { status: 400 })
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "Maps API not configured" }, { status: 503 })
  }

  const destinations = PROPERTIES.map((p) => `${p.lat},${p.lng}`).join("|")
  const url =
    `https://maps.googleapis.com/maps/api/distancematrix/json` +
    `?origins=${originLat},${originLng}` +
    `&destinations=${encodeURIComponent(destinations)}` +
    `&mode=driving` +
    `&key=${apiKey}`

  let apiData: {
    status: string
    rows?: { elements: { status: string; distance: { text: string; value: number }; duration: { text: string; value: number } }[] }[]
  }

  try {
    const res = await fetch(url, { next: { revalidate: 0 } })
    if (!res.ok) {
      return NextResponse.json({ error: "Upstream API error" }, { status: 502 })
    }
    apiData = await res.json()
  } catch {
    return NextResponse.json({ error: "Failed to reach Maps API" }, { status: 502 })
  }

  if (apiData.status !== "OK" || !apiData.rows?.[0]?.elements) {
    return NextResponse.json({ error: "Invalid API response", upstream: apiData.status }, { status: 502 })
  }

  const elements = apiData.rows[0].elements

  let nearestIdx = -1
  let minValue = Infinity

  elements.forEach((el, i) => {
    if (el.status === "OK" && el.distance.value < minValue) {
      minValue = el.distance.value
      nearestIdx = i
    }
  })

  if (nearestIdx === -1) {
    return NextResponse.json({ error: "No valid routes found" }, { status: 404 })
  }

  const nearest = elements[nearestIdx]

  return NextResponse.json({
    propertyId: PROPERTIES[nearestIdx].id,
    distanceText: nearest.distance.text,
    distanceValue: nearest.distance.value,
    durationText: nearest.duration.text,
  })
}
