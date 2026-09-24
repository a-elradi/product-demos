import "./index.css";
import { Composition } from "remotion";
import { FPS } from "./theme";
import { CS } from "./videos/shared";
import { WhatsAppVideo } from "./videos/WhatsApp";
import { InstagramVideo } from "./videos/Instagram";
import { EmailVideo } from "./videos/Email";
import { W, WazirVideo } from "./wazir/WazirVideo";

const base = { fps: FPS, width: 1920, height: 1080 };

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="WhatsApp" component={WhatsAppVideo} durationInFrames={CS.total} {...base} />
      <Composition id="Instagram" component={InstagramVideo} durationInFrames={CS.total} {...base} />
      <Composition id="Email" component={EmailVideo} durationInFrames={CS.total} {...base} />
      <Composition id="Wazir" component={WazirVideo} durationInFrames={W.total} {...base} />
    </>
  );
};
