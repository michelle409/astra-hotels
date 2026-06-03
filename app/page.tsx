import { Navigation } from "@/components/Navigation"
import { HeroSection } from "@/components/HeroSection"
import { GpsFinder } from "@/components/GpsFinder"
import { PropertiesGrid } from "@/components/PropertiesGrid"
import { BookingEngine } from "@/components/BookingEngine"
import { RoomsShowcase } from "@/components/RoomsShowcase"
import { VideoAmbiance } from "@/components/VideoAmbiance"
import { AmenitiesSection } from "@/components/AmenitiesSection"
import { Testimonials } from "@/components/Testimonials"
import { Footer } from "@/components/Footer"

export default function HomePage() {
  return (
    <>
      <Navigation />
      <main id="main-content" tabIndex={-1}>
        <HeroSection />
        <GpsFinder />
        <PropertiesGrid />
        <BookingEngine />
        <RoomsShowcase />
        <VideoAmbiance />
        <AmenitiesSection variant="dark" />
        <Testimonials />
      </main>
      <Footer />
    </>
  )
}
