const PRIMARY_COLOR_DARK = "#00F0C1"
const STRIPE_DARK_COLOR = "#878888"

function BackgroundStripe() {
  const themedColor = STRIPE_DARK_COLOR

  return (
    <div
      className="w-full h-full opacity-25 bg-[rgba(255,255,255,0)]"
      style={{
        backgroundSize: "auto auto",
        backgroundImage: `repeating-linear-gradient(135deg, transparent, transparent 7px, ${themedColor} 7px, ${themedColor} 8px)`,
      }}
    />
  )
}
export default BackgroundStripe
