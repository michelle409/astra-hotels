import { MARATHAHALLI_ATTRACTIONS, getGenericAttractions } from "@/lib/data"

type Attraction = {
  distance: string
  name: string
  type: string
}

const TYPE_COLORS: Record<string, string> = {
  Medical: "#c084c8",
  Shopping: "#c9a84c",
  Business: "#7b3fa0",
  Lifestyle: "#5a9a8a",
  Heritage: "#a07050",
  Nature: "#5a8a5a",
  Transport: "#6a8aa0",
}

type Props = {
  propertyId: string
}

export function NearbyAttractions({ propertyId }: Props) {
  const attractions: Attraction[] =
    propertyId === "marathahalli"
      ? MARATHAHALLI_ATTRACTIONS
      : getGenericAttractions(propertyId)

  return (
    <section
      aria-labelledby="nearby-heading"
      className="py-20 px-6"
      style={{ backgroundColor: "#1a0a24" }}
    >
      <div className="max-w-5xl mx-auto">
        <h2
          id="nearby-heading"
          style={{
            fontFamily: "var(--font-cormorant)",
            fontWeight: 300,
            fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)",
            color: "white",
            marginBottom: "2.5rem",
          }}
        >
          What&apos;s Nearby
        </h2>

        {/* Horizontal scroll container */}
        <div
          className="flex gap-4 overflow-x-auto pb-4"
          style={{ scrollbarWidth: "thin", scrollbarColor: "#561d70 #2d1b3d" }}
          role="list"
          aria-label="Nearby attractions and landmarks"
        >
          {attractions.map((a) => (
            <article
              key={a.name}
              role="listitem"
              className="flex-shrink-0 rounded-xl p-5 transition-all duration-300 hover:scale-[1.03] hover:brightness-125"
              style={{
                width: "200px",
                backgroundColor: "rgba(86,29,112,0.15)",
                border: "1px solid rgba(86,29,112,0.4)",
              }}
            >
              {/* Distance badge */}
              <span
                className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium mb-3"
                style={{
                  backgroundColor: "rgba(201,168,76,0.15)",
                  color: "#c9a84c",
                  fontFamily: "var(--font-inter)",
                  border: "1px solid rgba(201,168,76,0.3)",
                }}
                aria-label={`${a.distance} away`}
              >
                {a.distance}
              </span>

              <h3
                style={{
                  fontFamily: "var(--font-cormorant)",
                  fontWeight: 500,
                  fontSize: "1.1rem",
                  color: "white",
                  marginBottom: "0.5rem",
                  lineHeight: 1.3,
                }}
              >
                {a.name}
              </h3>

              {/* Type badge */}
              <span
                className="inline-flex items-center px-2 py-0.5 rounded text-xs"
                style={{
                  backgroundColor: `${TYPE_COLORS[a.type] || "#7b3fa0"}22`,
                  color: TYPE_COLORS[a.type] || "#7b3fa0",
                  fontFamily: "var(--font-inter)",
                  border: `1px solid ${TYPE_COLORS[a.type] || "#7b3fa0"}44`,
                }}
              >
                {a.type}
              </span>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
