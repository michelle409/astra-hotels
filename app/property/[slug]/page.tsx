import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { PROPERTIES } from "@/lib/data"
import { PropertyDetailClient } from "@/components/PropertyDetailClient"

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const property = PROPERTIES.find((p) => p.id === slug)
  if (!property) return { title: "Property Not Found" }
  return {
    title: `${property.name}, ${property.location}`,
    description: property.description,
  }
}

export default async function PropertyPage({ params }: Props) {
  const { slug } = await params
  const property = PROPERTIES.find((p) => p.id === slug)
  if (!property) notFound()
  return <PropertyDetailClient property={property} />
}
