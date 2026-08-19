"use client";

import { useEffect } from "react";
import { io } from "socket.io-client";
import { useRouter } from "next/navigation";

export function SocketProvider() {
  const router = useRouter();

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const socket = io(API_URL);

    socket.on("connect", () => {
      console.log("Connected to backend via socket.io");
    });

    socket.on("COLLECTOR_STATUS_CHANGED", (data) => {
      console.log("Status changed for collector", data.collectorId);
      // Trigger Next.js router refresh to fetch new data
      router.refresh();
    });

    return () => {
      socket.disconnect();
    };
  }, [router]);

  return null;
}
