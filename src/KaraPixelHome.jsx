import { useEffect, useState } from "react";
import "./KaraPixelHome.css";

const POSES = {
  idle: { x: 47, y: 75 },
  bed: { x: 28, y: 55 },
  desk: { x: 59, y: 52 },
  computer: { x: 51.5, y: 53 },
  sofa: { x: 77, y: 60 },
  toys: { x: 79, y: 84 },
  dresser: { x: 42, y: 47 },
  window: { x: 24, y: 38 },
  table: { x: 63, y: 72 },
  center: { x: 50, y: 73 },
};

const WANDER_ROUTE = [
  { x: 48, y: 82 },
  { x: 33, y: 89 },
  { x: 48, y: 89 },
  { x: 62, y: 86 },
  { x: 84, y: 89 },
  { x: 56, y: 81 },
];

const FOREGROUND_LAYERS = [
  "dresser",
  "desk",
  "desk-left-leg",
  "desk-right-leg",
  "sofa",
  "table",
  "table-left-leg",
  "table-center-leg",
  "table-right-leg",
  "toybox",
];

export default function KaraPixelHome({
  isSleeping,
  stage,
  interactions,
  nextStage,
  progress,
  showBubble,
  bubbleText,
  pose = "idle",
}) {
  const isBedPose = isSleeping || pose === "bed";
  const isComputerPose = !isBedPose && pose === "computer";
  const isToyPose = !isBedPose && pose === "toys";
  const [wanderStep, setWanderStep] = useState(0);
  const [isWalking, setIsWalking] = useState(false);
  const isWandering = pose === "idle" && isWalking;

  useEffect(() => {
    if (pose !== "idle" || isBedPose) return undefined;
    let stopWalking;
    const timer = setInterval(() => {
      setIsWalking(true);
      setWanderStep(step => (step + 1) % WANDER_ROUTE.length);
      clearTimeout(stopWalking);
      stopWalking = setTimeout(() => setIsWalking(false), 950);
    }, 5200);
    return () => {
      clearInterval(timer);
      clearTimeout(stopWalking);
    };
  }, [pose, isBedPose]);

  const currentPose = isBedPose
    ? POSES.bed
    : pose === "idle"
      ? WANDER_ROUTE[wanderStep]
      : POSES[pose] || POSES.idle;
  const roomHint = isBedPose
    ? "睡觉中"
    : isComputerPose
      ? "玩电脑中"
      : isToyPose
        ? "玩玩具中"
        : isWandering
          ? "到处走走中"
          : "自主生活中";

  return (
    <section className={`kara-pixel-card ${isBedPose ? "is-sleeping" : ""}`}>
      <header className="kara-pixel-meta">
        <div>
          <span className="kara-stage-icon">{stage.emoji}</span>
          <span className="kara-stage-name">{stage.name} · {stage.en}</span>
          <span className="kara-stage-desc">{stage.desc}</span>
        </div>
        <span className="kara-room-hint">{roomHint}</span>
      </header>

      <div className="kara-room" aria-label="Kara 的 2.5D 像素房间">
        <img className="kara-room-bg" src="/kara-home/room-v2.png" alt="Kara 的海边像素房间" />
        <div className="kara-room-shade" />

        <div
          className={`kara-sprite-wrap ${isBedPose ? "is-napping" : ""} ${isComputerPose ? "is-computing" : ""} ${isToyPose ? "is-playing" : ""} ${isWandering ? "is-walking" : ""}`}
          style={{ "--kara-x": `${currentPose.x}%`, "--kara-y": `${currentPose.y}%` }}
        >
          {showBubble && bubbleText && <div className="kara-speech" aria-live="polite">{bubbleText}</div>}
          {!isBedPose && <span className="kara-ground-shadow" aria-hidden="true" />}
          <img className="kara-sprite" src="/kara-home/kara-v1.png" alt="Kara" />
          {isBedPose && <span className="kara-sleep-blanket" aria-hidden="true" />}
          {isBedPose && <span className="kara-zzz">Z z z</span>}
          {isComputerPose && <span className="kara-typing" aria-hidden="true">⌨ ···</span>}
          {isToyPose && <span className="kara-toy" aria-hidden="true">🧸</span>}
          {isToyPose && <span className="kara-play-sparkles" aria-hidden="true">✦</span>}
        </div>

        {isComputerPose && (
          <div className="kara-computer-fx" aria-hidden="true">
            <i /><i /><i />
          </div>
        )}

        {!isBedPose && <img className="kara-room-foreground is-bed" src="/kara-home/room-v2.png" alt="" aria-hidden="true" />}
        {FOREGROUND_LAYERS.map(layer => (
          <img key={layer} className={`kara-room-foreground is-${layer}`} src="/kara-home/room-v2.png" alt="" aria-hidden="true" />
        ))}

        <div className="kara-room-badge">🏠 KARA'S ROOM · 2.5D</div>
      </div>

      <div className="kara-progress">
        <div className="kara-progress-labels">
          <span>成长值 {interactions}</span>
          <span>{nextStage ? `下一阶段：${nextStage.name} (${nextStage.threshold})` : "已抵达星海深处"}</span>
        </div>
        <div className="kara-progress-track">
          <div className="kara-progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </section>
  );
}
