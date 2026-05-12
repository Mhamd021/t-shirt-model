import { useLottie } from "lottie-react";
import animationData from "@/assets/animations/shirt1.json";

const LottiePlayer = ({ className }) => {
  const options = {
    animationData,
    loop: true,
    autoplay: true,
    style: { height: "100%", width: "100%" },
  };

  const { View } = useLottie(options);
  return <div className={className}>{View}</div>;
};

export default LottiePlayer;
