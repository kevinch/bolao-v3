import BackgroundStripe from "./backgroundStripe"

function BackgroundStripes() {
  return (
    <div className="background h-[15px] w-full">
      <div className="background__stripes-container flex flex-row justify-around h-full w-[300px] mx-auto">
        <div className="w-[22%] max-w-[90px]">
          <BackgroundStripe />
        </div>
        <div className="w-[22%] max-w-[90px]">
          <BackgroundStripe />
        </div>
        <div className="w-[22%] max-w-[90px]">
          <BackgroundStripe />
        </div>
      </div>
    </div>
  )
}

export default BackgroundStripes
