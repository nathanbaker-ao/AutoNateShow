import "./index.css";
import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import { ComedySkit, AutoNateScene } from "./compositions";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Original demo composition */}
      <Composition
        id="MyComp"
        component={MyComposition}
        durationInFrames={60}
        fps={30}
        width={1280}
        height={720}
      />

      {/* Comedy Skit composition */}
      <Composition
        id="ComedySkit"
        component={ComedySkit}
        durationInFrames={450} // 15 seconds at 30fps
        fps={30}
        width={1920}
        height={1080}
      />

      {/* AutoNate Test Scene */}
      <Composition
        id="AutoNateScene"
        component={AutoNateScene}
        durationInFrames={300} // 10 seconds at 30fps
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
