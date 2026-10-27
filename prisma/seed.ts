import 'dotenv/config';
import { prisma } from '../src/lib/prisma';
import { synthesizeProjectFromPrompt } from '../src/lib/studio-engine';

async function main() {
  console.log('Seeding public Atech Community Hub showcase builds (zero dummy/demo user accounts)...');

  const builds = [
    {
      id: 'e86fcee36ee5478b8fba279670e6f73c',
      projectId: '6655ff44-0b13-4126-8590-ad8e78bad80d',
      authorHandle: 'copenhagen-lab',
      title: 'Duet',
      summary: 'Connected pair of push-to-talk music players with 4x 3x3 LED grids, hand-distance volume control, and I2S melody playback.',
      description:
        'Two identical units sit in different places, and each can send a song to the other. Hold the button to speak a song title into the MEMS microphone while the 4 LED grids light up as a live green level meter. Wave your hand 50–300 mm above the Distance Sensor while playing to adjust speaker volume smoothly.',
      category: 'Gadgets',
      score: 14,
      buildCount: 6,
      featured: true,
      prompt: `Build "Duet": one unit of a pair of connected music players. Two identical units sit in different places, and each can send a song to the other.
MODULES (one Atech ESP32-S3 motherboard, WiFi mode, 2.4 GHz):
- 4x Light Grid (3x3 each): top row, 2 on each side of the display
- Color Display (2 ports): top centre, shows status, song title and artist
- Speaker (2 ports): bottom left, plays the received song as a melody
- Distance Sensor: bottom row, hand-distance volume control
- Button: bottom row, push-to-talk
- Microphone (2 ports): bottom right, picks up voice level while Button is held`,
    },
    {
      id: 'be08f90f45704a7d939ff932b5e766b0',
      projectId: '7721aa10-9c41-4812-8110-bc9123a0192b',
      authorHandle: 'nordic-maker',
      title: 'Hope — Voice Note Capsule',
      summary: 'Tactile desk voice-recording device with instant LED waveform feedback, rotary playback scrubber, and speaker output.',
      description:
        'A screen-free or minimal-distraction voice memo capsule built on the 14-port motherboard. Press and hold to capture a thought, turn the rotary knob to scrub through recent voice notes, and replay over the digital I2S speaker.',
      category: 'SmartHome',
      score: 9,
      buildCount: 4,
      featured: true,
      prompt:
        'Build Hope: a tactile voice-recording device with Microphone on ports 10-11, Speaker on ports 13-14, Button on port 7 for hold-to-record, Rotary Knob on port 5 to cycle saved voice notes, Color Display on ports 3-4, and 2x Light Grids on ports 1 and 2.',
    },
    {
      id: '98b74c28a1cb4585b5445cd8fdcb6f2f',
      projectId: '4147190b-6fe7-4410-9496-0517b259f2d4',
      authorHandle: 'biolab-dtu',
      title: 'Square Wave Voltammetry Bluetooth Bio-Sensor',
      summary: 'Electrochemical square-wave voltammetry acquisition fixture with real-time current-potential curve display and wireless telemetry.',
      description:
        'Connects an electrochemical bio-sensor electrode cell to the ESP32-S3 motherboard to sweep square-wave excitation potentials, sample current response, display live peak voltammograms on the TFT screen, and stream JSON packets over WiFi/BLE.',
      category: 'Gadgets',
      score: 7,
      buildCount: 3,
      featured: false,
      prompt:
        'I have connected a bio sensor to main cpu board. Build me hardware to perform square wave voltammetry with Color Display, Button trigger, Temperature compensation sensor, and LED Grid status indicator, then transmit the data via wireless gateway.',
    },
    {
      id: 'arcade-pocket-console-showcase',
      projectId: '8890cc21-3d12-4901-9442-ef1029384756',
      authorHandle: 'atech-team',
      title: 'Pocket Brick-Breaker & Snake Console',
      summary: 'Classic handheld arcade cabinet powered by the Rotary Knob paddle controller, tactile fire Button, IPS Screen, and I2S chiptune Speaker.',
      description:
        'The flagship showcase from the Studio home stage. Turn the Rotary Knob for zero-latency paddle control, press the Button to launch the ball or switch to Snake, and enjoy polyphonic retro sound effects.',
      category: 'Game',
      score: 22,
      buildCount: 15,
      featured: true,
      prompt:
        'Make me a game console with Color Display on ports 3-4, Rotary Knob on port 5, Button on port 1, Speaker on ports 9-10, and 3x3 Light Grid on port 2.',
    },
    {
      id: 'clawd-robot-arm-showcase',
      projectId: '9912dd34-5e23-4112-8553-fa2139485867',
      authorHandle: 'robotics-cph',
      title: 'Clawd — Waypoint Servo Robot Arm',
      summary: '3-DOF desktop robotic arm with rotary knob teach-pendant jogging, waypoint recording, and WiFi action control.',
      description:
        'Jog each servo joint with the Rotary Knob, click the Button to store pick-and-place keyframes, and trigger automated sorting routines from the Studio WiFi gateway.',
      category: 'Robotics',
      score: 18,
      buildCount: 11,
      featured: true,
      prompt:
        'Build Clawd: a 3-DOF robot arm controller with DC Motor / Servo actuators, Rotary Knob on port 5, Button on port 7, Distance Sensor on port 6, Color Display on ports 3-4, and Light Grid on port 9.',
    },
  ];

  for (const item of builds) {
    const bundle = synthesizeProjectFromPrompt({
      prompt: item.prompt,
      name: item.title,
      boardId: '14port_board',
      sourcingMode: 'atech_preferred',
      version: 11,
    });

    await prisma.project.upsert({
      where: { id: item.projectId },
      update: {
        name: item.title,
        title: item.title,
        prompt: item.prompt,
        featured: item.featured,
        briefJson: JSON.stringify(bundle.brief),
        placementJson: JSON.stringify(bundle.placement),
        electronicsArtifactsJson: JSON.stringify(bundle.electronicsArtifacts),
        firmwareArtifactsJson: JSON.stringify(bundle.firmwareArtifacts),
        wifiConfigJson: JSON.stringify(bundle.wifiConfig),
        eventsJson: JSON.stringify(bundle.events),
      },
      create: {
        id: item.projectId,
        name: item.title,
        title: item.title,
        prompt: item.prompt,
        ownerUserId: null,
        ownerEmail: null,
        boardId: bundle.boardId,
        sourcingMode: bundle.sourcingMode,
        currentPhase: 'DONE',
        writeSeq: 11,
        starred: false,
        featured: item.featured,
        briefJson: JSON.stringify(bundle.brief),
        placementJson: JSON.stringify(bundle.placement),
        electronicsArtifactsJson: JSON.stringify(bundle.electronicsArtifacts),
        firmwareArtifactsJson: JSON.stringify(bundle.firmwareArtifacts),
        wifiConfigJson: JSON.stringify(bundle.wifiConfig),
        eventsJson: JSON.stringify(bundle.events),
      },
    });

    await prisma.communityPost.upsert({
      where: { id: item.id },
      update: {
        projectId: item.projectId,
        authorHandle: item.authorHandle,
        title: item.title,
        summary: item.summary,
        description: item.description,
        category: item.category,
        modulesJson: JSON.stringify(bundle.placement.modules),
        score: item.score,
        buildCount: item.buildCount,
        featured: item.featured,
      },
      create: {
        id: item.id,
        projectId: item.projectId,
        authorUserId: null,
        authorHandle: item.authorHandle,
        title: item.title,
        summary: item.summary,
        description: item.description,
        category: item.category,
        modulesJson: JSON.stringify(bundle.placement.modules),
        score: item.score,
        buildCount: item.buildCount,
        featured: item.featured,
      },
    });
  }

  const userCount = await prisma.user.count();
  console.log(`Seed complete. Public community builds: ${builds.length}. User accounts in DB: ${userCount} (strictly 0 dummy users).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
