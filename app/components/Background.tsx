import BackgroundStripe from "./backgroundStripe"

const styles = { width: "22%", maxWidth: "90px" }

function Background() {
  return (
    <div className="background" style={{ height: "15px", width: "100%" }}>
      <div
        style={{
          width: "300px",
          margin: "0 auto",
          height: "100%",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-around",
        }}
        className="background__stripes-container"
      >
        <div style={styles}>
          <BackgroundStripe />
        </div>
        <div style={styles}>
          <BackgroundStripe />
        </div>
        <div style={styles}>
          <BackgroundStripe />
        </div>
      </div>
    </div>
  )
}

export default Background
