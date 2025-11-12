import { Mosaic } from "react-loading-indicators";

function Loading() {
  return (
    <div className="flex items-center justify-center h-screen bg-black">
      <Mosaic
        color="#32cd32"
        size="large"
        text="Loading..."
        textColor="white"
      />
    </div>
  );
}

export default Loading;
