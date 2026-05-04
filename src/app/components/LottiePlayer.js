import { useLottie } from "lottie-react";
import animationData from "@/assets/animations/loading.json";

const LottiePlayer = () => {
  const options = {
    animationData,
    loop: true,
    autoplay: true,
    style: { height: 300, width: 300 },
  };

  const { View } = useLottie(options);
  return View;
};

export default LottiePlayer;
