const PRIMARY_COLOR_DARK = "#00F0C1"
const STRIPE_DARK_COLOR = "#878888"

function BackgroundStripe() {
  const themedColor = STRIPE_DARK_COLOR

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        opacity: 0.25,
        backgroundSize: "auto auto",
        backgroundColor: "rgba(255, 255, 255, 0)",
        backgroundImage: `repeating-linear-gradient(135deg, transparent, transparent 7px, ${themedColor} 7px, ${themedColor} 8px )`,
      }}
    />
  )
}
export default BackgroundStripe
