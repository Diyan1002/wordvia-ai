"use client";
import { Suspense } from "react";
import UpgradeClient from "./UpgradeClient";

export default function UpgradePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          Loading...
        </div>
      }
    >
      <UpgradeClient />
    </Suspense>
  );
}