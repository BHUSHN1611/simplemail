import { useEffect, useRef, useState } from 'react';
import { Mail, Activity, Globe } from 'lucide-react';

export default function NetworkFlowVisualization() {
  const canvasRef = useRef(null);
  const [mailCount, setMailCount] = useState(0);
  const [activeNodes, setActiveNodes] = useState(4);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width = 1400;
    const height = canvas.height = 500;

    // Define nodes (3D globes) with positions
    const globes = [
      { x: 200, y: height / 2, radius: 50, label: 'NODE 1', rotation: 0, points: [], connections: [] },
      { x: 500, y: height / 2 - 80, radius: 70, label: 'NODE 2', rotation: Math.PI / 3, points: [], connections: [] },
      { x: 800, y: height / 2, radius: 90, label: 'NODE 3', rotation: Math.PI / 2, points: [], connections: [] },
      { x: 1100, y: height / 2 - 50, radius: 65, label: 'NODE 4', rotation: Math.PI, points: [], connections: [] }
    ];

    // Generate binary points for each globe
    globes.forEach(globe => {
      for (let lat = -Math.PI / 2; lat <= Math.PI / 2; lat += Math.PI / 16) {
        for (let lon = 0; lon < 2 * Math.PI; lon += Math.PI / 16) {
          globe.points.push({
            lat,
            lon,
            value: Math.random() > 0.5 ? '1' : '0',
            brightness: 0.5 + Math.random() * 0.5
          });
        }
      }

      // Generate internal connections for each globe
      for (let i = 0; i < 20; i++) {
        const a = Math.floor(Math.random() * globe.points.length);
        const b = Math.floor(Math.random() * globe.points.length);
        if (a !== b) {
          globe.connections.push({
            a,
            b,
            offset: Math.random(),
            speed: 0.3 + Math.random() * 0.5
          });
        }
      }
    });

    // Define connection paths between globes (curved lines)
    const paths = [
      // From globe 0
      { from: 0, to: 1, controlY: -150 },
      { from: 0, to: 2, controlY: -100 },
      { from: 0, to: 3, controlY: -180 },
      
      // From globe 1
      { from: 1, to: 2, controlY: -80 },
      { from: 1, to: 3, controlY: -120 },
      
      // From globe 2
      { from: 2, to: 1, controlY: 120 },
      { from: 2, to: 3, controlY: -60 },
      
      // From globe 3
      { from: 3, to: 2, controlY: 150 },
      { from: 3, to: 0, controlY: 200 }
    ];

    // Mail packets
    const mailPackets = [];

    function createMailPacket() {
      const path = paths[Math.floor(Math.random() * paths.length)];
      mailPackets.push({
        path: path,
        progress: 0,
        speed: 0.0008 + Math.random() * 0.0004, // Much slower speed
        size: 5 + Math.random() * 2,
        hue: 270 + Math.random() * 30
      });
      setMailCount(prev => prev + 1);
    }

    // Create initial packets
    for (let i = 0; i < 8; i++) {
      createMailPacket();
    }

    let animationId;

    function project(lat, lon, rotation, radius, centerX, centerY) {
      const x = radius * Math.cos(lat) * Math.sin(lon + rotation);
      const y = radius * Math.sin(lat);
      const z = radius * Math.cos(lat) * Math.cos(lon + rotation);
      const scale = 400 / (400 + z);
      return { 
        x: centerX + x * scale, 
        y: centerY - y * scale, 
        z,
        scale 
      };
    }

    function drawGlobe(globe, timestamp) {
      // Draw internal connections
      globe.connections.forEach(conn => {
        const p1 = project(globe.points[conn.a].lat, globe.points[conn.a].lon, globe.rotation, globe.radius, globe.x, globe.y);
        const p2 = project(globe.points[conn.b].lat, globe.points[conn.b].lon, globe.rotation, globe.radius, globe.x, globe.y);
        
        if (p1.z > -globe.radius / 2 && p2.z > -globe.radius / 2) {
          const depth = (p1.z + p2.z) / 2;
          const opacity = Math.max(0, (depth + globe.radius) / (globe.radius * 2));
          
          const gradient = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
          const t = ((timestamp / 1000) * conn.speed + conn.offset) % 1;
          
          gradient.addColorStop(0, `rgba(150,100,255,${0.1 * opacity})`);
          gradient.addColorStop(Math.max(0, t - 0.1), `rgba(150,100,255,${0.1 * opacity})`);
          gradient.addColorStop(t, `rgba(200,150,255,${0.7 * opacity})`);
          gradient.addColorStop(Math.min(1, t + 0.1), `rgba(150,100,255,${0.1 * opacity})`);
          
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      });

      // Draw glow around globe
      const glowGradient = ctx.createRadialGradient(
        globe.x, globe.y, globe.radius * 0.5,
        globe.x, globe.y, globe.radius * 1.6
      );
      glowGradient.addColorStop(0, 'rgba(150, 100, 255, 0.25)');
      glowGradient.addColorStop(1, 'rgba(150, 100, 255, 0)');
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(globe.x, globe.y, globe.radius * 1.6, 0, Math.PI * 2);
      ctx.fill();

      // Draw binary points
      globe.points.forEach(point => {
        const { x, y, z, scale } = project(point.lat, point.lon, globe.rotation, globe.radius, globe.x, globe.y);
        
        if (z > -globe.radius / 2) {
          const depth = (z + globe.radius) / (globe.radius * 2);
          const alpha = point.brightness * depth;
          
          ctx.fillStyle = `rgba(200,160,255,${alpha * 0.8})`;
          ctx.font = `${7 * scale}px monospace`;
          ctx.fillText(point.value, x - 3, y + 3);
        }
      });

      // Draw label
      ctx.fillStyle = 'rgba(200, 160, 255, 0.7)';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(globe.label, globe.x, globe.y + globe.radius + 25);

      // Update rotation
      globe.rotation += 0.002;
    }

    function drawPath(path, hasPacket, timestamp) {
      const fromGlobe = globes[path.from];
      const toGlobe = globes[path.to];
      
      const midX = (fromGlobe.x + toGlobe.x) / 2;
      const midY = (fromGlobe.y + toGlobe.y) / 2 + path.controlY;

      // Draw curved path
      ctx.beginPath();
      ctx.moveTo(fromGlobe.x, fromGlobe.y);
      ctx.quadraticCurveTo(midX, midY, toGlobe.x, toGlobe.y);
      
      // Animated gradient for active connections
      if (hasPacket) {
        const gradient = ctx.createLinearGradient(fromGlobe.x, fromGlobe.y, toGlobe.x, toGlobe.y);
        const t = (timestamp / 2000) % 1;
        gradient.addColorStop(0, 'rgba(150, 100, 255, 0.3)');
        gradient.addColorStop(t, 'rgba(200, 150, 255, 0.8)');
        gradient.addColorStop(1, 'rgba(150, 100, 255, 0.3)');
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
      } else {
        ctx.strokeStyle = 'rgba(150, 100, 255, 0.15)';
        ctx.lineWidth = 1.5;
      }
      
      ctx.stroke();

      // Draw arrow at the end
      if (hasPacket) {
        const angle = Math.atan2(toGlobe.y - midY, toGlobe.x - midX);
        const arrowX = toGlobe.x - Math.cos(angle) * (toGlobe.radius + 20);
        const arrowY = toGlobe.y - Math.sin(angle) * (toGlobe.radius + 20);
        
        ctx.save();
        ctx.translate(arrowX, arrowY);
        ctx.rotate(angle);
        
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-12, -6);
        ctx.lineTo(-12, 6);
        ctx.closePath();
        ctx.fillStyle = 'rgba(200, 150, 255, 0.8)';
        ctx.fill();
        ctx.restore();
      }
    }

    function getPointOnCurve(path, t) {
      const fromGlobe = globes[path.from];
      const toGlobe = globes[path.to];
      const midX = (fromGlobe.x + toGlobe.x) / 2;
      const midY = (fromGlobe.y + toGlobe.y) / 2 + path.controlY;

      // Quadratic Bezier curve formula
      const x = Math.pow(1 - t, 2) * fromGlobe.x + 
                2 * (1 - t) * t * midX + 
                Math.pow(t, 2) * toGlobe.x;
      const y = Math.pow(1 - t, 2) * fromGlobe.y + 
                2 * (1 - t) * t * midY + 
                Math.pow(t, 2) * toGlobe.y;
      
      return { x, y };
    }

    function draw(timestamp) {
      // Clear canvas with transparency
      ctx.clearRect(0, 0, width, height);

      // Track which paths have packets
      const activePaths = new Set();
      mailPackets.forEach(packet => {
        const key = `${packet.path.from}-${packet.path.to}`;
        activePaths.add(key);
      });

      // Draw all paths
      paths.forEach(path => {
        const key = `${path.from}-${path.to}`;
        drawPath(path, activePaths.has(key), timestamp);
      });

      // Draw mail packets
      mailPackets.forEach((packet, index) => {
        packet.progress += packet.speed;

        if (packet.progress >= 1) {
          mailPackets.splice(index, 1);
          createMailPacket();
          return;
        }

        const pos = getPointOnCurve(packet.path, packet.progress);

        // Larger glow effect for mail
        const glowGradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, 25);
        glowGradient.addColorStop(0, `hsla(${packet.hue}, 80%, 70%, 0.8)`);
        glowGradient.addColorStop(1, `hsla(${packet.hue}, 80%, 70%, 0)`);
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 25, 0, Math.PI * 2);
        ctx.fill();

        // White background circle for mail icon
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.shadowBlur = 15;
        ctx.shadowColor = `hsla(${packet.hue}, 80%, 70%, 0.9)`;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, packet.size + 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw mail icon using lucide-react style envelope
        ctx.save();
        ctx.translate(pos.x, pos.y);
        
        // Mail envelope outline
        const mailSize = packet.size - 1;
        ctx.strokeStyle = `hsla(${packet.hue}, 90%, 50%, 1)`;
        ctx.fillStyle = `hsla(${packet.hue}, 90%, 50%, 0.3)`;
        ctx.lineWidth = 1.5;
        
        // Envelope body
        ctx.beginPath();
        ctx.rect(-mailSize, -mailSize * 0.7, mailSize * 2, mailSize * 1.4);
        ctx.fill();
        ctx.stroke();
        
        // Envelope flap
        ctx.beginPath();
        ctx.moveTo(-mailSize, -mailSize * 0.7);
        ctx.lineTo(0, mailSize * 0.2);
        ctx.lineTo(mailSize, -mailSize * 0.7);
        ctx.stroke();
        
        ctx.restore();
      });

      // Draw globes on top
      globes.forEach(globe => drawGlobe(globe, timestamp));

      animationId = requestAnimationFrame(draw);
    }

    draw(0);

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className=" z-0 flex flex-col justify-center items-center min-h-screen  overflow-hidden relative">
      {/* Background particles */}
      <div className="absolute inset-0 opacity-10 z-0">
        {[...Array(60)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full animate-pulse z-0"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Title */}
      <div className="absolute top-8 text-center z-0">
      </div>

      {/* Stats Panel */}
      <div className="absolute top-8 right-8 space-y-3 z-0">
        <div className=" backdrop-blur-md  rounded-lg px-4 py-3">
        
        </div>
        
  

      </div>

      {/* Canvas */}
      <div className=" rounded-2xl overflow-hidden ">
        <canvas
          ref={canvasRef}
          className="w-full h-auto"
          width={1400}
          height={500}
        />
      </div>

    </div>
  );
}