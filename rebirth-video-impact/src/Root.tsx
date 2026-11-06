import {Composition} from 'remotion';
import {Rebirth, FPS, TOTAL} from './Rebirth';

export const RemotionRoot: React.FC = () => (
  <Composition id="Rebirth" component={Rebirth} durationInFrames={Math.round(TOTAL * FPS)} fps={FPS} width={1920} height={1080} />
);
