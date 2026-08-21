"use client";

import { useState } from "react";
import type { CommandCenterResult } from "@/lib/domain/result";
import type { Weights } from "@/lib/domain/score";
import { WeightSliders } from "./weight-sliders";
import { AccountTable } from "./account-table";
import { SignalFeed } from "./signal-feed";

const INITIAL_WEIGHTS: Weights = { fit: 40, signal: 35, engagement: 25 };

export function CommandCenterHome({ result }: { result: CommandCenterResult }) {
  const [weights, setWeights] = useState<Weights>(INITIAL_WEIGHTS);

  return (
    <div className="space-y-8">
      <WeightSliders weights={weights} onChange={setWeights} />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <AccountTable accounts={result.accounts} weights={weights} />
        <SignalFeed items={result.globalFeed} />
      </div>
    </div>
  );
}
